import Random from "js/pq_games/tools/random/main"
import Point from "js/pq_games/tools/geometry/point"
import Cell from "./cell"
import { TUTORIAL_DATA } from "./dict"
import BoardState from "./boardState"
import CONFIG from "./config"
import Color from "js/pq_games/layout/color/color"
import LayoutOperation from "js/pq_games/layout/layoutOperation"
import imageToPhaser from "js/pq_games/phaser/imageToPhaser"
import Line from "js/pq_games/tools/geometry/line"
import Rectangle from "js/pq_games/tools/geometry/rectangle"
import { lineToPhaser, rectToPhaser } from "js/pq_games/phaser/shapeToPhaser"
import ResourceText from "js/pq_games/layout/resources/resourceText"
import textToPhaser from "js/pq_games/phaser/textToPhaser"
import TextConfig from "js/pq_games/layout/text/textConfig"

export default class Board
{
    game: any
    outerRect: Rectangle
    outerMargin: Point
    rect: Rectangle
    cellSize: Point
    cellSizeSquare: number
    iconSize: number
    generationSuccess: boolean
    state: BoardState

    constructor(game:any)
    {
        this.game = game;
        this.setupOuterRectangle();
    }

    getOuterRectangle() { return this.outerRect; }
    setupOuterRectangle()
    {
        const size = this.game.canvas;
        const minSize = Math.min(size.width, size.height);
        const margin = new Point(CONFIG.board.outerMargin.x * minSize, CONFIG.board.outerMargin.y * minSize);
        this.outerMargin = margin;

        const maxWidth = size.width;
        const maxHeight = size.height;
        const squareSize = Math.min(maxWidth, maxHeight);
        let finalSize = new Point(maxWidth, maxHeight);
        let finalPos = new Point();

        if(CONFIG.board.position == "right" || CONFIG.board.position == "left") 
        {
            finalSize = new Point(squareSize);
        }

        if(CONFIG.board.position == "right") { finalPos.x = size.width - finalSize.x; }

        this.outerRect = new Rectangle().fromTopLeft(finalPos, finalSize);
        this.rect = new Rectangle().fromTopLeft(finalPos.clone().add(margin), finalSize.clone().sub(margin.clone().scale(2)));

        const fullSizeForCells = CONFIG.board.modifyEdgeCells ? this.outerRect : this.rect;

        const cellX = (fullSizeForCells.getSize().x / CONFIG.board.dims.x);
        const cellY = (fullSizeForCells.getSize().y / CONFIG.board.dims.y);
        const tilesNotSquare = Math.abs(cellX - cellY) > 10;
        if(tilesNotSquare) { return console.error("Tiles not square: ", cellX, cellY); }

        this.cellSize = new Point().fromXY(cellX, cellY);
        this.cellSizeSquare = Math.min(cellX, cellY);

        // top left should be the smallest cell, so save that as the measurement for everything
        const topLeftCell = this.getRectForCell(new Cell(0,0));
        this.iconSize = Math.min(topLeftCell.getSize().x, topLeftCell.getSize().y);
    }

    generate()
    {
        const maxTries = 100;
        let numTries = 0;
        do {
            this.generationSuccess = false;
            this.state = this.createBoardState(); 
            this.determineTypes();
        } while(!this.generationSuccess && numTries < maxTries);
    }

    createBoardState()
    {
        const state = new BoardState();
        state.createGrid();
        return state;
    }

    cloneState()
    {
        return this.state.clone();
    }

    removeFromList(elem, list)
    {
        const idx = list.indexOf(elem);
        if(idx < 0) { return; }
        list.splice(idx, 1);
    }

