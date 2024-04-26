import Feedback from "./feedback"
import CanvasDrawable from "games/photomone-games/js_shared/canvasDrawable"
import InterfaceWordOptions from "games/photomone-games/js_shared/interfaceWordOptions"
import Turn from "./turn";

export default class Interface 
{
    game: any;
    turnObject: Turn;
    allowSelecting: boolean;
    node: any;
    barNode: HTMLDivElement;
    bar: HTMLDivElement;
    turnsContainer: HTMLDivElement;
    turnsIcon: HTMLImageElement;
    turnsNumber: HTMLDivElement;
    foodContainer: HTMLDivElement;
    foodIcon: HTMLImageElement;
    foodNumber: HTMLDivElement;
    timerContainer: HTMLDivElement;
    canvasDrawable: CanvasDrawable;
    dynamicTimerNode: HTMLDivElement;
    timerNumber: HTMLDivElement;
    windowNode: HTMLDivElement;
    windowHeading: HTMLHeadingElement;
    windowContent: HTMLDivElement;
    canvasNode: HTMLElement;
    bigLinesCounter: HTMLDivElement;
    wordOptions: any;
    wordsNode: any;
    feedback: Feedback;
    buttonContainer: HTMLDivElement;
    buttons: { nextBtn: HTMLButtonElement; leaveBtn: HTMLButtonElement; restartBtn: HTMLButtonElement; };
    
    constructor(game:any)
    {
        this.game = game;
        this.turnObject = null;
        this.allowSelecting = true; // controls whether word options are clickable; might want a nicer system for that
        this.createHTML();
        this.hideAll();
    }

    getConfig() { return this.game.getConfig(); }
    getContainer() { return this.node; }

    createHTML()
    {
        const contentNode = document.getElementById("content");
        this.node = contentNode;

        // bar at the top
        // TURNS (done / max) + FOOD (total / target) => extended
        // TIMER (small horizontal bar) => minified
        this.barNode = document.createElement("div");
        contentNode.appendChild(this.barNode);
        this.barNode.classList.add("interface-bar-container");

        this.bar = document.createElement("div");
        this.barNode.appendChild(this.bar);
        this.bar.classList.add("interface-bar");

        this.turnsContainer = document.createElement("div");
        this.turnsContainer.title = "Number of turns";
        this.bar.appendChild(this.turnsContainer);

        this.turnsIcon = document.createElement("img");
        this.turnsIcon.src = "/photomone-games/assets/icon_turns.webp";
        this.turnsContainer.appendChild(this.turnsIcon);

        this.turnsNumber = document.createElement("div");
        this.turnsContainer.appendChild(this.turnsNumber);
        this.turnsNumber.innerHTML = "X / X";

        this.foodContainer = document.createElement("div");
        this.foodContainer.title = "Food ( = points) scored";
        this.bar.appendChild(this.foodContainer);
        
        this.foodIcon = document.createElement("img");
        this.foodIcon.src = "/photomone-games/assets/icon_points.webp";
        this.foodContainer.appendChild(this.foodIcon);

        this.foodNumber = document.createElement("div");
        this.foodContainer.appendChild(this.foodNumber);
        this.foodNumber.innerHTML = "Y / Y";

        this.timerContainer = document.createElement("div");
        this.bar.appendChild(this.timerContainer);
        this.timerContainer.classList.add("timer-container");
        this.timerContainer.addEventListener("click", (ev) => { 
            if(this.canvasDrawable.getTurn().count() <= 1) { return; }
            this.stopTimer(); 
        })

        this.dynamicTimerNode = document.createElement("div");
        this.timerContainer.appendChild(this.dynamicTimerNode);
        this.dynamicTimerNode.classList.add("dynamic-timer-rectangle");
        
        this.timerNumber = document.createElement("div");
        this.timerContainer.appendChild(this.timerNumber);
        this.timerNumber.classList.add("timer-number");
        this.timerNumber.innerHTML = "00s";

        this.extend();

        // windowNode (windowHeading, windowContent)
        this.windowNode = document.createElement("div");
        contentNode.appendChild(this.windowNode);
        this.windowNode.classList.add("overlay-window");

        this.windowHeading = document.createElement("h1");
        this.windowNode.appendChild(this.windowHeading);

        this.windowContent = document.createElement("div");
        this.windowNode.appendChild(this.windowContent);
        
        // interactive canvas
        this.canvasDrawable = new CanvasDrawable(contentNode as HTMLCanvasElement, this.game.getConfig());
        this.canvasNode = this.canvasDrawable.getHTMLContainer();

        this.bigLinesCounter = document.createElement("div");
        this.canvasNode.appendChild(this.bigLinesCounter);
        this.bigLinesCounter.classList.add("big-lines-counter");
        this.bigLinesCounter.innerHTML = "20";

        // word options and picking one to draw
        this.wordOptions = new InterfaceWordOptions(this, contentNode);
        this.wordOptions.setWordsCache(this.game.getWordList());
        this.wordsNode = this.wordOptions.getHTMLContainer();

        this.feedback = new Feedback(this);

        // all buttons ( + an easy way to reference/toggle them by others)
        this.buttonContainer = document.createElement("div");
        contentNode.appendChild(this.buttonContainer);
        this.buttonContainer.classList.add("button-container");

        const nextBtn = document.createElement("button");
        this.buttonContainer.appendChild(nextBtn);
        nextBtn.innerHTML = "Continue";
        nextBtn.classList.add("photomone-button");
        nextBtn.addEventListener("click", (ev) => {
            if(!this.allowedToContinue()) { return false; }
            this.game.gotoNextPhase();
        })

        const leaveBtn = document.createElement("button");
        this.buttonContainer.appendChild(leaveBtn);
        leaveBtn.innerHTML = "Leave";
        leaveBtn.classList.add("photomone-button");
        leaveBtn.addEventListener("click", (ev) => {
            window.location.href = "/photomone-games/draw/photomone-digital-antists/"
        });

        const restartBtn = document.createElement("button");
        this.buttonContainer.appendChild(restartBtn);
        restartBtn.innerHTML = "Play Again";
        restartBtn.classList.add("photomone-button");
        restartBtn.addEventListener("click", (ev) => {
            window.location.reload();
        })

        this.buttons = {
            nextBtn: nextBtn,
            leaveBtn: leaveBtn,
            restartBtn: restartBtn
        };
    }

