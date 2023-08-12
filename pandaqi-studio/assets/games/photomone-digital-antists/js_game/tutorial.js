export default class Tutorial {
    constructor(game)
    {
        this.game = game;
        this.params = structuredClone(game.getConfig().tutorialParams);
        this.node = this.createHTML();
        this.startTimerAfterClose = false;
        this.active = true;
    }

    createHTML()
    {
        const cont = document.createElement("div");
        document.body.appendChild(cont);
        cont.classList.add("tutorial-container");

        cont.addEventListener("click", (ev) => { this.toggle(false); })

        this.window = document.createElement("div");
        cont.appendChild(this.window);
        this.window.classList.add("overlay-window", "tutorial");
        this.windowHeading = document.createElement("h2");
        this.window.appendChild(this.windowHeading);
        this.windowHeading.innerHTML = "Tutorial";
        
        this.windowContent = document.createElement("div");
        this.window.appendChild(this.windowContent);

        this.windowInstruction = document.createElement("div");
        this.window.appendChild(this.windowInstruction);
        this.windowInstruction.classList.add("tutorial-instruction");
        this.windowInstruction.innerHTML = "<p>(Got it? Click / Tap to close.)</p>";
        
        return cont;
    }

    isActive() { return this.active; }
    setActive(val) { this.active = val; }

    updateToNewPhase()
    {
        if(!this.isActive()) { return; }

        const turnIndex = this.game.curTurn;
        const phaseName = this.game.getPhase();
        this.startTimerAfterClose = (phaseName == "draw");
        const shownTutorialForEnoughTurns = turnIndex > this.params.maxTurns;
        if(shownTutorialForEnoughTurns) { this.setActive(false); return; }

        const screenData = this.params.screens;
        const nothingToSay = !(phaseName in screenData);
        if(nothingToSay) { this.toggle(false); return; }

        this.toggle(true);
        this.setText(screenData[phaseName]);
    }

    toggle(val)
    {
        if(val) { this.node.style.display = "flex"; }
        else { this.node.style.display = "none"; }

        if(!val && this.startTimerAfterClose) 
        { 
            this.game.interface.startTimer();
        }
    }

    setHeading(h) { this.windowHeading.innerHTML = h; }
    setText(txt) { this.windowContent.innerHTML = txt; }
}