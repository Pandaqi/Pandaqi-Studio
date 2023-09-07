import Cauldron from "./cauldron";
import PotionEvaluator from "./evaluator";
import Ingredient from "./ingredient";
import Interface from "./interface";
import Puzzle from "./puzzle";
import { INGREDIENTS, EVENTS } from "../js/dictionary"

export default class Game 
{
	config: Record<string,any>

	constructor()
	{
		this.config = this.setupConfig();
		this.cacheHTML();
		this.setupClasses();
		this.setupNodes();
	}
	
	setupConfig()
	{
		const config:Record<string,any> = {};
		const userConfig = JSON.parse(window.localStorage.wonderingWitchesConfig);
		userConfig.recipeLength = parseInt(userConfig.recipeLength);
		Object.assign(config, userConfig);

		config.numSecretIngredients = 4;
		config.randomizeIngredientsUsed = false; // works, but prevents linking ANY board with ANY game started

		let minEffects = 1;
		let maxEffects = config.recipeLength*0.5;
		if(userConfig.competitive) { maxEffects *= 0.5; }

		config.numEffects = Math.floor(Math.random() * (maxEffects - minEffects) + minEffects);

		config.oneEffectPerIngredient = true;
		config.scrollToNewIngredient = false;

		// load ingredients in a more usable way
		const ingredientNames = Object.keys(INGREDIENTS);
		if(config.randomizeIngredientsUsed) { this.config.shuffle(ingredientNames); }

		config.ingredients = ingredientNames.slice(0, config.recipeLength);

		for(let i = 0; i < config.ingredients.length; i++)
		{
			const name = config.ingredients[i];
			const obj = new Ingredient(config, i)
			obj.setName(name);
			config.ingredients[i] = obj;
		}

		config.numIngredients = config.ingredients.length;

		// load events in a more usable way (based on good/bad)
		const events = {};
		let prob = 0.0;
		for(const [key, event] of Object.entries(EVENTS))
		{
			const type = event.type;
			if(!(type in events)) { events[type] = []; }
			events[type].push(event);
			prob += event.prob;
		}
		config.eventList = events;
		config.totalEventProb = prob;

		// useful functions
		config.shuffle = function(a) {
			var j, x, i;
			for (i = a.length - 1; i > 0; i--) {
				j = Math.floor(Math.random() * (i + 1));
				x = a[i];
				a[i] = a[j];
				a[j] = x;
			}
			return a;
		}
		
		config.getRandomSecretNum = function() {
			return Math.floor(Math.random() * config.numSecretIngredients) + 1;
		}
		
		return config;
	}

	cacheHTML()
	{
		// cache references to all important/interactive nodes
		this.config.nodes = {
			potionResult: document.getElementById('potion-result'),
			cauldron: document.getElementById('current-cauldron'),
			ingredientUI: document.getElementById("ingredient-clicker"),
			effectList: document.getElementById('effects-in-play'),
			effectExplanations: document.getElementById('effect-explanations'),
			solutionButton: document.getElementById('solution-button'),
			usePotionButton: document.getElementById('use-potion-button'),
			solutionRevealer: document.getElementById('solution-revealer'),
			eventsContainer: document.getElementById('events-container'),
		}
	}

	setupClasses()
	{
		this.config.classes = {
			cauldron: new Cauldron(this.config),
			UI: new Interface(this.config),
			puzzle: new Puzzle(this.config),
			potionEvaluator: new PotionEvaluator(this.config)
		}

		this.config.classes.UI.onLoadingDone();
		this.config.classes.puzzle.startGeneration();
	}

	setupNodes()
	{
		const n = this.config.nodes;
		const puzzle = this.config.classes.puzzle;
		const evaluator = this.config.classes.potionEvaluator;
		n.solutionButton.addEventListener('click', puzzle.showSolution.bind(puzzle) );
		n.usePotionButton.addEventListener('click', evaluator.usePotion.bind(evaluator) );
		window.onbeforeunload = () => { return "If you leave now, your current game will be deleted. Are you sure?"; };

		n.potionResult.style.display = 'block';

		const p = document.createElement("p");
		p.innerHTML = "<span>Generating puzzle. If still busy after 30 seconds: </span>"

		const a = document.createElement("a");
		a.innerHTML = "reload";
		p.appendChild(a);
		a.classList.add('reload-btn');
		a.addEventListener("click", (ev) => { window.location.reload(); });

		n.potionResult.innerHTML = '';
		n.potionResult.appendChild(p);
	}

}

new Game();
