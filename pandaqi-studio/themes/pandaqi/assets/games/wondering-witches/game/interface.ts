import { EFFECT_DICT } from "../shared/dict"

// handles all the buttons, adding/removing, hiding/showing
export default class Interface 
{
	config: Record<string,any>;
	containers: any[];
	effectExplanations: any[];
	activeEffectExplanation: any;
	eventBalancer: { good: number; neutral: number; bad: number; };
	curEvent: any;
	eventsMinified: HTMLElement;
	eventNode: HTMLElement;

	constructor(config: Record<string, any>) 
	{ 
		this.config = config;
		this.containers = [];
		this.effectExplanations = [];
		this.activeEffectExplanation = null;
    }

	onLoadingDone()
	{
		this.prepareEvents();
	}

	prepareEvents()
	{
		if(!this.config.events) { 
			this.config.nodes.eventsContainer.style.display = 'none';
			return; 
		}
		
		this.eventBalancer = { good: 0, neutral: 0, bad: 0 };	
		this.curEvent = null;
		this.eventsMinified = document.getElementById('event-minified');
		this.eventsMinified.style.display = 'none';
		this.eventsMinified.addEventListener("click", this.toggleEventView.bind(this));

		this.eventNode = document.getElementById('event');
		this.eventNode.style.display = 'none';
	}

	addIngredient(idx: string | number, ing: any) 
	{
		const c = this.config.cauldron;

		var elem = document.createElement('div');
		elem.classList.add('oneIngredient');
		elem.dataset.num = c.getNextIndex();

		this.createRemovalButton(elem);
		this.fillIngredientUI(elem, idx, ing);

        const obj = this.config.ingredients[idx].clone();
        obj.setSeeds(0);
		c.add(obj);

		this.containers.push(elem);
		this.config.nodes.cauldron.appendChild(elem);
		if(this.config.scrollToNewIngredient) { elem.scrollIntoView(); }
		this.refresh();
	}

	removeIngredient(cont:HTMLElement)
	{
		const num = parseInt(cont.dataset.num);
        this.removeContainer(cont);
		this.config.cauldron.removeAtIndex(num);
		this.refresh();
	}
    
    removeContainer(cont: { remove: () => void; })
    {
        const idx = this.containers.indexOf(cont);
        this.containers.splice(idx, 1);
        cont.remove();
    }
    
	clearIngredients()
	{
		this.config.cauldron.clear();
        this.containers = [];
		this.config.nodes.cauldron.innerHTML = '';
		this.config.nodes.usePotionButton.style.display = 'none';
	}

	refresh()
	{
        let shouldDisplay = 'block';
        if(this.config.cauldron.isEmpty()) { shouldDisplay = 'none' }

		const n = this.config.nodes;
        n.usePotionButton.style.display = shouldDisplay;
        n.cauldron.style.display = shouldDisplay;
        n.potionResult.style.display = (shouldDisplay == "block") ? "none" : "block"; // this one is exactly the opposite

		this.recalculateNumbers();
	}

	recalculateNumbers()
	{
		let idx = 0;
		for(const cont of this.containers)
		{
			cont.dataset.num = idx;
			idx++;
		}
	}

	createRemovalButton(elem: HTMLDivElement)
	{
		const removalButton = document.createElement('button');
		removalButton.innerHTML = 'X';
        const that = this;
		removalButton.addEventListener('click', function(ev) {
			that.removeIngredient(elem);
		});
		elem.appendChild(removalButton);
	}

    getSeedList()
    {
        const arr = [];
        for(const cont of this.containers)
        {
            const select = cont.getElementsByTagName("select")[0];
            const val = select.value;
            arr.push(parseInt(val));
        }
        return arr;
    }

	fillIngredientUI(elem: HTMLDivElement, idx: any, ing: { getFrame: () => number; getName: () => string; })
	{
		// display correct ingredient type
		var typeImage = document.createElement('span');
		typeImage.innerHTML += '<div class="ingSprite-small" style="background-position:' + (-60*ing.getFrame()) + 'px;"></div>';
		elem.appendChild(typeImage);

		var typeText = document.createElement('span');
		typeText.innerHTML = ing.getName();
		typeText.classList.add('ingredientName-inCauldron');
		elem.appendChild(typeText);

		var span = document.createElement('span');
		elem.appendChild(span);
		span.innerHTML = 'Seeds: ';

		// add interactive dropdown for number of seeds
		var select = document.createElement('select');
		span.appendChild(select);

		for(var i = 0; i < this.config.numSecretIngredients; i++) {
			var option : HTMLOptionElement = document.createElement('option');
			option.value = (i+1).toString();
			option.innerHTML = (i+1).toString();
			select.appendChild(option);
		}
	}

	createAddIngredientButton(index: number, ing: { getFrame: () => number; })
	{
		const btn = document.createElement("button");
		btn.innerHTML = '<div class="ingSprite" style="background-position:' + (-120*ing.getFrame()) + 'px;"></div>';
		btn.classList.add('ingButton');
        const that = this;
		btn.addEventListener('click', function(ev) {
			that.addIngredient(index, ing);
		});		
        return btn;
	}

