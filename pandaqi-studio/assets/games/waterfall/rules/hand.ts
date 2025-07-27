import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import fromArray from "js/pq_games/tools/random/fromArray";
import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import Tile from "../game/tile";

export default class Hand
{
    tiles: Tile[] = []
    tilesScored: Tile[] = []
    leapfrog = false

    resetTurnProperties()
    {
        this.leapfrog = false;
    }

    addTile(t:Tile) 
    { 
        if(!t) { return; }
        this.tiles.push(t); 
        return this;
    }

    addTiles(tiles:Tile[])
    {
        for(const tile of tiles)
        {
            this.addTile(tile);
        }
        return this;
    }

    removeTile(t:Tile)
    {
        let idx = this.tiles.indexOf(t);
        if(idx < 0) { return; }
        this.tiles.splice(idx, 1);
        return this;
    }
    removeTiles(tiles:Tile[])
    {
        for(const tile of tiles)
        {
            this.removeTile(tile);
        }
        return this;
    }

    getRandomTile(remove = false) : Tile
    {
        if(this.count() <= 0) { return null; }
        const tile = fromArray(this.tiles);
        if(remove) { this.removeTile(tile); }
        return tile;
    }

    count() : number { return this.tiles.length; }
    getTiles() : Tile[]
    {
        return this.tiles.slice();
    }

    scoreTile(t:Tile)
    {
        this.removeTile(t);
        this.tilesScored.push(t);
    }

    getScore()
    {
        let num = 0;
        for(const tile of this.tilesScored)
        {
            num += tile.score;
        }
        return num;
    }

    getTileMatchingPath(path:Tile[], remove = false)
    {
        for(const pathTile of path)
        {
            for(const handTile of this.tiles)
            {
                if(handTile.gemstone != pathTile.gemstone) { continue; }
                if(remove) { this.removeTile(handTile); }
                return handTile;               
            }
        }
        return null;
    }

    async draw(sim:InteractiveExampleSimulator)
    {
        const canvases = [];
        for(const tile of this.tiles)
        {
            canvases.push(await tile.draw(sim.getVisualizer()));
        }        
        const images = await convertCanvasToImageMultiple(canvases, true);
        return images;
    }
}