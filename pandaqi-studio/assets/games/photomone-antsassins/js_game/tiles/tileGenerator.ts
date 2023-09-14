import MosaicGenerator from "./generators/mosaicGenerator"
import LineGenerator from "./generators/lineGenerator"
import PhotomoneGenerator from "./generators/photomoneGenerator"
import ShapesGenerator from "./generators/shapesGenerator"
import CloudsGenerator from "./generators/cloudsGenerator"
import SimplifiedGenerator from "./generators/simplifiedGenerator"

export default class TileGenerator 
{
    generator: MosaicGenerator|LineGenerator|PhotomoneGenerator|ShapesGenerator|CloudsGenerator|SimplifiedGenerator

    constructor(config)
    {
        const type = config.tileType || "mosaic";
        let generator = null;
        if(type == "mosaic") {
            generator = new MosaicGenerator();
        } else if(type == "lines") {
            generator = new LineGenerator();
        } else if(type == "photomone") {
            generator = new PhotomoneGenerator();
        } else if(type == "shapes") {
            generator = new ShapesGenerator();
        } else if(type == "clouds") {
            generator = new CloudsGenerator();
        } else if(type == "simple") {
            generator = new SimplifiedGenerator();
        }

        this.generator = generator;
        generator.generate(config);
    }
}