	onGenerationFinished()
	{
		const n = this.config.nodes;

		// create clickable ingredients (to add to potion)
		for(var i = 0; i < this.config.recipeLength; i++) 
		{
            const ing = this.config.ingredients[i];
			n.ingredientUI.appendChild(this.createAddIngredientButton(i, ing));	
		}
		
		// create effect helpers (if needed)
		this.createEffectUIHints();
	
		// show everything
		n.effectList.style.display = 'block';
		n.cauldron.style.display = 'block';
		n.ingredientUI.style.display = 'grid';
		n.solutionRevealer.style.display = 'block';

        this.refresh();
	}

	createEffectUIHints()
	{
		const puzzle = this.config.classes.puzzle;
        const effects = this.config.shuffle(puzzle.getAllEffectNames());
        const noEffects =  effects.length <= 0;
        if(noEffects) { return; }

		const message = document.createElement("p");
		message.innerHTML = "Effects in play (tap them for explanation):"
		
		const effListNode = this.config.nodes.effectList;
		const effExplNode = this.config.nodes.effectExplanations;
		effListNode.appendChild(message);

		const effectsUnique = new Set(effects);

		for(const effectName of Array.from(effectsUnique))
		{
			// create element to display the CLICKABLE event name
			let span : HTMLSpanElement = document.createElement('span');
			effListNode.appendChild(span);
			span.classList.add('effectName');
			span.innerHTML = effectName.toString();

			span.addEventListener('click', (ev) => {
				const doubleClick = effectName == this.activeEffectExplanation;
				if(doubleClick) {
					this.activeEffectExplanation = null;
					effExplNode.style.display = 'none';
					return;
				}

				effExplNode.style.display = 'block';
				effExplNode.innerHTML = this.effectExplanations[effectName as string].toString();
				this.activeEffectExplanation = effectName;
			});

			this.effectExplanations[effectName as string] = EFFECT_DICT[effectName as string].explanation;
		}
	}

	onPotionResult(params: { text: string; })
	{
		const text = params.text || "<p>No results for you :(</p>";
		
		const n = this.config.nodes;
        n.potionResult.style.display = 'block';
        n.potionResult.innerHTML = text;

        this.clearIngredients();
        this.loadNewEvent();
	}

	loadNewEvent()
	{
		if(!this.config.events || this.config.eventList.length <= 0) { return; }
		const ev = this.pickEvent();
		this.buildEventHTML(ev);
		this.giveNotification();
	}

	getTotalProb(list: any)
	{
		let prob = 0.0;
		for(const elem of list) { prob += elem.prob; }
		return prob;
	}

	drawWeighted(list: any[], remove = false)
	{
		const totalProb = this.getTotalProb(list);
		let runningSum = 0.0;
		let fraction = 1.0 / totalProb;
		const rand = Math.random();

		let counter = -1;
		while(runningSum < rand)
		{
			counter++;
			runningSum += list[counter].prob * fraction;
		}

		let elem = list[counter];
		if(remove) { list.splice(counter, 1); }
		return elem;
	}

	pickEvent()
	{
		const prob = (this.eventBalancer.good - this.eventBalancer.bad);
		let type = Math.random() <= 0.5 ? "good" : "bad";
		const neutralProb = 0.1;
		if(prob != 0)
		{
			if(prob > 0 && Math.random() <= (1.0 / prob)) { type = "bad"; }
			if(prob < 0 && Math.random() <= (1.0 / -prob)) { type = "good"; }
			if(Math.random() <= neutralProb) { type = "neutral"; }
		}

		const options = this.config.shuffle(this.config.eventList[type].slice());
		let option = this.drawWeighted(options, true);
		if(this.curEvent && option.title == this.curEvent.title) { option = this.drawWeighted(options); }

		this.curEvent = option;
		this.eventBalancer[type] += 1;
		
		return this.curEvent;
	}

	buildEventHTML(ev: { title: string; desc: string; })
	{
		const container = document.createElement("div");

		const heading = document.createElement("h2");
		container.appendChild(heading);
		heading.innerHTML = ev.title;

		const p = document.createElement("p");
		container.appendChild(p);
		p.innerHTML = ev.desc;

		this.eventNode.innerHTML = '';
		this.eventNode.appendChild(container);

		this.eventNode.style.display = 'none';
	}

	giveNotification()
	{
		this.eventsMinified.classList.add("event-notification");
		this.eventsMinified.innerHTML = "&#128266; New Event!";
		this.eventsMinified.style.display = "block";
	}

	toggleEventView()
	{
		this.eventsMinified.classList.remove("event-notification");

		const isVisible = (this.eventNode.style.display == 'block');
		if(isVisible) { 
			this.eventNode.style.display = 'none'; 
			this.eventsMinified.innerHTML = "Show Event";
		} else { 
			this.eventNode.style.display = 'block'; 
			this.eventsMinified.innerHTML = "Hide Event";
		}
	}
}