    hideAll() 
    {
        this.toggleBar(false);
        this.toggleWindow(false);
        this.toggleCanvas(false);
        this.toggleWords(false);
        this.setButtons([]);
    }

    toggleNode(node: HTMLElement, val: boolean, string = "block")
    {
        if(val) { node.style.display = string; }
        else { node.style.display = "none"; }
    }

    toggleBar(val: boolean) { this.toggleNode(this.barNode, val); }
    toggleWindow(val: boolean) { this.toggleNode(this.windowNode, val); }
    toggleCanvas(val: boolean) 
    { 
        this.toggleNode(this.canvasNode, val); 
        if(val) {    
            this.canvasDrawable.resizeCanvas();
            document.body.style.overflow = "hidden"; 
            this.canvasDrawable.onShow();
        } else { 
            document.body.style.overflow = "auto"; 
            this.canvasDrawable.onHide();
        }
    }
    toggleWords(val: boolean) 
    { 
        this.toggleNode(this.wordsNode, val); 
        if(val) { this.wordOptions.loadNewWords(); }
    }
    
    setWindowText(heading: string, content: string)
    {
        this.windowHeading.innerHTML = heading;
        this.windowContent.innerHTML = content;
    }

    setMinimal(val: boolean)
    {
        this.toggleNode(this.timerContainer, val);
        this.toggleNode(this.turnsContainer, !val, "flex");
        this.toggleNode(this.foodContainer, !val, "flex");

        if(val) { this.bar.classList.add("interface-bar-minified"); }
        else { this.bar.classList.remove("interface-bar-minified"); }
    }

    minify() { this.setMinimal(true); }
    extend() { this.setMinimal(false); }

    setButtons(arr: string | string[])
    {
        for(const [key,btn] of Object.entries(this.buttons))
        {
            const showButton = arr.includes(key);
            btn.style.display = "none";
            if(showButton) { btn.style.display = "block"; }
        }

        this.toggleNode(this.buttonContainer, (arr.length > 0), "flex");
    }

    allowedToContinue()
    {
        if(this.game.getPhase() == "pick" && !this.wordOptions.isSelected()) { return false; }
        return true;
    }

    onLinesExhausted() 
    {
        this.canvasDrawable.emitFeedback("Out of lines!");
        this.canvasDrawable.lock(); 
    }

    getSelectedWord() { return this.wordOptions.getSelectedWord(); }
    setTurnObject(o: Turn) { this.turnObject = o; }
    startTimer() { this.turnObject.timer.start(); }
    stopTimer() { this.turnObject.timer.onTap(); }
    visualizeTimer(seconds: number, perc: number) { 
        this.dynamicTimerNode.style.width = (perc * 100) + "%";
        this.timerNumber.innerHTML = Math.ceil(seconds) + "s";
    }
    visualizeLines(l: string) { this.bigLinesCounter.innerHTML = l; }
    visualizeFood(f: any) { /* nothing? */ }

    visualize()
    {
        this.foodNumber.innerHTML = this.game.totalFood + " / " + this.game.targetFood;
        this.turnsNumber.innerHTML = this.game.curTurn + " / " + this.game.numTurns;
    }

    enableSpecialLastTurn()
    {
        const pointsNeededToWin = this.game.targetFood - this.game.totalFood;
        let lowestPointOption = Infinity;
        const allWords = this.wordOptions.getOptionsAsList();
        let numWinningOptions = 0;
        for(const option of allWords)
        {
            const optionPoints = option.getPoints();
            lowestPointOption = Math.min(lowestPointOption, optionPoints);
            if(optionPoints >= pointsNeededToWin) { numWinningOptions++; }
        }

        if(numWinningOptions >= 2) { return; }
        if(numWinningOptions == 1 && Math.random() <= 0.33) { return; }

        const makeupRatio = pointsNeededToWin / lowestPointOption;
        const needsModification = makeupRatio > 1;
        if(!needsModification) { return; }

        const cfg = this.game.getConfig();
        const newTime = Math.ceil(cfg.timerLength * makeupRatio);
        cfg.timerLength = newTime;

        for(const option of allWords)
        {
            const newLines = Math.ceil(option.getLines() / makeupRatio);
            option.setLines(newLines);

            const newPoints = Math.ceil(option.getPoints() * makeupRatio);
            option.setPoints(newPoints);
        }

        const txt = "For this final round, we've increased the points and timer for each word so you can still win! The number of lines, however, has decreased ..."
        this.game.powerupHints.showFinalRoundText(txt);

        this.wordOptions.visualize();
    }
}