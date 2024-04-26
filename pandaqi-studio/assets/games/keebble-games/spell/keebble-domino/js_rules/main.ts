import InteractiveExample from "js/pq_rulebook/examples/interactiveExample"
import shuffle from "js/pq_games/tools/random/shuffle"
import Point from "js/pq_games/tools/geometry/point"

const LETTER_DICTIONARY = {
    "joker": { frame: 0 },
    "E": { frame: 1 },
    "A": { frame: 2 },
    "V": { frame: 2, rotation: 2 },
    "R": { frame: 3 },
    "I": { frame: 4 },
    "O": { frame: 5 },
    "T": { frame: 6 },
    "K": { frame: 6, rotation: 3 },
    "N": { frame: 7 },
    "Z": { frame: 7, rotation: 1 },
    "S": { frame: 8 },
    "L": { frame: 9 },
    "C": { frame: 10 },
    "D": { frame: 10, rotation: 2 },
    "U": { frame: 10, rotation: 3 },
    "P": { frame: 11 },
    "M": { frame: 12 },
    "W": { frame: 12, rotation: 2 },
    "H": { frame: 13 },
    "G": { frame: 14 },
    "B": { frame: 15 },
    "J": { frame: 16 },
    "F": { frame: 16, rotation: 2 },
    "Y": { frame: 17 },
    "X": { frame: 18 },
    "Q": { frame: 19 },
}

const tools = {
    
    visualizeSymbol(params)
    {
        if(!params.value) { return; }

        const ctx = params.ctx;
        const cs = params.cs;

        const img = params.sprites;
        const frame = LETTER_DICTIONARY[params.value].frame || 0;
        const rotationIndex = LETTER_DICTIONARY[params.value].rotation || 0;
        const rotationRadians = rotationIndex * 0.5 * Math.PI;
        const spriteSize = 256
        const sourceX = (frame % 8) * spriteSize;
        const sourceY = Math.floor(frame / 8) * spriteSize;
        const scale = params.scale || 1.0;
        
        ctx.save();
        ctx.translate((params.x + 0.5) * cs, (params.y + 0.5) * cs);
        ctx.rotate(rotationRadians);
        ctx.drawImage(
            img,
            sourceX, sourceY, spriteSize, spriteSize,
            -0.5*scale*cs, -0.5*scale*cs, scale*cs, scale*cs 
        );

        ctx.restore();
    }

}

// orient = 0 means wide (2x1), 1 means tall (1x2)
class Domino 
{
    x: number;
    y: number;
    values: (string|null)[];
    valuesDisplayed: (string|null)[];
    orient: number;
    highlight: boolean;
    color: string;
    
    constructor(x = -1, y = -1, values : (string|null)[] = [], orient = 0)
    {
        this.x = x;
        this.y = y;
        if(values.length <= 0) { values = this.getRandomValues(); }
        this.values = values;
        this.valuesDisplayed = values.slice();
        this.orient = orient;
        this.highlight = false;

        this.makeRandomJoker();
        this.setRandomColor();
    }

    makeRandomJoker()
    {
        for(let i = 0; i < 2; i++)
        {
            if(!this.values[i]) { continue; }

            const JOKER_PROB = 0.15;
            if(Math.random() > JOKER_PROB) { return; }

            this.valuesDisplayed[i] = "joker";
        }
    }

    setRandomColor()
    {
        const DOMINO_COLORS = [
            "hsl(86,100%,40%)", "hsl(171,80%,39%)", 
            "hsl(231,100%,57%)", "hsl(290,100%,51%)", 
            "hsl(4,88%,56%)"
        ];
        this.color = DOMINO_COLORS[Math.floor(Math.random() * DOMINO_COLORS.length)];
    }

    setHighlight(val)
    {
        this.highlight = val;
    }

    setPosition(pos)
    {
        this.x = pos.x;
        this.y = pos.y;
    }

    // @TODO: also allow empty values here?
    getRandomValues()
    {
        const letters = Object.keys(LETTER_DICTIONARY);
        letters.splice(letters.indexOf("joker"), 1);

        const values : string[] = [];
        for(let v = 0; v < 2; v++)
        {
            const randLetter = letters[Math.floor(Math.random() * letters.length)];
            values.push(randLetter);
        }
        return values;
    }

