import { PdfBuilder, PageOrientation } from "js/pq_games/pdf/pdfBuilder"
import GridMapper from "js/pq_games/layout/gridMapper"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import createContext from "js/pq_games/layout/canvas/createContext"
import ResourceImage from "js/pq_games/layout/resources/resourceImage"
import LayoutOperation from "js/pq_games/layout/layoutOperation"
import Point from "js/pq_games/tools/geometry/point"
import PointGraph from "js/pq_games/tools/geometry/pointGraph"
import Line from "js/pq_games/tools/geometry/line"
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple"
import InterfaceWordOptions from "../js_shared/interfaceWordOptions"
import PhotomoneGame from "../js_shared/main"

const CONFIG = 
{
    wordsPerCard: 4,
    inkFriendly: false,
    resLoader: null,
    fontSize: 12,
    cardSize: new Point(),
    margin: new Point(),
    wordColors: ["#FFD23F", "#37FF8B", "#EE4266", "#CB9CF2"],
    distanceBetweenWords: 0,
    spaceAroundWord: 0,
    assetsBase: "/photomone/assets/"
}

async function createWordCard(wordList)
{
    const cardSize = CONFIG.cardSize.clone();

    const ctx = createContext({ size: cardSize });
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, cardSize.x, cardSize.y);

    ctx.font = CONFIG.fontSize + "px 'GelDoticaLowerCase'";
    ctx.textBaseline = 'middle';

    const wordsToPutOnCard = Math.min(CONFIG.wordsPerCard, wordList.length);

    // add background rectangles (colored, per word, save for reuse later)
    const randColorOffset = Math.floor(Math.random() * 4);
    const rectangles = [];
    for(let a = 0; a < wordsToPutOnCard; a++)
    {
        const rectWidth = cardSize.x;
        const rectHeight = cardSize.y / CONFIG.wordsPerCard;
        const rectX = 0;
        const rectY = a * rectHeight;
        rectangles.push({ x: rectX, y: rectY, width: rectWidth, height: rectHeight });

        const bgColorIdx = (a + randColorOffset) % 4;
        ctx.fillStyle = CONFIG.wordColors[bgColorIdx];
        if(CONFIG.inkFriendly) { ctx.fillStyle = (a % 2 == 0) ? "#FFFFFF" : "#DDDDDD"; }
        ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
    }

    // add ants at the top and bottom edge, random distances (as if walking in a row/line)
    const spriteSize = 0.06*cardSize.x;
    const antSpriteAlpha = 0.45;
    const antMarginY = 0.475*spriteSize;
    ctx.globalAlpha = antSpriteAlpha;

    const res : ResourceImage = CONFIG.resLoader.getResource("grayscale_ant") as ResourceImage;
    const spriteParams = {
        dims: new Point(spriteSize, spriteSize),
        rotation: Math.PI,
        pivot: new Point(0.5)
    }
    const canvOp = new LayoutOperation(spriteParams);

    // top row
    let antX = 0.5*cardSize.x + Math.random()*0.5*cardSize.x;
    while(antX > 0)
    {
        canvOp.translate = new Point(antX, antMarginY);
        await res.toCanvas(ctx, canvOp);
        antX -= Math.random() * (cardSize.x - antX) + 1.25*spriteSize;
    }

    // bottom row
    antX = Math.random()*0.5*cardSize.x;
    canvOp.rotation = 0;
    while(antX < cardSize.x)
    {
        canvOp.translate = new Point(antX, cardSize.y - antMarginY);
        await res.toCanvas(ctx, canvOp);
        antX += Math.random() * (cardSize.x - antX) + 1.25*spriteSize;
    }

    ctx.globalAlpha = 1.0;

    // add a random background network
    const bgNetworkAlpha = 0.066;
    const subCanvas = document.createElement("canvas");
    subCanvas.width = cardSize.x;
    subCanvas.height = cardSize.y;
    const subCtx = subCanvas.getContext("2d");

    const numPoints = Math.floor(Math.random() * 20) + 10;
    const pointRadius = 0.025*cardSize.x;
    const bgPoints = [];
    for(let ii = 0; ii < numPoints; ii++)
    {
        const p = new PointGraph();
        let tooClose = false;
        let numTries = 0;
        do 
        {
            let distToClosestPoint = Infinity;
            p.x = Math.random() * cardSize.x;
            p.y = Math.random() * cardSize.y;
            for(const otherPoint of bgPoints)
            {
                distToClosestPoint = Math.min(p.distTo(otherPoint), distToClosestPoint);
            }
            tooClose = (distToClosestPoint <= pointRadius*4.25);
            numTries++;
        } while(tooClose && numTries <= 100);
       
        bgPoints.push(p);
    }

    const bgLines = [];
    subCtx.lineWidth = 0.5*pointRadius;
    subCtx.strokeStyle = "#000000";
    subCtx.fillStyle = "#000000";
    for(const p1 of bgPoints)
    {
        let closestPoint = null;
        let closestDist = Infinity;
        for(const p2 of bgPoints)
        {
            if(p1 == p2) { continue; }
            if(p1.isConnectedTo(p2)) { continue; }
            const dist = p1.distTo(p2);
            if(dist >= closestDist) { continue; }
            closestPoint = p2;
            closestDist = dist;
        }

        const l = new Line(p1, closestPoint);
        p1.addConnectionByPoint(closestPoint);
        bgLines.push(l);

        subCtx.beginPath();
        subCtx.lineTo(p1.x, p1.y);
        subCtx.lineTo(closestPoint.x, closestPoint.y);
        subCtx.stroke();
    }

    for(const p of bgPoints)
    {
        subCtx.beginPath();
        subCtx.arc(p.x, p.y, pointRadius, 0, 2*Math.PI);
        subCtx.fill();
    }

    ctx.globalAlpha = bgNetworkAlpha;
    ctx.drawImage(subCanvas, 0, 0);
    ctx.globalAlpha = 1.0;

    // actually put words + data on the card
    const iconPoints = CONFIG.resLoader.getResource("icon_points") as ResourceImage;
    const iconLines = CONFIG.resLoader.getResource("icon_lines") as ResourceImage;
    const margin = CONFIG.margin;

    for(let a = 0; a < wordsToPutOnCard; a++)
    {
        const rect = rectangles[a];
        const word = wordList.pop();

        const x = margin.x;
        const y = margin.y + a * rect.height + 0.5*CONFIG.spaceAroundWord;

        ctx.fillStyle = "#000000";
        ctx.globalAlpha = 0.77;
        ctx.textAlign = 'left';
        ctx.fillText(word.getWord(), x, y);

        // we work backwards from the RIGHT for lines/points
        let dataX = cardSize.x - margin.x;
        const iconSize = 0.4*rect.height;
        const dataTextWidth = 1.5*CONFIG.fontSize;

        ctx.textAlign = 'right';
        ctx.fillText(word.getPoints(), dataX, y);
        dataX -= dataTextWidth;

        const resParams = {
            dims: new Point(iconSize),
            translate: new Point(dataX, y),
            pivot: new Point(0.5)
        }
        const canvOp = new LayoutOperation(resParams);
        await iconPoints.toCanvas(ctx, canvOp);

        dataX -= iconSize;
        ctx.fillText(word.getLines(), dataX, y);

        dataX -= dataTextWidth;
        canvOp.translate.x = dataX;
        await iconLines.toCanvas(ctx, canvOp);

        ctx.globalAlpha = 1.0;
    }

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 0.025*cardSize.x;
    ctx.strokeRect(0, 0, cardSize.x, cardSize.y);

    return ctx.canvas;
}


