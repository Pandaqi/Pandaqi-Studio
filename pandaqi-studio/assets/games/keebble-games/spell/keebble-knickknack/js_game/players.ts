import CONFIG from "./config"

export default class Players 
{
    game: any;
    playerNames: string[];
    activePlayer: number;
    plannedFirstPlayer: number;
    node: HTMLDivElement;
    startButton: HTMLButtonElement;

    constructor(game:any)
    {
        this.game = game;
        this.playerNames = [];
        this.activePlayer = -1;
        this.plannedFirstPlayer = -1;
        this.node = this.createHTML();

        if(CONFIG.predeterminedPlayers.length > 0)
        {
            for(const playerName of CONFIG.predeterminedPlayers)
            {
                this.addPlayer(playerName);
            }
        }

        if(CONFIG.debugging && this.count() <= 0)
        {
            for(const playerName of CONFIG.debugPlayers)
            {
                this.addPlayer(playerName);
            }
        }
    }

    saveCurrentAsStartPlayer()
    {
        this.plannedFirstPlayer = this.activePlayer;
    }

    checkInstantStart()
    {
        const alreadyHavePlayers = this.playerNames.length > 0;
        if(!alreadyHavePlayers) { return; }
        this.finish();
    }

    createHTML()
    {
        const cont = document.createElement("div");
        cont.classList.add("players-container");
        document.body.appendChild(cont);

        const subcont = document.createElement("div");
        subcont.classList.add("players-sub-container");
        cont.appendChild(subcont);

        const fbNode = document.createElement("div");
        fbNode.innerHTML = '<span>Please add your players in the right order.</span><span class="remark">(Start player first, then clockwise around the table.)</span>';
        fbNode.classList.add("players-feedback");
        subcont.appendChild(fbNode);

        const inp = document.createElement("input") as HTMLInputElement;
        subcont.appendChild(inp);
        inp.type = "text";
        inp.placeholder = "... player name ... ";
        inp.maxLength = CONFIG.maxNameLength;

        const btn = document.createElement("button");
        subcont.appendChild(btn);
        btn.innerHTML = 'Add player';
        btn.classList.add("button-look");

        const ths = this;
        btn.addEventListener("click", (ev) => {
            const [success, fb] = ths.addPlayer(inp.value);
            fbNode.innerHTML = fb.toString();
            if(!success) { return; }

            inp.value = "";
            fbNode.innerHTML += " Current players: " + this.printPlayers();
        })

        const startBtn = document.createElement("button");
        this.startButton = startBtn;
        startBtn.classList.add("button-look");
        subcont.appendChild(startBtn);
        startBtn.innerHTML = 'Start the game!'
        startBtn.disabled = true;
        startBtn.style.display = 'none';
        startBtn.addEventListener("click", (ev) => {
            ths.finish();
        });

        return cont;
    }

    finish()
    {
        this.destroyHTML();
        this.game.gotoNextPhase();
    }

    destroyHTML()
    {
        this.node.remove();
    }

    printPlayers()
    {
        if(this.count() <= 0) { return ""; }

        let txt = "<span class='player-name'>" 
                    + this.playerNames.join("</span>, <span class='player-name'>") 
                    + "</span>";
        return txt;
    }

    addPlayer(name: string)
    {
        const nameIncorrectSize = name.length <= 0 || name.length >= CONFIG.maxNameLength
        if(nameIncorrectSize) { return [false, "Name too short or too long"]; }

        const nameAlreadyUsed = this.playerNames.includes(name);
        if(nameAlreadyUsed) { return [false, "Name already used"]; }

        this.playerNames.push(name);
        
        const enoughPlayersToStart = this.playerNames.length >= 2;
        if(enoughPlayersToStart)
        {
            this.startButton.style.display = 'block';
            this.startButton.disabled = false;
        }

        return [true, "Player added!"];
    }

    nextTurn()
    {
        this.setActivePlayer( (this.activePlayer + 1) % this.count() );
    }

    nextRound()
    {
        const resetFirstPlayer = this.plannedFirstPlayer >= 0;
        if(resetFirstPlayer)
        {
            this.setActivePlayer( this.plannedFirstPlayer - 1 );
            this.plannedFirstPlayer = -1;
        } 

        this.nextTurn();
    }

    setActivePlayer(num: number)
    {
        this.activePlayer = num;
        this.game.header.setPlayerName(this.getActivePlayerName());
    }

    getActivePlayerName()
    {
        return this.playerNames[this.activePlayer];
    }

    getPlayerNames()
    {
        return this.playerNames.slice();
    }

    count()
    {
        return this.playerNames.length;
    }
}