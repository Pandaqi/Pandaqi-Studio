import Loader from "./loader";
import Nodes from "./nodes";
import Question from "./question";
import seedrandom from "js/pq_games/tools/random/seedrandom";
import DOM from "./dom";
import clamp from "js/pq_games/tools/numbers/clamp";
import { anyMatch, getAllPossibleValuesFor, parseQuestionsIntoJSON, shuffle } from "./parser";
import ErrorHandler from "./errorHandler";

interface ParseSymbols
{
    comment?: string,
    pairing?: string,
    questionOnly?: string,
    answerOnly?: string,
    inlineList?: string,
    keepAsIs?: string,
    section?: string,
}

interface QuizParams
{
    id?: string, // if you want multiple quizzes on the same page, they need unique IDs
    url?: string,
    filename?: string, // for automatic pattern matching (name_0, name_1, ...)
    filenames?: string[], // for fixed filenames given by user, can be anything
    fileExtensions?: string[],
    seed?: string,
    subFolders?: { media?: string, questions?: string },
    excludeSections?: boolean,
    allowInput?: boolean,

    loadExternalMediaAsIframe?: boolean,
    linkPrefixes?: string[],
    mediaFormats?: string[],

    defaultCategory?: string,
    possibleCategories?: string[],
    hideCategory?: boolean,
    
    defaultAuthor?: string,
    possibleAuthors?: string[],
    hideAuthor?: boolean,

    minScore?: number,
    maxScore?: number,
    defaultScore?: number,
    hideScore?: boolean,

    symbols?: ParseSymbols,
    groupBy?: string,
    exclude?: Record<string, any>, // a FILTER: any properties with these values are removed from the question set
    include?: Record<string, any>, // a MASK: only questions with properties matching these values are added to the question set
    minAnswers?: number,
    maxAnswers?: number,
    questionTypesAllowed?: string[],

    enableInlineLists?: boolean,
    enableSafety?: boolean,
    enableMouse?: boolean,
    enableKeys?: boolean,
    enableUI?: boolean,
    showErrors?: boolean,
    loadDefaultStyles?: boolean
}

enum QuizMode
{
    QUESTIONS,
    ANSWERS
}

const DEFAULT_ID = "defaultQuizID";
const DEFAULT_SEED = "quiz";
const DEFAULT_SCORE = 1;
const DEFAULT_AUTHOR = "anonymous";
const DEFAULT_CATEGORY = "general";

export { QuizMode, QuizParams, Quiz }
export default class Quiz
{
    params: QuizParams;
    questions: Question[];
    loader: Loader;
    nodes: Nodes;
    mode: QuizMode;
    rng: any;
    dom: DOM;
    counter: number;
    enableSafety: boolean;
    groupBy: string;

    colors = ["red", "orange", "green", "blue", "turquoise", "purple", "pink"]
    errorHandler: ErrorHandler;
    id: string;

    constructor(params:QuizParams = {})
    {
        this.params = params;

        const seed = params.seed ?? DEFAULT_SEED;

        params.defaultAuthor = params.defaultAuthor ?? DEFAULT_AUTHOR;
        params.defaultCategory = params.defaultCategory ?? DEFAULT_CATEGORY;
        params.defaultScore = params.defaultScore ?? DEFAULT_SCORE;
        params.showErrors = params.showErrors ?? true;
        params.id = (params.id ?? seed) ?? DEFAULT_ID;
        params.symbols = params.symbols ?? {};
        params.exclude = params.exclude ?? {};
        params.include = params.include ?? {};
        params.enableInlineLists = params.enableInlineLists ?? true;
        params.excludeSections = params.excludeSections ?? false;
        params.loadDefaultStyles = params.loadDefaultStyles ?? true;
        params.allowInput = params.allowInput ?? false;

        console.log(params);

        params.enableSafety = params.enableSafety ?? false;
        this.enableSafety = params.enableSafety;
        this.groupBy = params.groupBy ?? null;
        this.id = params.id;

        this.mode = QuizMode.QUESTIONS;
        this.loader = new Loader(params);
        this.nodes = new Nodes(params);
        this.errorHandler = new ErrorHandler(params);
        this.rng = seedrandom(seed);
        this.dom = new DOM(params);
        
        this.dom.listenFor(DOM.NEXT, () => { this.changeQuestion(+1); });
        this.dom.listenFor(DOM.PREV, () => { this.changeQuestion(-1); })
        this.dom.listenFor(DOM.REVEAL, () => { this.toggleAnswer(); });
        this.dom.listenFor(DOM.MEDIA, () => { this.toggleMedia(); });
        this.dom.listenFor(DOM.MODE, () => { this.toggleMode(); });
        this.dom.listenFor(DOM.END, () => { this.gotoEnd(); })
        this.dom.listenFor(DOM.FONT_SIZE, (ev) => { this.changeFontSize(ev.detail.change); })
    }

    async load()
    {
        this.nodes.createHTML();
        this.dom.connectToNodes(this.nodes);
        this.questions = await this.loader.load();
        this.prepareQuestions();
        this.reset();
    }

    start()
    {
        this.changeQuestion(+1);
    }