async function createWordCards(userConfig:Record<string,any>)
{
    const config = { orientation: PageOrientation.PORTRAIT };
	const pdfBuilder = new PdfBuilder(config);

    const customPageLayoutDims = new Point(3, 4);
	const gridConfig = { pdfBuilder: pdfBuilder, dims: customPageLayoutDims };
	const gridMapper = new GridMapper(gridConfig);
	
    const numPages = 3;
	const cardsPerPage = gridConfig.dims.x * gridConfig.dims.y;
    const totalNumCards = cardsPerPage * numPages;
	const numWordsNeeded = CONFIG.wordsPerCard * totalNumCards;

    const resLoader = new ResourceLoader({ base: CONFIG.assetsBase });
	resLoader.planLoad("icon_lines", { path: "icon_lines.webp" });
    resLoader.planLoad("icon_points", { path: "icon_points.webp" });
    resLoader.planLoad("grayscale_ant", { path: "grayscale_ant.webp" });
	await resLoader.loadPlannedResources();

    CONFIG.resLoader = resLoader;
    CONFIG.inkFriendly = userConfig.inkFriendly;

	const wordList = userConfig.WORDS.getWords(numWordsNeeded);
    const cardSize = gridMapper.getMaxElementSizeAsSquare();
    CONFIG.cardSize = cardSize;
    CONFIG.fontSize = 0.085 * cardSize.x;

    const margin = new Point(0.05 * cardSize.x, 0);
    CONFIG.margin = margin;

    const distanceBetweenWords = (cardSize.y - 2*margin.y) / CONFIG.wordsPerCard;
    CONFIG.distanceBetweenWords = distanceBetweenWords;
    CONFIG.spaceAroundWord = distanceBetweenWords;

    const actualNumCards = Math.ceil(wordList.length / CONFIG.wordsPerCard);
    const promises = [];
    for(let i = 0; i < actualNumCards; i++)
    {
        promises.push(createWordCard(wordList));
    }

    const canvases = await Promise.all(promises);
    for(const canv of canvases)
    {
        gridMapper.addElement(canv);
    }

    const images = await convertCanvasToImageMultiple(gridMapper.getCanvases());
	pdfBuilder.addImages(images);
	
    const fileName = "[Photomone] Word Cards";
	const pdfConfig = { customFileName: fileName }
	pdfBuilder.downloadPDF(pdfConfig);
}