    getValueData(idx, valueDisplayed = false)
    {
        if(idx < 0 || idx >= this.values.length) { return null; }
        const obj = { value: this.values[idx], x: this.x, y: this.y }
        if(valueDisplayed && idx < this.valuesDisplayed.length) { 
            obj.value = this.valuesDisplayed[idx]; 
        }

        if(idx == 1) {
            if(this.orient == 0) { obj.x += 1; }
            else { obj.y += 1; }
        }

        return obj;
    }

    getCells(board)
    {
        const parts = this.getParts();
        const arr : Cell[] = [];
        for(const part of parts)
        {
            arr.push(board.grid[part.x][part.y]);
        }
        return arr;
    }

    getRect(scale = 1.0)
    {   
        return this.getRectFrom(this.x, this.y, this.orient, scale);
    }
    
    getRectFrom(x, y, orient = 0, scale = 1.0)
    {
        let rect = { x1: x*scale, y1: y*scale, x2: (x + 2)*scale, y2: (y + 1)*scale };
        if(orient == 1) { rect.x2 = (x + 1)*scale; rect.y2 = (y + 2)*scale; }
        return rect;
    }

    getParts()
    {
        return this.getPartsFrom(this.x, this.y, this.orient);
    }

    getPartsFrom(x, y, orient)
    {
        const parts = [{ x: x, y: y }]
        if(orient == 0) { parts.push({ x: x + 1, y: y }) }
        else { parts.push({ x: x, y: y + 1}) }
        return parts;
    }

    isConnectedTo(x, y, orient)
    {
        const theirParts = this.getPartsFrom(x, y, orient);
        const ourParts = this.getParts();

        for(const p1 of theirParts)
        {
            for(const p2 of ourParts)
            {
                const dist = Math.abs(p2.x - p1.x) + Math.abs(p2.y - p1.y);
                if(dist <= 1) { return true; }
            }
        }

        return false;
    }
    
    overlapsCompletely(x,y,orient)
    {
        return this.x == x && this.y == y && this.orient == orient;
    }

    visualize(params)
    {
        const ctx = params.ctx;
        const cs = params.cs;
        const rect = this.getRect(cs);

        const w = rect.x2 - rect.x1;
        const h = rect.y2 - rect.y1;

        const col = this.color;
        const shadowCol = this.highlight ? "#663333" : "#000000";
        const strokeCol = this.highlight ? "#000000" : "#CCCCCC";
        const lineWidth = this.highlight ? 0.1*cs : 0.05*cs;
        const blurSize = this.highlight ? 0.2*cs : 0.1*cs;

        ctx.fillStyle = col;
        ctx.shadowBlur = blurSize;
        ctx.shadowColor = shadowCol;
        ctx.fillRect(rect.x1, rect.y1, w, h);
        
        ctx.shadowBlur = 0;
        ctx.strokeStyle = strokeCol;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(rect.x1, rect.y1, w, h);
    }

    visualizeStandalone(board) : Promise<HTMLImageElement>
    {
        const canv = document.createElement('canvas');
        canv.width = 256;
        canv.height = 512;
        
        const ctx = canv.getContext("2d") as CanvasRenderingContext2D;

        // background
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, canv.width, canv.height);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 0.05*canv.width;
        ctx.strokeRect(0, 0, canv.width, canv.height);

        // symbols
        const params = {
            ctx: ctx,
            cs: 256, // cellsize
            scale: 0.8,
            x: 0,
            y: 0,
            value: this.valuesDisplayed[0],
            sprites: board.spriteSheet
        }
        tools.visualizeSymbol(params);

        params.value = this.valuesDisplayed[1];
        params.y = 1;
        tools.visualizeSymbol(params);

        return new Promise((resolve, reject) => {
            const img = document.createElement("img");
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = canv.toDataURL();
            return img;
        })
    }
}

class Cell 
{
    x: number;
    y: number;
    value: string|null;
    valueDisplayed: string|null;

    constructor(x,y,value : string|null = null)
    {
        this.x = x;
        this.y = y;
        this.value = value;
        this.valueDisplayed = null;
    }

    setValue(v)
    {
        this.value = v;
    }

    setValueDisplayed(v)
    {
        this.valueDisplayed = v;
    }

    setRandomValue()
    {
        const letters = Object.keys(LETTER_DICTIONARY);
        letters.splice(letters.indexOf("joker"), 1);
        let randLetter = letters[Math.floor(Math.random() * letters.length)];
        const EMPTY_RAND_VAL_PROB = 0.25;
        if(Math.random() <= EMPTY_RAND_VAL_PROB) { randLetter = ''; }
        this.value = randLetter;
    }

