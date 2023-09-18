import { FIRST_HINT_TYPES, EFFECTS, EFFECT_DICT } from "../js_shared/dict"

// Holds the puzzle and solution + can print/explain it
export default class Puzzle 
{
	config: Record<string,any>;
	puzzle: any[];
	solution: any[];
	valid: boolean;
	numSecretIngredients: number;

	constructor(config: Record<string, any>) {
		this.config = config;
		this.puzzle = [];
		this.solution = []; // this has the INGREDIENT numbers, not just [1,2,3,4], obviously
		this.valid = false;
	}

	getSolution()
	{
		return this.solution;
	}

	isValid()
	{
		return this.valid;
	}

	startGeneration()
	{
		setTimeout(this.generate.bind(this), 10);
	}

	generate() {
		this.valid = false;
		
        this.create();
        this.check();
		
        if(!this.valid) { this.startGeneration(); return; }

		this.finishGeneration();
	}

	finishGeneration() {
		this.config.cauldron.clear();
		this.config.nodes.potionResult.innerHTML = this.getFirstHint();
		this.config.classes.UI.onGenerationFinished();
	}

	getNumbersInRandomOrder()
	{
		const list = [];
		for(var i = 0; i < this.config.recipeLength; i++) {
			const partOfRecipe = i < this.config.numSecretIngredients;
			if(partOfRecipe) { list[i] = (i+1); }
			else { list[i] = -1; }
		}
		return this.config.shuffle(list);
	}

	updateIngredientData(order: string | any[])
	{
		this.puzzle = [];
		for(let i = 0; i < order.length; i++)
		{
			const secretNum = order[i];
			const obj = this.config.ingredients[i];

            obj.clearEffects();
			obj.setNum(secretNum);
            if(secretNum == -1) { obj.makeDecoy(); }
            else { obj.removeDecoy(); }
			
			this.puzzle.push(obj);
		}
	}

	create()
	{
		const numbers = this.getNumbersInRandomOrder();
		this.updateIngredientData(numbers);
		this.determineEffects();
	}

	determineEffects() {		
		const listCopy = {};

		// first clean it out, just in case
		for (const key in EFFECT_DICT) { delete EFFECT_DICT[key]; }

		for(const key of Object.keys(EFFECTS))
		{
			listCopy[key] = this.config.shuffle(EFFECTS[key].slice());
            for(const val of EFFECTS[key]) { EFFECT_DICT[val.name] = val; }
		}

		if(!this.config.effects) { return; }
		const possibleEffectTypes = ['ChangeCauldron', 'Investigative', 'ChangePlayers'];
		let finalEffectList = [
			listCopy['ChangeCauldron'].pop(),
			listCopy['Investigative'].pop(),
			listCopy['ChangePlayers'].pop(),
		];

		const allowComplexEffects = this.config.recipeLength >= 7;
		if(allowComplexEffects) {
			finalEffectList.push( listCopy['Complex'].pop() );
			possibleEffectTypes.push('Complex');
		}

        let flatList = [];
        for(const key in listCopy) {
            flatList.push(listCopy[key]);
        }

		flatList = flatList.flat();
        this.config.shuffle(flatList);

		while(finalEffectList.length < this.config.numEffects) 
        {
			finalEffectList.push( flatList.pop() );
		}

        if(finalEffectList.length > this.config.numEffects)
        {
            finalEffectList = finalEffectList.slice(0, this.config.numEffects);
        }

		let numBrothers = 0;
		let numEnemies = 0;
		for(const eff of finalEffectList)
		{
			if(eff.name == "Brothers") { numBrothers++; }
			if(eff.name == "Enemies") { numEnemies++; }
		}

		if(numBrothers == 1) { finalEffectList.push(EFFECT_DICT["Brothers"]); }
		if(numEnemies == 1) { finalEffectList.push(EFFECT_DICT["Enemies"]); }

		const ingredientOptions = this.puzzle.slice();
		this.config.shuffle(ingredientOptions);
		while(finalEffectList.length > 0 && ingredientOptions.length > 0)
		{
			let ing = ingredientOptions[Math.floor(Math.random() * ingredientOptions.length)];
			if(this.config.oneEffectPerIngredient) { ing = ingredientOptions.pop(); }

			const eff = finalEffectList.pop(); // @NOTE: This is an "Effect" object instance
			if(!eff.name) { continue; }
			ing.addEffect(eff.name);
		}
	}

