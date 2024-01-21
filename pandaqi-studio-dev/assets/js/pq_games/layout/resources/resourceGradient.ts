import Point from "js/pq_games/tools/geometry/point";
import ColorStop from "../color/colorStop";
import LayoutOperation from "../layoutOperation";
import Resource from "./resource"
import { CanvasLike } from "./resourceImage";
import ResourceShape from "./resourceShape";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import ColorLike from "../color/colorLike";
import Line from "js/pq_games/tools/geometry/line";

enum GradientType
{
    LINEAR,
    RADIAL,
    CONIC
}

interface ResourceGradientParams
{
    type?:GradientType,
    stops?:ColorStop[],
    start: Point,
    startRadius?: number,
    end?: Point,
    endRadius?: number,
    startAngle?: number
}

export { ResourceGradient, GradientType }
export default class ResourceGradient extends Resource
{
    stops: ColorStop[];
    type: GradientType;
    start: Point;
    startRadius: number;
    end: Point;
    endRadius: number;
    startAngle: number;

    constructor(params:ResourceGradientParams)
    {
        super()

        this.type = params.type ?? GradientType.LINEAR;
        this.stops = params.stops ?? [];
        this.start = params.start ?? new Point();
        this.startRadius = params.startRadius ?? 0; // for radial only
        this.startAngle = params.startAngle ?? 0; // for conic only
        this.end = params.end ?? new Point(1,0);
        this.endRadius = params.endRadius ?? 1; // for radial only
        
    }
    
    clone(deep = false) : ResourceGradient
    {
        let stops = this.stops;
        if(deep)
        {
            stops = [];
            for(const stop of this.stops)
            {
                stops.push(stop.clone(deep));
            }
        }
        
        let start = deep ? this.start.clone() : this.start;
        let end = deep ? this.end.clone() : this.end;
        
        return new ResourceGradient({ 
            type: this.type, stops: stops,
            start: start, end: end,
            startRadius: this.startRadius, endRadius: this.endRadius,
            startAngle: this.startAngle
        });
    }

    /* The `to` functions */
    // A gradient itself has no specific visuals/size, so we create a rectangle at full canvas size to use as the "resource"
    // (the gradient simply becomes the fill)
    toCanvas(canv:CanvasLike = null, op:LayoutOperation = new LayoutOperation())
    {
        let dims = op.dims.clone();
        if(canv && dims.isZero()) { 
            if(canv instanceof CanvasRenderingContext2D) { canv = canv.canvas; }
            dims = new Point(canv.width, canv.height); 
        }

        const rect = new Rectangle().fromTopLeft(new Point(), dims);
        const shp = new ResourceShape({ shape: rect });

        op.resource = shp;
        op.fill = new ColorLike(this);

        return op.applyToCanvas(canv);
    }

    // @TODO: support "repeating-linear-gradient"??
    // Simply converts the gradient to a background image on a new HTML element
    async toHTML(op:LayoutOperation = new LayoutOperation())
    {
        const node = document.createElement("div");
        node.style.width = "100%";
        node.style.height = "100%";

        node.style.backgroundImage = this.toCSS();
        return await op.applyToHTML(node);
    }

    toCSS()
    {
        const colorStopsArray = [];
        let asAngles = this.type == GradientType.CONIC;
        for(const stop of this.stops)
        {
            colorStopsArray.push(stop.toCSS(asAngles));
        }
        const colorStopsString = colorStopsArray.join(",");

        const pos = this.start.x + "px " + this.start.y + "px";
        let bg;
        if(this.type == GradientType.LINEAR) {
            const angle = new Line(this.start, this.end).angle();
            bg = "linear-gradient(" + angle + "rad," + colorStopsString + ")";
        } else if(this.type == GradientType.RADIAL) {
            bg = "radial-gradient(ellipse at " + pos + "," + colorStopsString + ")";
        } else if(this.type == GradientType.CONIC) {
            bg = "conic-gradient(" + this.startAngle + "rad at " + pos + "," + colorStopsString + ")";   
        }

        return bg;
    }

    toCanvasStyle(ctx:CanvasRenderingContext2D)
    {
        let gradient;
        if(this.type == GradientType.LINEAR) {
           gradient = ctx.createLinearGradient(this.start.x, this.start.y, this.end.x, this.end.y);
        } else if(this.type == GradientType.RADIAL) {
            gradient = ctx.createRadialGradient(this.start.x, this.start.y, this.startRadius, this.end.x, this.end.y, this.endRadius);
        } else if(this.type == GradientType.CONIC) {
            gradient = ctx.createConicGradient(this.start.x, this.start.y, this.startAngle);
        }

        for(const stop of this.stops)
        {
            gradient.addColorStop(stop.pos, stop.color.toString());
        }

        return gradient;
    }

    /* @TODO
    async toSVG(op:LayoutOperation = new LayoutOperation())
    {
        const elem = document.createElementNS(null, "image");
        elem.setAttribute("href", this.getImage().src);
        return await op.applyToSVG(elem);
    }
    */

    addStop(s:ColorStop)
    {
        this.stops.push(s);
    }

    removeStop(s:ColorStop)
    {
        const idx = this.stops.indexOf(s);
        if(idx < 0) { return; }
        this.stops.splice(idx, 1);
    }

    isTransparent() : boolean
    {
        for(const stop of this.stops)
        {
            if(!stop.color.isTransparent()) { return false; }
        }
        return true;
    }
    
}