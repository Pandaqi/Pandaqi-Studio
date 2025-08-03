import InterfaceWordOptions from "games/photomone-games/shared/interfaceWordOptions"

export const InterfacePhotomone = class 
{
    node:HTMLElement
    params:Record<string,any>
    turn:number
    supportPausing:boolean
    score:number
    phase:string
    interfaceWordOptions:InterfaceWordOptions
    wordsGuessedRight:number
    scoreTarget:number

    window:HTMLElement
    windowHeader:HTMLElement
    windowText:HTMLElement
    uiContainer:HTMLElement
    scoreBtn:HTMLButtonElement
    
    scoreNode:HTMLElement
    pauseBtn:HTMLButtonElement
    nextTurnBtn:HTMLButtonElement
    turnsNode:HTMLElement

    allowSelecting:boolean

    constructor(node:HTMLElement, userConfig:Record<string,any> = {})
    {
        this.node = node;
        this.params = Object.assign({}, userConfig);
        this.turn = -1;
        this.supportPausing = false;
        this.score = 0;
        this.phase = "start"; // start, turn, interturn, end
        this.createOverlayWindow();
        this.interfaceWordOptions = new InterfaceWordOptions(this, node);
        this.wordsGuessedRight = 7; // how many words, on average, must be guessed correctly to win the game
        
        const WORDS = this.params.WORDS;
        const cachedWordList = this.interfaceWordOptions.getWordsCache();
        this.scoreTarget = WORDS.getObjectiveScore(cachedWordList, this.wordsGuessedRight);

        this.createHTML();
        this.createWelcomeMessage();
        this.protectAgainstLeaving();
        this.toggleWindow(true);
    }

    getConfig() { return this.params; }
    protectAgainstLeaving()
    {
        window.onbeforeunload = (ev: any) => {
            if(this.phase == "start" || this.phase == "end") { return undefined; }
            return "You're about to exit this game, losing all progress. Are you sure?";
        };
    }
    
    createOverlayWindow()
    {
        this.window = document.createElement("div");
        this.window.classList.add("overlay-window");

        this.windowHeader = document.createElement("h2");
        this.window.appendChild(this.windowHeader);
        this.windowHeader.innerHTML = 'Welcome!'

        this.windowText = document.createElement("p");
        this.window.appendChild(this.windowText);

        this.node.appendChild(this.window);
    }

    createWelcomeMessage()
    {
        this.windowText.innerHTML = "<p>Your objective is to score <strong>" + this.scoreTarget + " points</strong> (or more)!</p><p>When ready, press the button to start the first turn. Make sure only the <em>drawer</em> can see the phone screen!</p><p>Select your chosen word by tapping it. If it was guessed correctly, you can press the button to score its points.</p><p>Have fun!</p>";
    }

    toggleWindow(val: boolean)
    {
        if(val) 
        { 
            this.window.style.display = "block"; 
            this.scoreBtn.style.display = "none";
        } 
        else 
        { 
            this.window.style.display = "none"; 
            this.scoreBtn.style.display = "block";
        }
    }

    createHTML()
    {
        this.uiContainer = document.createElement("div");
        this.node.appendChild(this.uiContainer);
        this.uiContainer.classList.add("ui");

        this.scoreBtn = document.createElement("button");
        this.uiContainer.appendChild(this.scoreBtn);
        this.scoreBtn.classList.add("photomone-button");

        let scoreText = document.createElement("div");
        scoreText.innerHTML = "Score Points!";
        this.scoreBtn.appendChild(scoreText);

        this.scoreNode = document.createElement("div");
        this.scoreBtn.appendChild(this.scoreNode);
        this.scoreNode.classList.add("score-node");
        this.scoreBtn.addEventListener("click", (ev) => {
            this.saveSelectedWordScore();
        });

        this.updateScore(0);

        const pausingEnabled = this.params.expansions.antertainmentBreak;
        if(pausingEnabled && this.supportPausing)
        {
            this.pauseBtn = document.createElement("button");
            this.uiContainer.appendChild(this.pauseBtn);
            this.pauseBtn.classList.add("photomone-button");
            this.pauseBtn.innerHTML = "Pause this word";
            this.pauseBtn.addEventListener("click", (ev) => {
                this.pauseSelectedWord();
            });
        }
        
        this.nextTurnBtn = document.createElement("button");
        this.uiContainer.appendChild(this.nextTurnBtn);
        this.nextTurnBtn.classList.add("photomone-button");

        let turnText = document.createElement("div");
        this.nextTurnBtn.appendChild(turnText);
        turnText.innerHTML = "Next Turn!";

        this.turnsNode = document.createElement("div");
        this.nextTurnBtn.appendChild(this.turnsNode);
        this.turnsNode.classList.add("turns-node");
        this.nextTurnBtn.addEventListener("click", (ev) => {
            if(this.phase == "end") { return window.location.reload(); }
            else if(this.phase == "interturn" || this.phase == "start") { this.gotoNextTurn(); }
            else if(this.phase == "turn") { this.gotoInterTurn(); }
        })
    }

    gotoNextTurn()
    {
        this.phase = "turn";
        this.updateTurns(+1);
        this.toggleWindow(false);
        this.allowSelecting = true;
        this.nextTurnBtn.innerHTML = "End Turn";
        this.interfaceWordOptions.loadNewWords();
        this.interfaceWordOptions.setVisible(true);
    }

    gotoInterTurn()
    {
        this.phase = "interturn";
        this.interfaceWordOptions.clear();
        this.interfaceWordOptions.setVisible(false);
        this.nextTurnBtn.innerHTML = "Next Turn";
        this.toggleWindow(true);
        this.windowHeader.innerHTML = "Next player!";
        this.windowText.innerHTML = "<p>Pass the device to the next player.</p><p>Wait with pressing the button until you're sure nobody else can see the screen!</p>";
    }

    gotoGameOver()
    {
        this.turn++; // when we go to gameover, we're midway a turn and it hasn't been registered yet
        this.phase = "end";

        this.toggleWindow(true);
        this.windowHeader.innerHTML = "Game Over";
        this.windowText.innerHTML = "<p>The game is done! You finished in <strong>" + this.turn + "</strong> turns and scored <strong>" + this.score + " points</strong>!</p><p>Be proud of yourselves&mdash;or not. Check your amazing pheromone drawings. Feeling like a real ant-ist yet?</p>";

        this.interfaceWordOptions.clear();
        this.interfaceWordOptions.setVisible(false);
        this.nextTurnBtn.innerHTML = 'Play again?';
    }

    pauseSelectedWord()
    {
        // @TODO
    }

    saveSelectedWordScore()
    {
        const score = this.interfaceWordOptions.getSelectedWordScore(true);
        if(score <= 0) { return; }
        this.updateScore(score);
        this.allowSelecting = false;
    }

    updateScore(ds: number)
    {
        this.score += ds;
        this.scoreNode.innerHTML = "Score: " + this.score + " / " + this.scoreTarget;
        if(this.score >= this.scoreTarget) { this.gotoGameOver(); }
    }

    updateTurns(dt: number)
    {
        this.turn += dt;
        let txt = "Turns played: " + this.turn;
        this.turnsNode.innerHTML = txt;
    }
}