    hasValue()
    {
        return this.value != null && this.value != "";
    }

    visualize(params)
    {
        params.value = this.value;
        if(this.valueDisplayed) { params.value = this.valueDisplayed; }

        params.x = this.x;
        params.y = this.y;
        tools.visualizeSymbol(params);
    }
}

class Board 
{
    widthPixel: number;
    heightPixel: number;
    width: number;
    height: number;
    grid: Cell[][];
    lettersPlaced: number;
    dominoes: Domino[];
    spriteSheet: any;

    constructor(width, height)
    {
        this.widthPixel = 512;
        this.heightPixel = 512;
        this.width = width;
        this.height = height;
        this.grid = this.createGrid();
        this.lettersPlaced = 0;
        this.dominoes = [];
    }

    createGrid()
    {
        const arr : Cell[][] = [];
        for(let x = 0; x < this.width; x++)
        {
            arr[x] = [];
            for(let y = 0; y < this.height; y++)
            {
                arr[x][y] = new Cell(x,y);
            }
        }
        return arr;
    }

    addWords(maxNumWords, list)
    {
        let wordsPlaced = 0;
        while(wordsPlaced < maxNumWords && list.length > 0)
        {
            const word = list.pop();
            const commonLetters = this.findCommonLetters(word);
            if(commonLetters.length <= 0) { continue; }
            
            let placed = false;
            for(const cell of commonLetters)
            {                    
                let success = this.fitWordIfPossible(word, cell, 0);
                if(success) { placed = true; break; }
                
                success = this.fitWordIfPossible(word, cell, 1);
                if(success) { placed = true; break; }
            }

            if(placed) { wordsPlaced += 1; }
        }
    }

