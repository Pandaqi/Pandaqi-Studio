
import { Vector2, rangeInteger } from "lib/pq-games";
import { roundToMultiplesOf } from "./helpers";

export default class Point 
{
    x: number;
    y: number;
    change: null;
    type: string;
    connections: Vector2[];
    color: null;
    num: number;
    rectangle: boolean;

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
        return new Vector2(this);
    }

    copy(p:Vector2)
    {
        this.x = p.x;
        this.y = p.y;
        return this;
    }

    round()
    {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }

    add(p:Vector2) { return this.move(p); } // @NOTE: some of these are just aliases because I was stupid enough to mix two different Point classes (the Photomone one---this one---and the general one)
    move(p:Vector2)
    {
        this.moveX(p.x);
        this.moveY(p.y);
        return this;
    }

    moveX(dx: number) { this.x += dx; return this; }
    moveY(dy: number) { this.y += dy; return this; }

    clamp(pMin:Vector2, pMax:Vector2)
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
    scale(s: number)
    {
        this.scaleX(s);
        this.scaleY(s);
        return this;
    }

    scaleX(s: number) { this.x *= s; return this; }
    scaleY(s: number) { this.y *= s; return this; }
    scaleFactor(f: number) { return this.scale(f); }

    distSquaredTo(p: Vector2)
    {
        return Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2);
    }

    distTo(p: Vector2)
    {
        return Math.sqrt(this.distSquaredTo(p));
    }

    vecTo(p: Vector2)
    {
        return new Vector2({ x: p.x - this.x, y: p.y - this.y });
    }

    setChange(p: null) { this.change = p; }
    getChange() { return this.change; }
    setType(t: string) { this.type = t; }
    getType() { return this.type; }

    isPartOfLine() { return this.connections.length > 0; }
    getConnections() { return this.connections.slice(); }
    addConnection(p: Vector2)
    {
        this.connections.push(p);
    }

    removeConnection(p: Vector2)
    {
        const idx = this.connections.indexOf(p);
        if(idx < 0) { return; }
        this.connections.splice(idx, 1);
    }

    isConnectedTo(p: Vector2)
    {
        return this.connections.includes(p);
    }

    setColor(c: null) { this.color = c; }
    getColor() { return this.color; }

    setNumFromBounds(numBounds: { min: number | { min: number; max: number; }; max: number; }, mult: number)
    {
        if(!numBounds) { return; }
        let num = rangeInteger(numBounds.min, numBounds.max);
        num = roundToMultiplesOf(num, mult);
        this.setNum(num);
    }
    setNum(n: number) { this.num = n; }
    getNum() { return this.num; }
    getNumString() { 
        if(!this.num) { return null; }
        let numString = this.num + "";
        if(this.num > 0) { numString = "+" + this.num; }
        return numString;
    }

    isRectangle() { return this.rectangle; }
    setRectangle(val: boolean) { this.rectangle = val; }
}