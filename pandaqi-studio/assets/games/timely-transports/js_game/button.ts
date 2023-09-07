import { VEHICLE_MAP } from "../js/gameDictionary"
import Timer from "./timer"
import Interface from "./interface"

/*
this.load.image('upgrade_button', base + 'upgrade_button.webp');
		this.load.spritesheet('vehicle_icons', base + 'vehicle_icons.webp', { frameWidth: 400, frameHeight: 400 });
		this.load.spritesheet('goods', base + 'goods.webp', { frameWidth: 100, frameHeight: 100 });
        */

export default class Button {
    interface: Interface;
    type: string;
    upgradesTo: string;
    upgraded: boolean;
    overtime: boolean;
    node: HTMLDivElement;
    timer: Timer;
    nodeUpgradeContainer: any;
    nodeIcon: HTMLDivElement;
    nodeUpgrade: HTMLButtonElement;
    
    constructor(int: Interface, params:Record<string,any> = {})
    {
        this.interface = int;
        this.type = params.type || "jeep";
        this.upgradesTo = params.upgradesTo || "tour bus";
        this.upgraded = false;
        this.overtime = false;
        this.node = this.setupHTML(params);
        this.setupEvents();
        this.setupTimer();

        this.toggleUpgradeNode(false);
    }

    timerIsActive() { return this.timer.isActive(); }
    isUpgraded() { return this.upgraded; }
    setUpgraded(val: boolean) { this.upgraded = val; }
    toggleUpgradeNode(val: boolean)
    {
        if(val) { this.nodeUpgradeContainer.style.display = "flex"; }
        else { this.nodeUpgradeContainer.style.display = "none"; }
    }
    canUpgrade() {
        const cfg = this.interface.getConfig();
		if(!cfg.upgradesEnabled) { return false; }
		return this.interface.score.get() >= cfg.upgradeCost;
	}

    setupHTML(params:Record<string,any>)
    {
        if(!params.node) { params.node = document.getElementById("game-container"); }
        const cont = document.createElement("div");
        cont.classList.add("vehicle-button");
        params.node.appendChild(cont);

        const icon = document.createElement("div");
        cont.appendChild(icon);
        icon.classList.add("vehicle-icon", "vehicle-icon-" + this.type.toLowerCase());
        this.nodeIcon = icon;

        const upgradeBtnContainer = document.createElement("div");
        cont.appendChild(upgradeBtnContainer);
        upgradeBtnContainer.classList.add("vehicle-upgrade-button-container");
        this.nodeUpgradeContainer = upgradeBtnContainer;

        const upgradeBtn = document.createElement("button");
        upgradeBtnContainer.appendChild(upgradeBtn);
        upgradeBtn.classList.add("vehicle-upgrade-button");
        this.nodeUpgrade = upgradeBtn;

        const upgradeImage = document.createElement("img");
        upgradeImage.src = this.interface.getConfig().upgradeButtonPath;
        upgradeBtn.appendChild(upgradeImage);

        return cont;
    }

    setupEvents()
    {
        this.node.addEventListener("click", this.onClick.bind(this), false);
        this.nodeUpgrade.addEventListener("click", (ev) => {
            this.upgrade();
            ev.preventDefault(); 
            ev.stopPropagation();
            return false;
        }, true);
    }

    setupTimer()
    {
        this.timer = new Timer(this.interface, { node: this.node, borderRadius: "1.5em" });
        this.timer.addEventListener("timeout", this.onTimeout.bind(this));
    }

    upgrade() {
        if(!this.timerIsActive()) { return; }
        if(!this.canUpgrade()) { return; }
        if(this.isUpgraded()) { return; }

        this.setUpgraded(true);

        this.nodeIcon.classList.remove("vehicle-icon-" + this.type);
        this.type = this.upgradesTo;
        this.nodeIcon.classList.add("vehicle-icon-" + this.type);

        this.interface.score.update(-this.interface.getConfig().upgradeCost);
		this.interface.getGame().audio.play('upgrade_1_short');

		this.stopTimer(true);
	}

    getVehicleData() { return VEHICLE_MAP[this.type]; }

	startTimer() {
		const data = this.getVehicleData();
		const min = data.timerMin || 10, max = data.timerMax || 30
		const duration = Math.random()*(max - min) + min;
        this.node.classList.add("vehicle-button-timer-active");
        this.timer.resetTo(duration);
        this.timer.setDirection("ltr");
        this.timer.setColor("#00FF00");
        this.setOvertime(false);
        this.timer.start();
	}

	stopTimer(success: boolean) {
        this.toggleUpgradeNode(false);
        this.setOvertime(false);
        this.timer.stop(false);
        this.node.classList.remove("vehicle-button-timer-active");

        if(success) { return; }
        
        this.interface.score.update(this.interface.getConfig().timerExpirePenalty);
        this.interface.getGame().audio.play('timer_fail_1');
	}

    onClick()
    {
        if(this.interface.isPaused()) { return; }
		if(this.timerIsActive()) {
            const success = this.overtime;
			return this.stopTimer(success);
        }

        this.startTimer();
    }

    onTimeout()
    {
        if(!this.overtime) { return this.goIntoOvertime(); }
        this.stopTimer(false);
    }

    setOvertime(val: boolean) { this.overtime = val; }
	goIntoOvertime() {
        
        if(!this.isUpgraded() && this.canUpgrade())
        {
            this.toggleUpgradeNode(true);
        }
        
        this.setOvertime(true);
        this.timer.resetTo(this.interface.getConfig().timerExpireDuration);
        this.timer.setDirection("rtl");
        this.timer.setColor("#FF0000");
        this.timer.start();

		// play simple alarm bell sound
		this.interface.getGame().audio.play('alarm_1_short');
	}
}