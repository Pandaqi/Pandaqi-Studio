import Option from "./option"

export default class Options 
{
    game: any;
    options: Option[];
    node: HTMLDivElement;

    constructor(game:any)
    {
        this.game = game;
        this.options = [];
        this.node = this.setupHTML();
    }

    setupHTML()
    {
        const cont = document.createElement("div");
        this.game.getContainer().appendChild(cont);
        cont.classList.add("game-options");
        return cont;
    }

    toggle(val: boolean)
    {
        if(val) { this.node.style.display = "flex"; }
        else { this.node.style.display = "none"; }
    }

    loadNew(computerTurn = false)
    {
        const cfg = this.game.getConfig();

        this.node.innerHTML = "";
        this.options = [];
        for(var i = 0; i < cfg.numOptionsPerRound; i++) {
            const o = new Option(this.game, { node: this.node, ai: computerTurn });
            this.options.push(o);
        }
        
        if(computerTurn) { this.game.ai.executeBestOption(this.options); }
    }
}