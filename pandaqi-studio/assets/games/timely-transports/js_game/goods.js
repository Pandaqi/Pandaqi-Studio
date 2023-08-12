import Timer from "./timer"

export default class Goods {
    constructor(int)
    {
        this.interface = int;
        this.activeGood = null;
        this.activeCity = null;
        this.timer = null;
        this.node = this.setupHTML();
        this.setupEvents();
        this.setupTimer();
        this.toggle(false);
        this.addGood();
    }

    setupHTML()
    {
        const cont = document.createElement("div");
        cont.classList.add("goods-window");
        this.interface.getContainer().appendChild(cont);

        const content = document.createElement("div");
        cont.appendChild(content);
        content.classList.add("goods-window-content");
        this.nodeContent = content;

        return cont;
    }

    setupEvents()
    {
        this.node.addEventListener("click", this.onClick.bind(this))
    }

    setupTimer()
    {
        this.timer = new Timer(this.interface, { node: this.node, direction: "rtl", color: "#79fb6c" });
        this.timer.addEventListener("timeout", this.onTimeout.bind(this))
    }

    onClick()
    {
        if(this.interface.isPaused()) { return; }
        if(!this.goodIsActive()) { return; }
        this.removeGood(true);
    }

    onTimeout()
    {
        if(this.goodIsActive()) { return this.removeGood(false); }
        this.addGood();
    }

    toggle(val)
    {
        if(val) { this.node.style.display = "block"; this.node.classList.add("pop-up"); }
        else { this.node.style.display = "none"; this.node.classList.remove("pop-up"); }
    }

    goodIsActive() { return this.activeGood != null && this.timer != null; }
    toggleTimer() 
    {
        const cfg = this.interface.getConfig()
        let newTime = cfg.goodRunoutTime;

        if(!this.goodIsActive()) {
            newTime = Math.random() * (cfg.maxGoodTimer - cfg.minGoodTimer) + cfg.minGoodTimer;
        }

        this.timer.resetTo(newTime);
        this.timer.start();
	}

    getIconForGood(goodName)
    {
        const div = document.createElement("div");
        div.classList.add("good-icon", "good-icon-" + goodName.toLowerCase());
        return div;
    }

	addGood() {
        this.toggle(true);

		this.activeGood = this.interface.getRandomGood();
		this.activeCity = this.interface.getRandomCity();

        let text = "<span class='message-heading'>New Good!</span><span class='city-name'>" + this.activeCity + "</span><span>receives</span><span class='good-name'>" + this.activeGood + "</span>";
        this.nodeContent.innerHTML = text;
        this.nodeContent.appendChild(this.getIconForGood(this.activeGood));

		this.interface.getGame().audio.play('announcement_1');
        this.toggleTimer();
	}

	removeGood(success) {
        this.toggle(false);

		if(!success) {
			this.interface.score.update(-1);
			this.interface.getGame().audio.play('timer_fail_1');
		}

		// reset the timer
		this.activeGood = null;
        this.activeCity = null;
		this.toggleTimer();
	}
}