    setCell(params)
    {
        const c = params.cell;
        const t = params.type;
        const data = CONFIG.typeDict[t];

        if(!(t in params.numPerType)) { params.numPerType[t] = 0; }
        params.numPerType[t]++;

        c.setType(t);
        this.removeFromList(c, params.cells);

        if(params.tutorial)
        {
            c.setTutorial(params.tutorial);
        }

        if(data.value)
        {
            const randval = Random.rangeInteger(data.value.min, data.value.max);
            c.setValue(randval);
        }

        let changeRotation = true;
        if(data.needsTeam) {
            const myTeam = params.lastTeam;
            c.setTeam(myTeam);

            if(!data.keepTeamEachPick)
            {
                const newTeam = (myTeam + 1) % CONFIG.teams.num;
                params.lastTeam = newTeam;
            }

            if(!(t in params.numPerTeam[myTeam])) { params.numPerTeam[myTeam][t] = 0; }
            params.numPerTeam[myTeam][t]++;
            changeRotation = false;
        } 

        let myRot = 0;
        if(data.allowAllRotations) {
            myRot = Math.floor(Math.random() * 4);
            changeRotation = true;
        } else {
            myRot = params.lastTutorialRotation;
            let newRot = (params.lastTutorialRotation + 2) % 4;
            if(CONFIG.noRotation) { myRot = 0; newRot = 0; }
            params.lastTutorialRotation = newRot;
        }

        if(changeRotation) { c.setRotation(myRot); }
    }

    determineTypes()
    {
        let cells = this.state.getGridFlat();
        const totalNumCells = cells.length;
        Random.shuffle(cells);

        const placeTutorials = CONFIG.includeRules;

        // add tutorial cells
        if(placeTutorials)
        {
            const centerCell = this.state.getCenterCell();
            centerCell.setType("scroll");
            centerCell.setTutorial("objective");
            this.removeFromList(centerCell, cells);
    
            const centerCellRight = this.state.getCellOffset(centerCell, new Point({x:1,y:0}));
            centerCellRight.setType("scroll");
            centerCellRight.setTutorial("foldAction");
            this.removeFromList(centerCellRight, cells);
        }


        // place each type at least once
        const typesDict = Object.assign({}, CONFIG.typeDict);
        const types = Object.keys(typesDict);

        const cellParams = {
            type: "",
            numPerType: {},
            numPerTeam: [{}, {}], // whether this type has already been used by a team
            lastTeam: 0,
            lastTutorialRotation: 0,
            tutorial: null,
            cell: null,
            cells: cells
        }

        const nbParams = {
            empty: true,
            forbidEdgeSelf: false,
            forbidEdge: true
        }

        for(const type of types)
        {
            const data = CONFIG.typeDict[type];
            const hasBuildinTutorial = data.tutorial;
            nbParams.forbidEdgeSelf = hasBuildinTutorial;

            const cell = this.state.getRandomCell(cells, nbParams);

            if(!cell) { return console.error("Can't place cell because no empty neighbors possible"); }

            cellParams.type = type;
            cellParams.cell = cell;
            cellParams.tutorial = null;
            this.setCell(cellParams);

            const numEachPick = data.numEachPick || 1;
            const fixedMin = data.num ? data.num.min : 0;
            const minimumForType = Math.max(numEachPick, fixedMin) - 1; // minus the one we already placed above

            for(let i = 0; i < minimumForType; i++) 
            {
                const c = cells.pop();
                cellParams.cell = c;
                this.setCell(cellParams);
            }

            // some types have the tutorial on themselves; others get a tutorial to the side
            if(placeTutorials)
            {
                if(hasBuildinTutorial) { 
                    cell.setTutorial(hasBuildinTutorial); 
                    cell.setRotation(cellParams.lastTutorialRotation);
                } else {
                    const nbs = this.state.getNeighbors(cell, nbParams);
                    const nb = Random.fromArray(nbs);
                    if(!nb) { return console.error("Can't place tutorial because no empty neighbor"); }

                    cellParams.type = "scroll"
                    cellParams.tutorial = type;
                    cellParams.cell = nb;
                    this.setCell(cellParams);
                }
            }
        }

        const percentageEmpty = CONFIG.board.percentageEmpty[CONFIG.difficulty];
        const numEmptyCells = Math.round( Random.range(percentageEmpty.min*totalNumCells, percentageEmpty.max*totalNumCells) );

        // fill up the remaining empty space with random types
        const maxTries = 200;
        let numTries = 0;
        while(cells.length > numEmptyCells)
        {
            numTries += 1;
            const outOfTypes = Object.keys(typesDict).length <= 0;
            const ranOutOfTries = (numTries >= maxTries);
            if(outOfTypes || ranOutOfTries) { break; }

            const randType = Random.getWeighted(typesDict);
            const data = typesDict[randType];

            const typeMax = data.num ? data.num.max : CONFIG.types.generalMaxPerType;
            const placedTooMany = cellParams.numPerType[randType] >= typeMax;

            const teamMax = data.numPerTeam ? data.numPerTeam.max : CONFIG.types.generalMaxPerTeam;
            const placedTooManyForTeam = cellParams.numPerTeam[cellParams.lastTeam][randType] >= teamMax;

            if(placedTooMany || placedTooManyForTeam)
            {
                delete typesDict[randType];
                continue;
            }

            const numEachPick = data.numEachPick || 1;
            const noRoom = (numEachPick > cells.length);
            if(noRoom) { continue; }

            for(let i = 0; i < numEachPick; i++)
            {
                const c = cells.pop();
                cellParams.type = randType;
                cellParams.cell = c;
                cellParams.tutorial = null;
                this.setCell(cellParams);
            }
        }

        this.finishGeneration();
    }

