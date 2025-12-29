
import BoardState from "./boardState"
import Cell from "./cell"
import { CONFIG } from "../shared/config"
import { TUTORIAL_DATA } from "../shared/dict"
import { prepareCorrectCellTypes } from "./types"
import Evaluator from "./evaluator"
import { Color, colorLighten, fromArray, getWeighted, LayoutOperation, Line, MaterialVisualizer, range, rangeInteger, Rectangle, ResourceGroup, ResourceShape, ResourceText, shuffle, StrokeAlign, TextConfig, Vector2 } from "lib/pq-games"

export default class Board
{
    outerRect: Rectangle
    outerMargin: Vector2
    rect: Rectangle
    cellSize: Vector2
    cellSizeSquare: number
    iconSize: number
    generationSuccess: boolean
    state: BoardState

    getOuterRectangle() { return this.outerRect; }
    setupOuterRectangle(vis:MaterialVisualizer)
    {
        const size = vis.size;
        const minSize = Math.min(size.x, size.y);
        const margin = new Vector2(vis.get("board.outerMargin.x") * minSize, vis.get("board.outerMargin.y") * minSize);
        this.outerMargin = margin;

        const maxWidth = size.x;
        const maxHeight = size.y;
        const squareSize = Math.min(maxWidth, maxHeight);
        let finalSize = new Vector2(maxWidth, maxHeight);
        let finalPos = new Vector2();

        const boardPos = vis.get("board.position");
        const boardSize = vis.get("board.size");
        if(boardPos == "right" || boardPos == "left") 
        {
            finalSize = new Vector2(squareSize);
        }

        if(boardPos == "right") { finalPos.x = size.x - finalSize.x; }

        this.outerRect = new Rectangle().fromTopLeft(finalPos, finalSize);
        this.rect = new Rectangle().fromTopLeft(finalPos.clone().add(margin), finalSize.clone().sub(margin.clone().scale(2)));

        const fullSizeForCells = vis.get("board.modifyEdgeCells") ? this.outerRect : this.rect;

        const cellX = fullSizeForCells.getSize().x / boardSize.x;
        const cellY = fullSizeForCells.getSize().y / boardSize.y;
        const tilesNotSquare = Math.abs(cellX - cellY) > 10;
        if(tilesNotSquare) { return console.error("Tiles not square: ", cellX, cellY); }

        this.cellSize = new Vector2(cellX, cellY);
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
            const randval = rangeInteger(data.value.min, data.value.max);
            c.setValue(randval);
        }

        let changeRotation = true;
        if(data.needsTeam) {
            const myTeam = params.lastTeam;
            c.setTeam(myTeam);

            if(!data.keepTeamEachPick)
            {
                const newTeam = (myTeam + 1) % CONFIG._drawing.teams.num;
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
            if(CONFIG._settings.noRotation.value) { myRot = 0; newRot = 0; }
            params.lastTutorialRotation = newRot;
        }

        if(changeRotation) { c.setRotation(myRot); }
    }

