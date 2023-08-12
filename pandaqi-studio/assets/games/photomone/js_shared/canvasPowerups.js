export default class CanvasPowerups {
    constructor(canvasDrawable)
    {
        this.canvasDrawable = canvasDrawable;
        this.pencilLengthFactor = 0.34;
        this.game = null;
        this.powerupDefaults = {
            linesOffset: 0,
            pointsOffset: 0,
            distance: false,
            stuck: false,
            fixed: false,
            repel: false,
            add: false
        }
        this.powerups = {};
        this.reset();
    }

    reset() { this.powerups = Object.assign({}, this.powerupDefaults); }
    get(key)
    {
        if(!(key in this.powerups)) { return 0; }
        return this.powerups[key];
    }

    set(key, value)
    {
        this.powerups[key] = value;
    }

    registerLine(l)
    {
        const p = l.getEnd(); // the _last_ point of a line is always activated
        const type = p.getType();

        // numeric types
        if(type == "numLines") { 
            this.powerups.linesOffset += p.getNum(); 
            const ev = new CustomEvent("photomone-numlines", { detail: { num: p.getNum() } });
            window.dispatchEvent(ev);
        } else if(type == "points") { 
            this.powerups.pointsOffset += p.getNum(); 
            const ev = new CustomEvent("photomone-points", { detail: { num: p.getNum() } });
            window.dispatchEvent(ev);
        } else if(type == "timer") {
            this.powerups.timerOffset += p.getNum();
            const ev = new CustomEvent("photomone-timer", { detail: { num: p.getNum() } })
            window.dispatchEvent(ev);
        } else if(type == "foodloose") {
            this.powerups.targetFoodOffset += p.getNum();
            const ev = new CustomEvent("photomone-objective", { detail: { num: p.getNum() } });
            window.dispatchEvent(ev);
        }
        
        // special types
        if(type == "eraser") { this.canvasDrawable.erase(); }
        else if(type == "magiciant") { this.canvasDrawable.applyRandomChanges(); }
        else if(type == "wordeater") { 
            const ev = new CustomEvent("photomone-wordeater");
            window.dispatchEvent(ev);
        }

        // boolean types (just flip a switch to true)
        const isBooleanType = (type == "distance" || type == "stuck" || type == "fixed" || type == "repel" || type == "add" || type == "poisonTrail" || type == "wolverine");
        if(isBooleanType) { this.powerups[type] = true; }
    }

    distanceCheckPassed(point)
    {
        if(!this.get("distance")) { return true; }

        const curLines = this.canvasDrawable.getTurn().getLines();
        const dist = this.canvasDrawable.map.getBiggestDistanceToExisting(point, curLines);
        if(dist <= this.getPencilLength()) { return true; }
        return false;
    }

    intersectCheckPassed(line)
    {
        if(!this.get("poisonTrail")) { return true; }
        if(line.isPoint()) { return true; }
        return !this.lineIntersectsExisting(line);
    }

    getPencilLength()
    {
        const minSize = Math.min(this.canvasDrawable.canvas.width, this.canvasDrawable.canvas.height);
        return this.pencilLengthFactor * minSize;
    }

    lineIntersectsExisting(l)
    {
        const allLines = this.canvasDrawable.map.getLinesAsList();
        for(const otherLine of allLines)
        {
            if(l.intersectsLine(otherLine, 0.1)) { return true; }
        }
        return false;
    }

    checkRepel(p)
    {
        if(!this.get("repel")) { return false; }
        return p.isPartOfLine();
    }

    checkFixed(p)
    {
        if(!this.get("fixed")) { return false; }
        if(!p.isPartOfLine()) { return true; }

        const lines = this.canvasDrawable.getTurn().getLines();
        for(const line of lines)
        {
            if(line.start == p || line.end == p) { return false; }
        }
        return true;
    }

    handleWolverine()
    {
        if(!this.get("wolverine")) { return; }
        
        const lines = this.canvasDrawable.getTurn().getLines();
        for(const line of lines)
        {
            this.canvasDrawable.map.removePoint(line.getStart());
            this.canvasDrawable.map.removePoint(line.getEnd());
            this.canvasDrawable.map.removeLine(line);
        }
    }

}
