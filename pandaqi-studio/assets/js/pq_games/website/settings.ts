import BoardVisualizer from "js/pq_games/website/boardVisualizer"
import Point from "../tools/geometry/point"
import { PageFormat, PageOrientation } from "../pdf/pdfEnums"

interface SettingsConfig
{
	localstorage?: string,
	singleClick?: boolean,
	stayOnPage?: boolean,
	targetURL?: string,

	seed?: string,
	useRandomSeed?: boolean, // to remember we're using random seeds for re-generations
	numPlayers?: number,
	inkFriendly?: boolean,
	orientation?: PageOrientation,
	gameTitle?: string,

	secretBoard?: boolean,
	pageSize?: PageFormat,
	size?: Point,

	// passed into the board class by boardVisualizer itself
	visualizer?: BoardVisualizer,

	// these are used/set automatically by the Phaser system as it loads, otherwise not used I think?
	canvas?: HTMLCanvasElement,
	bgColor?: string
}

export type { SettingsConfig }
class SettingsClass
{
	gameButtonCallback : (this: HTMLButtonElement, ev: MouseEvent) => void
	startGameBtn : HTMLButtonElement

	boardButtonCallback : (this: HTMLButtonElement, ev: MouseEvent) => void
	generateBoardBtn : HTMLButtonElement

	init()
	{
		this.initGame();
		this.initBoard();
		this.initSections();
	}

	// Fold/Unfold for setting sections => at some point, functionality like this should receive its own .ts file!!!
	initSections()
	{
		const nodes = Array.from(document.getElementsByClassName("game-settings-section")) as HTMLElement[];

		const fold = (node, content, instruction, forced = false) =>
		{
			if(!forced) { node.dataset.folded = "true"; }
			content.style.display = "none";
			instruction.innerHTML = "(Click to unfold.)";
		}

		const unfold = (node, content, instruction, forced = false) =>
		{
			if(!forced) { node.dataset.folded = "false"; }
			content.style.display = "grid";
			instruction.innerHTML = "(Click to fold.)";
		}

		for(const node of nodes)
		{
			const header = node.getElementsByClassName("section-header")[0] as HTMLElement;
			const instruction = header.getElementsByClassName("section-instruction")[0] as HTMLElement;
			const content = node.getElementsByClassName("section-content")[0] as HTMLElement;

			// simple fold/unfold system through clicks on the header
			header.addEventListener("click", (ev) => 
			{
				if(node.dataset.folded == "true") {
					unfold(node, content, instruction);
				} else {
					fold(node, content, instruction);
				}
			});

			// if we start folded, do a fake click to easily achieve that state
			const startFolded = node.dataset.folded == "true";
			if(startFolded) 
			{
				fold(node, content, instruction, true);
			}

		}
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

	onGameButtonClicked(ev:MouseEvent)
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

	onBoardButtonClicked(ev:MouseEvent)
	{
		ev.preventDefault();
		ev.stopPropagation();

		const cfg = this.readFrom(this.generateBoardBtn);
		this.addDefaultParams(cfg);
		window.localStorage.setItem(cfg.localstorage, JSON.stringify(cfg));

		const URL = cfg.targetURL ?? "board";
		return window.open(URL, "_blank");
	}

	getStartGameButton() : HTMLButtonElement
	{
		return document.getElementById('btn-start-game') as HTMLButtonElement;
	}

	getGenerateBoardButton() : HTMLButtonElement
	{
		return document.getElementById('btn-generate-board') as HTMLButtonElement;
	}

	// @NOTE: The first part of an input id is literally IGNORED (it's usually setting-, but can be settingBoard- sometimes)
	// Why does it exist? To keep the id unique on the page
	// What comes after "setting-" is the actual name being used in the config passed on
	// And if there are multiple things (setting-expansions-blabla), then the third is used and put into the group "expansions"
	addToConfig(cfg:SettingsConfig, id:string, val:any)
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
	addDefaultParams(cfg:SettingsConfig = {})
	{
		const defaultParams = {
			useRandomSeed: !cfg.seed,
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

	readFrom(startNode:HTMLElement) : SettingsConfig
	{
		const container = this.bubbleUpFrom(startNode);
		if(!container) { return {}; }
		
		const inputs = Array.from(container.getElementsByTagName("input"));
		const selects = Array.from(container.getElementsByTagName("select"))

		const allInputs : (HTMLInputElement|HTMLSelectElement)[] = [inputs,selects].flat();

		let cfg:SettingsConfig = {};
		for(const input of allInputs)
		{
			let val : boolean|string = input.value;
			if(input instanceof HTMLInputElement && input.type == "checkbox") { val = input.checked; }
			this.addToConfig(cfg, input.id, val);
		}

		cfg.localstorage = container.dataset.localstorage;
		cfg.targetURL = container.dataset.targeturl;
		cfg.stayOnPage = !!container.dataset.stayonpage;
		cfg.singleClick = !!container.dataset.singleclick;
		console.log(cfg);
		return cfg;
	}
};

export default new SettingsClass();