    gotoQuestionMode() { this.mode = QuizMode.QUESTIONS; }
    gotoAnswerMode() { this.mode = QuizMode.ANSWERS; }

    gotoEnd() 
    { 
        if(this.enableSafety && !confirm("Are you sure you want to skip to the end?")) { return; }
        this.changeQuestion(Infinity); 
    }
    gotoStart() 
    { 
        if(this.enableSafety && !confirm("Are you sure you want to skip to the start?")) { return; }
        this.changeQuestion(-Infinity); 
    }

    reset()
    {
        this.counter = -1;
        this.changeQuestion(0);
    }

    prepareQuestions()
    {   
        this.applyMask();
        this.filterExclusions();

        // first do a STABLE, CONSISTENT sort on anything (I picked the question, but it doesn't matter)
        // so that the seeded shuffling works later on
        // otherwise it's STILL random because of delays and inconsistencies in downloading the questions,
        // and thus different ordering when inserted into array
        this.questions.sort((a,b) => {
            return a.question[0].get().localeCompare(b.question[0].get());
        })

        // randomly sort questions
        shuffle(this.questions, this.rng);

        // allow some common groupings
        if(this.groupBy != null)
        {
            const allPossibleValues = getAllPossibleValuesFor(this.questions, this.groupBy);
            shuffle(allPossibleValues, this.rng);
            this.questions.sort((a,b) => {
                const idx1 = allPossibleValues.indexOf(a.getPropertySingle(this.groupBy));
                const idx2 = allPossibleValues.indexOf(b.getPropertySingle(this.groupBy));
                return idx1 - idx2;
            })
        }

        this.assignColors();

        // pre-shuffle answers (seeded) + track some statistics
        let totalScore = 0;
        for(const question of this.questions)
        {
            totalScore += parseInt(question.score.get());
            question.shuffleAnswers(this.rng);
        }

        // track some statistics
        const stats = 
        {
            numQuestions: this.questions.length,
            totalScore: totalScore
        }
        this.nodes.saveStats(stats);

        console.log("### Questions ###");
        console.log(this.questions);

        console.log("### JSON Output ###");
        console.log(parseQuestionsIntoJSON(this.questions));
    }

    changeQuestion(dc:number)
    {
        this.counter = clamp(this.counter + dc, -1, this.questions.length);
        if(this.counter <= -1)
        {
            return this.nodes.showStartScreen(this);
        }

        if(this.counter >= this.questions.length)
        {
            return this.nodes.showEndScreen(this);
        }

        this.nodes.showQuestion(this.counter, this.getCurrentQuestion(), this.mode);
    }

    getCurrentQuestion()
    {
        if(this.counter < 0 || this.counter >= this.questions.length) { return null; }
        return this.questions[this.counter];
    }

    toggleAnswer()
    {
        if(this.enableSafety && !confirm("Are you sure you wish to toggle answers?")) { return; }
        this.toggleMode(true);
        this.changeQuestion(0);
    }

    toggleMedia()
    {
        this.nodes.toggleMedia();
    }

    toggleMode(suppressSafety = false)
    {
        if(this.enableSafety && !suppressSafety && !confirm("Are you sure you want to toggle mode (questions<->answers)?")) { return; }
        if(this.mode == QuizMode.ANSWERS) { this.gotoQuestionMode(); }
        else { this.gotoAnswerMode(); }
        this.changeQuestion(0);
    }

    changeFontSize(change:number)
    {
        this.nodes.changeFontSize(change);
    }

    filterExclusions()
    {
        // delete any questions that need to be excluded
        const hasExclusions = Object.keys(this.params.exclude).length > 0;
        if(!hasExclusions) { return; }

        const arr = [];
        for(const q of this.questions)
        {
            let shouldRemove = false;
            for(const [prop,data] of Object.entries(this.params.exclude))
            {
                const val = q.getQuestionValues(prop);
                const dataList = Array.isArray(data) ? data : [data];
                if(anyMatch(dataList,val)) {
                    shouldRemove = true; 
                    break;
                }
            }

            if(shouldRemove) { continue; }
            arr.push(q);
        }
        this.questions = arr;
    }

    applyMask()
    {
        const hasMask = Object.keys(this.params.include).length > 0;
        if(!hasMask) { return; }

        const arr = [];
        for(const q of this.questions)
        {
            let shouldAdd = false;
            for(const [prop,data] of Object.entries(this.params.exclude))
            {
                const val = q.getQuestionValues(prop);
                const dataList = Array.isArray(data) ? data : [data];
                if(anyMatch(dataList,val)) {
                    shouldAdd = true; 
                    break;
                }
            }

            if(!shouldAdd) { continue; }
            arr.push(q);
        }
        this.questions = arr;
    }

    assignColors()
    {
        const allColors = [];
        const numColors = this.colors.length;
        const numQuestions = this.questions.length;
        const numSets = Math.ceil(numQuestions/numColors);
        for(let i = 0; i < numSets; i++)
        {
            for(const color of this.colors)
            {
                allColors.push(color);
            }
        }

        shuffle(allColors, this.rng);
        for(const q of this.questions)
        {
            q.updateProperty("color", allColors.pop());
        }
    }

    atStart() { return this.counter < 0; }
    atEnd() { return this.counter >= this.questions.length; }
}