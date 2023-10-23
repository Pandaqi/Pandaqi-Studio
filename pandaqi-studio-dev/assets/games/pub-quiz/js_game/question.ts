import shuffle from "js/pq_games/tools/random/shuffle"
import { parsePathToID, parseQuestionProperty } from "./parser"

export default class Question
{
    question: string
    category: string[]
    media: string[]
    score: string|number
    correct: string
    answers: string[]
    color: string

    constructor()
    {
        this.category = [];
        this.media = [];
        this.answers = [];
    }

    hasQuestion() { return this.question.length >= 1; }
    hasAnswers() { return this.answers.length >= 1; }
    hasCorrectAnswer() { return this.correct.length >= 1; }
    hasMedia() { return this.media.length >= 1; }
    shuffleAnswers(rng:any)
    {
        shuffle(this.answers, rng);
    }

    isOpen()
    {
        return this.answers.length == 1;
    }

    isValid()
    {
        return this.hasQuestion() && this.hasAnswers();
    }

    finalize()
    {
        if(!this.hasAnswers()) { return; }

        if(this.category.length <= 0) { this.category.push("general"); }
        if(!this.correct || !this.answers.includes(this.correct)) { this.correct = this.answers[0]; }
        
        this.category.sort((a,b) => {
            return a.localeCompare(b);
        })

        if(!this.score) { this.score = 1; }
        // @ts-ignore
        this.score = parseInt(this.score);
    }

    updateProperty(prop:string, val:string)
    {
        const valParsed : string[] = parseQuestionProperty(val);
        if(valParsed.length <= 0)
        {
            console.error("Can't set property " + prop + " to empty value: " + val);
            return;
        }

        const isList = Array.isArray(this[prop]);
        if(!isList)
        {
            if(valParsed.length <= 1) { this[prop] = valParsed[0]; }
            else { console.error("Can't set property " + prop + " to value " + val); }
            return;
        }

        for(const elem of valParsed)
        {
            this[prop].push(elem);
        }
    }

    isCorrectAnswer(val:string)
    {
        return this.correct == val || this.correct == parsePathToID(val); 
    }

}