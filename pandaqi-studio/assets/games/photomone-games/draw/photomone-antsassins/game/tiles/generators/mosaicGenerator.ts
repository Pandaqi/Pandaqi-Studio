import Mosaic from "../../mosaic"

export default class MosaicGenerator
{
    visualType: string;
    mosaic: Mosaic;
    
    constructor()
    {
        this.visualType = "mosaic"
    }

    generate(config)
    {
        this.mosaic = new Mosaic(config.gridPoints);
        this.mosaic.setSize(config.size);
        if(config.mosaic.useDelaunay) { this.mosaic.setupDelaunayList(config, config.gridPoints); }
    }
}