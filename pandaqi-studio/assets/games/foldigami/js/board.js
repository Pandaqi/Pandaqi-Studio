import { Geom, Display } from "js/pq_games/phaser.esm"
import Random from "js/pq_games/tools/random/main"
import Point from "js/pq_games/tools/geometry/point"
import Cell from "./cell"
import { TUTORIAL_DATA } from "./dictionary"
import BoardState from "./boardState"

export default class Board
{
    constructor(game)
    {
        this.game = game;
        this.cfg = this.game.cfg;
        this.cfgBoard = this.cfg.board;
        this.setupOuterRectangle();
    }

    getOuterRectangle() { return this.outerRect; }
    setupOuterRectangle()
    {
        const size = this.game.canvas;
        const minSize = Math.min(size.width, size.height);
        const cfg = this.cfgBoard;
        const margin = { x: cfg.outerMargin.x * minSize, y: cfg.outerMargin.y * minSize }
        this.outerMargin = margin;

        const maxWidth = size.width;
        const maxHeight = size.height;
        const squareSize = Math.min(maxWidth, maxHeight);
        let finalSize = { x: maxWidth, y: maxHeight };
        let finalPos = { x: 0, y: 0 }

        if(cfg.position == "right" || cfg.position == "left") 
        {
            finalSize = { x: squareSize, y: squareSize }
        }

        if(cfg.position == "right") { finalPos.x = size.width - finalSize.x; }

        this.outerRect = new Geom.Rectangle(
            finalPos.x, finalPos.y,
            finalSize.x, finalSize.y
        )

        this.rect = new Geom.Rectangle(
            this.outerRect.x + margin.x,
            this.outerRect.y + margin.y,
            finalSize.x - 2*margin.x,
            finalSize.y - 2*margin.y
        )

        const fullSizeForCells = cfg.modifyEdgeCells ? this.outerRect : this.rect;

        const cellX = (fullSizeForCells.width / cfg.dims.x);
        const cellY = (fullSizeForCells.height / cfg.dims.y);
        const tilesNotSquare = Math.abs(cellX - cellY) > 10;
        if(tilesNotSquare) { return console.error("Tiles not square: ", cellX, cellY); }

        this.cellSize = new Point().fromXY(cellX, cellY);
        this.cellSizeSquare = Math.min(cellX, cellY);

        // top left should be the smallest cell, so save that as the measurement for everything
        const topLeftCell = this.getRectForCell(new Cell(0,0));
        this.iconSize = Math.min(topLeftCell.width, topLeftCell.height);
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
        const state = new BoardState(this.cfg);
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
        const data = this.cfg.typeDict[t];

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
                const newTeam = (myTeam + 1) % this.cfg.teams.num;
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
            if(this.cfg.noRotation) { myRot = 0; newRot = 0; }
            params.lastTutorialRotation = newRot;
        }

