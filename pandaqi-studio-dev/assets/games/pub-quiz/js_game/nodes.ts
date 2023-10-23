import { AUDIO_FORMATS, IMAGE_FORMATS, VIDEO_FORMATS, isValidMediaType, parseExtension } from "./parser";
import Question from "./question";
import { QuizMode } from "./quiz";

export default class Nodes
{
    nodes: Record<string, HTMLElement>;
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    answerNodes: HTMLElement[]
    answerRevealed:boolean
    mediaNodes: HTMLElement[]

    startScreen = {
        questionNumber: "?",
        questionCategory: "Start",
        question: "Welkom bij de quiz!",
        instruction: "Schrijf bij elke vraag het nummer en je antwoord op. Is iedereen er klaar voor?"
    }

    endScreen = {
        question: "Het einde is bereikt!",
        questionCategory: "Einde",
        questionNumber: "?",
        instruction: "<p>Dat waren alle vragen!</p><p>Herlaad de pagina om de antwoorden te bekijken.</p>"
    }
    node: HTMLDivElement;
    statsNode: HTMLDivElement;
    currentTheme: string;

    constructor()
    {
        this.nodes = {};
        this.answerRevealed = false;
    }

    createHTML()
    {
        const cont = document.createElement("div");
        cont.classList.add("quiz-container");
        document.body.appendChild(cont);
        this.node = cont;

        const header = document.createElement("div");
        header.classList.add("question-header");
        cont.appendChild(header);

        const metadata = document.createElement("div");
        metadata.classList.add("question-metadata");
        header.appendChild(metadata);
        //this.nodes.metadata = metadata;

        const num = document.createElement("div");
        num.classList.add("question-number");
        metadata.appendChild(num);
        this.nodes.questionNumber = num;

        const cat = document.createElement("div");
        cat.classList.add("question-category");
        metadata.appendChild(cat);
        this.nodes.questionCategory = cat;

        const h1 = document.createElement("h1");
        h1.classList.add("quiz-question");
        header.appendChild(h1);
        this.nodes.question = h1;

        const mediaCont = document.createElement("div");
        mediaCont.classList.add("question-media");
        cont.appendChild(mediaCont);
        this.nodes.media = mediaCont;

        const p = document.createElement("p");
        p.classList.add("quiz-instruction");
        cont.appendChild(p);
        this.nodes.instruction = p;

        const answerCont = document.createElement("div");
        answerCont.classList.add("question-answers");
        cont.appendChild(answerCont);
        this.nodes.answers = answerCont;

        const stats = document.createElement("div");
        stats.classList.add("quiz-statistics");
        cont.appendChild(stats);
        this.statsNode = stats;
    }

    changeScreen(data)
    {
        this.answerRevealed = false;

        for(const [name,node] of Object.entries(this.nodes))
        {
            if(!data[name]) { node.style.display = "none"; continue; }
            node.innerHTML = data[name];
            node.style.display = "flex";
        }
    }

    saveStats(stats)
    {
        const node = this.statsNode;
        node.innerHTML = "(Statistieken: " + stats.numQuestions + " vragen, " + stats.totalScore + " punten)";
    }

    showStartScreen(quiz) 
    { 
        this.changeScreen(this.startScreen); 
        this.addDefaultButtons(quiz);
    }
    
    showEndScreen(quiz) 
    { 
        this.changeScreen(this.endScreen); 
    }

    addDefaultButtons(quiz)
    {
        const startButton = document.createElement("button");
        startButton.innerHTML = "Speel de vragen";
        startButton.addEventListener("click", (ev) => {
            quiz.gotoQuestionMode();
            quiz.start();
            ev.stopPropagation();
        });
        this.nodes.instruction.appendChild(startButton);

        const restartButton = document.createElement("button");
        restartButton.innerHTML = "Bekijk de antwoorden!";
        restartButton.addEventListener("click", (ev) => {
            quiz.gotoAnswerMode();
            quiz.start();
            ev.stopPropagation();
        })
        this.nodes.instruction.appendChild(restartButton);
    }