    finishGeneration()
    {
        this.generationSuccess = true;
    }

    draw()
    {
        this.drawGrid();
        this.drawIcons();
        this.drawOutline();
    }

    convertGridToRealPos(cell:Cell)
    {
        return new Point().setXY(
            cell.x * this.cellSize.x + this.outerRect.getTopLeft().x,
            cell.y * this.cellSize.y + this.outerRect.getTopLeft().y
        );
    }


    getRectCenter(rect:Rectangle)
    {
        return rect.center.clone();
    }

    getRotationForCell(c:Cell)
    {
        const rotationPerTeam = CONFIG.teams.num == 2 ? 2 : 1;
        let rotation = c.getRotation();
        const data = c.hasType() ? CONFIG.typeDict[c.getType()] : {};
        if(c.hasTeam() && !data.allowAllRotations)
        {
            rotation = (c.getTeam() * rotationPerTeam) % 4;
            if(CONFIG.noRotation) { rotation = 0; }
        }

        return rotation * 0.5 * Math.PI;
    }

    getCornerFromRotation(rect:Rectangle, rot:number)
    {
        const rotInt = Math.round(rot / (0.5 * Math.PI));
        const pos = rect.getTopLeft();
        const size = rect.getSize();
        if(rotInt == 0) {
            return new Point().setXY(pos.x + size.x, pos.y + size.y);
        } else if(rotInt == 1) { 
            return new Point().setXY(pos.x, pos.y + size.y);
        } else if(rotInt == 2) { 
            return new Point().setXY(pos.x, pos.y);
        } else if(rotInt == 3) {
            return new Point().setXY(pos.x + size.x, pos.y);
        }
    }

    getRectForCell(c:Cell)
    {
        let pos = this.convertGridToRealPos(c);
        let size = this.cellSize.clone();

        const isHorizontalEdge = (c.x == 0 || c.x == (CONFIG.board.dims.x-1));
        const isVerticalEdge = (c.y == 0 || c.y == (CONFIG.board.dims.y-1));
        const isHorizontalTopEdge = (c.x == 0);
        const isVerticalTopEdge = (c.y == 0);

        const isEdgeCell = (isHorizontalEdge || isVerticalEdge)
        if(CONFIG.board.modifyEdgeCells && isEdgeCell)
        {
            if(isHorizontalEdge) { size.x -= this.outerMargin.x; }
            if(isVerticalEdge) { size.y -= this.outerMargin.y; }

            if(isHorizontalTopEdge) { pos.x += this.outerMargin.x; }
            if(isVerticalTopEdge) { pos.y += this.outerMargin.y; }
        }

        return new Rectangle().fromTopLeft(pos, size);
    }

