async function createWordCards(userConfig)
{
    const config = { orientation: "portrait" };
	const pdfBuilder = PQ_GAMES.PDF.getPDFBuilder(config);

    const customPageLayoutDims = { x: 3, y: 4 };
	const gridConfig = { pdfBuilder: pdfBuilder, dims: customPageLayoutDims };
	const gridMapper = new PQ_GAMES.GridMapper(gridConfig);
	
	const wordsPerCard = 4;
    const numPages = 3;
	const cardsPerPage = gridConfig.dims.x * gridConfig.dims.y;
    const totalNumCards = cardsPerPage * numPages;
	const numWordsNeeded = wordsPerCard * totalNumCards;

    const baseAssetDir = "assets/"
    const resLoader = new PQ_GAMES.ResourceLoader();
	resLoader.planLoad("icon_lines", { path: baseAssetDir + "icon_lines.webp" });
    resLoader.planLoad("icon_points", { path: baseAssetDir + "icon_points.webp" });
    resLoader.planLoad("grayscale_ant", { path: baseAssetDir + "grayscale_ant.webp" });
	await resLoader.loadPlannedResources();

	const wordList = userConfig.WORDS.getWords(numWordsNeeded);
    const cardSize = gridMapper.getMaxElementSizeAsSquare();

    const fontSize = 0.085 * cardSize.width;

    const margin = { x: 0.05 * cardSize.width, y: 0 /*0.05 * cardSize.height*/ }
    const distanceBetweenWords = (cardSize.height - 2*margin.y) / wordsPerCard;
    const spaceAroundWord = distanceBetweenWords;

    const wordColors = ["#FFD23F", "#37FF8B", "#EE4266", "#CB9CF2"];
    const actualNumCards = Math.ceil(wordList.length / wordsPerCard);

    for(let i = 0; i < actualNumCards; i++)
    {
        const ctx = PQ_GAMES.CANVAS.createNewContext(cardSize);
        ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(0, 0, cardSize.width, cardSize.height);

        ctx.font = fontSize + "px 'GelDoticaLowerCase'";
        ctx.textBaseline = 'middle';

        const wordsToPutOnCard = Math.min(wordsPerCard, wordList.length);

        // add background rectangles (colored, per word, save for reuse later)
        const randColorOffset = Math.floor(Math.random() * 4);
        const rectangles = [];
        for(let a = 0; a < wordsToPutOnCard; a++)
        {
            const rectWidth = cardSize.width;
            const rectHeight = cardSize.height / wordsPerCard;
            const rectX = 0;
            const rectY = a * rectHeight;
            rectangles.push({ x: rectX, y: rectY, width: rectWidth, height: rectHeight });

            const bgColorIdx = (a + randColorOffset) % 4;
            ctx.fillStyle = wordColors[bgColorIdx];
            if(userConfig.inkFriendly) { ctx.fillStyle = (a % 2 == 0) ? "#FFFFFF" : "#DDDDDD"; }
            ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
        }

        // add ants at the top and bottom edge, random distances (as if walking in a row/line)
        const spriteSize = 0.066*cardSize.width;
        const antSpriteAlpha = 0.45;
        const antMarginY = 0.5*spriteSize;
        ctx.globalAlpha = antSpriteAlpha;

        const spriteParams = {
            id: "grayscale_ant",
            pos: { x: 0, y: antMarginY },
            size: { width: spriteSize, height: spriteSize },
            rotation: Math.PI
        }

        // top row
        let antX = 0.5*cardSize.width + Math.random()*0.5*cardSize.width;
        while(antX > 0)
        {
            spriteParams.pos = { x: antX, y: spriteParams.pos.y };
            PQ_GAMES.CANVAS.addResourceToContext(ctx, resLoader, spriteParams)
            antX -= Math.random() * (cardSize.width - antX) + 1.25*spriteSize;
        }

        // bottom row
        antX = Math.random()*0.5*cardSize.width;
        spriteParams.pos.y = (cardSize.height - antMarginY);
        spriteParams.rotation = 0;
        while(antX < cardSize.width)
        {
            spriteParams.pos = { x: antX, y: spriteParams.pos.y };
            PQ_GAMES.CANVAS.addResourceToContext(ctx, resLoader, spriteParams)
            antX += Math.random() * (cardSize.width - antX) + 1.25*spriteSize;
        }

        ctx.globalAlpha = 1.0;

        // add a random background network
        const bgNetworkAlpha = 0.066;
        const subCanvas = document.createElement("canvas");
        subCanvas.width = cardSize.width;
        subCanvas.height = cardSize.height;
        const subCtx = subCanvas.getContext("2d");

        const numPoints = Math.floor(Math.random() * 20) + 10;
        const pointRadius = 0.025*cardSize.width;
        const bgPoints = [];
        for(let ii = 0; ii < numPoints; ii++)
        {
            const p = new PHOTOMONE.Point();
            let tooClose = false;
            let numTries = 0;
            do 
            {
                let distToClosestPoint = Infinity;
                p.x = Math.random() * cardSize.width;
                p.y = Math.random() * cardSize.height;
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

            const l = new PHOTOMONE.Line(p1, closestPoint);
            p1.addConnection(closestPoint);
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
        for(let a = 0; a < wordsToPutOnCard; a++)
        {
            const rect = rectangles[a];
            const word = wordList.pop();

            const x = margin.x;
            const y = margin.y + a * rect.height + 0.5*spaceAroundWord;

            ctx.fillStyle = "#000000";
            ctx.globalAlpha = 0.77;
            ctx.textAlign = 'left';
            ctx.fillText(word.getWord(), x, y);

            // we work backwards from the RIGHT for lines/points
            let dataX = cardSize.width - margin.x;
            const iconSize = 0.4*rect.height;
            const dataTextWidth = 1.5*fontSize;

            ctx.textAlign = 'right';
            ctx.fillText(word.getPoints(), dataX, y);
            dataX -= dataTextWidth;

            const resParams = {
                id: "icon_points",
                size: { width: iconSize, height: iconSize },
                pos: { x: dataX, y: y }
            }
            PQ_GAMES.CANVAS.addResourceToContext(ctx, resLoader, resParams);

            dataX -= iconSize;
            ctx.fillText(word.getLines(), dataX, y);

            resParams.id = "icon_lines";
            dataX -= dataTextWidth;
            resParams.pos.x = dataX;
            PQ_GAMES.CANVAS.addResourceToContext(ctx, resLoader, resParams);

            ctx.globalAlpha = 1.0;
        }

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 0.025*cardSize.width;
        ctx.strokeRect(0, 0, cardSize.width, cardSize.height);

        gridMapper.addElement(ctx.canvas);
    }

    const images = await PQ_GAMES.CANVAS.convertCanvasesToImage(gridMapper.getCanvases());
	pdfBuilder.addImages(images);
	let fileName = "[Photomone] Word Cards";
	const pdfConfig = { customFileName: fileName }
	pdfBuilder.downloadPDF(pdfConfig);
}

function loadInterface(userConfig)
{
    const contentNode = document.getElementById("content");
    const interface = new Interface(contentNode, userConfig);
}

const Interface = class {
    constructor(node, userConfig = {})
    {
        this.node = node;
        this.params = Object.assign({}, userConfig);
        this.turn = -1;
        this.supportPausing = false;
        this.score = 0;
        this.phase = "start"; // start, turn, interturn, end
        this.createOverlayWindow();
        this.interfaceWordOptions = new PHOTOMONE.InterfaceWordOptions(this, node);
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
        window.onbeforeunload = (ev) => {
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

    toggleWindow(val)
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

    updateScore(ds)
    {
        this.score += ds;
        this.scoreNode.innerHTML = "Score: " + this.score + " / " + this.scoreTarget;
        if(this.score >= this.scoreTarget) { this.gotoGameOver(); }
    }

    updateTurns(dt)
    {
        this.turn += dt;
        let txt = "Turns played: " + this.turn;
        this.turnsNode.innerHTML = txt;
    }
}

async function startPhotomoneGame(config)
{
    const fb = document.getElementById("feedback-message");
    const fontURL = "/photomone/assets/fonts/GelDoticaLowerCaseThick.woff2";
	const fontFile = new FontFace("GelDoticaLowerCase", "url(" + fontURL + ")");
	document.fonts.add(fontFile);

	await fontFile.load();

    if(config.createPDF) {
        fb.innerHTML = "Generating ... ";
        await createWordCards(config);
        fb.innerHTML = "Done!";
    } else {
        loadInterface(config);
        fb.style.display = "none";
    }
}

window.startPhotomoneGame = startPhotomoneGame;