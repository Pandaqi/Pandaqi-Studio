import Cauldron from "./cauldron";
import { EFFECT_DICT } from "../js/dictionary"

export default class PotionEvaluator 
{
    config: Record<string,any>;
    cauldron: Cauldron;
    
    constructor(config: Record<string, any>) 
    {
        this.config = config;
        this.cauldron = null;
    }

    initializeCauldron(fixedInput: any)
    {
        // @NOTE: used for debugging AND testing if the generated puzzle is solvable
        if(fixedInput)
        {
            this.cauldron = new Cauldron(this.config);
            this.config.cauldron = this.cauldron;
            this.cauldron.createFromIndices(fixedInput);
            this.cauldron.cloneAllContent(); // to ensure we don't modify the original secret number
            return;
        }

        this.cauldron = this.config.cauldron;

        this.cauldron.setSeeds(this.config.classes.UI.getSeedList());
        this.cauldron.cloneAllContent();
    }

    weWon(obj: { growingResult?: string; totalEffectResult?: any[]; numUndergrown?: number; numOvergrown?: number; elementsConsidered: any; numWrongIngredients: any; fertilizerActive?: boolean; skipElement?: boolean; res?: any; })
    {
        const codeLongEnough = (obj.elementsConsidered >= this.config.numSecretIngredients);
        const noMistakes = (obj.numWrongIngredients == 0);
        return noMistakes && codeLongEnough;
    }

    checkIngredient(idx: number, ing: { getSeeds: () => number; setSeeds: (arg0: any) => void; getNum: () => any; isImposter: () => any; effects: any; }) {
        const obj = { 
            idx: idx,
            ing: ing,
            isWrong: false, 
            feedbackText: [], 
            effect: "",
            directEffects: {
                "Cutoff": false,
                "Enthusiastic": false,
                "Fertilizer": false,
                'Resetter': false,
                'Coward': false,
            } 
        };

        // when testing a potion, we don't have seeds (through the interface)
        // so set it to whatever is correct

        if(ing.getSeeds() <= 0) { ing.setSeeds(ing.getNum()); }
        obj.isWrong = !this.cauldron.isOrderCorrect(idx-1, idx);

        if(ing.isImposter()) { obj.isWrong = true; }

        for(const eff of ing.effects)
        {
            obj.effect = eff;
            this.checkEffect(obj);
        }

        return obj;
    }

    evaluate(obj: { growingResult?: string; totalEffectResult?: any[]; numUndergrown: any; numOvergrown: any; elementsConsidered: any; numWrongIngredients: any; fertilizerActive: any; skipElement?: boolean; res: any; skip?: any; ing?: any; })
    {
        if(obj.skip) { return; }

        obj.elementsConsidered++;

        const fert = obj.fertilizerActive;
        const ignoreGrowthCheck = fert;

        if(obj.ing.isUndergrown() && !ignoreGrowthCheck) {
            obj.numUndergrown++;
            obj.res.isWrong = true;
        }

        if(obj.ing.isOvergrown() && !ignoreGrowthCheck) {
            obj.numOvergrown++;
            obj.res.isWrong = true;
        }

        if(fert) { obj.fertilizerActive = false; }
        if(obj.res.isWrong) { obj.numWrongIngredients++; }
    }
    