    drawGrid()
    {
        const graphics = this.game.add.graphics();
        const cells = this.state.getGridFlat();
        const inkFriendly = CONFIG.inkFriendly;

        // filled in background / rectangles
        for(const c of cells)
        {
            if(inkFriendly) { continue; }

            const colorIndex = (c.x + c.y) % 2;
            let baseCol = CONFIG.board.grid.colorNeutral;
            if(c.hasType()) { baseCol = CONFIG.typeDict[c.getType()].bg; }

            let baseColObject = new Color(baseCol);

            const slightlyModifyColor = colorIndex == 1;
            if(slightlyModifyColor) { baseColObject = baseColObject.lighten(CONFIG.board.grid.colorModifyPercentage); }

            const alpha = CONFIG.board.grid.colorBackgroundAlpha;
            const rect = this.getRectForCell(c);
            const op = new LayoutOperation({
                fill: baseColObject,
                alpha: alpha
            });
            rectToPhaser(rect, op, graphics);
        }

        // vertical lines
        const dims = CONFIG.board.dims;
        for(let x = 1; x < dims.x; x++)
        {
            this.drawLineVertical(graphics, x, dims);
        }

        // horizontal lines
        for(let y = 1; y < dims.y; y++)
        {
            this.drawLineHorizontal(graphics, y, dims);
        }

        // dotted lines halfway squares
        const addHalfLines = CONFIG.board.addHalfLines;
        if(addHalfLines)
        {
            for(let x = 0; x < dims.x; x++)
            {
                this.drawLineVertical(graphics, x + 0.5, dims, true)
            }

            for(let y = 0; y < dims.y; y++)
            {
                this.drawLineHorizontal(graphics, y + 0.5, dims, true);
            }
        }
    }

    drawLineVertical(graphics, x, dims, dotted = false)
    {
        const pos1 = this.convertGridToRealPos(new Point().fromXY(x, 0));
        const pos2 = this.convertGridToRealPos(new Point().fromXY(x, dims.y));
        this.drawLineBetween(graphics, pos1, pos2, dotted);
    }

    drawLineHorizontal(graphics, y, dims, dotted = false)
    {
        const pos1 = this.convertGridToRealPos(new Point().fromXY(0, y));
        const pos2 = this.convertGridToRealPos(new Point().fromXY(dims.x, y));
        this.drawLineBetween(graphics, pos1, pos2, dotted);
    }

    drawLineBetween(graphics, pos1, pos2, dotted = false)
    {
        if(dotted)
        {
            return this.drawDottedLineBetween(graphics, pos1, pos2);
        }

        const line = new Line(pos1, pos2);
        const gridParams = CONFIG.board.grid;
        const lineWidth = gridParams.lineWidth * this.cellSizeSquare;
        const op = new LayoutOperation({
            stroke: gridParams.lineColor,
            strokeWidth: lineWidth
        });
        lineToPhaser(line, op, graphics);
    }

    drawDottedLineBetween(graphics, pos1, pos2)
    {
        const vector = pos1.vecTo(pos2);
        const vectorNorm = vector.clone().normalize();
        const vectorLength = vector.clone().length();

        const dashLength = 10;
        const gapLength = 10;
        const stepsNeeded = Math.floor( (vectorLength / (dashLength + gapLength)) * 2 );

        const gridParams = CONFIG.board.grid;
        const halfLineWidth = gridParams.halfLineWidth * this.cellSizeSquare;
        const op = new LayoutOperation({
            stroke: gridParams.halfLineColor,
            alpha: gridParams.halfLineAlpha,
            strokeWidth: halfLineWidth
        });

        let curPos = pos1.clone();
        let currentlyAtGap = true;
        for(let i = 0; i < stepsNeeded; i++)
        {
            let prevPos = curPos.clone();
            currentlyAtGap = !currentlyAtGap;

            if(currentlyAtGap) {
                curPos.add( vectorNorm.clone().scaleFactor(gapLength) );
            } else {
                curPos.add( vectorNorm.clone().scaleFactor(dashLength) );
            }
            
            const lastStep = i == (stepsNeeded - 1);
            if(lastStep) { curPos = pos2.clone(); }

            if(currentlyAtGap) { continue; }

            const line = new Line(prevPos, curPos);
            lineToPhaser(line, op, graphics);
        }
    }