	check()
	{
		// if perfect order works, we're done
		let perfectSolution = this.getPerfectSolution();
		const evaluator = this.config.classes.potionEvaluator;
		if(evaluator.usePotion(perfectSolution, true))
		{
			this.solution = perfectSolution;
			this.valid = true;
			return;
		}

		// 1) RECURSIVE => slower, but 100% correct
		const useRecursiveGenerator = this.config.recipeLength <= 6; 
		if(useRecursiveGenerator)
		{
			this.solution = [];
			this.valid = this.checkCombinationRecursive(this.solution);
			return;
		}

		// 2) DEVIATIONS => faster, but might miss a solution 
		// start from perfect solution
		// we deviate more and more, trying to find a solution
		const maxDeviation = Math.round(0.66 * (this.config.recipeLength - this.config.numSecretIngredients));

		let numTries = 0;
		const maxTries = 500;
		this.valid = false;
		while(numTries <= maxTries)
		{
			const deviation = Math.floor(Math.random() * maxDeviation) + 1;
			const sol = perfectSolution.slice();

			const numToAdd = Math.floor(Math.random() * deviation);
			const numToChange = deviation - numToAdd;

			// adds new elements to the solution; any element, any index
			for(let i = 0; i < numToAdd; i++)
			{
				let randIdx = Math.floor(Math.random() * sol.length);
				let randNum = Math.floor(Math.random() * this.config.numIngredients);
				sol.splice(randIdx, 0, randNum)
			}

			// changes an existing element
			for(let i = 0; i < numToChange; i++)
			{
				sol[i] = Math.floor(Math.random() * this.config.numIngredients);
			}

			if(evaluator.usePotion(sol, true)) {
				this.solution = sol;
				this.valid = true;
				break;
			}

			numTries++;
		}
	}

	// just place ingredients in the right order
	// if no effects or other weird things, this would be the solution
	getPerfectSolution()
	{
		const numSecret = this.config.numSecretIngredients;
		const arr = new Array(numSecret);
		const ings = this.config.ingredients;
		for(let i = 0; i < ings.length; i++)
		{
			if(ings[i].isImposter()) { continue; }

			const idx = ings[i].getNum() - 1;
			if(idx < 0 || idx >= numSecret) { continue; }
			arr[idx] = i;
		}

		//console.log(arr); => useful when debugging
		return arr;
	}
	
	// @HEURISTIC: Some decoys can be ignored (no effects, ignore or imposter)
	// @HEURISTIC: Ingredients without secret num and without order-changing effect can be ignored
	checkCombinationRecursive(comb: any[]) {
		const potionIsLongEnough = comb.length >= this.config.numSecretIngredients;
		if(potionIsLongEnough) 
		{ 
			const evaluator = this.config.classes.potionEvaluator;
			return evaluator.usePotion(comb, true); 
		}
	
		const ing = (comb.length > 0) ? this.puzzle[ comb[comb.length - 1] ] : null;
		
        // @NOTE: we don't forbid checking yourself again, 
        // because more complex recipes can have the same ingredient multiple times (in succession)
		for(var i = 0; i < this.puzzle.length; i++) {
			const newVal = this.puzzle[i];

			if(ing)
			{
				const isIgnorableDecoy = ing.isDecoy() && !ing.hasEffect() && !ing.isDecoyType(1);
				if(isIgnorableDecoy) { continue; }

				const hasConsistentEffect = ing.hasOnlyOrderConsistentEffects();
				if(!ing.hasNum() && hasConsistentEffect) { continue; }
			}

			comb.push(i);
			if(this.checkCombinationRecursive(comb)) { return true; }	
			comb.pop();
		}
	
		return false;
	}

