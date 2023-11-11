import shuffle from "js/pq_games/tools/random/shuffle"
import { parsePathToID, parseQuestionProperty } from "./parser"
import { QuizParams } from "./quiz"
import QVal, { QValType } from "./questionValue"

export default class Question
{
    question: QVal[]
    comment: QVal[]
    category: QVal[]
    media: QVal[]
    score: QVal
    correct: QVal
    answers: QVal[]
    author: QVal[]
    color: QVal
    url: string // origin file of this question, for easier debugging/finding an error in submitted questions

    constructor()
    {
        this.category = [];
        this.media = [];
        this.answers = [];
        this.question = [];
        this.author = [];
        this.comment = [];
    }

    hasQuestion() { return this.question.length >= 1; }
    hasAnswers() { return this.answers.length >= 1; }
    hasCorrectAnswer() { return this.correct.isValid(); }
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

        if(this.category.length <= 0) { this.category.push(new QVal(params.defaultCategory)); }
        if(params.possibleCategories)
        {
            const list = this.getQuestionValues("category");
            for(const cat of list)
            {
                if(params.possibleCategories.includes(cat)) { continue; }
                console.error("Question has category " + cat + " which is not a possible category", this);
            }
        }

        if(!this.correct) { this.correct = this.answers[0]; }
        if(this.correct) {
            let correctAnswerIncluded = false;
            if(this.answers.includes(this.correct)) { correctAnswerIncluded = true; }

            if(!correctAnswerIncluded)
            {
                const list = this.getQuestionValues("answers", QValType.QUESTION);
                for(const answer of list)
                {
                    if(answer.toLowerCase() != this.correct.get().toLowerCase()) { continue; }
                    console.error("Question had a correct answer (" + this.correct + "), but spelled differently from the real one (" + answer + ")", this);
                    this.correct = new QVal(answer);
                    correctAnswerIncluded = true;
                    break;
                }
            }

            if(!correctAnswerIncluded) 
            { 
                console.error("Question has no valid correct answer ", this);
                this.correct = this.answers[0];
            }
        }

        if(!this.correct || !this.answers.includes(this.correct)) { this.correct = this.answers[0]; }
        
        this.category.sort((a,b) => {
            return a.get().localeCompare(b.get());
        })

        if(!this.score) { this.score = new QVal(params.defaultScore + ""); }

        if(!this.author || this.author.length <= 0) { this.author = [new QVal(params.defaultAuthor)]; }
        if(params.possibleAuthors)
        {
            const list = this.getQuestionValues("author");
            for(const author of list)
            {
                if(params.possibleAuthors.includes(author)) { continue; }
                console.error("Question has author " + author + " which is not a possible author", this);
            }
        }
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

        const valParsed : QVal[] = parseQuestionProperty(prop, val);
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

    getPropertySingle(prop:string) : string
    {
        const val = this[prop];
        if(!val) { return ""; }
        if(Array.isArray(val) && val.length > 0) { return this[prop][0].toString(); }
        return val.toString();
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
        return this.correct.get() == val || this.correct.get() == parsePathToID(val); 
    }

    getQuestionValues(key:string, type:QValType = QValType.ALL) : string[]
    {
        const list = this[key];
        const arr = [];
        let matches = [QValType.QUESTION, QValType.ALL, QValType.ANSWER];
        if(type == QValType.QUESTION) { matches = [QValType.QUESTION, QValType.ALL]; }
        else if(type == QValType.ANSWER) { matches = [QValType.ANSWER, QValType.ALL]; }

        for(const elem of list)
        {
            if(!matches.includes(elem.type)) { continue; }
            arr.push(elem.get());
        }

        return arr;
    }

}