function loadInterface(userConfig:Record<string,any>)
{
    const contentNode = document.getElementById("content");
    new Interface(contentNode, userConfig);
}

const Interface = class 
{
    node:HTMLElement
    params:Record<string,any>
    turn:number
    supportPausing:boolean
    score:number
    phase:string
    interfaceWordOptions:InterfaceWordOptions
    wordsGuessedRight:number
    scoreTarget:number

    window:HTMLElement
    windowHeader:HTMLElement
    windowText:HTMLElement
    uiContainer:HTMLElement
    scoreBtn:HTMLButtonElement
    
    scoreNode:HTMLElement
    pauseBtn:HTMLButtonElement
    nextTurnBtn:HTMLButtonElement
    turnsNode:HTMLElement

    allowSelecting:boolean

    constructor(node:HTMLElement, userConfig:Record<string,any> = {})
    {
        this.node = node;
        this.params = Object.assign({}, userConfig);
        this.turn = -1;
        this.supportPausing = false;
        this.score = 0;
        this.phase = "start"; // start, turn, interturn, end
        this.createOverlayWindow();
        this.interfaceWordOptions = new InterfaceWordOptions(this, node);
        this.wordsGuessedRight = 7; // how many words, on average, must be guessed correctly to win the game
        
        const WORDS = this.params.WORDS;
        const cachedWordList = this.interfaceWordOptions.getWordsCache();
        this.scoreTarget = WORDS.getObjectiveScore(cachedWordList, this.wordsGuessedRight);

        this.createHTML();
        this.createWelcomeMessage();
        this.protectAgainstLeaving();
        this.toggleWindow(true);
    }

    getConfig() { return this.params; }
    protectAgainstLeaving()
    {
        window.onbeforeunload = (ev: any) => {
            if(this.phase == "start" || this.phase == "end") { return undefined; }
            return "You're about to exit this game, losing all progress. Are you sure?";
        };
    }
    
    createOverlayWindow()
    {
        this.window = document.createElement("div");
        this.window.classList.add("overlay-window");

        this.windowHeader = document.createElement("h2");
        this.window.appendChild(this.windowHeader);
        this.windowHeader.innerHTML = 'Welcome!'

        this.windowText = document.createElement("p");
        this.window.appendChild(this.windowText);

        this.node.appendChild(this.window);
    }

    createWelcomeMessage()
    {
        this.windowText.innerHTML = "<p>Your objective is to score <strong>" + this.scoreTarget + " points</strong> (or more)!</p><p>When ready, press the button to start the first turn. Make sure only the <em>drawer</em> can see the phone screen!</p><p>Select your chosen word by tapping it. If it was guessed correctly, you can press the button to score its points.</p><p>Have fun!</p>";
    }

    toggleWindow(val: boolean)
    {
        if(val) 
        { 
            this.window.style.display = "block"; 
            this.scoreBtn.style.display = "none";
        } 
        else 
        { 
            this.window.style.display = "none"; 
            this.scoreBtn.style.display = "block";
        }
    }

    createHTML()
    {
        this.uiContainer = document.createElement("div");
        this.node.appendChild(this.uiContainer);
        this.uiContainer.classList.add("ui");

        this.scoreBtn = document.createElement("button");
        this.uiContainer.appendChild(this.scoreBtn);
        this.scoreBtn.classList.add("photomone-button");

        let scoreText = document.createElement("div");
        scoreText.innerHTML = "Score Points!";
        this.scoreBtn.appendChild(scoreText);

        this.scoreNode = document.createElement("div");
        this.scoreBtn.appendChild(this.scoreNode);
        this.scoreNode.classList.add("score-node");
        this.scoreBtn.addEventListener("click", (ev) => {
            this.saveSelectedWordScore();
        });

        this.updateScore(0);

        const pausingEnabled = this.params.expansions.antertainmentBreak;
        if(pausingEnabled && this.supportPausing)
        {
            this.pauseBtn = document.createElement("button");
            this.uiContainer.appendChild(this.pauseBtn);
            this.pauseBtn.classList.add("photomone-button");
            this.pauseBtn.innerHTML = "Pause this word";
            this.pauseBtn.addEventListener("click", (ev) => {
                this.pauseSelectedWord();
            });
        }
        
        this.nextTurnBtn = document.createElement("button");
        this.uiContainer.appendChild(this.nextTurnBtn);
        this.nextTurnBtn.classList.add("photomone-button");

        let turnText = document.createElement("div");
        this.nextTurnBtn.appendChild(turnText);
        turnText.innerHTML = "Next Turn!";

        this.turnsNode = document.createElement("div");
        this.nextTurnBtn.appendChild(this.turnsNode);
        this.turnsNode.classList.add("turns-node");
        this.nextTurnBtn.addEventListener("click", (ev) => {
            if(this.phase == "end") { return window.location.reload(); }
            else if(this.phase == "interturn" || this.phase == "start") { this.gotoNextTurn(); }
            else if(this.phase == "turn") { this.gotoInterTurn(); }
        })
    }

    gotoNextTurn()
    {
        this.phase = "turn";
        this.updateTurns(+1);
        this.toggleWindow(false);
        this.allowSelecting = true;
        this.nextTurnBtn.innerHTML = "End Turn";
        this.interfaceWordOptions.loadNewWords();
        this.interfaceWordOptions.setVisible(true);
    }

    gotoInterTurn()
    {
        this.phase = "interturn";
        this.interfaceWordOptions.clear();
        this.interfaceWordOptions.setVisible(false);
        this.nextTurnBtn.innerHTML = "Next Turn";
        this.toggleWindow(true);
        this.windowHeader.innerHTML = "Next player!";
        this.windowText.innerHTML = "<p>Pass the device to the next player.</p><p>Wait with pressing the button until you're sure nobody else can see the screen!</p>";
    }

    gotoGameOver()
    {
        this.turn++; // when we go to gameover, we're midway a turn and it hasn't been registered yet
        this.phase = "end";

        this.toggleWindow(true);
        this.windowHeader.innerHTML = "Game Over";
        this.windowText.innerHTML = "<p>The game is done! You finished in <strong>" + this.turn + "</strong> turns and scored <strong>" + this.score + " points</strong>!</p><p>Be proud of yourselves&mdash;or not. Check your amazing pheromone drawings. Feeling like a real ant-ist yet?</p>";

        this.interfaceWordOptions.clear();
        this.interfaceWordOptions.setVisible(false);
        this.nextTurnBtn.innerHTML = 'Play again?';
    }

    pauseSelectedWord()
    {
        // @TODO
    }

    saveSelectedWordScore()
    {
        const score = this.interfaceWordOptions.getSelectedWordScore(true);
        if(score <= 0) { return; }
        this.updateScore(score);
        this.allowSelecting = false;
    }

    updateScore(ds: number)
    {
        this.score += ds;
        this.scoreNode.innerHTML = "Score: " + this.score + " / " + this.scoreTarget;
        if(this.score >= this.scoreTarget) { this.gotoGameOver(); }
    }

    updateTurns(dt: number)
    {
        this.turn += dt;
        let txt = "Turns played: " + this.turn;
        this.turnsNode.innerHTML = txt;
    }
}

async function startPhotomoneGame(config:Record<string,any>)
{
    const fb = document.getElementById("feedback-message");
    const r = new ResourceLoader();
    r.planLoad("GelDoticaLowercase", { path: "/photomone/assets/fonts/GelDoticaLowerCaseThick.woff2", key: "GelDoticaLowercase" });
    await r.loadPlannedResources();

    if(config.createPDF) {
        fb.innerHTML = "Generating ... ";
        await createWordCards(config);
        fb.innerHTML = "Done!";
    } else {
        loadInterface(config);
        fb.style.display = "none";
    }
}

new PhotomoneGame({ gameTitle: "photomone", loadGame: true, callback: startPhotomoneGame })