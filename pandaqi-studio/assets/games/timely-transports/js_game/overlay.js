export default class Overlay {
    constructor(game)
    {
        this.game = game;
        this.setupHTML();
        this.setupEvents();
    }

    setupHTML()
    {
        const cont = document.createElement("div");
        cont.classList.add("overlay-container");

        const subCont = document.createElement("div");
        cont.appendChild(subCont);
        subCont.classList.add("overlay");

        document.getElementById("game-container").appendChild(cont);
        this.container = cont;
        this.content = subCont;
    }

    destroyHTML()
    {
        this.container.remove();
    }

    setupEvents()
    {
        this.clickable = false;
        this.clickCallback = null;
        this.clickListener = this.onClick.bind(this);
        this.container.addEventListener("click", this.clickListener)
    }

    clearText() { this.setText(""); }
    setText(t)
    {
        this.content.innerHTML = t;
    }

    setVisible(val)
    {
        if(val) { this.container.style.display = "flex"; }
        else { this.container.style.display = "none"; }
    }

    onClick(ev)
    {
        if(!this.clickable) { return; }
        this.setVisible(false);
        if(this.clickCallback) { this.clickCallback(); }
        this.clickCallback = null;
    }

    removeClickable()
    {
        this.container.removeEventListener("click", this.clickListener);
        this.clickListener = null;
    }

    makeClickable(callback = () => {})
    {
        this.clickable = true;
        this.container.classList.add("overlay-container-clickable");
        this.clickCallback = callback;
    }

    gotoGameOver()
    {
        this.game.setGameOver(true);

        this.setVisible(true);
        this.removeClickable();
        this.clearText();

        this.container.classList.add("overlay-game-over");
        
        const h = document.createElement("h2");
        h.innerHTML = "Game Over";
        this.content.appendChild(h);

        const p = document.createElement("p");
        this.content.appendChild(p);
        let text = "Unfortunately, you lost. Maybe try again?"
        if(this.game.weWon) { text = "Congratulations, you won!"; }
        p.innerHTML = text;

        const buttonContainer = document.createElement("div");
        this.content.appendChild(buttonContainer);
        buttonContainer.classList.add("game-over-button-container");

        const leaveBtn = document.createElement("button");
        buttonContainer.appendChild(leaveBtn);
        leaveBtn.innerHTML = "Leave";
        leaveBtn.addEventListener("click", (ev) => {
            // history is always at least 1, as it includes the current page
            if(history.length > 1) { return window.history.back(); }
            window.location.href = "/timely-transports"
        });

        const replayBtn = document.createElement("button");
        buttonContainer.appendChild(replayBtn);
        replayBtn.innerHTML = "Play Again!";
        replayBtn.addEventListener("click", (ev) => {
            window.location.reload();
        })
    }
}