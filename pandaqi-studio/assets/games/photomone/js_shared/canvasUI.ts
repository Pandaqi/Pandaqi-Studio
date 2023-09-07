import CanvasDrawable from "./canvasDrawable"
import Line from "./line";
import WordsPhotomone from "./wordsPhotomone"
import WordPhotomone from "./wordPhotomone"

export default class CanvasUI {
    canvasDrawable: CanvasDrawable;
    node: HTMLElement;
    params: Record<string,any>;
    WORDS: WordsPhotomone;
    linesDrawn: number;
    currentWord: WordPhotomone;
    instructions: HTMLDivElement;
    wordContainer: HTMLDivElement;
    pointsNode: HTMLDivElement;
    wordNode: HTMLDivElement;
    linesNode: HTMLDivElement;
    uiContainer: HTMLDivElement;
    hintText: HTMLDivElement;

    constructor(canvasDrawable: CanvasDrawable, node: HTMLElement)
    {
        this.canvasDrawable = canvasDrawable;
        this.node = node;
        this.params = this.canvasDrawable.getConfig();
        this.WORDS = this.canvasDrawable.getConfig().WORDS;

        this.linesDrawn = 0;
        this.currentWord = null;

        this.createHTML();
        this.loadRandomInstruction();
    }

    createHTML()
    {
        this.instructions = document.createElement("div");
        this.node.appendChild(this.instructions);

        // words + metadata (lines, points, ...)
        this.wordContainer = document.createElement("div");
        this.instructions.appendChild(this.wordContainer);
        this.wordContainer.classList.add("word-container");

        let pointsContainer = document.createElement("div");
        this.wordContainer.appendChild(pointsContainer)
        pointsContainer.classList.add("word-points-container");

        let pointsIcon = document.createElement("img");
        pointsContainer.appendChild(pointsIcon);
        pointsIcon.src = "/photomone/assets/icon_points.webp";

        this.pointsNode = document.createElement("div");
        pointsContainer.appendChild(this.pointsNode);
        this.pointsNode.classList.add("num-points");

        this.wordNode = document.createElement("div");
        this.wordContainer.appendChild(this.wordNode);
        this.wordNode.classList.add("word");

        let linesContainer = document.createElement("div");
        this.wordContainer.appendChild(linesContainer);
        linesContainer.classList.add("word-lines-container");

        let linesIcon = document.createElement("img");
        linesContainer.appendChild(linesIcon);
        linesIcon.src = "/photomone/assets/icon_lines.webp";

        this.linesNode = document.createElement("div");
        linesContainer.appendChild(this.linesNode);
        this.linesNode.classList.add("num-lines");

        // ui (instructions, buttons to reset/clear/refresh)
        this.uiContainer = document.createElement("div");
        this.instructions.appendChild(this.uiContainer);
        this.uiContainer.classList.add("ui");

        this.hintText = document.createElement("div");
        this.uiContainer.appendChild(this.hintText);
        this.hintText.classList.add("hint-text");
        this.hintText.innerHTML = 'Draw this word by connecting dots.';

        const newWordBtn = document.createElement("button");
        this.uiContainer.appendChild(newWordBtn);
        newWordBtn.classList.add("photomone-button");
        newWordBtn.innerHTML = 'New Word';
        newWordBtn.addEventListener("click", (ev) => {
            this.loadRandomInstruction();
        });

        const clearBtn = document.createElement("button");
        this.uiContainer.appendChild(clearBtn);
        clearBtn.classList.add("photomone-button");
        clearBtn.innerHTML = "Erase";
        clearBtn.addEventListener("click", (ev) => {
            this.canvasDrawable.erase();
        });

        const toggleBtn = document.createElement("button");
        this.uiContainer.appendChild(toggleBtn);
        toggleBtn.innerHTML = "Toggle Word";
        toggleBtn.classList.add("photomone-button");
        toggleBtn.addEventListener("click", (ev) => {
            this.toggleWordVisibility();
        });
    }

    toggleWordVisibility()
    {
        if(this.wordNode.style.visibility == "hidden") { this.wordNode.style.visibility = "visible"; }
        else {this.wordNode.style.visibility = "hidden"; }
    }

    loadRandomInstruction()
    {
        this.linesDrawn = 0;
        this.canvasDrawable.startNewDrawing();
        this.currentWord = this.WORDS.getWords(1)[0];
        this.visualizeInstruction();
    }

    visualizeInstruction()
    {
        const w = this.currentWord;
        this.wordNode.innerHTML = w.getWord().toString();

        const po  = this.canvasDrawable.getTurn().getPowerups();

        const lines = w.getLines() - this.linesDrawn + po.get("linesOffset");
        const linesTxt = (lines > 1) ? "lines" : "line";
        this.linesNode.innerHTML = lines + " " + linesTxt;
        if(lines == 0) { this.linesNode.innerHTML = "Done!"; }

        const points = w.getPoints() + po.get("pointsOffset");
        const pointsTxt = (points > 1) ? "points" : "point";
        this.pointsNode.innerHTML = points + " " + pointsTxt;
    }

    registerLine(l: Line)
    {
        this.linesDrawn += 1;
        this.visualizeInstruction();
    }

    hitMaxLines()
    {
        return this.linesDrawn >= this.currentWord.getLines();
    }
}