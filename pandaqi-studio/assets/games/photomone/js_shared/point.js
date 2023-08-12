import Helpers from "./helpers";
import Random from "js/pq_games/tools/random/main";

export default class Point {
    constructor(p = { x: 0, y: 0 })
    {
        this.x = p.x;
        this.y = p.y;
        this.change = null;
        this.type = null;
        this.connections = [];
        this.color = null;
        this.num = null;
        this.rectangle = false;
    }

    clone()
    {
        return new Point(this);
    }

    copy(p)
    {
        this.x = p.x;
        this.y = p.y;
        return this;
    }

    move(p)
    {
        this.moveX(p.x);
        this.moveY(p.y);
        return this;
    }

    moveX(dx) { this.x += dx; return this; }
    moveY(dy) { this.y += dy; return this; }

    clamp(pMin, pMax)
    {
        this.x = Math.min(Math.max(this.x, pMin.x), pMax.x);
        this.y = Math.min(Math.max(this.y, pMin.y), pMax.y);
    }

    length()
    {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    angle() 
    {
        return Math.atan2(this.y, this.x);
    }

    normalize()
    {
        const len = this.length();
        if(len == 0) { return; }
        return this.scale(1.0 / len);
    }

    negate() { return this.scale(-1); }
    scale(s)
    {
        this.scaleX(s);
        this.scaleY(s);
        return this;
    }

    scaleX(s) { this.x *= s; return this; }
    scaleY(s) { this.y *= s; return this; }

    distSquaredTo(p)
    {
        return Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2);
    }

    distTo(p)
    {
        return Math.sqrt(this.distSquaredTo(p));
    }

    vecTo(p)
    {
        return new Point({ x: p.x - this.x, y: p.y - this.y });
    }

    setChange(p) { this.change = p; }
    getChange() { return this.change; }
    setType(t) { this.type = t; }
    getType() { return this.type; }

    isPartOfLine() { return this.connections.length > 0; }
    getConnections() { return this.connections.slice(); }
    addConnection(p)
    {
        this.connections.push(p);
    }

    removeConnection(p)
    {
        const idx = this.connections.indexOf(p);
        if(idx < 0) { return; }
        this.connections.splice(idx, 1);
    }

    isConnectedTo(p)
    {
        return this.connections.includes(p);
    }

    setColor(c) { this.color = c; }
    getColor() { return this.color; }

    setNumFromBounds(numBounds, mult)
    {
        if(!numBounds) { return; }
        let num = Random.rangeInteger(numBounds.min, numBounds.max);
        num = Helpers.roundToMultiplesOf(num, mult);
        this.setNum(num);
    }
    setNum(n) { this.num = n; }
    getNum() { return this.num; }
    getNumString() { 
        if(!this.num) { return null; }
        let numString = this.num + "";
        if(this.num > 0) { numString = "+" + this.num; }
        return numString;
    }

    isRectangle() { return this.rectangle; }
    setRectangle(val) { this.rectangle = val; }
}