    determineTypes()
    {
        let cells = this.state.getGridFlat();
        const totalNumCells = cells.length;
        shuffle(cells);

        const placeTutorials = CONFIG._settings.includeRules.value;

        // add tutorial cells
        if(placeTutorials)
        {
            const centerCell = this.state.getCenterCell();
            centerCell.setType("scroll");
            centerCell.setTutorial("objective");
            this.removeFromList(centerCell, cells);
    
            const centerCellRight = this.state.getCellOffset(centerCell, new Vector2({x:1,y:0}));
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
                    const nb = fromArray(nbs);
                    if(!nb) { return console.error("Can't place tutorial because no empty neighbor"); }

                    cellParams.type = "scroll"
                    cellParams.tutorial = type;
                    cellParams.cell = nb;
                    this.setCell(cellParams);
                }
            }
        }

        const percentageEmpty = CONFIG._drawing.board.percentageEmpty[CONFIG._settings.difficulty.value];
        const numEmptyCells = Math.round( range(percentageEmpty.min*totalNumCells, percentageEmpty.max*totalNumCells) );

        // fill up the remaining empty space with random types
        const maxTries = 200;
        let numTries = 0;
        while(cells.length > numEmptyCells)
        {
            numTries += 1;
            const outOfTypes = Object.keys(typesDict).length <= 0;
            const ranOutOfTries = (numTries >= maxTries);
            if(outOfTypes || ranOutOfTries) { break; }

            const randType = getWeighted(typesDict);
            const data = typesDict[randType];

            const typeMax = data.num ? data.num.max : CONFIG._drawing.types.generalMaxPerType;
            const placedTooMany = cellParams.numPerType[randType] >= typeMax;

            const teamMax = data.numPerTeam ? data.numPerTeam.max : CONFIG._drawing.types.generalMaxPerTeam;
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

    async draw(vis:MaterialVisualizer, group:ResourceGroup) : Promise<HTMLCanvasElement>
    {
        // old code, so drawing + generation was intertwined and I decided to keep it that way for now
        this.setupOuterRectangle(vis);
        prepareCorrectCellTypes(); // this is stupid code from old me, making permanent changes on config like this every draw, but we'll accept it for now
        const evaluator = new Evaluator();
    
        let validBoard = false;
        do {
            this.generate();
            validBoard = evaluator.evaluate(this);
        } while(!validBoard);
    
        this.drawGrid(vis, group);
        this.drawIcons(vis, group);
        this.drawOutline(vis, group);
        evaluator.draw(vis, group, this);
        return await vis.finishDraw(group);
    }

    convertGridToRealPos(pos:Vector2)
    {
        return new Vector2(
            pos.x * this.cellSize.x + this.outerRect.getTopLeft().x,
            pos.y * this.cellSize.y + this.outerRect.getTopLeft().y
        );
    }


    getRectCenter(rect:Rectangle)
    {
        return rect.center.clone();
    }

    getRotationForCell(c:Cell)
    {
        const rotPerTeam = CONFIG._drawing.teams.num == 2 ? 2 : 1;
        let rot = c.getRotation();
        const data = c.hasType() ? CONFIG.typeDict[c.getType()] : {};
        if(c.hasTeam() && !data.allowAllRotations)
        {
            rot = (c.getTeam() * rotPerTeam) % 4;
            if(CONFIG._settings.noRotation.value) { rot = 0; }
        }

        return rot * 0.5 * Math.PI;
    }

    getCornerFromRotation(rect:Rectangle, rot:number)
    {
        const rotInt = Math.round(rot / (0.5 * Math.PI));
        const pos = rect.getTopLeft();
        const size = rect.getSize();
        if(rotInt == 0) {
            return new Vector2(pos.x + size.x, pos.y + size.y);
        } else if(rotInt == 1) { 
            return new Vector2(pos.x, pos.y + size.y);
        } else if(rotInt == 2) { 
            return new Vector2(pos.x, pos.y);
        } else if(rotInt == 3) {
            return new Vector2(pos.x + size.x, pos.y);
        }
    }

    getRectForCell(c:Cell)
    {
        let pos = this.convertGridToRealPos(c.getPos());
        let size = this.cellSize.clone();

        const isHorizontalEdge = (c.x == 0 || c.x == (CONFIG._drawing.board.size.x-1));
        const isVerticalEdge = (c.y == 0 || c.y == (CONFIG._drawing.board.size.y-1));
        const isHorizontalTopEdge = (c.x == 0);
        const isVerticalTopEdge = (c.y == 0);

        const isEdgeCell = (isHorizontalEdge || isVerticalEdge)
        if(CONFIG._drawing.board.modifyEdgeCells && isEdgeCell)
        {
            if(isHorizontalEdge) { size.x -= this.outerMargin.x; }
            if(isVerticalEdge) { size.y -= this.outerMargin.y; }

            if(isHorizontalTopEdge) { pos.x += this.outerMargin.x; }
            if(isVerticalTopEdge) { pos.y += this.outerMargin.y; }
        }

        return new Rectangle().fromTopLeft(pos, size);
    }

    drawGrid(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const cells = this.state.getGridFlat();
        const inkFriendly = vis.inkFriendly;

        // filled in background / rectangles
        for(const c of cells)
        {
            if(inkFriendly) { continue; }

            const colorIndex = (c.x + c.y) % 2;
            let baseCol = vis.get("board.grid.colorNeutral");
            if(c.hasType()) { baseCol = CONFIG.typeDict[c.getType()].bg; }

            let baseColObject = new Color(baseCol);

            const slightlyModifyColor = colorIndex == 1;
            if(slightlyModifyColor) { baseColObject = colorLighten(baseColObject, vis.get("board.grid.colorModifyPercentage")); }

            const alpha = vis.get("board.grid.colorBackgroundAlpha");
            const rect = this.getRectForCell(c);
            const op = new LayoutOperation({
                fill: baseColObject,
                alpha: alpha
            });
            group.add(new ResourceShape(rect), op);
        }

        // vertical lines
        const size = vis.get("board.size");
        for(let x = 1; x < size.x; x++)
        {
            this.drawLineVertical(vis, group, x, size);
        }

        // horizontal lines
        for(let y = 1; y < size.y; y++)
        {
            this.drawLineHorizontal(vis, group, y, size);
        }

        // dotted lines halfway squares
        const addHalfLines = vis.get("board.addHalfLines");
        if(addHalfLines)
        {
            for(let x = 0; x < size.x; x++)
            {
                this.drawLineVertical(vis, group, x + 0.5, size, true)
            }

            for(let y = 0; y < size.y; y++)
            {
                this.drawLineHorizontal(vis, group, y + 0.5, size, true);
            }
        }
    }

    drawLineVertical(vis:MaterialVisualizer, group:ResourceGroup, x:number, size:Vector2, dotted = false)
    {
        const pos1 = this.convertGridToRealPos(new Vector2(x, 0));
        const pos2 = this.convertGridToRealPos(new Vector2(x, size.y));
        this.drawLineBetween(vis, group, pos1, pos2, dotted);
    }

    drawLineHorizontal(vis:MaterialVisualizer, group:ResourceGroup, y:number, size:Vector2, dotted = false)
    {
        const pos1 = this.convertGridToRealPos(new Vector2(0, y));
        const pos2 = this.convertGridToRealPos(new Vector2(size.x, y));
        this.drawLineBetween(vis, group, pos1, pos2, dotted);
    }

    drawLineBetween(vis:MaterialVisualizer, group:ResourceGroup, pos1:Vector2, pos2:Vector2, dotted = false)
    {
        if(dotted)
        {
            return this.drawDottedLineBetween(vis, group, pos1, pos2);
        }

        const line = new Line(pos1, pos2);
        const gridParams = vis.get("board.grid");
        const lineWidth = gridParams.lineWidth * this.cellSizeSquare;
        const op = new LayoutOperation({
            stroke: gridParams.lineColor,
            strokeWidth: lineWidth
        });
        group.add(new ResourceShape(line), op);
    }

    drawDottedLineBetween(vis:MaterialVisualizer, group:ResourceGroup, pos1:Vector2, pos2:Vector2)
    {
        const vector = pos1.vecTo(pos2);
        const vectorNorm = vector.clone().normalize();
        const vectorLength = vector.clone().length();

        const dashLength = 10;
        const gapLength = 10;
        const stepsNeeded = Math.floor( (vectorLength / (dashLength + gapLength)) * 2 );

        const gridParams = vis.get("board.grid");
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
            group.add(new ResourceShape(line), op);
        }
    }

    drawIcons(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const cells = this.state.getGridFlat();
        const inkFriendly = vis.inkFriendly;

        const fontCfg = vis.get("board.font");
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
            let textureKey = vis.get("types.textureKey");
            let frame = CONFIG.typeDict[t].frame;
            if(t == "scroll" && inkFriendly)
            {
                textureKey = "scroll_grayscale"; 
                frame = 0;
            }

            const resSprite = vis.getResource(textureKey);
            const opSprite = new LayoutOperation({
                pos: center,
                frame: frame,
                size: new Vector2(iconSize*vis.get("board.iconScale")),
                rot: rot,
                pivot: Vector2.CENTER
            });
            group.add(resSprite, opSprite);

            const hasTeam = c.hasTeam();
            if(hasTeam)
            {
                const anchorPos = this.getCornerFromRotation(rect, rot);
                const teamIconScale = iconSize * CONFIG._drawing.teams.iconScale;

                const offset = new Vector2(
                    -Math.cos(rot + 0.25*Math.PI) * teamIconScale,
                    -Math.sin(rot + 0.25*Math.PI) * teamIconScale
                );
                const pos = anchorPos.clone().add(offset);

                const resSprite = vis.getResource(vis.get("teams.textureKey"));
                const opSprite = new LayoutOperation({
                    pos: pos,
                    size: new Vector2(teamIconScale),
                    rot: rot,
                    frame: c.getTeam(),
                    pivot: Vector2.CENTER
                })
                group.add(resSprite, opSprite);
            }

            if(hasTutorial) 
            {
                const tutorialType = c.getTutorial();

                let frame = 0;
                if(tutorialType in CONFIG.typeDict) { frame = CONFIG.typeDict[tutorialType].tutFrame; }
                else { frame = TUTORIAL_DATA[tutorialType].frame; }

                const resTut = vis.getResource(vis.get("tutorial.textureKey"));
                const opTut = new LayoutOperation({
                    pos: center,
                    size: new Vector2(iconSize * vis.get("board.tutScale")),
                    frame: frame,
                    rot: rot,
                    pivot: Vector2.CENTER
                });
                group.add(resTut, opTut);
            }

            const hasValue = c.hasValue();
            if(hasValue)
            {
                const text = c.getValue().toString();
                const resText = new ResourceText({ text: text, textConfig: textConfig });
                const opText = new LayoutOperation({
                    pos: center,
                    size: new Vector2(2*textConfig.size),
                    pivot: Vector2.CENTER,
                    rot: rot,
                    fill: fontCfg.color,
                    stroke: fontCfg.strokeColor,
                    strokeWidth: (fontCfg.strokeWidth * this.cellSizeSquare),
                    strokeAlign: StrokeAlign.OUTSIDE
                });
                group.add(resText, opText);
            }
        }
    }

    drawOutline(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const lineWidth = vis.get("board.outline.width") * this.cellSizeSquare;
        const lineColor = vis.get("board.outline.color") ?? "#000000";

        const op = new LayoutOperation({
            stroke: lineColor,
            strokeWidth: lineWidth
        });
        group.add(new ResourceShape(this.rect), op);
    }
}
