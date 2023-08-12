export default class Score {
    constructor(int)
    {
        this.interface = int;
        this.score = 0;
        this.node = this.setupHTML();
        this.setupEvents();
    }

    getScoreString() { return "Score: " + this.score; }
    setupHTML()
    {
        const cont = document.createElement("div");
        cont.classList.add("score-text");
        cont.innerHTML = this.getScoreString();
        this.interface.getContainer().appendChild(cont);
        return cont;
    }

    setupEvents()
    {
        this.node.addEventListener("click", (ev) => {
            if(this.interface.isPaused()) { return; }
            this.update(1);
        });
    }

    get() { return this.score; }
    update(ds)
    {
        if(this.interface.isPaused()) { return; }
        this.score += ds;
        this.node.innerHTML = this.getScoreString();

        const audio = this.interface.getGame().audio;
        const weWon = (this.score >= this.interface.getConfig().pointsToWin);

        this.node.classList.remove("pop-up");
        void this.node.offsetWidth;
        this.node.classList.add("pop-up");

        if(weWon)
        {
            audio.play("victory_1_short");
            this.node.style.color = "#00FF00";
            this.interface.setPaused(true);
            this.interface.getGame().setWon(true);
            return;
        }

        if(ds >= 0) { audio.play("score_success_1"); }
    }
}