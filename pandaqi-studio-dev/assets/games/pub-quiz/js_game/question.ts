import shuffle from "js/pq_games/tools/random/shuffle"
import { parsePathToID, parseQuestionProperty, toWhiteSpaceString } from "./parser"
import { QuizParams } from "./quiz"
import QVal, { QValType } from "./questionValue"
import { showMessage } from "./errorHandler"

enum QuestionType
{
    MULTIPLE = "multiple", // a multiple choice question
    OPEN = "open", // an open question, parsed as normal
    OPEN_SINGLE = "opensingle", // an open question, but the answers should be displayed as ONE piece of text
    RANGE = "range", // the answer is a numeric range (@TODO: not implemented yet) => interpret the first two answers given as the bounds of that range?
}

export { Question, QuestionType }
export default class Question
{
    quizID: string;
    type: QVal;
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
        if(this.isOpen()) { return; }
        shuffle(this.answers, rng);
    }

    isMultipleChoice() { return this.type.get() == QuestionType.MULTIPLE; }
    isOpen() { return this.type.get() == QuestionType.OPEN || this.type.get() == QuestionType.OPEN_SINGLE; }
    isValid()
    {
        const visibleQuestions = this.getQuestionValues("question", QValType.QUESTION);
        const visibleAnswers = this.getQuestionValues("question", QValType.QUESTION);
        return visibleQuestions.length > 0 && visibleAnswers.length > 0;
    }

    finalize(params:QuizParams)
    {
        this.quizID = params.id;

        if(!this.isValid())
        {
            showMessage(["Question wants to be finalized, but isn't valid.", this], this.quizID);
            return;
        }

        this.finalizeCategories(params);
        this.finalizeCorrectAnswer(params);
        this.finalizeAuthor(params);

        const typeInferred = this.answers.length == 1 ? QuestionType.OPEN : QuestionType.MULTIPLE;
        this.type = this.type ?? new QVal(typeInferred); 

        if(!this.score) { this.score = new QVal(params.defaultScore + ""); }

        if(this.isMultipleChoice())
        {
            const tooFewAnswers = this.answers.length < (params.minAnswers ?? 2);
            if(tooFewAnswers) { showMessage(["Multiple choice question has too few answers", this], this.quizID); }

            const tooManyAnswers = this.answers.length > (params.maxAnswers ?? Infinity);
            if(tooManyAnswers) { showMessage(["Multiple choice question has too many answers", this], this.quizID); }
        }
        
    }

    finalizeAuthor(params:QuizParams)
    {
        if(!this.author || this.author.length <= 0) { this.author = [new QVal(params.defaultAuthor)]; }
        if(params.possibleAuthors)
        {
            const list = this.getQuestionValues("author");
            for(const author of list)
            {
                if(params.possibleAuthors.includes(author)) { continue; }
                showMessage(["Question has author " + author + " which is not a possible author", this], this.quizID);
            }
        }
    }

    finalizeCategories(params:QuizParams)
    {
        if(!this.category || this.category.length <= 0) { this.category = [new QVal(params.defaultCategory)]; }
        
        if(params.possibleCategories)
        {
            const list = this.getQuestionValues("category");
            for(const cat of list)
            {
                if(params.possibleCategories.includes(cat)) { continue; }
                showMessage(["Question has category " + cat + " which is not a possible category", this], this.quizID);
            }
        }

        this.category.sort((a,b) => {
            return a.get().localeCompare(b.get());
        })
    }

    finalizeCorrectAnswer(params:QuizParams)
    {
        if(!this.correct) { this.correct = this.answers[0]; }
        
        // easiest case: correct answer included, great, stop here
        const list = this.getQuestionValues("answers", QValType.QUESTION);
        let correctAnswerIncluded = list.includes(this.correct.get());

        // try to find a correct answer, but spelled differently
        if(!correctAnswerIncluded)
        {
            for(const answer of list)
            {
                if(answer.toLowerCase() != this.correct.get().toLowerCase()) { continue; }
                showMessage(["Question had a correct answer (" + this.correct.get() + "), but spelled differently from the real one (" + answer + ")", this], this.quizID);
                this.correct = new QVal(answer);
                correctAnswerIncluded = true;
                break;
            }
        }

        // if still not included, mention it and try our best with the first answer
        if(!correctAnswerIncluded) 
        { 
            showMessage(["Question has no valid correct answer ", this], this.quizID);
            this.correct = this.answers[0];
        }

        // safeguard against some annoying situations
        const correctAnswerNotVisible = this.correct.type == QValType.ANSWER;
        if(correctAnswerNotVisible)
        {
            showMessage(["Question's correct answer is not question visible", this], this.quizID);
        }
    }

    updateProperty(prop:string, val:string|string[], params:QuizParams = {})
    {
        if(val.length <= 0) { return; }
        if(!Array.isArray(val)) { val = [val]; }

        if(!Object.keys(this).includes(prop))
        {
            showMessage(["Unknown question property: " + prop, this], this.quizID);
            return;
        }

        const valParsed : QVal[] = parseQuestionProperty(prop, val, params);
        if(valParsed.length <= 0)
        {
            showMessage("Can't set property " + prop + " to empty value: " + val, this.quizID);
            return;
        }

        const isList = Array.isArray(this[prop]);
        if(!isList)
        {
            if(valParsed.length <= 1) { this[prop] = valParsed[0]; }
            else { showMessage("Can't set (single) property " + prop + " to value " + val, this.quizID); }
            return;
        }

        for(const elem of valParsed)
        {
            this[prop].push(elem);
        }
    }

    getPropertySingle(prop:string) : string
    {
        const values = this.getQuestionValues(prop);
        if(!values) { return ""; }
        if(!Array.isArray(values)) { return values; }
        return values[0];
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
        let list = this[key];
        if(!Array.isArray(list)) { list = [list]; }

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

    getAnswers(qValType:QValType)
    {
        const rawValues = this.getQuestionValues("answers", qValType);
        if(this.type.get() == QuestionType.OPEN_SINGLE)
        {
            return [toWhiteSpaceString(rawValues)];
        }
        return rawValues;
    }

    toString()
    {
        return "<strong>&ldquo;" + this.getQuestionValues("question").join(" ") + "&rdquo;</strong>";
    }

}