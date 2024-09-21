import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage"
import splitImage from "js/pq_games/layout/canvas/splitImage"
import ResourceLoader from "../../layout/resources/resourceLoader"
import { SettingsConfig } from "../../website/settings"
import Renderer from "../../layout/renderers/renderer"
import RendererPandaqi from "../../layout/renderers/rendererPandaqi"
import ResourceGroup from "../../layout/resources/resourceGroup"
import Point from "../geometry/point"

interface VisualizerParams
{
	config:Record<string,any>,
	renderer?:Renderer,
	resLoader?:ResourceLoader
}

export default class BoardVisualizer
{
	config: Record<string,any>;
	resLoader: ResourceLoader
	renderer:Renderer
	collection = false

	size:Point
	sizeUnit:number
	
	constructor(params:VisualizerParams)
	{
		this.config = params.config ?? {};
		this.renderer = params.renderer ?? new RendererPandaqi();
		this.resLoader = params.resLoader ?? new ResourceLoader();
		
		// just handy shortcuts
		this.size = this.config.size;
		this.sizeUnit = Math.min(this.size.x, this.size.y);
		
		// @TODO: now stuff should get the visualizer directly
		//this.gameConfig.visualizer = this;

		// @TODO: startCollection + endCollection are gone, just as secretBoard
		// Classes are simply responsible for returning the entire list of resource groups by themselves => though I might create a helper class like `BoardCollection`?
	}

	getResource(key:string)
	{
		return this.resLoader.getResource(key);
	}

	prepareDraw() 
	{
		this.renderer.prepareDraw(this.config);
		this.renderer.startDraw(this.config);
	}

	async finishDraw(group:ResourceGroup) : Promise<HTMLImageElement[]>
	{
		// ask the renderer to get us our final canvas
		const canv = await this.renderer.finishDraw({ size: this.size, group: group });
		const img = await convertCanvasToImage(canv);

		// split into multiple pages if wanted
		const splitConfig = { splitDims: this.config.splitDims }
		const images = await splitImage(img, splitConfig);

		return images;
	}
}