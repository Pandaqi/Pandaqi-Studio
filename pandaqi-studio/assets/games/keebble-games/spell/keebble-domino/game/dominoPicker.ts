import getWeighted from "js/pq_games/tools/random/getWeighted";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import { CONFIG } from "./config";
import { CELLS, KEEBBLE_LETTER_VALUES, LETTERS, REAL_LETTER_FREQS } from "./dict";
import Domino from "./domino";
import Visualizer from "./visualizer";

interface DominoPickParams
{

}

interface RandomLetterParams
{
    letterData?: Record<string,any>,
    numLettersPlaced?: number,
    useDynamicProbs?: boolean,
    emptyDominoProb?: number,
}

export const dominoPicker = () : Domino[] =>
{
    const numDominoes = 80;
    const allDominoes = [];
    for(let i = 0; i < numDominoes; i++)
    {
        allDominoes.push(new Domino());
    }

    let numLettersPlaced = 0;
    const letterData = {};
    for(const key in KEEBBLE_LETTER_VALUES)
    {
        letterData[key] = { freq: 0 };
    }

    // calculate dictionaries to use and their probabilities
    const letterValues = KEEBBLE_LETTER_VALUES;
    const emptySideProb = 0.25;
    for(const symbol of Object.keys(LETTERS))
    {
        const expansion = LETTERS[symbol].expansion;
        if(expansion && !CONFIG.expansions[expansion])
        {
            delete LETTERS[symbol];
            continue;
        }

        const alreadyHasProb = LETTERS[symbol].prob;
        if(alreadyHasProb) { continue; }

        let prob = 0;
        let letters = LETTERS[symbol].letters;
        for(const letter of letters)
        {
            if(!letter) { prob += emptySideProb; continue; }
            prob += (1.0 / letterValues[letter]);
        }
        prob /= letters.length;

        LETTERS[symbol].prob = prob;
    }

    // the number of special cells should be strictly controlled
    // so we decide a good number, add those first (completely randomly)
    // once done, we simply fill up all empty spaces with letters
    const specialCellBounds = { min: 0.145, max: 0.2375 }; // "Scrabble" has roughly 0.26 = 26% of the board a special cell
    const min = specialCellBounds.min*numDominoes;
    const max = specialCellBounds.max*numDominoes;
    let numSpecialCells = rangeInteger(min, max);
    if(!CONFIG.expansions.specialCells) { numSpecialCells = 0; }

    const finalDominoes = [];
    for(let i = 0; i < numSpecialCells; i++)
    {
        const randIndex = Math.floor(Math.random() * allDominoes.length);
        const randDomino = allDominoes[randIndex];
        const randomCellType = getRandomCellType();
        const success = randDomino.setEmptySideTo("cell", randomCellType);
        if(success) { continue; }
        finalDominoes.push( allDominoes.splice(randIndex, 1)[0] );
    }

    function registerLettersOf(letterName)
    {
        if(letterName == "") { return; }
        const lettersInside = LETTERS[letterName].letters;
        for(const l of lettersInside)
        {
            if(!l) { continue; }
            letterData[l].freq += 1;
            numLettersPlaced += 1;
        }
    }

    // similarly, we want to make sure each symbol appears at least ONCE
    // (otherwise uncommon letters might be left out completely)
    for(const letter of Object.keys(LETTERS))
    {
        const randIndex = Math.floor(Math.random() * allDominoes.length);
        const randDomino = allDominoes[randIndex];
        randDomino.setEmptySideTo("letter", letter);
        registerLettersOf(letter);
    }

    const useDynamicProbs = false;
    let emptyDominoProb = 0.085;
    // special cells are, kind of, empty already
    // so greatly lower their probability if special cells are enabled
    if(CONFIG.expansions.specialCells) { emptyDominoProb = 0.01; } 
    
    while(allDominoes.length > 0)
    {
        const randIndex = Math.floor(Math.random() * allDominoes.length);
        const randDomino = allDominoes[randIndex];
        const drawParams : RandomLetterParams = {
            letterData: letterData,
            numLettersPlaced: numLettersPlaced,
            useDynamicProbs: useDynamicProbs,
            emptyDominoProb: emptyDominoProb
        }
        const randomLetter = getRandomLetter(drawParams);
        const success = randDomino.setEmptySideTo("letter", randomLetter);
        if(success) 
        { 
            registerLettersOf(randomLetter);
            continue; 
        }
        finalDominoes.push( allDominoes.splice(randIndex, 1)[0] );
    }

    return finalDominoes;

}

const printStatistics = (list:Domino[]) =>
{
    const letterData : Record<string,{freq:number, ratioError?:number}> = {};
    for(const key in KEEBBLE_LETTER_VALUES)
    {
        letterData[key] = { freq: 0 };
    }

    let numLetters = 0;
    for(const elem of list)
    {
        for(let i = 0; i < 2; i++)
        {
            const part = elem.getSide(i);
            if(part.getType() == "letter")
            {
                if(part.getValue() == "") { continue; }

                const letters = LETTERS[part.getValue()].letters;
                for(const letter of letters)
                {
                    if(!letter) { continue; }
                    numLetters += 1;
                    letterData[letter].freq += 1;
                }
            }
        }
    }

    for(const [key,elem] of Object.entries(letterData))
    {
        const givenRatio = elem.freq / (numLetters + 0.0)
        const targetRatio = REAL_LETTER_FREQS[key];
        elem.ratioError = (givenRatio/targetRatio);
    }

    console.log("== Letter frequencies ==");
    console.log(letterData);
}

const getRandomCellType = () => { return getWeighted(CELLS); }
const getRandomLetter = (params:RandomLetterParams) =>
{
    let ratioErrors;
    if(params.useDynamicProbs)
    {
        ratioErrors = {};
        for(const [key,data] of Object.entries(params.letterData))
        {
            // @ts-ignore
            const ratio = data.freq / params.numLettersPlaced;
            const targetRatio = REAL_LETTER_FREQS[key];
            ratioErrors[key] = targetRatio/ratio;
            // @ts-ignore
            if(data.freq == 0) { ratioErrors[key] = 0; }
        }    
    }

    const makeEmpty = Math.random() <= params.emptyDominoProb
    if(makeEmpty) { return ""; }

    for(const letter of Object.values(LETTERS))
    {
        let probDynamic = 0;
        let probFactor = letter.probFactor || 1.0;

        if(params.useDynamicProbs)
        {
            let lettersConsidered = 0;
            for(const l of letter.letters)
            {
                if(!l) { continue; }
                probDynamic += ratioErrors[l];
                lettersConsidered += 1;
            }
            probDynamic /= lettersConsidered;
        }
        
        const probCustom = letter.prob*probFactor + probDynamic;
        letter.probCustom = Math.max(probCustom, 0);
    }

    return getWeighted(LETTERS, "probCustom");
}