    cutIntoDominoes()
    {
        const letterCells : Cell[] = [];
        for(let x = 0; x < this.width; x++)
        {
            for(let y = 0; y < this.height; y++)
            {
                const cell = this.grid[x][y];
                if(!cell.hasValue()) { continue; }
                letterCells.push(cell);
            }
        }

        const nbs = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }];
        while(letterCells.length > 0)
        {
            const cell = letterCells.pop();
            if(!cell) { break; }
            shuffle(nbs);

            let nbCell;
            for(let n = 0; n < 4; n++)
            {
                const x = cell.x + nbs[n].x;
                const y = cell.y + nbs[n].y;
                if(this.outOfBounds(x,y)) { continue; }
                nbCell = this.grid[x][y];
            }

            const isAnotherLetterCell = letterCells.includes(nbCell);
            if(isAnotherLetterCell)
            {
                letterCells.splice(letterCells.indexOf(nbCell), 1);
            }

            const orient = (Math.abs(nbCell.x - cell.x) > 0.005) ? 0 : 1;
            let anchorCell = cell;
            if(nbCell.x < cell.x || nbCell.y < cell.y) { anchorCell = nbCell; }
            let otherCell = (anchorCell == cell) ? nbCell : cell;

            const d = new Domino(anchorCell.x, anchorCell.y, [anchorCell.value, otherCell.value], orient);
            this.dominoes.push(d);
        }
    }

    outOfBounds(x,y)
    {
        return x < 0 || x >= this.width || y < 0 || y >= this.height;
    }

    fitWordIfPossible(word, cell, orient)
    {
        let letterIndex = word.indexOf(cell.value);
        if(letterIndex < 0) { letterIndex = Math.floor(0.5*word.length); }

        let startX = (cell.x - letterIndex);
        let endX = startX + word.length;

        let startY = (cell.y - letterIndex);
        let endY = startY + word.length;

        if(orient == 0)
        {
            const outOfBounds = startX < 0 || endX > this.width;
            if(outOfBounds) { return false; }

            let spaceAlreadyUsed = false;
            for(let x = startX; x < endX; x++)
            {
                if(x == cell.x) { continue; }
                if(!this.grid[x][cell.y].value) { continue; }
                spaceAlreadyUsed = true;
                break;
            }
            if(spaceAlreadyUsed) { return false; }

            for(let i = 0; i < word.length; i++)
            {
                this.grid[startX + i][cell.y].setValue(word.at(i));
            }
            this.lettersPlaced += (word.length - 1);
            return true;
        }

        if(orient == 1)
        {
            const outOfBounds = startY < 0 || endY > this.height;
            if(outOfBounds) { return false; }

            let spaceAlreadyUsed = false;
            for(let y = startY; y < endY; y++)
            {
                if(y == cell.y) { continue; }
                if(!this.grid[cell.x][y].value) { continue; }
                spaceAlreadyUsed = true;
                break;
            }
            if(spaceAlreadyUsed) { return false; }

            for(let i = 0; i < word.length; i++)
            {
                this.grid[cell.x][startY + i].setValue(word.at(i));
            }
            this.lettersPlaced += (word.length - 1);
            return true;
        }
    }

    getNonEmptyLine()
    {
        const orient = Math.random() <= 0.5 ? 0 : 1;
        const maxValue = orient == 0 ? this.height : this.width;
        const options : number[] = [];
        for(let i = 0; i < maxValue; i++)
        {
            options.push(i);
        }

        shuffle(options);
        while(options.length > 0)
        {
            const o = options.pop();
            if(!o) { break; }
            
            const arr : Cell[] = [];
            if(orient == 0)
            {
                for(let x = 0; x < this.width; x++)
                {
                    const cell = this.grid[x][o];
                    if(!cell.hasValue() && arr.length <= 0) { continue; }
                    if(!cell.hasValue()) { break; }
                    arr.push(cell);
                }
            }

            if(orient == 1)
            {
                for(let y = 0; y < this.height; y++)
                {
                    const cell = this.grid[o][y];
                    if(!cell.hasValue() && arr.length <= 0) { continue; }
                    if(!cell.hasValue()) { break; }
                    arr.push(cell);
                }
            }

            if(arr.length <= 0) { continue; }

            const hasOddLength = (arr.length % 2 == 1);
            let willGoOutOfBounds = false;
            let maxX = arr[arr.length - 1].x;
            let maxY = arr[arr.length - 1].y;
            if(orient == 0) { willGoOutOfBounds = maxX == (this.width - 1); }
            if(orient == 1) { willGoOutOfBounds = maxY == (this.height - 1); }

            if(hasOddLength && willGoOutOfBounds) { continue; }

            if(hasOddLength)
            {
                const newX = (orient == 0) ? maxX + 1 : maxX;
                const newY = (orient == 0) ? maxY : maxY + 1;
                arr.push(new Cell(newX, newY, ""));
            }

            return arr;
        }

        return [];
    }

    getCenterCell()
    {
        const cX = Math.floor(0.5 * this.width);
        const cY = Math.floor(0.5 * this.height);
        return this.grid[cX][cY];
    }

    findCommonLetters(word)
    {
        if(this.lettersPlaced <= 0) { return [this.getCenterCell()]; }

        const letters = word.split("");
        const arr : Cell[] = [];
        for(let x = 0; x < this.width; x++)
        {
            for(let y = 0; y < this.height; y++)
            {
                const value = this.grid[x][y].value;
                if(!value) { continue; }
                if(!letters.includes(value)) { continue; }
                arr.push(this.grid[x][y]);
            }
        }
        return arr;
    }

    addRandomDominoes()
    {
        const num = Math.floor(Math.random() * 3) + 1;
        for(let i = 0; i < num; i++)
        {
            const orient = Math.random() <= 0.5 ? 0 : 1;
            const pos = this.findPlaceForDomino(orient);
            const d = new Domino(pos.x, pos.y, undefined, orient);
            this.addDomino(d);
        }
    }

    findPlaceForDomino(orient)
    {
        const maxX = orient == 0 ? (this.width - 1) : this.width;
        const maxY = orient == 1 ? (this.height - 1) : this.height;

        const locations : Point[] = [];
        for(let x = 0; x < maxX; x++)
        {
            for(let y = 0; y < maxY; y++)
            {
                let fullOverlap = false;
                let notConnected = true;
                for(const domino of this.dominoes)
                {
                    if(domino.isConnectedTo(x,y,orient))
                    {
                        notConnected = false;
                    }

                    if(domino.overlapsCompletely(x,y,orient)) {
                        fullOverlap = true;
                        break;
                    }
                }

                const thereAreDominoes = this.dominoes.length > 0;
                const invalidLocation = (notConnected || fullOverlap) && thereAreDominoes;
                if(invalidLocation) { continue; }
                locations.push(new Point(x, y));
            }
        }

        return locations[Math.floor(Math.random() * locations.length)];
    }

    addDomino(domino)
    {
        this.dominoes.push(domino);

        const val1 = domino.getValueData(0);
        const val2 = domino.getValueData(1);

        const displayVal1 = domino.getValueData(0, true);
        const displayVal2 = domino.getValueData(1, true);

        this.grid[val1.x][val1.y].setValue(val1.value);
        this.grid[val1.x][val1.y].setValueDisplayed(displayVal1.value);
        this.grid[val2.x][val2.y].setValue(val2.value);
        this.grid[val2.x][val2.y].setValueDisplayed(displayVal2.value);
    }

    loadSpriteSheet()
    {
        return new Promise((resolve, reject) => {
            const spriteSheet = new Image()
            spriteSheet.onload = () => resolve(spriteSheet)
            spriteSheet.onerror = reject
            spriteSheet.src = "/keebble-games/spell/keebble-domino/assets/ambigram_letters.webp"
        })
    }

    getNewWords(newCells : Cell[] = [])
    {            
        const params = {
            x: 0, 
            y: 0, 
            newCells: newCells,
            words: [], 
            curWord: "", 
            cellsUsed: []
        }

        // vertical words
        for(let x = 0; x < this.width; x++)
        {
            params.x = x;
            for(let y = 0; y <= this.height; y++)
            {
                params.y = y;
                this.sweepFindWord(params);
            }
        }

        params.curWord = "";
        params.cellsUsed = [];

        // horizontal words
        for(let y = 0; y < this.height; y++)
        {
            params.y = y;
            for(let x = 0; x <= this.width; x++)
            {
                params.x = x;
                this.sweepFindWord(params);
            }
        }

        return params.words;
    }

    sweepFindWord(params)
    {
        const x = params.x;
        const y = params.y;
        
        const hasValue = (x < this.width && y < this.height) && this.grid[x][y].hasValue();
        if(!hasValue) { 

            const validWord = params.curWord.length > 1;
            
            let isNew = false;
            for(const cell of params.cellsUsed)
            {
                if(!params.newCells.includes(cell)) { continue; }
                isNew = true;
                break;
            }

            if(validWord && isNew) 
            { 
                params.words.push(params.curWord); 
            }
            
            params.curWord = "";
            params.cellsUsed = [];
            return;
        }

        params.curWord += this.grid[x][y].value;
        params.cellsUsed.push(this.grid[x][y]);
    }

    async visualize() : Promise<HTMLImageElement>
    {
        const spriteSheet = await this.loadSpriteSheet();
        this.spriteSheet = spriteSheet;

        const canv = document.createElement('canvas');
        canv.width = this.widthPixel;
        canv.height = this.heightPixel;
        
        const ctx = canv.getContext("2d") as CanvasRenderingContext2D;
        const cellSize = Math.min(this.widthPixel / this.width, this.heightPixel / this.height);
        const params = {
            ctx: ctx,
            cs: cellSize,
            sprites: spriteSheet,
            scale: 0.8
        }

        // background and grid
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canv.width, canv.height);

        ctx.strokeStyle = "#CCCCCC";
        ctx.lineWidth = 0.01 * canv.width;
        for(let x = 0; x < this.width; x++)
        {
            ctx.beginPath();
            ctx.moveTo(x*cellSize, 0);
            ctx.lineTo(x*cellSize, canv.height);
            ctx.stroke();
        }

        for(let y = 0; y < this.height; y++)
        {
            ctx.beginPath();
            ctx.moveTo(0, y*cellSize);
            ctx.lineTo(canv.width, y*cellSize);
            ctx.stroke();
        }

        // use the domino array for correct overlapping of backgrounds
        for(const domino of this.dominoes)
        {
            domino.visualize(params);
        }

        // print the symbols inside the dominoes
        for(let x = 0; x < this.width; x++)
        {
            for(let y = 0; y < this.height; y++)
            {
                this.grid[x][y].visualize(params);
            }
        }

        return new Promise((resolve, reject) => {
            const img = document.createElement("img");
            img.onload = () => resolve(img)
            img.onerror = reject
            img.src = canv.toDataURL();
            return img;
        })
    }
}


