import { GridMapper } from "lib/pq-games"
import { CONFIG } from "../../shared/config"
import Colorizer from "../tools/colorizer"
import Tile from "./tile"

export default class Tiles 
{
    individualCanvases: HTMLCanvasElement[]
    gridMapper: GridMapper
    tilesToGenerate: number
    //individualImages: HTMLImageElement[]
    images: HTMLImageElement[]
    tiles: Tile[]

    constructor()
    {
        this.individualCanvases = [];
        this.setup();

        // last minute update: realized sizes should usually be smaller on hexagons/triangles
        let generatorReductionFactor = 1.0;
        const tileShape = CONFIG._settings.tileShape.value;
        if(tileShape == "hexagon") {
            generatorReductionFactor = 0.66;
        } else if(tileShape == "rectangle") {
            generatorReductionFactor = 1.0;
        } else if(tileShape == "triangle") {
            generatorReductionFactor = 0.5;
        }
        CONFIG.generatorReductionFactor = generatorReductionFactor;
        CONFIG.photomone.maxRandomization.min *= generatorReductionFactor;
        CONFIG.photomone.maxRandomization.max *= generatorReductionFactor;
        
        // last minute update: on weird tileshapes, disable all "enhancements" as they don't work or make it messy
        if(tileShape != "rectangle")
        {
            CONFIG.randomWalk.enhancements_v2.dotsBetween = false;
            CONFIG.randomWalk.enhancements_v2.shapesAttached = false;
            CONFIG.randomWalk.enhancements_v2.hairs = false;
            CONFIG.randomWalk.enhancements_v2.halfLines = false;
            CONFIG.randomWalk.enhancements_v2.edgeLines = false;
        }

        const numLinesFactor = (CONFIG.tiles.gridResolution / 4);
        const size = CONFIG.tiles.tileSize;
        const squareSize = Math.min(size.x, size.y);
        const visualScaleFactor = (squareSize / CONFIG.tiles.gridResolution);
        CONFIG.randomWalk.length.min *= numLinesFactor;
        CONFIG.randomWalk.length.max *= numLinesFactor;
        CONFIG.randomWalk.lineWidth *= visualScaleFactor;
        CONFIG.tiles.gridPointSize *= visualScaleFactor * CONFIG.generatorReductionFactor;
        CONFIG.tiles.outlineWidth *= squareSize;

        for(const key of Object.keys(CONFIG.randomWalk.lineWidths))
        {
            CONFIG.randomWalk.lineWidths[key] *= squareSize;
        }

        this.setupColors();

        if(!CONFIG._settings.material.includeTiles.value) { return; }
        this.generate();
    }

    setupColors()
    {
        const colorizer = new Colorizer();
        CONFIG.mosaic.colors = colorizer.generateEquidistant(CONFIG.mosaic.numColors);
        CONFIG.photomone.colors = colorizer.generateEquidistant(CONFIG.photomone.numColors);
        CONFIG.shapes.colors = colorizer.generateEquidistant(CONFIG.shapes.numColors);
        CONFIG.simple.colors = colorizer.generateEquidistant(CONFIG.simple.numColors);
    }

    setup()
    {
        const numPages = CONFIG.tiles.numPages;
        // @TODO
        const tilesPerPage = size.x * size.y;
        this.tilesToGenerate = numPages * tilesPerPage;
    }

    generate()
    {
        const arr : Tile[] = []
        for(let i = 0; i < this.tilesToGenerate; i++)
        {
            arr.push(new Tile(CONFIG, i));
        }
        this.tiles = arr;
    }
}