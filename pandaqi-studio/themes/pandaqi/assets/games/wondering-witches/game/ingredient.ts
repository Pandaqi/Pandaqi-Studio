import { INGREDIENTS, DECOY_NAMES, EFFECT_DICT } from "../shared/dict"

// holds one ingredient
export default class Ingredient 
{
	config: Record<string,any>;
	name: string;
	index: number;
	effects: string[];
	decoy: number;
	seeds: number;
	num: number;

	constructor(config: Record<string, any>, index: number, num = 1, effects = [], decoy = -1, seeds = 0) {
		this.config = config;
		this.setNum(num);
        this.name = this.config.ingredients[index];
		this.index = index; 
		this.effects = effects;
		this.decoy = decoy;
        this.seeds = seeds;
	}

    setName(n: string) { this.name = n; }
    getFrame() { return INGREDIENTS[this.name]; }

    clone() { return new Ingredient(this.config, this.index, this.num, this.effects.slice(), this.decoy, this.seeds); }
	getName() { return this.name; }
	getIndex() { return this.index; }
	getNum() { return this.num; }
    setNum(n: number)  { this.num = n; }
	hasNum(num = null) 
	{ 
		if(num != null) { return this.num == num } 
		return this.num >= 0; 
	}

	isUndergrown() { 
		if(this.isDecoy() && !this.isImposter()) { return false; }
		return this.seeds < this.num; 
	}
    isOvergrown() { 
		if(this.isDecoy() && !this.isImposter()) { return false; }
		return this.seeds > this.num; 
	}

    setSeeds(s: number) { this.seeds = s; }
    getSeeds() { return this.seeds; }

	isDecoy() { return this.decoy >= 0; }
	isDecoyType(tp: number) { return this.decoy == tp; }
	getDecoyAsName() { return DECOY_NAMES[this.decoy]; }
    removeDecoy() { this.decoy = -1; }
	isImposter() { return this.decoy == 2; }
	makeDecoy(type = -1) 
	{ 
		let rand = Math.random();
		let decoyStatus = 0;
		let newNum = this.num;

        const dramaDecoysNotEnabled = !this.config.dramaDecoys;
		if(rand <= 0.45 || dramaDecoysNotEnabled) {
			decoyStatus = 0;
		} else if(rand <= 0.8) {
			decoyStatus = 1;
		} else {
			decoyStatus = 2;
		}

        if(type >= 0) { decoyStatus = type; }
        if(decoyStatus == 1) { 
			newNum = Math.random() <= 0.5 ? 0 : (this.config.numSecretIngredients + 1);
        } else if(decoyStatus == 2) {
            newNum = this.config.getRandomSecretNum();
			this.addEffect("Imposter");
        }

        this.decoy = decoyStatus;
		this.num = newNum;
	}
	
	isMultiEffect() { return this.effects.length > 1; }
	getEffectsAsString() { return this.effects.join(", "); }
	countEffects() { return this.effects.length; }
	addEffect(tp: string) { this.effects.push(tp); }
	clearEffects() { this.effects = []; }
	hasEffect(tp = null) 
	{ 
		if(tp == null) { return this.effects.length > 0 } 
		return this.effects.includes(tp); 
	}

	hasOnlyOrderConsistentEffects()
	{
		if(this.countEffects() == 0) { return true; }
		let changesOrder = false;
		for(const eff of this.effects)
		{
			const data = EFFECT_DICT[eff];
			if(!(data.isInvestigative() || data.isAbility())) { continue; }
			changesOrder = true;
		}
		return changesOrder;
	}
}

