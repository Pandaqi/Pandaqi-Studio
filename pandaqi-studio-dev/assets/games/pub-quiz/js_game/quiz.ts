import shuffle from "js/pq_games/tools/random/shuffle";
import Loader from "./loader";
import Nodes from "./nodes";
import Question from "./question";
import seedrandom from "js/pq_games/tools/random/seedrandom";
import DOM from "./dom";
import clamp from "js/pq_games/tools/numbers/clamp";

interface QuizParams
{
    url?: string,
    filename?: string,
    seed?: string,
    maxScore?: number

    enableSafety?: boolean
    enableMouse?: boolean
    enableKeys?: boolean
}

enum QuizMode
{
    QUESTIONS,
    ANSWERS
}

export { QuizMode }
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

    colors = ["red", "orange", "green", "blue", "turquoise", "purple", "pink"]

    constructor(params:QuizParams = {})
    {
        const url = params.url ?? "/pub-quiz/";
        const filename = params.filename ?? "questions";
        const seed = params.seed ?? "quiz";
        const maxScore = params.maxScore ?? 5;
        const enableMouse = params.enableMouse ?? false;
        const enableKeys = params.enableKeys ?? true;

        this.enableSafety = params.enableSafety ?? true;
        this.mode = QuizMode.QUESTIONS;
        this.loader = new Loader({ url: url, filename: filename, maxScore: maxScore });
        this.nodes = new Nodes();
        this.rng = seedrandom(seed);
        this.dom = new DOM({ enableMouse: enableMouse, enableKeys: enableKeys });
        
        this.dom.listenFor(DOM.NEXT, () => { this.changeQuestion(+1); });
        this.dom.listenFor(DOM.PREV, () => { this.changeQuestion(-1); })
        this.dom.listenFor(DOM.REVEAL, () => { this.toggleAnswer(); });
        this.dom.listenFor(DOM.MEDIA, () => { this.toggleMedia(); });
        this.dom.listenFor(DOM.MODE, () => { this.toggleMode(); });
        this.dom.listenFor(DOM.END, () => { this.gotoEnd(); })
    }

    async load()
    {
        this.nodes.createHTML();
        this.questions = await this.loader.load();
        this.prepareQuestions();
        this.reset();
    }

    start()
    {
        this.changeQuestion(+1);
        console.log(this.questions);
    }

    gotoQuestionMode() { this.mode = QuizMode.QUESTIONS; }
    gotoAnswerMode() { this.mode = QuizMode.ANSWERS; }

    gotoEnd() 
    { 
        if(this.enableSafety && !confirm("Weet je zeker dat je helemaal naar het einde wilt?")) { return; }
        this.changeQuestion(Infinity); 
    }
    gotoStart() 
    { 
        if(this.enableSafety && !confirm("Weet je zeker dat je helemaal naar het begin wilt?")) { return; }
        this.changeQuestion(-Infinity); 
    }

    reset()
    {
        this.counter = -1;
        this.changeQuestion(0);
    }

    prepareQuestions()
    {
        // randomly sort questions, but grouped by category
        shuffle(this.questions, this.rng);
        this.questions.sort((a,b) => {
            return a.category[0].localeCompare(b.category[0]);
        })

        this.assignColors();

        // pre-shuffle answers (seeded) + track some statistics
        let totalScore = 0;
        for(const question of this.questions)
        {
            totalScore += question.score as number;
            question.shuffleAnswers(this.rng);
        }

        // track some statistics
        const stats = {
            numQuestions: this.questions.length,
            totalScore: totalScore
        }
        this.nodes.saveStats(stats);
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

        this.nodes.showQuestion(this.counter, this.questions[this.counter], this.mode);
    }

    getCurrentQuestion()
    {
        if(this.counter < 0 || this.counter >= this.questions.length) { return null; }
        return this.questions[this.counter];
    }

    toggleAnswer()
    {
        if(this.enableSafety && !confirm("Weet je zeker dat je het antwoord wilt zien?")) { return; }
        this.nodes.toggleAnswer(this.getCurrentQuestion());
    }

    toggleMedia()
    {
        this.nodes.toggleMedia();
    }

    toggleMode()
    {
        if(this.enableSafety && !confirm("Weet je zeker dat je de modus wilt veranderen?")) { return; }
        if(this.mode == QuizMode.ANSWERS) { this.gotoQuestionMode(); }
        else { this.gotoAnswerMode(); }
        this.changeQuestion(0);
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
}