    usePotion(fixedInput = null, earlyCutoff = false) 
    {
        if(!Array.isArray(fixedInput)) { fixedInput = null; }
        const headerless = fixedInput;
        this.initializeCauldron(fixedInput);

        const data = { 
            growingResult: '',
            totalEffectResult: [],
            numUndergrown: 0,
            numOvergrown: 0,
            elementsConsidered: 0,
            numWrongIngredients: 0,
            fertilizerActive: false,
            skipElement: false,
            res: null,
            idx: -1,
            ing: "",
            skip: false,
            totalEffectResultString: ""
        }

        const content = this.cauldron.getContent();
        for(let i = 0; i < content.length; i++) {
            if(data.skipElement) { data.skipElement = false; continue; }

            const idx = i, elem = content[i];
            const res = this.checkIngredient(idx, elem);
            console.log(res);
            if(res.isWrong && earlyCutoff) { return false; }

            const de = res.directEffects;

            let skipEvaluation = false;
            if(!elem.hasNum()) { skipEvaluation = true; }
            if(de['Coward'] && i < (content.length - 1)) { skipEvaluation = true; i--; }
            
            data.idx = idx;
            data.ing = elem; 
            data.skip = skipEvaluation;
            data.res = res;

            this.evaluate(data); 

            for(const fb of res.feedbackText) {
                data.totalEffectResult.push(fb);
            }

            if(de["Cutoff"]) { break; }
            if(de["Enthusiastic"]) { data.skipElement = true; }
            if(de["Fertilizer"]) { data.fertilizerActive = true; }
            if(de["Resetter"]) {
                data.elementsConsidered = 0;
                data.numWrongIngredients = 0;
                data.totalEffectResult = [];
                data.numOvergrown = 0;
                data.numUndergrown = 0;
                data.fertilizerActive = false;
            }
        }

        data.growingResult = '<p>Potion had <strong>' + data.numUndergrown + ' undergrown</strong> and <strong>' + data.numOvergrown + ' overgrown</strong> ingredients.</p>';
        data.totalEffectResultString = this.config.shuffle(data.totalEffectResult).join("");

        const weWon = this.weWon(data);
        if(weWon) {
            data.growingResult = '';
            data.totalEffectResultString = '<p class="winMessage">Congratulations! You won!</p>';
        }

        if(headerless) { return weWon; }

        this.config.classes.UI.onPotionResult({ text: data.growingResult + data.totalEffectResultString });
        return weWon;
    }

    checkEffect(params:Record<string,any>)
    {
        const effectName = params.effect;
        if(!effectName) { return; }

        const effectData = EFFECT_DICT[effectName];
        
        params.singular = effectData.singular;
        if(effectData.isInvestigative()) { params.singular = false; }

        params.feedbackValue = effectData.feedback || "";
        if(effectData.directEffect) { 
            params.directEffects[effectData.directEffect] = true;
        }

        // @NOTE: all "board" and "player" effects are handled by default, as they are merely feedback
        this.checkCauldronEffects(params);
        this.checkInvestigativeEffects(params);
        this.checkComplexEffects(params);

        let myFeedbackText = this.generateFeedback(params);
        if(params.obscureName) { myFeedbackText = params.feedbackValue }
        if(!myFeedbackText) { return; }

        params.feedbackText.push(myFeedbackText);
    }

    generateFeedback(params:Record<string,any>)
    {
        if(!params.feedbackValue) { return ""; }
        if(params.singular) { return "<p>" + params.feedbackValue + "</p>"; }
        return '<p><strong>' + params.effect + '</strong> says <strong>' + params.feedbackValue + '</strong></p>';
    }

    // Effects handled by default: Cutoff, Enthusiastic, Fertilizer
    checkCauldronEffects(params:Record<string,any>)
    {
        const e = params.effect;
		if(e == 'Spicy') {
			this.cauldron.updateSecretNum(params.idx + 1, 1);
        } else if(e == 'Refreshing') {
			this.cauldron.updateSecretNum(params.idx + 1, -1);
        } else if(e == 'Cleaner') {
			this.cauldron.cleanAtIndex(params.idx + 1);
        }
    }

