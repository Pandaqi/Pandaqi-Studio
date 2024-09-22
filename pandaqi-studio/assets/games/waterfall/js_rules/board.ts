import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Tile from "../js_game/tile";
import Hand from "./hand";
import Point from "js/pq_games/tools/geometry/point";
import fromArray from "js/pq_games/tools/random/fromArray";
import Bounds from "js/pq_games/tools/numbers/bounds";
import { ACTIONS, PAWNS } from "../js_shared/dict";
import CONFIG from "../js_shared/config";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import createContext from "js/pq_games/layout/canvas/createContext";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Circle from "js/pq_games/tools/geometry/circle";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";

interface GameState
{
    curPlayer: Hand,
    playerIndex: number,
    players: Hand[],
    allTiles: Tile[],
    allTilesDiscard: Tile[],
    sim: InteractiveExampleSimulator
}

interface TileData
{
    pos: Point,
    tile: Tile,
    pawns: number[],
}

const OUT_OF_BOARD_POS = null;

export { GameState }
export default class Board
{
    grid:TileData[][] = []
    gridFlat:TileData[] = []
    startingTileData:TileData = null;

    pawns:Point[] = []

    create(startingTile:Tile, numPlayers:number)
    {
        // place the starting tile
        this.startingTileData = this.addTile(startingTile, new Point());

        // create the pawns (+place then off board)
        for(let i = 0; i < numPlayers; i++)
        {
            this.pawns.push(OUT_OF_BOARD_POS)
        }
    }

    addTile(t:Tile, pos:Point)
    {
        // if tile position is lower than lowest layer, add another
        while(this.outOfBounds(pos))
        {
            this.addLayer();
        }

        // and now we can just place it
        return this.setTile(pos, t);
    }

    outOfBounds(pos:Point)
    {
        return pos.y > this.getLowestLayer()
    }

    removeTile(pos:Point)
    {
        const oldTile = this.getTile(pos);
        this.setTile(pos, OUT_OF_BOARD_POS);
        return oldTile;
    }

    getLowestLayer()
    {
        return this.grid.length - 1;
    }

    addLayer()
    {
        this.grid.push([]);
    }

    count()
    {
        return this.gridFlat.length;
    }

    // any time grid changes, keep a flat list of all options that is easier/faster to work with sometimes
    refreshGridFlat()
    {
        const arr = this.grid.flat(); 
        this.gridFlat = [];
        for(const elem of arr)
        {
            if(!elem) { continue; }
            this.gridFlat.push(elem);
        }
    }

    setTile(pos:Point, tile:Tile, pawns:number[] = []) : TileData
    {
        const data = (tile == OUT_OF_BOARD_POS) ? OUT_OF_BOARD_POS : { pos, tile, pawns };
        this.grid[pos.y][pos.x] = data;
        this.refreshGridFlat();
        return data;
    }

    tileHasPawns(pos:Point)
    {
        if(!this.hasTile(pos)) { return false; }
        return this.getTileData(pos).pawns.length > 0;
    }

    hasTile(pos:Point)
    {
        return this.getTileData(pos) != null;
    }

    getTileData(pos:Point)
    {
        if(pos.y < 0 || pos.y >= this.grid.length) { return null; }
        if(pos.x < 0 || pos.x >= this.grid[pos.y].length) { return null; }
        return this.grid[pos.y][pos.x];
    }

    getTile(pos:Point)
    {
        return this.getTileData(pos).tile;
    }

    getPawn(idx:number)
    {
        return this.pawns[idx];
    }

    getRandomValidTileData(exclude:TileData[] = []) : TileData
    {
        const options = this.gridFlat.slice();
        for(const ex of exclude)
        {
            options.splice(options.indexOf(ex), 1);
        }
        if(options.length <= 0) { return null; }
        return fromArray(options);
    }

    moveOffBoard(idx:number) { this.movePawn(idx, OUT_OF_BOARD_POS); }
    movePawn(idx:number, pos:Point)
    {
        const curPos = this.pawns[idx];
        if(curPos != OUT_OF_BOARD_POS)
        {
            const curData = this.getTileData(curPos);
            curData.pawns.splice(curData.pawns.indexOf(idx), 1);
        }

        this.pawns[idx] = pos;

        if(pos != OUT_OF_BOARD_POS)
        {
            const newData = this.getTileData(pos);
            newData.pawns.push(idx);
        }
    }