    drawIcons()
    {
        const cells = this.state.getGridFlat();
        const inkFriendly = CONFIG.inkFriendly;

        const fontCfg = CONFIG.board.font;
        const textConfig = new TextConfig({
            font: fontCfg.family,
            size: (fontCfg.size * this.cellSizeSquare),
        }).alignCenter();

        for(const c of cells)
        {
            const t = c.getType();
            if(!t) { continue; }

            const rect = this.getRectForCell(c);
            const rot = this.getRotationForCell(c);
            const rectSize = Math.min(rect.getSize().x, rect.getSize().y);
            let iconSize = this.iconSize;
            const hasTutorial = c.hasTutorial();
            if(hasTutorial) { iconSize = rectSize; }

            const center = this.getRectCenter(rect);
            let textureKey = CONFIG.types.textureKey;
            let frame = CONFIG.typeDict[t].frame;
            if(t == "scroll" && inkFriendly)
            {
                textureKey = "scroll_grayscale"; 
                frame = 0;
            }

            const resSprite = CONFIG.resLoader.getResource(textureKey); // @TODO: re-figure out how to load resources myself and get them
            const opSprite = new LayoutOperation({
                translate: center,
                frame: frame,
                dims: new Point(iconSize*CONFIG.board.iconScale),
                rotation: rot,
                pivot: Point.CENTER
            });
            imageToPhaser(resSprite, opSprite, this.game);

            const hasTeam = c.hasTeam();
            if(hasTeam)
            {
                const anchorPos = this.getCornerFromRotation(rect, rot);
                const teamIconScale = iconSize * CONFIG.teams.iconScale;

                const offset = new Point().setXY(
                    -Math.cos(rot + 0.25*Math.PI) * teamIconScale,
                    -Math.sin(rot + 0.25*Math.PI) * teamIconScale
                );
                const pos = anchorPos.clone().add(offset);

                const resSprite = CONFIG.resLoader.getResource(CONFIG.teams.textureKey);
                const opSprite = new LayoutOperation({
                    translate: pos,
                    dims: new Point(teamIconScale),
                    rotation: rot,
                    frame: c.getTeam(),
                    pivot: Point.CENTER
                })
                imageToPhaser(resSprite, opSprite, this.game);
            }

            if(hasTutorial) 
            {
                const tutorialType = c.getTutorial();

                let frame = 0;
                if(tutorialType in CONFIG.typeDict) { frame = CONFIG.typeDict[tutorialType].tutFrame; }
                else { frame = TUTORIAL_DATA[tutorialType].frame; }

                const resTut = CONFIG.resLoader.getResource(CONFIG.tutorial.textureKey);
                const opTut = new LayoutOperation({
                    translate: center,
                    dims: new Point(iconSize * CONFIG.board.tutScale),
                    frame: frame,
                    rotation: rot,
                    pivot: Point.CENTER
                });
                imageToPhaser(resTut, opTut, this.game);
            }

            const hasValue = c.hasValue();
            if(hasValue)
            {
                const text = c.getValue().toString();
                const resText = new ResourceText({ text: text, textConfig: textConfig });
                const opText = new LayoutOperation({
                    translate: center,
                    dims: new Point(2*textConfig.size),
                    pivot: Point.CENTER,
                    rotation: rot,
                    fill: fontCfg.color,
                    stroke: fontCfg.strokeColor,
                    strokeWidth: (fontCfg.strokeWidth * this.cellSizeSquare)
                });
                textToPhaser(resText, opText, this.game);
            }
        }
    }

    drawOutline()
    {
        const graphics = this.game.add.graphics();
        const lineWidth = CONFIG.board.outline.width * this.cellSizeSquare;
        const lineColor = CONFIG.board.outline.color ?? "#000000";

        const op = new LayoutOperation({
            stroke: lineColor,
            strokeWidth: lineWidth
        });
        rectToPhaser(this.rect, op, graphics);
    }
}
