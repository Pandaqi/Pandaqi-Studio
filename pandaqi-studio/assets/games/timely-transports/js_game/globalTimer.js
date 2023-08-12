import Timer from "./timer"

export default class GlobalTimer {
    constructor(int)
    {
        this.interface = int;

        const inputTimeout =  this.interface.getConfig().timeout;
        this.useTimeout = inputTimeout > 1;
        this.timeoutDuration = inputTimeout*60; // seconds
        this.globalTimerDuration = this.interface.getConfig().soloModeTimerDuration;

        this.setupTimeoutTimer();
        this.setupSoloTimer();
    }

    startTimeout() 
    {
        const overlay = this.interface.getGame().overlay;
        this.interface.setPaused(true);
        overlay.setVisible(true);
        overlay.setText("<p>Timeout!</p><p class='sub-instruction'>(click anywhere to end it)</p>");
        overlay.makeClickable(this.stopTimeout.bind(this));
	}

	stopTimeout() 
    {
        const overlay = this.interface.getGame().overlay;
        this.interface.setPaused(false);
        overlay.setVisible(false);
        this.timer.restart();
	}

    setupTimeoutTimer()
    {
        if(!this.useTimeout) { return; }
        this.timer = new Timer(this.interface);
        this.timer.resetTo(this.timeoutDuration);
        this.timer.start();
        this.timer.addEventListener("timeout", this.startTimeout.bind(this));
    }

    setupSoloTimer()
    {
        if(!this.interface.getConfig().addGlobalTimer) { return; }
        
        this.soloTimer = new Timer(this.interface);
        this.soloTimer.resetTo(this.globalTimerDuration);
        this.soloTimer.start();
        this.soloTimer.addEventListener("timeout", this.onSoloTimerDone.bind(this));
        this.soloTimer.addEventListener("update", this.updateSoloTimer.bind(this));
        this.createVisualTimer(); 
    }

    createVisualTimer() {
        const cont = document.createElement("div");
        cont.classList.add("global-timer");
        this.interface.getContainer().appendChild(cont);
        cont.innerHTML = this.convertSecondsToString(this.globalTimerDuration);
        this.visualTimer = cont;
	}

    onSoloTimerDone()
    {
        this.visualTimer.innerHTML = this.convertSecondsToString(0);
        this.visualTimer.style.color = "#FF0000";
        this.interface.getGame().audio.play("timer_fail_1");

        this.interface.setPaused(true);
        clearInterval(this.intervalHandler);
    }

    updateSoloTimer()
    {
        this.visualTimer.innerHTML = this.convertSecondsToString(this.soloTimer.getTime());
    }

	convertSecondsToString(s) {
        s = Math.ceil(s);

		let minutes = Math.floor(s / 60);
		if(minutes < 10) { minutes = "0"+minutes; }

		let seconds = Math.ceil(s) % 60
		if(seconds < 10) { seconds = "0"+seconds; }

		return minutes + ":" + seconds;
	}
}
	