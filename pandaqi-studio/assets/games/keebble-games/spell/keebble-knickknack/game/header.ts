export default class Header 
{
    game: any;
    node: HTMLDivElement;
    playerNameNode: HTMLDivElement;
    lastRoundNode: HTMLDivElement;
    container: HTMLDivElement;

    constructor(game:any) 
    { 
        this.game = game;
        this.node = this.createHTML();
    }

    createHTML()
    {
        const cont = document.createElement("div");
        cont.classList.add("header", "disable-select");
        document.body.appendChild(cont);

        const playerName = document.createElement("div");
        playerName.innerHTML = '... player here ... ';
        cont.appendChild(playerName);
        this.playerNameNode = playerName;

        const lastRound = document.createElement("div");
        lastRound.innerHTML = "";
        cont.appendChild(lastRound);
        this.lastRoundNode = lastRound;

        const container = document.createElement("div");
        container.classList.add("header-container");
        cont.appendChild(container);
        this.container = container;

        return cont;
    }

    destroyHTML()
    {
        this.node.remove();
    }

    getContainer()
    {
        return this.container;
    }

    setPlayerName(n: string)
    {
        this.playerNameNode.innerHTML = n;
    }

    nextRound()
    {
        this.warnAboutLastRound();
    }
 
    warnAboutLastRound()
    {
        if(!this.game.isLastRound()) { return; }
        this.lastRoundNode.innerHTML = "Last Round!";
    }
}