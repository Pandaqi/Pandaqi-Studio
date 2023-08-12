import Timer from "./timer"

export default class Events {
    constructor(int)
    {
        this.interface = int;
        this.node = this.setupHTML();
        this.setupTimer();
        this.toggle(false);
        this.toggleTimer();
    }

    setupHTML()
    {
        const cont = document.createElement("div");
        cont.classList.add("events-window");
        this.interface.getContainer().appendChild(cont);

        const content = document.createElement("div");
        cont.appendChild(content);
        content.classList.add("events-window-content");
        this.nodeContent = content;

        return cont;
    }

    setupTimer()
    {
        this.timer = new Timer(this.interface, { node: this.node, direction: "rtl", color: "#91c9f8" });
        this.timer.addEventListener("timeout", this.onTimeout.bind(this));
    }

    eventIsActive() { return this.activeEvent != null; }
	toggleTimer() {
        const cfg = this.interface.getConfig();
        let newTime = 0;

        if(this.eventIsActive()) {
            var minLength = this.activeEvent.lengthMax || 30;
			var maxLength = this.activeEvent.lengthMax || 45;
			newTime = Math.random() * (maxLength - minLength) + minLength;
        } else {
            // if playing without player ranks, just distribute randomly
			// (on average, one event per two minutes, give some extra margin on edges)
			if(cfg.playerRank == 0) {
				newTime = (cfg.playerCount * Math.random() * 180 - 90) + 90;

			// if playing WITH player ranks, distribute evenly
			// (each event falls into some two minute interval only available to this player)
			} else {
				newTime = (cfg.playerRank - 1) * 180 + Math.random()*90;
			}
        }

		this.timer.resetTo(newTime);
        this.timer.start();
	}

    getEventObject(eventName)
    {
        return this.interface.getConfig().events[eventName]
    }

    getIconForGood(goodName)
    {
        return "<div class='good-icon good-icon-" + goodName.toLowerCase() + "'></div>";
    }

    fillInValues(event)
    {
		let eventString = event.desc;
		const randomNumber = Math.floor(Math.random()*4)+2;

        this.activeCity = this.interface.getRandomCity();
        this.activeGood = this.interface.getRandomGood()

		eventString = eventString.replace("CITY", '</span><span class="city-name">' + this.activeCity + '</span><span>');
		eventString = eventString.replace("GOOD", '</span><span class="good-name">' + this.activeGood + '</span>' + this.getIconForGood(this.activeGood) + "<span>");
		eventString = eventString.replace("NUMBER", '</span><span class="event-number">' + randomNumber + '</span><span>');

        return eventString;
    }

    toggle(val)
    {
        if(val) { this.node.style.display = "block"; this.node.classList.add("pop-up"); }
        else { this.node.style.display = "none"; this.node.classList.add("pop-up"); }
    }

    onTimeout()
    {
        if(this.eventIsActive()) { return this.hideEvent(); }
        this.showEvent();
    }

	showEvent() {
        this.toggle(true);

		this.activeEvent = this.getEventObject(this.interface.getRandomEvent());
        const finalText = this.fillInValues(this.activeEvent);
        this.nodeContent.innerHTML = "<span>" + finalText + "</span>";

		this.interface.getGame().audio.play('announcement_1');
		this.toggleTimer();
	}

	hideEvent() {
        this.toggle(false);
        this.interface.getGame().audio.play('announcement_1');

		this.activeEvent = null;
		this.toggleTimer();
	}
}