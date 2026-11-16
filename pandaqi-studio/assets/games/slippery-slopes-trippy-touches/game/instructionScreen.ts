import { CONFIG } from "games/slippery-slopes/shared/config";
import GameState from "./gameState";

export default class InstructionScreen
{
    node: HTMLDivElement;

    // @IMPROV: switch to signals, so we never even need to know about the game
    constructor()
    {
        this.setupHTML();
        this.hide();
    }

    getContainer() { return this.node; }
    setupHTML()
    {
        this.node = document.createElement("div");
        this.node.classList.add("instruction-screen");
    }

    hide()
    {
        this.node.innerHTML = "";
        this.node.style.display = "none";
    }

    show()
    {
        this.node.style.display = "block";
    }

    showWelcome()
    {
        this.hide();
        this.show();

        const subCont = document.createElement("div");
        this.node.appendChild(subCont);

        const h = document.createElement("h2");
        h.innerHTML = "Welcome!";
        subCont.appendChild(h);

        let p = document.createElement("p");
        p.innerHTML = "On your turn, tap the button to get <strong>" + CONFIG._drawing.wordCards.numPerCard + " new words</strong>. Pick one in <strong>secret</strong>.";
        subCont.appendChild(p);

        p = document.createElement("p");
        p.innerHTML = "Now you must communicate this secret word ... by ranking it on the <strong>sliders</strong> you receive. For example, a slider might be HOT-COLD, or HEAVY-LIGHT.";
        subCont.appendChild(p);

        p = document.createElement("p");
        p.innerHTML = "The other players <strong>guess</strong>. When you hear the right guess, <strong>tap the timer</strong> and score points. If the timer runs out, your turn is over (with no points).";
        subCont.appendChild(p);

        p = document.createElement("p");
        p.innerHTML = "Have fun!";
        subCont.appendChild(p);

        p = document.createElement("p");
        p.classList.add("instruction-remark")
        p.innerHTML = "(It's recommended to play this game in landscape mode, at high brightness, with the phone clearly visible to everyone.)";
        subCont.appendChild(p);

        const btn = document.createElement("button");
        btn.innerHTML = "Start Game!";
        btn.addEventListener("click", (ev) => {
            CONFIG.signalManager.dispatchEvent("changeState", GameState.WORDS);
        });
        subCont.appendChild(btn);
    }

    showTurnOver(previousWord:string, pointsScored:number)
    {
        this.hide();
        this.show();

        const subCont = document.createElement("div");
        this.node.appendChild(subCont);

        const h = document.createElement("h2");
        h.innerHTML = "Turn Over!";
        subCont.appendChild(h);

        let texts = ["The word was <strong>" + previousWord + "</strong>."];
        if(pointsScored > 0) {
            texts.push("Congratulations, you guessed it and scored <strong>" + pointsScored + " points!</strong>");
        } else {
            texts.push("Better luck next time!");
        }

        let p = document.createElement("p");
        p.innerHTML = texts.join(" ");
        subCont.appendChild(p);

        p = document.createElement("p");
        p.innerHTML = "Now give the phone to the next player. When ready, press the button.";
        subCont.appendChild(p);

        const btn = document.createElement("button");
        btn.innerHTML = "Start next turn";
        btn.addEventListener("click", (ev) => {
            CONFIG.signalManager.dispatchEvent("changeState", GameState.WORDS);
        });
        subCont.appendChild(btn);
    }

    showGameOver(score:number)
    {
        this.hide();
        this.show();

        const subCont = document.createElement("div");
        this.node.appendChild(subCont);

        const h = document.createElement("h2");
        h.innerHTML = "Game Over!";
        subCont.appendChild(h);

        const maxPointsPossible = CONFIG.game.maxTurns * CONFIG.game.scoreBounds.max;

        let p = document.createElement("p");
        p.innerHTML = "You scored <strong>" + score + " points</strong> (out of a possible " + maxPointsPossible + ")!";
        subCont.appendChild(p);

        p = document.createElement("p");
        p.innerHTML = "You all deserve a round of applause. A promotion. A piece of chocolate. Or maybe just ... another round of Slippery Slopes?"
        subCont.appendChild(p);

        const btn1 = document.createElement("button");
        btn1.innerHTML = "Play Again!";
        btn1.addEventListener("click", (ev) => {
            window.location.reload();
        });

        const btn2 = document.createElement("button");
        btn2.innerHTML = "Leave";
        btn2.addEventListener("click", (ev) => {
            window.location.href = "/slippery-slopes-trippy-touches/"
        });

        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");
        subCont.appendChild(buttonContainer);
        buttonContainer.appendChild(btn1);
        buttonContainer.appendChild(btn2);
    }
}