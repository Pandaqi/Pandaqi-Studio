import Tile from "./tile"
import Point from "../shapes/point"
import GridMapper from "js/pq_games/canvas/gridMapper"
import Canvas from "js/pq_games/canvas/main"
import Colorizer from "../tools/colorizer"

export default class Tiles {
    constructor(config)
    {
        this.individualCanvases = [];
        this.setupGridMapper(config);

        // last minute update: realized sizes should usually be smaller on hexagons/triangles
        let generatorReductionFactor = 1.0;
        if(config.tileShape == "hexagon") {
            generatorReductionFactor = 0.66;
        } else if(config.tileShape == "rectangle") {
            generatorReductionFactor = 1.0;
        } else if(config.tileShape == "triangle") {
            generatorReductionFactor = 0.5;
        }
        config.generatorReductionFactor = generatorReductionFactor;
        config.photomone.maxRandomization.min *= generatorReductionFactor;
        config.photomone.maxRandomization.max *= generatorReductionFactor;
        
        // last minute update: on weird tileshapes, disable all "enhancements" as they don't work or make it messy
        if(config.tileShape != "rectangle")
        {
            config.randomWalk.enhancements_v2.dotsBetween = false;
            config.randomWalk.enhancements_v2.shapesAttached = false;
            config.randomWalk.enhancements_v2.hairs = false;
            config.randomWalk.enhancements_v2.halfLines = false;
            config.randomWalk.enhancements_v2.edgeLines = false;
        }

        const numLinesFactor = (config.tiles.gridResolution / 4);
        const size = config.tiles.tileSize;
        const squareSize = Math.min(size.x, size.y);
        const visualScaleFactor = (squareSize / config.tiles.gridResolution);
        config.randomWalk.length.min *= numLinesFactor;
        config.randomWalk.length.max *= numLinesFactor;
        config.randomWalk.lineWidth *= visualScaleFactor;
        config.tiles.gridPointSize *= visualScaleFactor * config.generatorReductionFactor;
        config.tiles.outlineWidth *= squareSize;

        for(const key of Object.keys(config.randomWalk.lineWidths))
        {
            config.randomWalk.lineWidths[key] *= squareSize;
        }

        this.setupColors(config);

        if(!config.includeTiles) { return; }
        this.generate(config);
    }

    setupColors(config)
    {
        const colorizer = new Colorizer();
        config.mosaic.colors = colorizer.generateEquidistant(config.mosaic.numColors);
        config.photomone.colors = colorizer.generateEquidistant(config.photomone.numColors);
        config.shapes.colors = colorizer.generateEquidistant(config.shapes.numColors);
        config.simple.colors = colorizer.generateEquidistant(config.simple.numColors);
    }

    setupGridMapper(config)
    {
        let dims = config.tiles.dims;
        if(config.tiles.varyDimsPerShape) { 
            dims = config.tiles.dimsPerShape[config.tileShape]; 
            if(config.reducedTileSize) { dims = config.tiles.dimsPerShapeReduced[config.tileShape]; }
        }

        const gridConfig = { debug: config.tiles.debug, pdfBuilder: config.pdfBuilder, dims: dims, layoutShape: config.tileShape };
        this.gridMapper = new GridMapper(gridConfig);

        const numPages = config.tiles.numPages;
        const tilesPerPage = dims.x * dims.y;
        this.tilesToGenerate = numPages * tilesPerPage;

        let size = this.gridMapper.getMaxElementSizeAsSquare().width;
        config.tiles.tileCenter = new Point(0.5 * size, 0.5 * size);
        config.tiles.tileSize = new Point(size, size);
        
        const smallerSize = size*(1.0 - 2*config.tiles.outlineWidth); // slightly offset size to push us off the edge
        config.tiles.tileSizeOffset = new Point(smallerSize, smallerSize);
    }

    generate(config)
    {
        for(let i = 0; i < this.tilesToGenerate; i++)
        {
            const t = new Tile(config, i);
            this.individualCanvases.push(t.getCanvas());
            this.gridMapper.addElement(t.getCanvas());
        }
    }

    getIndividualImages() { return this.individualImages; }
    getImages() { return this.images; }

    // @TODO: turn off the individual image one, as it will eat resources
    async convertToImages()
    {
        this.individualImages = await Canvas.convertCanvasesToImage(this.individualCanvases);
        this.images = await Canvas.convertCanvasesToImage(this.gridMapper.getCanvases());
    }
}