    async executeTurn(g:GameState, silent = false)
    {
        const tile = g.curPlayer.getRandomTile(true);
        const tilePlayed = (tile != null)

        let numMoves = tilePlayed ? tile.score : 1;
        g.sim.stats.pathLengthTheory += numMoves;

        g.curPlayer.resetTurnProperties();

        if(tilePlayed) { 
            g.allTilesDiscard.push(tile); 
            if(!silent) 
            { 
                g.sim.print("You decide to play the tile <strong>" + tile.getAsString() + "</strong>. This means you take <strong>" + numMoves + " steps</strong> down the waterfall."); 
            }
        } else {

            if(CONFIG.rulebook.drawTileIfHandEmpty && g.allTiles.length > 0)
            {
                g.curPlayer.addTile(g.allTiles.pop());
            }

            g.sim.stats.numTimesHandEmpty++;
            if(!silent) { g.sim.print("Your hand is empty. By default, you take <strong>1 step</strong> down the waterfall."); }
        }

        let curPos = this.getPawn(g.playerIndex);
        let numTilesTraveled = 0;
        const pathTraveled = [];

        const feedback = [];
        for(let i = 0; i < numMoves; i++)
        {
            let str = "Step " + (i+1) + ") ";

            const canLeapfrog = g.curPlayer.leapfrog && Math.random() <= CONFIG.rulebook.leapFrogUseProb;
            if(canLeapfrog) { g.curPlayer.leapfrog = false; }

            // if no moves are returned, all options are BLOCKED
            const moves : Point[] = this.getPossibleMoves(curPos, canLeapfrog, g);
            if(moves.length <= 0)
            {
                str += "You have no moves as they're all blocked by pawns.";
                if(!silent) { g.sim.print(str); }
                g.sim.stats.numTimesBlockedFully++;
                break;
            }

            // pick a random move
            // with some probability, prefer picking a move that makes us STAY on te board
            let randMove = fromArray(moves);
            const stayOnBoard = Math.random() <= CONFIG.rulebook.preferStayingOnBoardProb ?? 0.9;

            if(!this.hasTile(randMove) && stayOnBoard)
            {
                for(const move of moves)
                {
                    if(!this.hasTile(move)) { continue; }
                    randMove = move;
                    break;
                }
            }
            
            // moves are returned, but they're out of bounds, we simply moved off the board
            if(!this.hasTile(randMove))
            {
                str += "You moved off the board.";
                if(!silent) { g.sim.print(str); }
                this.moveOffBoard(g.playerIndex);
                g.sim.stats.numResets++;
                break;    
            }

            numTilesTraveled++;
            if(canLeapfrog) 
            { 
                str += "You use your leapfrog. ";
                numMoves += 1; 
            }

            const newTile = this.getTile(randMove);
            pathTraveled.push(newTile);
            this.doMove(randMove, pathTraveled, canLeapfrog, g);

            // need to re-get it because of leapfrog actions and stuff that make curPos volatile
            curPos = this.getPawn(g.playerIndex); 
            str += "You take one step and land on <em style='color:#333333;'>" + newTile.getAsString() + "</em>. Take its action. After doing so, the board looks like this.";
            //str += "You moved to tile " + (curPos.x+1) + " on row " + (curPos.y+1) + ".";

            if(!silent)
            {
                g.sim.print(str);
                await g.sim.listImages(this, "draw");
            }
        }

        g.sim.stats.pathLengthPractice += numTilesTraveled;
    }

    doMove(newPos:Point, pathTraveled:Tile[], leapfrog = false, g:GameState)
    {
        this.movePawn(g.playerIndex, newPos);
        //console.log(newPos, this.getTile(newPos), this);
        const action = this.getTile(newPos).keyAction;
        if(leapfrog) { return; }
        this.executeAction(action, pathTraveled, g);
    }

