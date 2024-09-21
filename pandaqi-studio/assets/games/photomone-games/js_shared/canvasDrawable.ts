import CanvasUI from "./canvasUI";
import CanvasTurn from "./canvasTurn";
import Map from "./map";
import MapVisualizer from "./mapVisualizer";
import Line from "./line";
import LayoutOperation from "js/pq_games/layout/layoutOperation"
import PointNonPhotomone from "js/pq_games/tools/geometry/point";
import Point from "./point";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";

export default class CanvasDrawable 
{
    node: HTMLCanvasElement;
    params: Record<string,any>;
    map: Map;
    locked: boolean;
    drawing: boolean;
    drawingStartPoint: Point;
    drawingEndPoint: Point;
    ui: CanvasUI;
    globalContainer: HTMLDivElement;
    canvas: HTMLCanvasElement;
    curTurn: CanvasTurn;
    mapVisualizer: MapVisualizer;
    drawingEndPos: Point;
    
    constructor(node: HTMLCanvasElement, config:Record<string,any> = {})
    {
        this.node = node;
        this.params = Object.assign({}, config);

        // override existing params with HTML dataset, if specified
        for(const [key,value] of Object.entries(this.node.dataset))
        {
            let properKey = key;
            for(const existingKey of Object.keys(this.params))
            {
                if(existingKey.toLowerCase() != key.toLowerCase()) { continue; }
                properKey = existingKey;
            }

            let finalValue:string|number|boolean = value;
            // @ts-ignore
            if(!isNaN(parseFloat(value))) { finalValue = parseFloat(value); }
            if(value == "true" || value == "false") { finalValue = (value == "true"); }
            this.params[properKey] = finalValue;
        }

        if(this.params.noexpansions) 
        {
            for(const [key,data] of Object.entries(this.params.pointTypes))
            {
                // @ts-ignore
                if(!data.expansion) { continue; }
                delete this.params.pointTypes[key];
            }
        }

        if(this.params.pointboundsmin) { this.params.pointBounds.min = this.params.pointboundsmin; }
        if(this.params.pointboundsmax) { this.params.pointBounds.max = this.params.pointboundsmax; }

        this.createCanvas();

        this.map = null;
        this.locked = false;

        this.drawing = false;
        this.drawingStartPoint = null;
        this.drawingEndPoint = null;

        this.listenForEvents();
        this.createRandomMap();

        window.addEventListener('resize', this.resizeCanvas.bind(this));
        this.resizeCanvas();

        if(this.params.addUI)
        {
            this.ui = new CanvasUI(this, node);
        }
    }

    createCanvas()
    {
        this.globalContainer = document.createElement("div");
        this.node.appendChild(this.globalContainer);
        this.globalContainer.classList.add("canvas-drawable-container");

        this.canvas = document.createElement("canvas");
        this.globalContainer.appendChild(this.canvas);
    }

    getHTMLContainer() { return this.globalContainer; }
    getConfig() { return this.params; }
    getContext()
    {
        return this.canvas.getContext("2d");
    }

    lock() { this.locked = true; }
    unlock() { this.locked = false; }
    startNewDrawing(keepObject = false) {
        if(keepObject && this.curTurn) { this.curTurn.reset(); return; } 
        this.curTurn = new CanvasTurn(this); 
    }
    getTurn() { return this.curTurn; }

    createRandomMap()
    {
        this.map = new Map(this.params);
        this.map.generate();

        this.mapVisualizer = new MapVisualizer(this.map);
    }

    resizeCanvas()
    {
        const maxWidth = this.node.offsetWidth
        const maxHeight = this.node.offsetHeight;

        if(this.params.resizePolicy == "width")
        {
            const resolution = this.params.height / this.params.width;
            this.params.width = maxWidth;
            this.params.height = resolution * maxWidth;
        }

        if(this.params.resizePolicy == "height")
        {
            const resolution = this.params.width / this.params.height;
            this.params.width = resolution * maxWidth;
            this.params.height = maxHeight;
        }
        
        if(this.params.resizePolicy == "full")
        {
            this.params.width = window.innerWidth;
            this.params.height = window.innerHeight;
        }

        this.canvas.style.width = this.params.width + "px";
        this.canvas.style.height = this.params.height + "px";

        this.params.width *= this.params.resolution;
        this.params.height *= this.params.resolution;

        this.canvas.width = this.params.width;
        this.canvas.height = this.params.height;

        if(this.map) { this.map.resizeTo(this.params.width, this.params.height); }
        this.visualize();
    }

    erase()
    {
        this.map.clearLines();
        this.startNewDrawing(true);
        this.visualize();
    }

    onShow() {
        this.unlock();
        this.startNewDrawing();
    }