	getFirstHint()
	{
		if(!this.config.freeClue) { return "<p>Have fun! Potion results will be here.</p>"; }

		const type = FIRST_HINT_TYPES[Math.floor(Math.random()*FIRST_HINT_TYPES.length)];
	
		var arr = ['<p>Here\'s a <strong>free clue</strong> to start the game!</p><p>'];
		
		if(type == "Group")
		{
			const puzzleCopy = this.puzzle.slice();
            const numRevealed = (this.config.recipeLength >= 6) ? 3 : 2;
			const set = this.config.shuffle(puzzleCopy).slice(0,numRevealed);

			if(set[0].isDecoy()) {
				arr.push('One of these ingredients is a DECOY: ');
			} else {
				arr.push('One of these ingredients has number ' + set[0].getNum() + ': ');
			}

			this.config.shuffle(set);

            if(set.length == 2) { arr.push(set[0].getName() + " or " + set[1].getName()); }
            else if(set.length == 3) { arr.push(set[0].getName() + ', ' + set[1].getName() + ' or ' + set[2].getName()); }
		}

		else if(type == "Negative")
		{
			var idx = Math.floor(Math.random() * this.puzzle.length);
			var ing = this.puzzle[idx];
			arr.push(ing.getName() + ' is NOT ');

			const num = ing.getNum();
            let numRandom = this.config.getRandomSecretNum();
			const isNonImposterDecoy = (num == -1 || num == 0 || num == (this.config.numSecretIngredients + 1));
			if(isNonImposterDecoy) { 
				arr.push(numRandom); 
			
			} else {
                if(numRandom == num) { numRandom = (numRandom % this.config.numSecretIngredients) + 1; }
                arr.push(numRandom);
			}
		}
	
		else if(type == "Effects")
		{
			var ing = this.puzzle[Math.floor(Math.random() * this.puzzle.length)];
			arr.push(ing.getName());

			const effectsNotEnabled = (this.config.effectsLevel == 0);
			if(effectsNotEnabled) {
				if(ing.isDecoy()) {
					arr.push(' is a decoy');
				} else if(ing.getNum() <= Math.floor(0.5*this.config.numSecretIngredients)) {
					arr.push(' should be in the first half of the potion');
				} else {
					arr.push(' should be in the last half of the potion');
				}
			
			} else {
				arr.push(' has ' + ing.countEffects() + ' effects ');
			}
		}
	
		arr.push('</p>');
		return arr.join("");
	}

    getAllEffectNames()
    {
        const arr = [];
        for(const elem of this.puzzle)
        {
            arr.push(elem.effects)
        }
        return arr.flat();
    }

	getSolutionIndex(ing: { getIndex: () => any; })
	{
		return this.getSolution().indexOf(ing.getIndex());
	}

	showSolution() 
	{
		if(!confirm("Are you sure you want to see the solution?")) { return; }

		const solutionParts = new Array(this.numSecretIngredients);
		const remainingParts = [];

		for(const ing of this.config.ingredients) 
		{
			const num = ing.hasNum() ? ' = ' + ing.getNum() : "";
			const effects = ing.hasEffect() ? ' | Effects: ' + ing.getEffectsAsString() : "";
			const decoy = ing.isDecoy() ? ' | Decoy: ' + ing.getDecoyAsName() : "";

			const txt = '<p><strong>' + ing.getName() + '</strong><span>' + num + effects + decoy + '</span></p>';

			const idx = this.getSolutionIndex(ing);
			const partOfSolution = (idx >= 0);

			if(partOfSolution) { solutionParts[idx] = txt; }
			else { remainingParts.push(txt); }
		}
		
		const res = solutionParts.concat(remainingParts).join("");
		const n = this.config.nodes;
		n.potionResult.style.display = 'block';
		n.potionResult.innerHTML = res;
	}
}