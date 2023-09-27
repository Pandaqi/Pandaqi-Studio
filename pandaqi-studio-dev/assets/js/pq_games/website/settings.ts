import PandaqiPhaser from "js/pq_games/website/phaser"
import { PageOrientation } from "js/pq_games/pdf/pdfBuilder"

class SettingsClass
{
	gameButtonCallback : (this: HTMLButtonElement, ev: any) => void
	startGameBtn : HTMLButtonElement

	boardButtonCallback : (this: HTMLButtonElement, ev: any) => void
	generateBoardBtn : HTMLButtonElement

	init()
	{
		this.initGame();
		this.initBoard();
	}

	// This is for GAMES (hybrid/interactive)
	initGame(clean = false)
	{
		this.gameButtonCallback = this.onGameButtonClicked.bind(this);
		const startGameBtn = this.getStartGameButton();
		if(!startGameBtn) { return; }
		if(clean) { startGameBtn.onclick = null; }
		this.startGameBtn = startGameBtn;
		this.startGameBtn.addEventListener('click', this.gameButtonCallback);
	}

	onGameButtonClicked(ev:any)
	{
		ev.preventDefault();
		ev.stopPropagation();

		const cfg = this.readFrom(this.startGameBtn);
		window.localStorage.setItem(cfg.localstorage, JSON.stringify(cfg));
		
		if(cfg.singleClick)
		{
			this.startGameBtn.removeEventListener("click", this.gameButtonCallback);
		}

		if(cfg.stayOnPage) { return false; }
		
		const URL = cfg.targetURL ?? "game"; // "game.html";
		return window.open(URL, "_blank");
	}

	// This is for BOARD generation (merely downloadable PDF)
	initBoard(clean = false)
	{
		this.boardButtonCallback = this.onBoardButtonClicked.bind(this);
		const generateBoardBtn = this.getGenerateBoardButton();
		if(!generateBoardBtn) { return; }
		this.generateBoardBtn = generateBoardBtn;
		if(clean) { generateBoardBtn.onclick = null; }
		generateBoardBtn.addEventListener("click", this.boardButtonCallback);
	}

	onBoardButtonClicked(ev:any)
	{
		const gameConfig = this.readFrom(this.generateBoardBtn);
		console.log("gameConfig", gameConfig);
		this.addDefaultParams(gameConfig);
		setTimeout(() => { PandaqiPhaser.start(gameConfig); }, 50);

		ev.preventDefault();
		ev.stopPropagation();
		return false;
	}

	getStartGameButton() : HTMLButtonElement
	{
		return document.getElementById('btn-start-game') as HTMLButtonElement;
	}

	getGenerateBoardButton() : HTMLButtonElement
	{
		return document.getElementById('btn-generate-board') as HTMLButtonElement;
	}

	addToConfig(cfg:Record<string,any>, id:string, val:any)
	{
		const idSplit = id.split("-");
		if(idSplit.length == 3) {
			const subcat = idSplit[1];
			const key = idSplit[2];
			if(!(subcat in cfg)) { cfg[subcat] = {}; }
			cfg[subcat][key] = val;
		} else if(idSplit.length == 2) {
			const key = idSplit[1];
			cfg[key] = val;
		}
	}

	// override some crucial settings if not provided
	addDefaultParams(cfg : Record<string,any> = {})
	{
		const randomSeedLength = Math.floor(Math.random() * 6) + 3;
		const randomSeed = Math.random().toString(36).replace(/[^a-z]+/g, '').slice(0, randomSeedLength);
		const defaultParams = {
			seed: randomSeed,
			numPlayers: 4,
			inkFriendly: false,
			orientation: PageOrientation.LANDSCAPE,
			gameTitle: "Title"
		}

		for(const key in defaultParams)
		{
			if(key in cfg && cfg[key]) { continue; }
			cfg[key] = defaultParams[key];
		}
	}

	bubbleUpFrom(node:HTMLElement) : HTMLElement
	{
		let containerClass = "game-settings-container";
		while(node)
		{
			const validContainers : Element[] = Array.from(node.getElementsByClassName(containerClass));
			if(validContainers.length > 0) { return validContainers[0] as HTMLElement; }
			node = node.parentElement;
		}
		return null;
	}

	readFrom(startNode:HTMLElement) : Record<string,any>
	{
		const container = this.bubbleUpFrom(startNode);
		if(!container) { return {}; }
		
		const inputs = Array.from(container.getElementsByTagName("input"));
		const selects = Array.from(container.getElementsByTagName("select"))

		const allInputs : any[] = [].concat(inputs).concat(selects);

		let cfg : Record<string,any> = {};
		for(const input of allInputs)
		{
			let val : boolean|string = input.value;
			if(input.type == "checkbox") { val = input.checked; }
			this.addToConfig(cfg, input.id, val);
		}

		cfg.localstorage = container.dataset.localstorage;
		cfg.targetURL = container.dataset.targeturl;
		cfg.stayOnPage = container.dataset.stayonpage;
		cfg.singleClick = container.dataset.singleclick;
		console.log(cfg);
		return cfg;
	}
};

export default new SettingsClass();