    onHide() 
    {
        if(this.getTurn()) { this.getTurn().getPowerups().handleWolverine() };
        this.lock();
    }

    /* Actual drawing */
    listenForEvents()
    {
        const canv = this.canvas;
        canv.addEventListener('mousedown', this.onDrawStart.bind(this), true);
        canv.addEventListener('touchstart', this.onDrawStart.bind(this), true);
        canv.addEventListener('mousemove', this.onDrawProgress.bind(this), true);
        canv.addEventListener('touchmove', this.onDrawProgress.bind(this), true);
        canv.addEventListener('mouseup', this.onDrawEnd.bind(this), true);
        canv.addEventListener('touchend', this.onDrawEnd.bind(this), true);
        canv.addEventListener('mouseleave', this.onMouseLeave.bind(this), true);
        canv.addEventListener('touchcancel', this.onMouseLeave.bind(this), true);
    }

    preventDefaults(ev:any)
    {
        if(!ev) { return false; }
        ev.stopPropagation(); 
        ev.preventDefault();
        return false;
    }

    getPosFromEvent(ev:any)
    {
        const p = new Point();
        const offset = this.canvas.getBoundingClientRect();
        const res = this.params.resolution;
        p.move(new Point({ x: -offset.left, y: -offset.top }));

        if(ev.type == 'touchstart' || ev.type == 'touchmove' || ev.type == 'touchend' || ev.type == 'touchcancel')
        {
            var evt = (typeof ev.originalEvent === 'undefined') ? ev : ev.originalEvent;
            var touch = evt.touches[0] || evt.changedTouches[0];
            p.move(new Point({ x: touch.clientX, y: touch.clientY }));
        } else if (ev.type == 'mousedown' || ev.type == 'mouseup' || ev.type == 'mousemove' || ev.type == 'mouseover'|| ev.type == 'mouseout' || ev.type == 'mouseenter' || ev.type=='mouseleave' ) {
            p.move(new Point({ x: ev.clientX, y: ev.clientY }));
        } 
        p.scale(res);
        return p;
    }

    onDrawStart(ev: any)
    {
        if(this.locked) { return; }
        if(this.ui && this.ui.hitMaxLines()) { return this.emitFeedback("Out of lines!"); }

        const po = this.getTurn().getPowerups();
        if(po.get("stuck")) { return this.emitFeedback("You're stuck!"); }

        const startPos = this.getPosFromEvent(ev);
        if(po.get("add"))
        {
            const point = new Point(startPos);
            this.map.addPoint(point);
            po.set("add", false);
            this.visualize();
            return;
        }

        const startPoint = this.map.snapToClosestPoint(startPos);

        if(po.checkRepel(startPoint)) { return this.emitFeedback("Repel active: use points with no lines."); }
        if(po.checkFixed(startPoint)) { return this.emitFeedback("Glue active: drawing can't jump around."); }
        if(!po.distanceCheckPassed(startPoint)) { return this.emitFeedback("Distance active: this point is too far."); }

        this.drawingStartPoint = startPoint;
        this.drawing = true;
        this.visualize();
        return this.preventDefaults(ev);
    }

    onDrawProgress(ev: any)
    {
        if(this.locked) { return; }
        if(!this.drawing) { return; }

        const po = this.getTurn().getPowerups();

        this.drawingEndPos = this.getPosFromEvent(ev);
        const endPoint = this.map.snapToClosestPoint(this.drawingEndPos, po.get("repel"));
        const l = new Line(this.drawingStartPoint, endPoint);
        const isValidPoint = po.distanceCheckPassed(endPoint) && po.intersectCheckPassed(l);
        const isValidLine = this.map.lineIsValid(l, this.params);
        this.drawingEndPoint = null;
        if(isValidPoint && isValidLine) { this.drawingEndPoint = endPoint; }

        this.visualize();
        return this.preventDefaults(ev);
    }

    onDrawEnd(ev:any)
    {
        if(this.locked) { return; }
        if(!this.drawing) { return; }
        this.drawing = false;
        
        let isValidLine = ev;
        if(!isValidLine) { this.clearActiveLine(); return; }

        const po = this.getTurn().getPowerups();
        const endPos = this.getPosFromEvent(ev);
        const endPoint = this.map.snapToClosestPoint(endPos, po.get("repel"));
        if(!endPoint) { this.clearActiveLine(); return; }

        const l = new Line(this.drawingStartPoint, endPoint);

        const clickedOnOneLocation = l.isPoint();
        const locationIsSpecial = endPoint.getType();
        if(clickedOnOneLocation && locationIsSpecial) 
        { 
            const hintSignal = new CustomEvent("photomone-cell-hint", { detail: { type: endPoint.getType() } });
            window.dispatchEvent(hintSignal);
        }

        const isValidPoint = po.distanceCheckPassed(endPoint) && po.intersectCheckPassed(l);
        if(!isValidPoint) { this.clearActiveLine(); return; }

        isValidLine = this.map.lineIsValid(l, this.params);
        if(!isValidLine) { this.clearActiveLine(); return; }

        this.drawingEndPoint = endPoint;
        this.map.addLine(l);
        this.curTurn.addLine(l);        
        if(this.ui) { this.ui.registerLine(l); }
        this.clearActiveLine();
        this.visualize();

        const customEvent = new CustomEvent("photomone-line-drawn", { detail: { line: l }});
        window.dispatchEvent(customEvent);

        return this.preventDefaults(ev);
    }

