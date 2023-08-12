import MosaicVisualizer from "./visualizers/mosaicVisualizer"
import LineVisualizer from "./visualizers/lineVisualizer"
import PixelGridVisualizer from "./visualizers/pixelGridVisualizer"
import PhotomoneVisualizer from "./visualizers/photomoneVisualizer"
import ShapesVisualizer from "./visualizers/shapesVisualizer"
import LinesAndPixelsVisualizer from "./visualizers/linesAndPixelsVisualizer"

export default class TileVisualizer 
{
    constructor(config)
    {
        const type = config.generator.visualType;

        let visualizer = null;
        if(type == "mosaic") {
            visualizer = new MosaicVisualizer();
        } else if(type == "lines") {
            visualizer = new LineVisualizer();
        } else if(type == "pixelgrid") {
            visualizer = new PixelGridVisualizer();
        } else if(type == "photomone") {
            visualizer = new PhotomoneVisualizer();
        } else if(type == "shapes") {
            visualizer = new ShapesVisualizer();
        } else if(type == "linesandpixels") {
            visualizer = new LinesAndPixelsVisualizer();
        }

        this.visualizer = visualizer;
    }

    draw(config)
    {
        this.visualizer.draw(config);
    }
}