async function generate() 
{
    const wordOptions = ["CAT", "DOG", "EAT", "ALE", "HUT", "CAR", "OPEN", "OKAY", "INN", "MINT", "HAT", "ACE", "PEAR", "HAND", "DUST", "SIN", "SAP", "OLD", "SAY", "MET", "BIN", "EYE", "LOT", "LUCK", "COW", "BIKE", "BUY", "SING"];

    // board state
    // we start by placing a few perfect words
    o.addParagraph("The board looks like this (from your perspective).");

    let board = new Board(5, 5);
    let cells : Cell[] = [];
    let badGeneration = true;
    while(badGeneration)
    {
        const numWordsInSetup = Math.floor(Math.random() * 2) + 2;
        board.addWords(numWordsInSetup, shuffle(wordOptions.slice()));
        board.cutIntoDominoes();

        cells = board.getNonEmptyLine();
        badGeneration = cells.length < 2;
    }

    // hand state
    // now we extract one column/row from the board as our hand

    // @NOTE: this ensures the line returned has an even length and splits precisely into dominoes
    const orient = (Math.abs(cells[1].x - cells[0].x) > 0.005) ? 0 : 1;
    const hand : Domino[] = [];
    const numDominoesPlayed = Math.floor(cells.length * 0.5);
    for(let i = 0; i < 4; i++)
    {
        const idx = i*2;
        let d = new Domino();
        if(idx < cells.length)
        {
            const cell1 = cells[idx];
            const cell2 = cells[idx+1];
            d = new Domino(cell1.x, cell1.y, [cell1.value, cell2.value], orient);
        }

        hand.push(d);
    }

    // reset all the cells we'll overlap on our turn (see below) to some random letter
    for(const c of cells)
    {
        if(!c.value) { continue; }
        c.setRandomValue();
    }

    const imgNode = await board.visualize();
    const imgNodeContainer = document.createElement("div");
    imgNodeContainer.classList.add("interactive-example-image-container");
    imgNodeContainer.appendChild(imgNode);
    o.addNode(imgNodeContainer);

    const containerNode = document.createElement("div");
    containerNode.classList.add("interactive-example-hand-container");
    const nodes : HTMLImageElement[] = [];
    for(const domino of hand)
    {
        const node = await domino.visualizeStandalone(board);
        nodes.push(node);
    }

    shuffle(nodes);
    for(const node of nodes)
    {
        containerNode.appendChild(node);
    }

    o.addParagraph("You hold these dominoes in your hand.");
    o.addNode(containerNode);

    // option 1) don't play anything
    const play = Math.random() <= 0.95;
    if(!play)
    {
        o.addParagraph("You do not play any cards.");
        o.addParagraph("End of turn! You draw 2 extra dominoes <em>from your own score pile</em>.");
    }

    // option 2) play dominoes
    if(play)
    {
        o.addParagraph("You play " + numDominoesPlayed + " of them. The board now looks like this.");
        
        const cellsUsed : any[] = [];
        for(let i = 0; i < numDominoesPlayed; i++)
        {
            const d = hand.shift(); 
            if(!d) { break; }
            d.setHighlight(true);
            board.addDomino(d);
            cellsUsed.push(d.getCells(board));
        }

        const finalBoardImgNode = await board.visualize();
        const finalImgNodeContainer = document.createElement("div");
        finalImgNodeContainer.classList.add("interactive-example-image-container");
        finalImgNodeContainer.appendChild(finalBoardImgNode);
        o.addNode(finalImgNodeContainer);

        const newWords : string[] = board.getNewWords(cellsUsed.flat());
        let points = 0;
        if(newWords.length == 1)
        {
            const word = newWords[0];
            const score = word.length;
            o.addParagraph("You created a new word: <strong>" + word + "</strong>! It has " + score + " letters, so it scores you " + score + " points.");
            points += score;
        } 
        else 
        {
            o.addParagraph("You created new words! They score you ... ");
        
            const list : string[] = [];
            for(const word of newWords)
            {
                const validWord = wordOptions.includes(word);
                let score = word.length;
                if(!validWord) { score *= -1; }

                list.push("<strong>" + word + "</strong>: " + score + " points"); 
                points += score;
            }
            o.addParagraphList(list);
        }

        let txt = "";
        if(points < 0) 
        { 
            txt += "Give " + Math.abs(points) + " dominoes from your score pile back to the draw pile"; 
        }            
        if(points > 0) 
        { 
            txt += "Grab " + points + " dominoes from the draw pile and add them to your score pile!"; 
        }
        o.addParagraph(txt);

        o.addParagraph("End of turn! Draw your hand back up to 4 cards.");
    }
}

const e = new InteractiveExample({ id: "turn" });
e.setButtonText("Give me an example turn!");
e.setGenerationCallback(generate);

const o = e.getOutputBuilder();