    executeAction(action:string, pathTraveled: Tile[], g:GameState)
    {
        // if wildcard, first pick any other valid action
        if(action == "wildcard")
        {
            const options = Object.keys(ACTIONS);
            options.splice(options.indexOf("wildcard"), 1);
            action = fromArray(options);
        }

        if(!g.sim.stats.actionDist[action]) { g.sim.stats.actionDist[action] = 0; }
        g.sim.stats.actionDist[action]++;

        // then just execute the simple actions
        if(action == "add") {
            const locationOptions = this.getPossibleAddLocations();
            if(locationOptions.length > 0)
            {
                const randLocation = fromArray(locationOptions);
                const randTile = g.curPlayer.getRandomTile(true);
                if(randTile) {
                    this.addTile(randTile, randLocation);
                } else {
                    g.sim.stats.numWantedAddButNoTiles++;
                }
            }


        } else if(action == "draw") {
            const num = CONFIG.rulebook.numTilesPerDrawAction ?? 1;
            for(let i = 0; i < num; i++)
            {
                if(g.allTiles.length <= 0) { break; }
                g.curPlayer.addTile(g.allTiles.pop());
            }

        } else if(action == "score") {
            const num = CONFIG.rulebook.numTilesPerScoreAction ?? 1;

            for(let i = 0; i < num; i++)
            {
                const randTile = g.curPlayer.getTileMatchingPath(pathTraveled, true);
                if(randTile) {
                    g.curPlayer.scoreTile(randTile);
                    if(CONFIG.rulebook.resetPathAfterScoring)
                    {
                        pathTraveled.length = 0; // reset "path traveled so far" after score action
                    }
                } else {
                    g.sim.stats.numWantedScoreButNoMatch++;
                }
            }

        } else if(action == "remove") {
            const excludeTiles = [this.startingTileData];
            for(const pawn of this.pawns)
            {
                if(pawn == OUT_OF_BOARD_POS) { continue; }
                excludeTiles.push(this.getTileData(pawn));
            }

            const randData = this.getRandomValidTileData(excludeTiles);
            if(randData)
            {
                if(!this.boardWouldBeDisconnectedIfRemoved(randData.pos)) {
                    const tile = this.removeTile(randData.pos);
                    g.allTilesDiscard.push(tile);
                }   
            }

        } else if(action == "swap") {
            const dataA = this.getRandomValidTileData([this.startingTileData]);
            const dataB = this.getRandomValidTileData([dataA, this.startingTileData]);
            if(dataA && dataB)
            {
                this.setTile(dataA.pos, dataB.tile, dataA.pawns);
                this.setTile(dataB.pos, dataA.tile, dataB.pawns);
            }

        } else if(action == "leapfrog") {
            g.curPlayer.leapfrog = true;

        } else if(action == "pawn") {
            const randPawn = new Bounds(0, this.pawns.length - 1).randomInteger();
            const randPos = this.getRandomValidTileData().pos;
            this.movePawn(randPawn, randPos);
        }
    }

    getPossibleMoves(pos:Point, leapfrog = false, g:GameState) : Point[]
    {
        if(pos == OUT_OF_BOARD_POS)
        {
            return [this.startingTileData.pos];
        }

        const posBelow : Point[] = this.getPositionsBelow(pos);
        const validMoves : Point[] = [];
        for(const pos of posBelow)
        {
            if(this.tileHasPawns(pos) && !leapfrog) 
            { 
                g.sim.stats.numTimesBlocked++;
                continue; 
            }

            validMoves.push(pos);
        }

        if(CONFIG.rulebook.dontBlockIfBothPathsBlocked && validMoves.length <= 0) { return posBelow }
        return validMoves;
    }

    getPossibleAddLocations() : Point[]
    {
        const arr : Point[] = [];
        for(const tile of this.gridFlat)
        {
            arr.push(...this.getPositionsAround(tile.pos, true));
        }
        return arr;
    }

    getPositionsAround(pos:Point, mustBeEmpty = false)
    {
        const allPositions = [
            new Point(pos.x, pos.y - 1), // above
            new Point(pos.x - 1, pos.y), new Point(pos.x + 1, pos.y), // sideways
            new Point(pos.x, pos.y + 1), new Point(pos.x + 1, pos.y + 1) // below
        ]
        const positionsInPyramid = [];
        for(const p of allPositions)
        {
            if(p.x < 0 || p.x > p.y) { continue; }
            if(p.y < 0 || p.y >= CONFIG.rulebook.maxWaterfallHeight) { continue; }
            if(mustBeEmpty && this.hasTile(p)) { continue; }
            positionsInPyramid.push(p);
        }
        return positionsInPyramid;
    }

