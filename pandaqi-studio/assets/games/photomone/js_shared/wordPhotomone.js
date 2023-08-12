import Helpers from "./helpers";

export default class WordPhotomone {
    constructor(wordData, config)
    {
        this.config = config;
        this.baseLines = 10;
        this.lineVariation = { min: 0, max: 8 };
        this.charsPerLine = 5;
        this.basePoints = 1;
        this.pointVariation = { min: 0, max: 4 };
        this.charsPerPoint = 7;

        this.linesPerDifficulty = { core: 0, easy: 4, medium: 8, hard: 12, hardcore: 16 };
        this.pointsPerDifficulty = { core: 0, easy: 2, medium: 4, hard: 6, hardcore: 8 };

        this.linesBonusPerCategory = { occupations: 8, places: 4 };
        this.pointsBonusPerCategory = { occupations: 2, places: 1 };

        this.wordData = wordData;

        const randomness = Math.random();
        this.numLines = this.calculateNumberOfLines(randomness);
        this.points = this.calculatePointValue(1.0 - randomness); 
    }

    getWord()
    {
        if(this.wordIsString()) { return this.wordData; }
        return this.wordData.getWord();
    }

    getLines() { return this.numLines; }
    updateLines(dl) { this.numLines += dl; }
    setLines(l) { this.numLines = l; }
    getPoints() { return this.points; }
    updatePoints(dp) { this.points += dp; }
    setPoints(p) { this.points = p; }

    wordIsString()
    {
        return (typeof this.wordData === 'string');
    }

    calculateNumberOfLines(randomness)
    {
        let num = this.baseLines;
        if(this.wordIsString()) { num += this.calculateLinesFromString(); }
        else { num += this.calculateLinesFromMetadata(); }

        const randVal = this.lineVariation.min + Math.floor( randomness * (this.lineVariation.max - this.lineVariation.min + 1));
        num += randVal;

        const lengthBonus = Math.floor(this.getWord().length / this.charsPerLine);
        num += lengthBonus;

        num += this.getLineBonus();

        num = Helpers.roundToMultiplesOf(num, this.config.numberRounding.lines);
        if(this.config.printWordsOnPaper) { num = Helpers.roundToValueList(num, this.config.wordsOnPaperLineValues); }

        return num;
    }

    getLevel() { return this.wordData.getMetadata().level || "core"; }
    getCategory() { return this.wordData.getMetadata().cat || "food"; }

    calculateLinesFromString() { return 0; }
    getLineBonus() 
    { 
        return this.linesBonusPerCategory[this.getCategory()] || 0;
    }
    calculateLinesFromMetadata()
    {
        return this.linesPerDifficulty[this.getLevel()] || 0;
    }

    calculatePointValue(randomness)
    {
        let num = this.basePoints;
        if(this.wordIsString()) { num += this.calculatePointsFromString(); }
        else { num += this.calculatePointsFromMetadata(); }

        const randVal = this.pointVariation.min + Math.floor( randomness * (this.pointVariation.max - this.pointVariation.min + 1));
        num += randVal;

        const lengthBonus = Math.floor(this.getWord().length / this.charsPerPoint);
        num += lengthBonus;

        if(this.config.printWordsOnPaper) { num *= this.config.wordsOnPaperPointsScalar }
        num = Helpers.roundToMultiplesOf(num, this.config.numberRounding.points);
        return num;
    }

    calculatePointsFromString() { return 0; }
    getPointBonus()
    {
        return this.pointsBonusPerCategory[this.getCategory()] || 0;
    }
    calculatePointsFromMetadata()
    {
        return this.pointsPerDifficulty[this.getLevel()] || 0;
    }
}
