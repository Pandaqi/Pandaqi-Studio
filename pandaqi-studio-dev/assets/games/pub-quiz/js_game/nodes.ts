import { AUDIO_FORMATS, IMAGE_FORMATS, VIDEO_FORMATS, isExternalURL, isValidMediaType, parseExtension, toWhiteSpaceString } from "./parser";
import Question from "./question";
import { QValType } from "./questionValue";
import { QuizMode } from "./quiz";

export default class Nodes
{
    nodes: Record<string, HTMLElement>;
    nodesUI: Record<string, HTMLElement>;
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    answerNodes: HTMLElement[]
    answerRevealed:boolean
    mediaNodes: HTMLElement[]

    fontSizes = [9,12,16,20,24,28,32]
    fontSizeDefault = 20

    startButtonText = "Speel de vragen!"
    answerButtonText = "Bekijk de antwoorden!"
    openQuestionText = "Dit is een open vraag!"

    loadingScreen = {
        questionNumber: "?",
        questionCategory: "Loading",
        question: "Loading ...",
        instruction: "The quiz is loading all your juicy questions!"
    }

    startScreen = {
        questionNumber: "?",
        questionCategory: "Start",
        question: "Welkom bij de quiz!",
        instruction: "<p>Schrijf bij elke vraag het nummer en je antwoord op. Is iedereen er klaar voor?</p>"
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
    loadExternalMediaAsIframe: boolean;
    hiddenNodes: string[];
    openQuestionRemark: HTMLDivElement;

    enableUI: boolean;
    enableSafety: boolean;

    constructor(params:any)
    {
        this.hiddenNodes = [];
        if(params.hideAuthor) { this.hiddenNodes.push("questionAuthor"); }
        if(params.hideCategory) { this.hiddenNodes.push("questionCategory"); }
        if(params.hideScore) { this.hiddenNodes.push("questionScore"); }

        params.enableUI = params.enableUI ?? true;
        this.enableUI = params.enableUI;
        this.loadExternalMediaAsIframe = params.loadExternalMediaAsIframe ?? false;
        this.enableSafety = params.enableSafety;
        this.nodes = {};
        this.nodesUI = {};
        this.answerRevealed = false;
    }

    createHTML()
    {
        const cont = document.createElement("div");
        cont.classList.add("quiz-container");
        document.body.appendChild(cont);
        this.node = cont;

        if(this.enableUI)
        {
            const ui = document.createElement("div");
            ui.classList.add("quiz-ui");
            cont.appendChild(ui);
            this.nodesUI.container = ui;
    
            const prevBtn = document.createElement("button");
            prevBtn.innerHTML = "Previous";
            ui.appendChild(prevBtn);
            this.nodesUI.prevButton = prevBtn;

            const fontSizeMinBtn = document.createElement("button");
            fontSizeMinBtn.innerHTML = "Font -";
            ui.appendChild(fontSizeMinBtn);
            this.nodesUI.fontSizeMinButton = fontSizeMinBtn;

            const divider = document.createElement("div");
            divider.style.width = "100%";
            ui.appendChild(divider);

            const fontSizePlusBtn = document.createElement("button");
            fontSizePlusBtn.innerHTML = "Font +";
            ui.appendChild(fontSizePlusBtn);
            this.nodesUI.fontSizePlusButton = fontSizePlusBtn;

            const nextBtn = document.createElement("button");
            nextBtn.innerHTML = "Next";
            ui.appendChild(nextBtn);
            this.nodesUI.nextButton = nextBtn;
            
        }
        
        const header = document.createElement("div");
        header.classList.add("question-header");
        cont.appendChild(header);

        const metadata = document.createElement("div");
        metadata.classList.add("question-metadata");
        header.appendChild(metadata);
        //this.nodes.metadata = metadata;

        const num = document.createElement("div");
        num.classList.add("question-number", "metadata-part");
        metadata.appendChild(num);
        this.nodes.questionNumber = num;

        const score = document.createElement("div");
        score.classList.add("question-score", "metadata-part");
        metadata.appendChild(score);
        this.nodes.questionScore = score;

        const cat = document.createElement("div");
        cat.classList.add("question-category", "metadata-part");
        metadata.appendChild(cat);
        this.nodes.questionCategory = cat;

        const author = document.createElement("div");
        author.classList.add("question-author", "metadata-part");
        metadata.appendChild(author);
        this.nodes.questionAuthor = author;

        const h1 = document.createElement("h1");
        h1.classList.add("quiz-question");
        header.appendChild(h1);
        this.nodes.question = h1;

        const comment = document.createElement("div");
        comment.classList.add("question-comment");
        cont.appendChild(comment);
        this.nodes.questionComment = comment;

        const mediaCont = document.createElement("div");
        mediaCont.classList.add("question-media");
        cont.appendChild(mediaCont);
        this.nodes.media = mediaCont;

        const div = document.createElement("div");
        div.classList.add("quiz-instruction");
        cont.appendChild(div);
        this.nodes.instruction = div;

        const answerCont = document.createElement("div");
        answerCont.classList.add("question-answers");
        cont.appendChild(answerCont);
        this.nodes.answers = answerCont;

        const stats = document.createElement("div");
        stats.classList.add("quiz-statistics");
        cont.appendChild(stats);
        this.statsNode = stats;
        
        this.changeScreen(this.loadingScreen);
    }

    changeScreen(data)
    {
        this.answerRevealed = false;

        for(const [name,node] of Object.entries(this.nodes))
        {
            const noEntry = !data[name];
            const forcedHidden = this.hiddenNodes.includes(name);
            const shouldHide = noEntry || forcedHidden;
            if(shouldHide) { node.style.display = "none"; node.innerHTML = ''; continue; }
            node.innerHTML = data[name];
            node.style.display = "flex";
        }
    }

    saveStats(stats)
    {
        const node = this.statsNode;
        node.innerHTML = "(Statistieken: " + stats.numQuestions + " vragen, " + stats.totalScore + " punten)";
    }

    toggleLeaveProtection(val:boolean)
    {
        if(val && this.enableSafety) {
            window.onbeforeunload = () => { return "Are you sure you want to leave?"; }
        } else {
            window.onbeforeunload = null;
        }
    }

    showStartScreen(quiz) 
    { 
        this.changeScreen(this.startScreen); 
        this.addDefaultButtons(quiz);
        this.updateUI(true, false);
        this.toggleLeaveProtection(false);
    }
    
    showEndScreen(quiz) 
    { 
        this.changeScreen(this.endScreen); 
        this.updateUI(false, true);
        this.toggleLeaveProtection(false);
    }

    updateUI(atStart = false, atEnd = false)
    {
        (this.nodesUI.prevButton as HTMLButtonElement).disabled = atStart;
        (this.nodesUI.nextButton as HTMLButtonElement).disabled = atEnd;
    }

    addDefaultButtons(quiz)
    {
        const startButton = document.createElement("button");
        startButton.innerHTML = this.startButtonText;
        startButton.addEventListener("click", (ev) => {
            quiz.gotoQuestionMode();
            quiz.start();
            ev.stopPropagation();
        });
        this.nodes.instruction.appendChild(startButton);

        const restartButton = document.createElement("button");
        restartButton.innerHTML = this.answerButtonText;
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
        const qValType = mode == QuizMode.QUESTIONS ? QValType.QUESTION : QValType.ANSWER;
        const mediaList = q.getQuestionValues("media", qValType);
        const hasMedia = mediaList.length > 0;

        // set the default texts and (in)visible parts
        const data = {
            question: toWhiteSpaceString(q.getQuestionValues("question", qValType)),
            questionComment: toWhiteSpaceString(q.getQuestionValues("comment", qValType)),
            questionNumber: (num + 1), // we start at 0, people will expect it to start at 1
            questionCategory: "🏷️" + toWhiteSpaceString(q.getQuestionValues("category", qValType)),
            questionAuthor: "🧔" + toWhiteSpaceString(q.getQuestionValues("author", qValType)),
            questionScore: "⭐" + q.score.get(),
            answers: "Answers here",
            media: hasMedia ? "Media here" : ""
        }

        this.changeScreen(data);
        this.changeTheme(q.color.get());
        this.updateUI();
        this.toggleLeaveProtection(true);

        // add media, if available
        this.mediaNodes = [];
        if(hasMedia)
        {
            this.nodes.media.innerHTML = "";
            let counter = 0;
            const elems = [];
            for(const elem of mediaList)
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
        this.nodes.answers.innerHTML = "";

        this.openQuestionRemark = this.createOpenQuestionRemark();
        if(openQuestion && mode == QuizMode.QUESTIONS)
        {
            this.nodes.answers.appendChild(this.openQuestionRemark); 
        }

        let counter = 0;
        const elems = [];
        const answerList = q.getQuestionValues("answers", qValType);
        for(const answer of answerList)
        {
            elems.push(this.createAnswerHTML(counter, answer, openQuestion));
            counter++;
        }
        this.answerNodes = elems;

        for(const elem of elems)
        {
            this.nodes.answers.appendChild(elem);
            if(openQuestion && mode == QuizMode.QUESTIONS) { elem.style.display = "none"; }
        }

        if(mode == QuizMode.ANSWERS) { this.showAnswer(q); }
    }

    createOpenQuestionRemark()
    {
        const div = document.createElement("div");
        div.classList.add("open-question-remark");
        div.innerHTML = this.openQuestionText;
        return div;
    }

    createAnswerHTML(num:number, val:string, openQuestion:boolean)
    {
        const div = document.createElement("div");
        div.classList.add("answer");
        div.dataset.id = val;

        const enumerate = !openQuestion;
        if(enumerate)
        {
            const number = document.createElement("div");
            number.innerHTML = this.alphabet.charAt(num);
            number.classList.add("answer-number");
            div.appendChild(number);
        }
        
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
        const externalNonFile = isExternalURL(val) && !isValidMediaType(val);

        if(externalNonFile)
        {
            if(this.loadExternalMediaAsIframe) {
                const iframe = document.createElement("iframe");
                iframe.src = val;
                return iframe;
            } else {
                const a = document.createElement("a");
                a.href = val;
                a.innerHTML = val;
                return a;
            }
        }

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

    // This actually has the ability to TOGGLE, but I don't really use that right now?
    showAnswer(q:Question)
    {
        this.answerRevealed = !this.answerRevealed;

        const openQuestion = q.isOpen();
        this.openQuestionRemark.style.display = this.answerRevealed ? "none" : "block";

        for(const elem of this.answerNodes)
        {
            const isAnswer = q.isCorrectAnswer(elem.dataset.id);
            if(this.answerRevealed) {
                if(isAnswer) { elem.classList.add("answer-right"); }
                else { elem.classList.add("answer-wrong"); }
                elem.style.display = "flex";
            } else {
                elem.classList.remove("answer-right");
                elem.classList.remove("answer-wrong");
                if(openQuestion) { elem.style.display = "none"; }
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

    changeFontSize(change:number)
    {
        const curSizeString = window.getComputedStyle(document.body).fontSize;
        let curSize = parseInt(curSizeString.slice(0, curSizeString.length - 2));
        if(!this.fontSizes.includes(curSize)) { curSize = this.fontSizeDefault; }

        let curIndex = this.fontSizes.indexOf(curSize);
        let newIndex = Math.min(Math.max(curIndex + change, 0), this.fontSizes.length-1);
        
        document.body.style.fontSize = this.fontSizes[newIndex] + "px";
    }
}