    checkInvestigativeEffects(params:Record<string,any>)
    {
        const e = params.effect;
        if(e == "Liar") {
            const numbersNotPresent = this.cauldron.getNumbersPresent(false);
			params.feedbackValue = 'nothing to say';
			if(numbersNotPresent.length > 0) {
				const randNum = numbersNotPresent[Math.floor(Math.random()*numbersNotPresent.length)];
				params.feedbackValue = 'number ' + randNum;
			}
        
        } else if(e == "Detective") {
			params.feedbackValue = 'number ' + this.cauldron.getRandomNumber();
        
        } else if(e == "General") {
			params.feedbackValue = this.cauldron.countNumEffects();
        
        } else if(e == "Inspector") {
			params.feedbackValue = this.cauldron.countIngredientsWithAnEffect();
        
        } else if(e == "Calculator") {
			params.feedbackValue = this.cauldron.getSecretNumberSum();

        } else if(e == "Revealer") {
			params.feedbackValue = this.cauldron.countDecoys(true);

        } else if(e == "Blessing") {
			params.feedbackValue = this.cauldron.countDecoys(false);

        } else if(e == "Hugger") {
            const isAdjacent = this.cauldron.secretNumbersAreAdjacent(params.idx, params.idx - 1);
			params.feedbackValue = isAdjacent ? 'YES' : 'NO';

        } else if(e == "Scientist") {
            const hasMultiEffect = this.cauldron.hasMultiEffect();
			params.feedbackValue = hasMultiEffect ? 'YES' : 'NO';

        } else if(e == "Crowdy") {
			if(this.cauldron.getSize() < 4) { params.feedbackValue = ""; }

        } else if(e == "Brothers") {
            params.singular = true;
            params.isWrong = (this.cauldron.countNumWithEffectOfType("Brothers") < 2) || params.isWrong;
        
        } else if(e == "Enemies") {
            params.singular = true;
            params.isWrong = (this.cauldron.countNumWithEffectOfType("Enemies") >= 2) || params.isWrong;

        } else if(e == "Optimist") {
			params.feedbackValue = this.cauldron.countNumCorrect(true) + " are correct";
            
        } else if(e == "Pessimist") {
			params.feedbackValue = this.cauldron.countNumCorrect(false) + " are incorrect";

        } else if(e == "Joker") {
			var validFakeEffects = ["Liar", "Detective", "General", "Inspector", "Calculator", "Revealer", "Blessing", "Hugger"];
			var randEffect = validFakeEffects[Math.floor(Math.random()*validFakeEffects.length)];

            params.effect = randEffect;
            params.obscureName = true;
            this.checkEffect(params); //@NOTE: this already adds itself to the feedback, we don't need to do it again
        }
    }

    // Handled by default: Resetter, Student, Spreader
    checkComplexEffects(params: Record<string,any>)
    {
        const e = params.effect;
        if(e == "Equalizer") {
            const numEffects = this.cauldron.get(params.idx + 1).countEffects();
            this.cauldron.setSecretNum(params.idx + 1, numEffects);

        } else if(e == "Random") {
            const rand = this.config.getRandomSecretNum();
            this.cauldron.setSecretNum(params.idx, rand);

        } else if(e == "Blender") {
            const numGood = this.cauldron.countDecoys(false);
            this.cauldron.updateSecretNum(params.idx, numGood);

        } else if(e == "Downer") {
            const numBad = this.cauldron.countDecoys(true);
            this.cauldron.updateSecretNum(params.idx, numBad);

        } else if(e == "Teamplayer") {
            if(params.idx <= 0) { return; }
            const numBefore = this.cauldron.get(params.idx-1).getNum();
            this.cauldron.setSecretNum(params.idx, numBefore);

        } else if(e == "Analyzer") {
            params.feedbackValue = "no distance possible ...";
            if(!params.ing.hasNum()) { return; }
            
            const dist = Math.abs(params.ing.getNum() - (params.idx + 1));
            params.feedbackValue = "distance was " + dist;

        } else if(e == "Odd") { 
            const cauldronSizeIsOdd = this.cauldron.getSize() % 2 == 1;
            if(!cauldronSizeIsOdd) { return; }

            params.ing.clearEffects();
            params.ing.setNum(-1);
            params.ing.makeDecoy(0);

        } else if(e == "Even") {
            const cauldronSizeIsEven = (this.cauldron.getSize() % 2 == 0);
            if(!cauldronSizeIsEven) { 
                var randNum = this.config.getRandomSecretNum();
                params.ing.setNum(randNum);
                params.feedbackValue = "I'm number " + randNum;
                return;
            }

            params.feedbackValue = "I'm a decoy";
            if(!params.ing.isDecoy()) { params.feedbackValue = "I'm number " + params.ing.getNum(); }
            
        } else if(e == "Coward") {
            this.cauldron.moveToEnd(params.idx);

        }
    }
}