    changeTheme(col:string)
    {
        const newTheme = "theme-" + col;
        if(this.currentTheme) { document.body.classList.remove(this.currentTheme); }
        document.body.classList.add(newTheme);
        this.currentTheme = newTheme;
    }
    
    showQuestion(num:number, q:Question, mode:QuizMode)
    {
        // set the default texts and (in)visible parts
        const data = {
            question: q.question,
            questionNumber: (num + 1), // we start at 0, people will expect it to start at 1
            questionCategory: q.category.join(", "),
            answers: "Answers here",
            media: q.hasMedia() ? "Media here" : ""
        }

        this.changeScreen(data);
        this.changeTheme(q.color);

        // add media, if available
        const hasMedia = q.hasMedia();
        this.mediaNodes = [];
        if(hasMedia)
        {
            this.nodes.media.innerHTML = "";
            let counter = 0;
            const elems = [];
            for(const elem of q.media)
            {
                elems.push(this.createMediaHTML(counter, elem));
                counter++;
            }
            this.mediaNodes = elems;

            for(const elem of elems)
            {
                this.nodes.media.appendChild(elem);
            }
        }

        // add the answers
        const openQuestion = q.isOpen();
        this.answerNodes = [];
        if(openQuestion) 
        { 
            this.nodes.answers.innerHTML = "Dit is een open vraag!"; 
        }
        else 
        {
            this.nodes.answers.innerHTML = "";
            let counter = 0;
            const elems = [];
            for(const answer of q.answers)
            {
                elems.push(this.createAnswerHTML(counter, answer));
                counter++;
            }
            this.answerNodes = elems;

            for(const elem of elems)
            {
                this.nodes.answers.appendChild(elem);
            }
        }

        if(mode == QuizMode.ANSWERS) { this.toggleAnswer(q); }
    }

    createAnswerHTML(num:number, val:string)
    {
        const div = document.createElement("div");
        div.classList.add("answer");
        div.dataset.id = val;

        const number = document.createElement("div");
        number.innerHTML = this.alphabet.charAt(num);
        number.classList.add("answer-number");
        div.appendChild(number);

        const answer = document.createElement("div");
        answer.classList.add("answer-text");
        div.appendChild(answer);

        if(isValidMediaType(val)) {
            answer.appendChild(this.createMediaHTML(num, val));
        } else {
            answer.innerHTML = val;
        }

        return div;
    }

    createMediaHTML(num:number, val:string)
    {
        const ext = parseExtension(val);
        const isImage = IMAGE_FORMATS.includes(ext); 
        if(isImage)
        {
            const img = document.createElement("img");
            img.src = val;
            img.dataset.id = num.toString();
            return img;
        }

        const isVideo = VIDEO_FORMATS.includes(ext);
        const isAudio = AUDIO_FORMATS.includes(ext);
        if(isVideo || isAudio)
        {
            const elemType = isVideo ? "video" : "audio";
            const elem = document.createElement(elemType);
            elem.setAttribute("controls", "controls");
            elem.dataset.id = num.toString();

            const source = document.createElement("source");
            source.src = val;
            elem.appendChild(source);
            return elem;
        } 

        const placeholder = document.createElement("div");
        placeholder.innerHTML = "Can't create media: " + val;
        return placeholder;
    }

    toggleAnswer(q:Question)
    {
        this.answerRevealed = !this.answerRevealed;
        
        for(const elem of this.answerNodes)
        {
            const isAnswer = q.isCorrectAnswer(elem.dataset.id);
            if(this.answerRevealed) {
                if(isAnswer) { elem.classList.add("answer-right"); }
                else { elem.classList.add("answer-wrong"); }
            } else {
                elem.classList.remove("answer-right");
                elem.classList.remove("answer-wrong");
            }
        }
    }

    isPlaying(node)
    {
        return node.currentTime > 0 && !node.paused && !node.ended && node.readyState > 2
    }

    // @NOTE: plays/pauses the first playable element it finds
    toggleMedia()
    {
        for(const node of this.mediaNodes)
        {
            if(node instanceof HTMLVideoElement || node instanceof HTMLAudioElement)
            {
                if(this.isPlaying(node)) { node.pause(); }
                else { node.play(); }
                break;
            }
        }
    }
}