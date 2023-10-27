import shuffle from "js/pq_games/tools/random/shuffle"
import { parsePathToID, parseQuestionProperty } from "./parser"
import { QuizParams } from "./quiz"

export default class Question
{
    question: string[]
    category: string[]
    media: string[]
    score: string|number
    correct: string
    answers: string[]
    author: string[]
    color: string

    constructor()
    {
        this.category = [];
        this.media = [];
        this.answers = [];
        this.question = [];
        this.author = [];
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

    finalize(params:QuizParams)
    {
        if(!this.hasAnswers()) { return; }

        if(this.category.length <= 0) { this.category.push(params.defaultCategory); }
        if(!this.correct || !this.answers.includes(this.correct)) { this.correct = this.answers[0]; }
        
        this.category.sort((a,b) => {
            return a.localeCompare(b);
        })

        if(!this.score) { this.score = params.defaultScore; }
        // @ts-ignore
        this.score = parseInt(this.score);
        if(!this.author || this.author.length <= 0) { this.author = [params.defaultAuthor]; }
    }

    updateProperty(prop:string, val:string|string[])
    {
        if(val.length <= 0) { return; }
        if(!Array.isArray(val)) { val = [val]; }

        if(!Object.keys(this).includes(prop))
        {
            console.error("Unknown question property: " + prop, this);
            return;
        }

        const valParsed : string[] = parseQuestionProperty(prop, val);
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

    propertyAlreadyHasData(prop:string)
    {
        const val = this[prop]
        if(Array.isArray(val)) { return val.length > 0; }
        else if(typeof val == "object") { return Object.keys(val).length > 0; }
        return val;
    }

    isCorrectAnswer(val:string)
    {
        return this.correct == val || this.correct == parsePathToID(val); 
    }

}