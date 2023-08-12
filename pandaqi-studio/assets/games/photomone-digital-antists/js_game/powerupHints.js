export default class PowerupHints {
    constructor(game)
    {
        this.game = game;
        this.node = this.createHTML();
        this.setupEvents();
        this.toggle(false);
    }

    // @TODO: duplicate code with Tutorial; can I merge these? Just a global function?
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
        
        this.windowContent = document.createElement("div");
        this.window.appendChild(this.windowContent);

        this.windowInstruction = document.createElement("div");
        this.window.appendChild(this.windowInstruction);
        this.windowInstruction.classList.add("tutorial-instruction");
        this.windowInstruction.innerHTML = "<p>(Got it? Click / Tap to close.)</p>";
        
        return cont;
    }

    setupEvents()
    {
        window.addEventListener("photomone-cell-hint", (ev) => {
            const pointTypes = this.game.getConfig().pointTypes;
            const type = ev.detail.type;
            const data = pointTypes[type];
            this.setHeading(data.title)
            this.setText(data.desc);
            this.toggle(true);
        })

        this.node.addEventListener("click", (ev) => { this.toggle(false) });
    }

    setHeading(h) { this.windowHeading.innerHTML = h; }
    setText(t) { this.windowContent.innerHTML = t; }
    toggle(val)
    {
        if(val) { this.node.style.display = "flex"; }
        else { this.node.style.display = "none"; }
    }

    showFinalRoundText(text)
    {
        this.toggle(true);
        this.setHeading("Final Round!");
        this.setText(text);
    }
}