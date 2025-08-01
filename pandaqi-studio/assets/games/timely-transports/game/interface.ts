import { CITY_NAMES, PLAYERCOUNT_TO_CITYCOUNT, GOODS, EVENTS, DIFFICULTY_LEVELS } from "../shared/dict"
import GlobalTimer from "./globalTimer"
import Score from "./score"
import Buttons from "./buttons"
import Goods from "./goods"
import Events from "./events"
import Random from "js/pq_games/tools/random/main"
import { CONFIG } from "../shared/config"

export default class Interface {
    game: any
    paused: boolean
    config: Record<string,any>
    ambienceSound: any
    node: any
    globalTimer: GlobalTimer
    score: Score
    events: Events
    goods: Goods
    buttons: Buttons
    
    constructor(game: any, config: Record<string, any>)
    {
        this.game = game;
        this.paused = false;
        this.config = this.setupConfig(config);
        this.setupDictionaries();
        console.log(this.config);
        this.setupHTML();
        this.playAmbienceSound();
    }
    
    setupConfig(config:Record<string, any>)
    {
        const baseConfig = {
            playerCount: 4,
			difficulty: "trainingWheels",
			pointsToWin: 30,
			minGoodTimer: 35,
			maxGoodTimer: 80,
			goodRunoutTime: 15,
            soloModeTimerDuration: 20*60, // 20*60 seconds; so 20 minutes
            timerExpireDuration: 10,
            timerExpirePenalty: -3,
            upgradeCost: 4,
            goodsEnabled: false,
            upgradesEnabled: false,
            planesAndTrainsDisabled: true,
            cityNames: [],
            difficultyIndex: 0,
            upgradeButtonPath: CONFIG.assetsBase + "upgrade_button.webp",
            addGlobalTimer: false,
            eventsEnabled: false,
		}

        // override config with meaningful properties set by user
        for(const [key,val] of Object.entries(config))
        {
            if(val == null || val == undefined) { continue; }
            baseConfig[key] = val;
        }

        // @TODO: probably just want to set such properties ("goodsEnabled") on the difficulty object directly?
        const difficultyIndex = DIFFICULTY_LEVELS[baseConfig.difficulty];
        baseConfig.difficultyIndex = difficultyIndex;
        baseConfig.goodsEnabled = (difficultyIndex > 0);
		baseConfig.planesAndTrainsDisabled = (difficultyIndex < 2);
        baseConfig.upgradesEnabled = (difficultyIndex >= DIFFICULTY_LEVELS["anotherUpgrade"]);
        baseConfig.addGlobalTimer = (baseConfig.playerCount == 1);
        baseConfig.eventsEnabled = (difficultyIndex >= DIFFICULTY_LEVELS["extraordinaryEvents"])
        return baseConfig
    }

    prepareCities() {
		const maxCities = PLAYERCOUNT_TO_CITYCOUNT[this.config.playerCount];
		this.config.cityNames = CITY_NAMES.splice(0, maxCities)
	}

	prepareGoods() {
        const goods = structuredClone(GOODS); 
        this.config.goods = goods;
		for(const [key,value] of Object.entries(goods)) {
            // @ts-ignore
            const goodDifficulty = DIFFICULTY_LEVELS[value.difficulty || "trainingWheels"];
            if(goodDifficulty <= this.config.difficultyIndex) { continue; }
            delete goods[key];
		}
	}

    prepareEvents()
    {
        const events = structuredClone(EVENTS);
        this.config.events = events;

        // some events are only included in later difficulty levels (e.g. Rubber madness stuff); filter
        for(const [key,value] of Object.entries(events)) {
            // @ts-ignore
            const eventDifficulty = DIFFICULTY_LEVELS[value.difficulty || "trainingWheels"];
            if(eventDifficulty <= this.config.difficultyIndex) { continue; }
            delete events[key];
        }
    }

    setupDictionaries()
    {
        this.prepareCities();
		this.prepareGoods();
        this.prepareEvents();
    }

    playAmbienceSound()
    {
        const shouldPlay = (this.config.playerRank == 1);
        if(!shouldPlay) { return; }

        this.ambienceSound = this.game.audio.play("jungle_ambience_2", { loop: true, volume: 0.68 });
    }

    stopAmbienceSound()
    {
        if(!this.ambienceSound) { return; }
        this.ambienceSound.disconnect(); 
        this.ambienceSound = null;
    }

    setPaused(val: boolean)
    {
        this.paused = val;

        if(val) {
            this.stopAmbienceSound();
        } else {
            this.playAmbienceSound();
        }

        const ev = new CustomEvent("pause", { detail: { paused: val } });
        this.node.dispatchEvent(ev);
    }
    isPaused() { return this.paused; }

    getContainer() { return this.node; }
    getConfig() { return this.config; }
    getGame() { return this.game; }
    addEventListener(type: any, callback: any)
    {
        this.node.addEventListener(type, callback);
    }
    setupHTML()
    {
        this.node = document.createElement("div");
        document.getElementById("game-container").appendChild(this.node);

        this.globalTimer = new GlobalTimer(this);
        this.score = new Score(this);
        if(this.config.eventsEnabled) { this.events = new Events(this); }
        if(this.config.goodsEnabled) { this.goods = new Goods(this); }
        this.buttons = new Buttons(this);
    }

    getRandomCity() 
    {
        const cities = this.config.cityNames;
		return cities[Math.floor(Math.random() * cities.length)];
	}

	getRandomGood() 
    {
        return Random.getWeighted(this.config.goods, "prob")
	}
    
	getRandomEvent()
    {
        return Random.getWeighted(this.config.events, "prob");
	}

}