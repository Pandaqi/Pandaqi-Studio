import Random from "js/pq_games/tools/random/main"

export default class Point 
{
    x: number;
    y: number;
    edge: boolean;
    nbs: any[];
    connections: any[];
    lineIndex: number;
    gridPos: Point;

    constructor(x = 0, y = 0)
    {
        this.x = x;
        this.y = y;
        this.edge = false;
        this.nbs = [];
        this.connections = [];
        this.lineIndex = -1;
        this.gridPos = undefined;
    }

    clone() { 
        const p = new Point(this.x, this.y); 
        p.edge = this.edge;
        p.nbs = this.nbs;
        p.connections = this.connections;
        p.lineIndex = this.lineIndex;
        return p;
    }

    isOnEdge() { return this.edge; }
    setEdge(val) { this.edge = val; return this; }

    setNeighbours(arr) { this.nbs = arr; return this; }
    addNeighbour(p) { this.nbs.push(p); return this; }
    getNeighbours() { return this.nbs.slice(); }
    getRandomNeighbourGrid(params:Record<string,any> = {})
    {
        const validNbs = [];
        const targetDist = params.dist || 1;
        const anchor = params.anchor || this;
        const epsilon = 0.05;
        for(const nb of this.nbs)
        {
            const dist = Math.abs(anchor.gridPos.x - nb.gridPos.x) + Math.abs(anchor.gridPos.y - nb.gridPos.y);
            if(Math.abs(dist - targetDist) > epsilon) { continue; }
            validNbs.push(nb);
        }
        return Random.fromArray(validNbs);
    }


    getRandomNeighbour(params:Record<string,any> = {}) { 
        const validNbs = [];
        const exclude = params.exclude || [];
        const angleRange = params.angleRange || -1;
        const epsilonAngle = 0.05;

        for(const nb of this.nbs)
        {
            const idx = exclude.indexOf(nb);
            if(idx >= 0) { continue; }

            if(angleRange != -1)
            {
                const angleBetween = this.angleTo(nb);
                if(angleBetween < (angleRange.min-epsilonAngle) || angleBetween > (angleRange.max+epsilonAngle)) { continue; }
            }

            if(params.orthogonal)
            {
                if(Math.abs(nb.x - this.x) > 0.05 && Math.abs(nb.y - this.y) > 0.05) { continue; }
            }

            validNbs.push(nb);
        }

        if(validNbs.length <= 0) { return null; }
        return validNbs[Math.floor(Math.random() * validNbs.length)]; 
    }

    angleTo(p) 
    { 
        const normalizer = this.length() * p.length();
        return Math.acos(this.dot(p)/normalizer);
    }
    dot(p) { return this.x * p.x + this.y * p.y; }
    length() { return this.distTo(new Point(0,0)); }
    distTo(p) {  return Math.sqrt(this.distSquaredTo(p)); }
    distSquaredTo(p) { return Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2);}
    vecTo(p) { return new Point(p.x - this.x, p.y - this.y); }
    move(p) { this.x += p.x; this.y += p.y; return this; }
    negate() { this.scaleFactor(-1.0); return this; }
    normalize() { this.scaleFactor(1.0 / this.length()); return this; }
    
    scaleFactor(f) { this.x *= f; this.y *= f; return this; }
    scale(p) { this.x *= p.x; this.y *= p.y; return this; }
    add(p) { return this.move(p); }
    sub(p) { return this.add(p.clone().scaleFactor(-1)); }

    setX(x) { this.x = x; return this; }
    setY(y) { this.y = y; return this; }
    clamp(pMin = new Point(), pMax = new Point())
    {
        this.setX(Math.min(Math.max(this.x, pMin.x), pMax.x));
        this.setY(Math.min(Math.max(this.y, pMin.y), pMax.y));
        return this;
    }

    setLineIndex(l) { this.lineIndex = l; return this; }
    getLineIndex() { return this.lineIndex; }

    addConnection(p) { this.connections.push(p); return this; }
    removeConnection(p)
    {
        const idx = this.connections.indexOf(p);
        if(idx < 0) { return; }
        this.connections.splice(idx, 1);
        return this;
    }
    getConnections() { return this.connections.slice(); }
    isConnectedTo(p) { return this.connections.includes(p); }
    hasConnections() { return this.countConnections() > 0; }
    countConnections() { return this.connections.length; }
}