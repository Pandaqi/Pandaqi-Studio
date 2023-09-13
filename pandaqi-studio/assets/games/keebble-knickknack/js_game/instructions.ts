import { KEEBBLE_TYPES } from "games/keebble/js_shared/dict"
import CONFIG from "./config"
import Option from "./option"

export default class Instructions 
{
    game: any;
    node: HTMLDivElement;
    content: HTMLParagraphElement;

    constructor(game:any)
    {
        this.game = game;
        this.node = this.createHTML();
        this.hide();
    }

    createHTML()
    {
        const cont = document.createElement("div");
        cont.classList.add("instructions-container");
        document.body.appendChild(cont);

        const subCont = document.createElement("div");
        subCont.classList.add("instructions-sub-container");
        cont.appendChild(subCont);

        const p = document.createElement("p");
        subCont.appendChild(p);
        p.innerHTML = '... wait text here ...';
        this.content = p;

        const btn = document.createElement("button");
        subCont.appendChild(btn);
        btn.classList.add("button-look");
        btn.innerHTML = "I'm done! Continue.";
        btn.addEventListener("click", (ev) => {
            this.game.gotoNextTurn();
        });

        return cont;
    }

    destroyHTML()
    {
        this.node.remove();
    }

    show()
    {
        this.node.style.display = 'flex';
    }

    hide()
    {
        this.node.style.display = 'none';
    }

    waitOnOption(o:Option)
    {
        this.game.options.hide();
        this.show();

        const playerName = this.game.players.getActivePlayerName();

        const tp = o.getType();
        let txt = "";
        if(tp == "letter")
        {
            let lettersJoined = "";
            const numLetters = o.letters.length;
            for(let i = 0; i < numLetters; i++)
            {
                const letter = o.letters[i];
                const score = this.game.getLetterScore(letter);
                const scoreWord = (score > 1) ? "points" : "point";
                lettersJoined += letter + " (" + score + " " + scoreWord + ")";
                if(i < numLetters - 2) { lettersJoined += ", "; }
                else if (i < numLetters - 1) { lettersJoined += " and "; }
            }

            const letterWord = (numLetters > 1) ? "letters" : "letter";
            const typeWord = (numLetters > 1) ? "empty cells" : "an empty cell";
            txt = "Place the " + letterWord + " <strong>" + lettersJoined + "</strong> in " + typeWord + " on the board.";

            if(CONFIG.expansions.beefyBackpacks)
            {
                txt += " <span style='opacity:0.5';>(Or add them to your backpack.)</span>";
            }
        }

        if(tp == "wall")
        {
            const numWalls = o.value;
            const typeWord = (numWalls > 1) ? "walls" : "wall";
            const edgeWord = (numWalls > 1) ? "empty edges" : "an empty edge";
            txt = "Place <strong>" + numWalls + " " + typeWord + "</strong> on " + edgeWord + ".";
        }

        if(tp == "cell")
        {
            let cellsJoined = "";
            const numCells = o.cells.length;
            for(let i = 0; i < numCells; i++)
            {
                const cellID = o.cells[i];
                const cellName = KEEBBLE_TYPES[cellID].humanName;
                cellsJoined += cellName;
                if(i < numCells - 2) { cellsJoined += ", "; }
                else if (i < numCells - 1) { cellsJoined += " and "; }
            }

            const cellWord = (numCells > 1) ? "these special types to cells" : "this special type to a cell"

            txt = "Add " + cellWord + " without one yet: <strong>" + cellsJoined + "</strong>.";
        }

        if(tp == "swap")
        {
            const typeWord = (o.num > 1) ? "cells" : "cell";
            txt = "Swap <strong>" + o.num + " " + typeWord + "</strong>. Cross out the existing letter, write any new letter.";
        }

        if(tp == "destroy")
        {
            const typeWord = (o.num > 1) ? "cells" : "cell";
            txt = "Destroy <strong>" + o.num + " " + typeWord + "</strong>. Cross out one part of it (owner, type, score content)."
        }

        if(tp == "empty_backpack")
        {
            const content = this.game.backpacks.getForPlayer(playerName);
            if(content.length <= 0) {
                txt = "Your backpack is empty, sorry! Can't do anything."
            } else {
                txt = "Your backpack has: <strong>" + content + "</strong>. Place all of them now."
            }

            this.game.backpacks.clear(playerName);
        }

        this.content.innerHTML = txt;

    }
}