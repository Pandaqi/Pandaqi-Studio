import Game from "./main"
import CONFIG from "./config"

export default class GameOver 
{
    game: any;
    node: HTMLDivElement;
    constructor(game)
    {
        this.game = game;
        let results = this.game.score.getScoresAsList();
        results.sort((a,b) => { return b.score - a.score; })
        this.node = this.createHTML(results);
    }

    createHTML(results)
    {
        const cont = document.createElement("div");
        cont.classList.add("game-over-container");
        document.body.appendChild(cont);

        const subCont = document.createElement("div");
        cont.appendChild(subCont);
        subCont.classList.add("game-over-sub-container");

        const msg = document.createElement("div");
        subCont.appendChild(msg);
        msg.classList.add("game-over-message");
        msg.innerHTML = "Game over!";

        const resultsCont = document.createElement("div");
        subCont.appendChild(resultsCont);
        resultsCont.classList.add("game-over-results");
        
        let isFirst = true;
        for(const result of results)
        {
            const scoreCont = document.createElement("div");
            resultsCont.appendChild(scoreCont);

            if(isFirst)
            {
                scoreCont.classList.add("game-over-winner", "attention-repeat");
                isFirst = false;
            }

            const nameNode = document.createElement("div");
            scoreCont.appendChild(nameNode);
            nameNode.innerHTML = result.name;

            const scoreNode = document.createElement("div");
            scoreCont.appendChild(scoreNode);
            scoreNode.innerHTML = result.score;
        }

        const nav = document.createElement("div");
        subCont.appendChild(nav);
        nav.classList.add("game-over-navigation");

        const restartBtn = document.createElement("button");
        nav.appendChild(restartBtn);
        restartBtn.innerHTML = 'Play Again (same players)';
        restartBtn.classList.add("button-look");
        restartBtn.addEventListener("click", (ev) => {
            const curPlayers = this.game.players.getPlayerNames();
            CONFIG.GAME.destroy();
            CONFIG.GAME = new Game();
            CONFIG.GAME.start(curPlayers);
        })

        const leaveBtn = document.createElement("button");
        nav.appendChild(leaveBtn);
        leaveBtn.classList.add("button-look");
        leaveBtn.innerHTML = "Leave";
        leaveBtn.addEventListener("click", (ev) => {
            window.location.href = "/keebble-knickknack/"
        })

        return cont;
    }

    destroyHTML()
    {
        this.node.remove();
    }
}