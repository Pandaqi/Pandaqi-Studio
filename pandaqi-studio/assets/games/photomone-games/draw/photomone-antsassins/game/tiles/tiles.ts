import Tile from "./tile"
import Point from "../shapes/point"
import GridMapper, { GridMapperLayout } from "js/pq_games/layout/gridMapper"
import Colorizer from "../tools/colorizer"
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple"
import CONFIG from "../config"

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
        this.setupGridMapper();

        // last minute update: realized sizes should usually be smaller on hexagons/triangles
        let generatorReductionFactor = 1.0;
        if(CONFIG.tileShape == "hexagon") {
            generatorReductionFactor = 0.66;
        } else if(CONFIG.tileShape == "rectangle") {
            generatorReductionFactor = 1.0;
        } else if(CONFIG.tileShape == "triangle") {
            generatorReductionFactor = 0.5;
        }
        CONFIG.generatorReductionFactor = generatorReductionFactor;
        CONFIG.photomone.maxRandomization.min *= generatorReductionFactor;
        CONFIG.photomone.maxRandomization.max *= generatorReductionFactor;
        
        // last minute update: on weird tileshapes, disable all "enhancements" as they don't work or make it messy
        if(CONFIG.tileShape != "rectangle")
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

        if(!CONFIG.includeTiles) { return; }
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

    setupGridMapper()
    {
        let size = CONFIG.tiles.size;
        if(CONFIG.tiles.varyDimsPerShape) { 
            size = CONFIG.tiles.sizePerShape[CONFIG.tileShape]; 
            if(CONFIG.reducedTileSize) { size = CONFIG.tiles.sizePerShapeReduced[CONFIG.tileShape]; }
        }

        let layoutShape = GridMapperLayout.RECTANGLE;
        if(CONFIG.tileShape == "hexagon") { layoutShape = GridMapperLayout.HEXAGON; }
        else if(CONFIG.tileShape == "triangle") { layoutShape = GridMapperLayout.TRIANGLE; }

        const gridConfig = { debug: CONFIG.tiles.debug, pdfBuilder: CONFIG.pdfBuilder, size: size, layoutShape: layoutShape };
        this.gridMapper = new GridMapper(gridConfig);

        const numPages = CONFIG.tiles.numPages;
        const tilesPerPage = size.x * size.y;
        this.tilesToGenerate = numPages * tilesPerPage;

        let sizeElem = this.gridMapper.getMaxElementSizeAsSquare().x;
        CONFIG.tiles.tileCenter = new Point(0.5 * sizeElem, 0.5 * sizeElem);
        CONFIG.tiles.tileSize = new Point(sizeElem, sizeElem);
        
        const smallerSize = sizeElem*(1.0 - 2*CONFIG.tiles.outlineWidth); // slightly offset size to push us off the edge
        CONFIG.tiles.tileSizeOffset = new Point(smallerSize, smallerSize);
    }

    generate()
    {
        const arr : Tile[] = []
        for(let i = 0; i < this.tilesToGenerate; i++)
        {
            const t = new Tile(CONFIG, i);
            arr.push(t);
        }
        this.tiles = arr;
    }

    async draw()
    {
        if(!this.tiles) { return; }

        const promises = [];
        for(const tile of this.tiles)
        {
            promises.push(tile.draw());
        }
        const canvases = await Promise.all(promises);
        this.gridMapper.addElements(canvases);
        await this.convertToImages();
    }

    getImages() { return this.images ?? []; }
    async convertToImages()
    {
        this.images = await convertCanvasToImageMultiple(this.gridMapper.getCanvases());
    }
}