    onMouseLeave()
    {
        this.onDrawEnd(null);
    }

    emitFeedback(text: string)
    {
        const customEvent = new CustomEvent("photomone-feedback", { detail: { text: text }});
        window.dispatchEvent(customEvent);
        return false;
    }

    clearActiveLine()
    {
        this.drawingStartPoint = null;
        this.drawingEndPos = null;
        this.drawingEndPoint = null;
        this.visualize();
    }

    applyRandomChanges()
    {
        this.map.applyRandomChanges();
        this.visualize();
    }

    /* Visualizing */
    visualize()
    {
        this.clearCanvas();
        this.visualizeMap();
        this.visualizeActiveLine();
        this.visualizeTurn();
    }

    clearCanvas()
    {
        const ctx = this.getContext();
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if(!this.params.transparentBackground)
        {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    visualizeMap()
    {
        this.params.activePoints = [this.drawingStartPoint, this.drawingEndPoint];
        const vis = this.mapVisualizer.getVisualization(this.params);

        const ctx = this.getContext();
        for(const rect of vis.rects)
        {
            ctx.fillStyle = rect.color.toString();
            ctx.fillRect(rect.p.x, rect.p.y, rect.size.x, rect.size.y);
        }

        for(const line of vis.lines)
        {
            ctx.strokeStyle = line.color.toString();
            ctx.lineWidth = line.width;

            ctx.beginPath();
            ctx.moveTo(line.p1.x, line.p1.y);
            ctx.lineTo(line.p2.x, line.p2.y);
            ctx.closePath();
            ctx.stroke();
        }

        for(const circ of vis.circles)
        {
            ctx.fillStyle = circ.color.toString();

            ctx.beginPath();
            ctx.arc(circ.p.x, circ.p.y, circ.radius, 0, 2*Math.PI, false);
            ctx.closePath();
            ctx.fill();
        }

        for(const text of vis.text)
        {
            // a circle behind the text is cheaper and clearer than stroke in this case
            if(text.stroke)
            {
                ctx.fillStyle = text.stroke;
                ctx.translate(text.p.x, text.p.y);
                ctx.beginPath();
                ctx.arc(0, 0, text.strokeWidth*1.33, 0, 2*Math.PI, false);
                ctx.closePath();
                ctx.fill();
            }

            const textConfig = new TextConfig({
                font: text.fontFamily,
                size: text.fontSize,
            }).alignCenter();

            const opText = new LayoutOperation({
                translate: new PointNonPhotomone(text.p),
                rotation: text.rotation ?? 0,
                dims: new PointNonPhotomone(2*textConfig.size),
                fill: text.color,
                pivot: PointNonPhotomone.CENTER
            })
            const resText = new ResourceText({ text: text.text, textConfig: textConfig });
            resText.toCanvas(ctx, opText);
        }

        for(const sprite of vis.sprites)
        {
            const res = this.params.RESOURCE_LOADER.getResource(sprite.textureKey);
            const canvOp = new LayoutOperation({ 
                frame: sprite.frame,
                dims: new PointNonPhotomone(sprite.size),
                translate: new PointNonPhotomone(sprite.p),
                pivot: PointNonPhotomone.CENTER
            })
            res.toCanvas(ctx, canvOp);
        }
    }

    visualizeActiveLine()
    {
        const p1 = this.drawingStartPoint;
        const p2 = this.drawingEndPos;
        if(!p1 || !p2) { return; }

        const ctx = this.getContext();
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineWidth = this.params.activeLineWidth;
        ctx.strokeStyle = this.params.activeLineColor;
        ctx.stroke();
        ctx.restore();
    }

    visualizeTurn()
    {
        if(!this.getTurn()) { return; }

        const fontSize = this.params.fontSize*0.95;
        const ctx = this.getContext();
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = fontSize + "px geldotica";

        let counter = 1;
        for(const l of this.getTurn().getLines())
        {
            const pos = l.getCenter()
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(l.getAngle());
            ctx.fillText(counter.toString(), 0, -0.85*fontSize);
            ctx.restore();

            counter++;
        }

        ctx.restore();
    }
}