        if(changeRotation) { c.setRotation(myRot); }
    }

    determineTypes()
    {
        let cells = this.state.getGridFlat();
        const totalNumCells = cells.length;
        Random.shuffle(cells);

        const placeTutorials = this.cfg.includeRules;

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
        const typesDict = Object.assign({}, this.cfg.typeDict);
        const types = Object.keys(typesDict);

        const cellParams = {
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
            const data = this.cfg.typeDict[type];
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

        const percentageEmpty = this.cfgBoard.percentageEmpty[this.cfg.difficulty];
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

            const typeMax = data.num ? data.num.max : this.cfg.types.generalMaxPerType;
            const placedTooMany = cellParams.numPerType[randType] >= typeMax;

            const teamMax = data.numPerTeam ? data.numPerTeam.max : this.cfg.types.generalMaxPerTeam;
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

    convertGridToRealPos(pos)
    {
        return new Point().setXY(
            pos.x * this.cellSize.x + this.outerRect.x,
            pos.y * this.cellSize.y + this.outerRect.y
        );
    }


    getRectCenter(rect)
    {
        return new Point().setXY(
            rect.x + 0.5*rect.width,
            rect.y + 0.5*rect.height
        );
    }

    getRotationForCell(c)
    {
        const rotationPerTeam = this.cfg.teams.num == 2 ? 2 : 1;
        let rotation = c.getRotation();
        const data = c.hasType() ? this.cfg.typeDict[c.getType()] : {};
        if(c.hasTeam() && !data.allowAllRotations)
        {
            rotation = (c.getTeam() * rotationPerTeam) % 4;
            if(this.cfg.noRotation) { rotation = 0; }
        }

        return rotation * 0.5 * Math.PI;
    }

    getCornerFromRotation(rect, rot)
    {
        const rotInt = Math.round(rot / (0.5 * Math.PI));
        if(rotInt == 0) {
            return new Point().setXY(rect.x + rect.width, rect.y + rect.height);
        } else if(rotInt == 1) { 
            return new Point().setXY(rect.x, rect.y + rect.height);
        } else if(rotInt == 2) { 
            return new Point().setXY(rect.x, rect.y);
        } else if(rotInt == 3) {
            return new Point().setXY(rect.x + rect.width, rect.y);
        }
    }

    getRectForCell(c)
    {
        let pos = this.convertGridToRealPos(c);
        let size = this.cellSize.clone();

        const isHorizontalEdge = (c.x == 0 || c.x == (this.cfgBoard.dims.x-1));
        const isVerticalEdge = (c.y == 0 || c.y == (this.cfgBoard.dims.y-1));
        const isHorizontalTopEdge = (c.x == 0);
        const isVerticalTopEdge = (c.y == 0);

        const isEdgeCell = (isHorizontalEdge || isVerticalEdge)
        if(this.cfgBoard.modifyEdgeCells && isEdgeCell)
        {
            if(isHorizontalEdge) { size.x -= this.outerMargin.x; }
            if(isVerticalEdge) { size.y -= this.outerMargin.y; }

            if(isHorizontalTopEdge) { pos.x += this.outerMargin.x; }
            if(isVerticalTopEdge) { pos.y += this.outerMargin.y; }
        }

        const rect = new Geom.Rectangle(
            pos.x, pos.y,
            size.x, size.y
        )
        return rect;
    }

    drawGrid()
    {
        const graphics = this.game.add.graphics();
        const cells = this.state.getGridFlat();
        const inkFriendly = this.cfg.inkFriendly;

        // filled in background / rectangles
        for(const c of cells)
        {
            if(inkFriendly) { continue; }

            const colorIndex = (c.x + c.y) % 2;
            let baseCol = this.cfgBoard.grid.colorNeutral;
            if(c.hasType()) { baseCol = this.cfg.typeDict[c.getType()].bg; }

            baseCol = Display.Color.ValueToColor(baseCol);

            const slightlyModifyColor = colorIndex == 1;
            if(slightlyModifyColor) { baseCol.lighten(this.cfgBoard.grid.colorModifyPercentage); }

            const alpha = this.cfgBoard.grid.colorBackgroundAlpha;
            graphics.fillStyle(baseCol.color, alpha);

            const rect = this.getRectForCell(c);
            graphics.fillRectShape(rect);
        }

        // vertical lines
        const dims = this.cfgBoard.dims;
        const gridParams = this.cfgBoard.grid;
        const lineWidth = gridParams.lineWidth * this.cellSizeSquare;
        graphics.lineStyle(lineWidth, gridParams.lineColor);
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
        const addHalfLines = this.cfgBoard.addHalfLines;
        if(addHalfLines)
        {
            const halfLineWidth = gridParams.halfLineWidth * this.cellSizeSquare;
            graphics.lineStyle(halfLineWidth, gridParams.halfLineColor, gridParams.halfLineAlpha);

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

        const line = new Geom.Line(pos1.x, pos1.y, pos2.x, pos2.y);
        graphics.strokeLineShape(line);
    }

    drawDottedLineBetween(graphics, pos1, pos2)
    {
        const vector = pos1.vecTo(pos2);
        const vectorNorm = vector.clone().normalize();
        const vectorLength = vector.clone().length();

        const dashLength = 10;
        const gapLength = 10;
        const stepsNeeded = Math.floor( (vectorLength / (dashLength + gapLength)) * 2 );

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

            const line = new Geom.Line(prevPos.x, prevPos.y, curPos.x, curPos.y);
            graphics.strokeLineShape(line);
        }
    }

    drawIcons()
    {
        const cells = this.state.getGridFlat();
        const inkFriendly = this.cfg.inkFriendly;

        const fontCfg = this.cfgBoard.font;
        const textCfg = {
            fontFamily: fontCfg.family,
            fontSize: (fontCfg.size * this.cellSizeSquare) + 'px',
            color: fontCfg.color,
            stroke: fontCfg.strokeColor,
            strokeThickness: (fontCfg.strokeWidth * this.cellSizeSquare)
        }

        for(const c of cells)
        {
            const t = c.getType();
            if(!t) { continue; }

            const rect = this.getRectForCell(c);
            const rot = this.getRotationForCell(c);
            const rectSize = Math.min(rect.width, rect.height);
            let iconSize = this.iconSize;
            const hasTutorial = c.hasTutorial();
            if(hasTutorial) { iconSize = rectSize; }

            const center = this.getRectCenter(rect);
            let textureKey = this.cfg.types.textureKey;
            let frame = this.cfg.typeDict[t].frame;
            if(t == "scroll" && inkFriendly)
            {
                textureKey = "scroll_grayscale"; 
                frame = 0;
            }

            const sprite = this.game.add.sprite(center.x, center.y, textureKey);
            sprite.setOrigin(0.5, 0.5);
            sprite.setFrame(frame);
            sprite.setRotation(rot);
            sprite.displayWidth = sprite.displayHeight = iconSize * this.cfgBoard.iconScale;

            const hasTeam = c.hasTeam();
            if(hasTeam)
            {
                const anchorPos = this.getCornerFromRotation(rect, rot);
                const teamIconScale = iconSize * this.cfg.teams.iconScale;

                const offset = new Point().setXY(
                    -Math.cos(rot + 0.25*Math.PI) * teamIconScale,
                    -Math.sin(rot + 0.25*Math.PI) * teamIconScale
                );
                const pos = anchorPos.clone().add(offset);
                const teamSprite = this.game.add.sprite(pos.x, pos.y, this.cfg.teams.textureKey);
                teamSprite.setOrigin(0.5, 0.5);
                teamSprite.setFrame(c.getTeam());
                teamSprite.setRotation(rot);
                teamSprite.displayWidth = teamSprite.displayHeight = teamIconScale;
            }

            if(hasTutorial) 
            {
                const tutorialType = c.getTutorial();
                const tutSprite = this.game.add.sprite(center.x, center.y, this.cfg.tutorial.textureKey);
                tutSprite.setOrigin(0.5, 0.5);
                tutSprite.setRotation(rot);

                let frame = 0;
                if(tutorialType in this.cfg.typeDict) { frame = this.cfg.typeDict[tutorialType].tutFrame; }
                else { frame = TUTORIAL_DATA[tutorialType].frame; }

                tutSprite.setFrame(frame);
                tutSprite.displayWidth = tutSprite.displayHeight = iconSize * this.cfgBoard.tutScale;
            }

            const hasValue = c.hasValue();
            if(hasValue)
            {
                const text = c.getValue().toString();
                const textObject = this.game.add.text(center.x, center.y, text, textCfg);
                textObject.setOrigin(0.5, 0.5);
                textObject.setRotation(rot);
            }
        }
    }

    drawOutline()
    {
        const graphics = this.game.add.graphics();
        const lineWidth = this.cfgBoard.outline.width * this.cellSizeSquare;
        const lineColor = this.cfgBoard.outline.color || 0x00000;
        graphics.lineStyle(lineWidth, lineColor);
        graphics.strokeRectShape(this.rect);
    }
}