    getPositionsBelow(pos:Point) : Point[]
    {
        const xOffset = 0; // Math.floor(0.5*pos.y);
        const newX = [
            pos.x + xOffset,
            pos.x + xOffset + 1
        ];
        const yPos = pos.y + 1;

        const arr = [];
        for(const xPos of newX)
        {
            arr.push(new Point(xPos, yPos));
        }
        return arr;
    }

    getPawnsOffBoard()
    {
        const arr : number[] = [];           
        for(let i = 0; i < this.pawns.length; i++)
        {
            if(this.pawns[i] != OUT_OF_BOARD_POS) { continue; }
            arr.push(i)
        };
        return arr;
    }

    positionToID(pos:Point)
    {
        return pos.x * 10 + pos.y; // pyramid will never have width/height 10 or more, so safe to do this
    }

    boardWouldBeDisconnectedIfRemoved(pos:Point)
    {
        const toVisit : Point[] = [this.startingTileData.pos];
        const visited : number[] = [];
        while(toVisit.length > 0)
        {
            const elem = toVisit.pop();
            visited.push(this.positionToID(elem));

            const posAround = this.getPositionsAround(elem);
            for(const position of posAround)
            {
                const id = this.positionToID(position);
                if(visited.includes(id)) { continue; }
                toVisit.push(position);
            }
        }
        const couldVisitAllTiles = visited.length >= this.count();
        return couldVisitAllTiles;
    }

    async draw(sim:InteractiveExampleSimulator)
    {
        const maxSize = this.grid.length;
        const tileSize = 256;
        const canvSize = new Point(tileSize * maxSize);

        const ctx = createContext({ size: canvSize });
        const group = new ResourceGroup();
        const pawnRadius = 0.25*tileSize;

        const drawPawn = (idx:number, pos:Point) => 
        {
            const resPawn = new ResourceShape( new Circle({ center: pos, radius: pawnRadius }) );
            const opPawn = new LayoutOperation({
                fill: PAWNS[idx].color,
                stroke: "#000000",
                strokeWidth: 0.15*pawnRadius,
            })
            group.add(resPawn, opPawn);
        }

        const drawPawns = (indices:number[], pos:Point) =>
        {
            const positions = getPositionsCenteredAround({ pos: pos, size: new Point(1.0*pawnRadius), num: indices.length });
            for(let i = 0; i < positions.length; i++)
            {
                drawPawn(indices[i], positions[i]);
            }
        }

        for(let x = 0; x < maxSize; x++)
        {
            for(let y = 0; y < maxSize; y++)
            {
                const xOffset = -0.5*y;
                const posGrid = new Point(x,y);
                const posReal = new Point((x+xOffset)*tileSize,y*tileSize);
                const tileTop = new Point(posReal.x + 0.5*tileSize, posReal.y);
                const tileCenter = new Point(posReal.x + 0.5*tileSize, posReal.y + 0.5*tileSize);

                // draw the tile that's there (full visualized image)
                if(this.hasTile(posGrid))
                {
                    const resTile = new ResourceImage(await this.getTile(posGrid).drawForRules(sim.getVisualizer()));
                    const opTile = new LayoutOperation({
                        pos: posReal,
                        size: new Point(tileSize)
                    })
                    group.add(resTile, opTile);

                    // also draw any "off-board" pawns on first tile.
                    if(y == 0)
                    {
                        drawPawns(this.getPawnsOffBoard(), tileTop);
                    }
                }

                // draw the player pawn on top
                // (just a circle, though colored correctly)
                if(this.tileHasPawns(posGrid))
                {
                    drawPawns(this.getTileData(posGrid).pawns, tileCenter);
                }
            }
        }

        const groupOp = new LayoutOperation({
            pos: new Point(0.5*canvSize.x - 0.5*tileSize, 0)
        })
        group.toCanvas(ctx, groupOp);
        const img = await convertCanvasToImage(ctx.canvas);
        img.style.maxHeight = "512px";
        return [img];
    }
}