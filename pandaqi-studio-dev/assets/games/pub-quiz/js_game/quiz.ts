import shuffle from "js/pq_games/tools/random/shuffle";
import Loader from "./loader";
import Nodes from "./nodes";
import Question from "./question";
import seedrandom from "js/pq_games/tools/random/seedrandom";
import DOM from "./dom";
import clamp from "js/pq_games/tools/numbers/clamp";
import { parseQuestionsIntoJSON } from "./parser";
import ErrorHandler from "./errorHandler";

interface QuizParams
{
    url?: string,
    filename?: string, // for automatic pattern matching (name_0, name_1, ...)
    filenames?: string[], // for fixed filenames given by user, can be anything
    fileExtensions?: string[],
    seed?: string,
    maxScore?: number,
    loadExternalMediaAsIframe?: boolean,
    
    // @TODO: somehow, get these into the parser to override defaults if set?
    linkPrefixes?: string[],
    mediaFormats?: string[],

    defaultCategory?: string,
    defaultAuthor?: string,
    defaultScore?: number,

    possibleCategories?: string[],
    possibleAuthors?: string[],

    hideCategory?: boolean,
    hideAuthor?: boolean,
    hideScore?: boolean,

    enableSafety?: boolean
    enableMouse?: boolean
    enableKeys?: boolean
    enableUI?: boolean

    groupBy?: string

    subFolders?: { media?: string, questions?: string }

    showErrors?: boolean
}

enum QuizMode
{
    QUESTIONS,
    ANSWERS
}

const DEFAULT_SEED = "quiz";
const DEFAULT_SCORE = 1;
const DEFAULT_AUTHOR = "anonymous";
const DEFAULT_CATEGORY = "general";

export { QuizMode, QuizParams, Quiz }
export default class Quiz
{
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

    constructor(params:QuizParams = {})
    {
        const seed = params.seed ?? DEFAULT_SEED;

        params.defaultAuthor = params.defaultAuthor ?? DEFAULT_AUTHOR;
        params.defaultCategory = params.defaultCategory ?? DEFAULT_CATEGORY;
        params.defaultScore = params.defaultScore ?? DEFAULT_SCORE;
        params.showErrors = params.showErrors ?? true;

        params.enableSafety = params.enableSafety ?? false;
        this.enableSafety = params.enableSafety;
        this.groupBy = params.groupBy ?? null;

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
            this.questions.sort((a,b) => {
                return a.getPropertySingle(this.groupBy).localeCompare(b.getPropertySingle(this.groupBy));
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
        const stats = {
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
        let curQuestion = this.counter;
        this.toggleMode(true);
        this.changeQuestion(curQuestion);
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