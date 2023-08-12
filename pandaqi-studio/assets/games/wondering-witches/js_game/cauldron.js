import Ingredient from "./ingredient";

// holds the ingredients + seeds currently input by player
export default class Cauldron {
	constructor(config) { 
		this.config = config;
		this.content = []; 
	}
	clear() { this.content = []; }
	isEmpty() { return this.content.length <= 0; }
	outOfBounds(idx) { return idx < 0 || idx >= this.content.length; }
	add(ing) { this.content.push(ing); }
	removeAtIndex(idx) { this.content.splice(idx, 1); }
	getNextIndex() { return this.content.length; }
    getContent() { return this.content; }
    getSize() { return this.content.length; }
    get(idx) { 
        if(this.outOfBounds(idx)) { return new Ingredient(this.config, 0); }
        return this.content[idx];
    }

	cloneAllContent()
	{
		for(let i = 0; i < this.content.length; i++)
		{
			this.content[i] = this.content[i].clone();
		}
	}

    setSeeds(seedList)
    {
        for(let i = 0; i < this.content.length; i++)
        {
            this.content[i].setSeeds(seedList[i]);
        }
    }

    createFromIndices(inds) 
    { 
        this.clear();
        for(const ind of inds)
        {
            this.content.push(this.config.ingredients[ind]);
        }
    }

	updateSecretNum(idx, dn) 
	{
		if(this.outOfBounds(idx)) { return; }
		this.setSecretNum(idx, this.content[idx].getNum() + dn);
	}

    setSecretNum(idx, val)
    {
        if(this.outOfBounds(idx)) { return; }
        this.content[idx].setNum(val);
    }

	cleanAtIndex(idx)
	{
		if(this.outOfBounds(idx)) { return; }
		this.content[idx].clearEffects();
	}

	hasNum(num)
	{
		for(const elem of this.content)
		{
			if(elem.hasNum(num)) { return true; }
		}

		return false;
	}

	getRandomNumber()
	{
		const randIngredient = this.content[Math.floor(Math.random() * this.content.length)];
		return randIngredient.num;
	}

	getNumbersPresent(present)
	{
		const list = [];
		for(let i = 0; i < this.config.numSecretIngredients; i++) { 
			if(this.hasNum(i) != present) { continue }
            list.push(i); 
		}
		return list;
	}

	countNumEffects()
	{
		let sum = 0;
		for(const elem of this.content) {
			sum += elem.countEffects();
		}
		return sum;
	}

	countIngredientsWithAnEffect()
	{
		let sum = 0;
		for(const elem of this.content)
		{
			if(elem.countEffects() <= 0) { continue; }
			sum += 1;
		}
		return sum;
	}

	getSecretNumberSum()
	{
		let sum = 0;
		for(const elem of this.content) {
			if(!elem.hasNum()) { continue; }
			sum += elem.num;
		}
		return sum;
	}

	countDecoys(isDecoy = true)
	{
		let sum = 0;
		for(const elem of this.content)
		{
			if(elem.isDecoy() != isDecoy) { continue; }
			sum++;
		}
		return sum;
	}

	secretNumbersAreAdjacent(idx1, idx2, maxDist = 1)
	{
		if(this.outOfBounds(idx1) || this.outOfBounds(idx2)) { return false; }

		const dist = Math.abs(this.content[idx1].getNum() - this.content[idx2].getNum());
		return dist <= maxDist;
	}

    isOrderCorrect(idx1, idx2)
    {
        if(this.outOfBounds(idx1) || this.outOfBounds(idx2)) { return true; }
        return this.content[idx1].getNum() == (this.content[idx2].getNum() - 1)
    }

    countNumCorrect(correct)
    {
        let sum = 0;
        for(let i = 1; i < this.content.length; i++)
        {
            if(this.isOrderCorrect(i-1, i) != correct) { continue; }
            sum++;
        }
        return sum;
    }

	hasMultiEffect()
	{
		for(const elem of this.content)
		{
			if(elem.isMultiEffect()) { return true; }
		}
		return false;
	}

	countNumWithEffectOfType(tp)
	{
		let sum = 0;
		for(const elem of this.content)
		{
			if(!elem.hasEffect(tp)) { continue; }
			sum++;
		}
		return sum
	}

    moveToEnd(idx)
    {
        const ing = this.content.splice(idx, 1)[0];
        this.content.push(ing);
    }
}