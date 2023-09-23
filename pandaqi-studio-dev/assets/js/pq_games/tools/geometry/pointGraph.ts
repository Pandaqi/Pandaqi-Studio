import LineGraph from "./lineGraph"
import { Point, PointLike } from "./point"

export default class PointGraph extends Point
{
    neighbors:PointGraph[]
    connections:LineGraph[]
    metadata:Record<string,any>

    constructor(x:number|PointLike = new Point(), y:number = 0, nbs:PointGraph[] = [], cons:LineGraph[] = [], meta:any = {})
    {
        super(x,y);

        let neighbors = nbs;
        if(x instanceof PointGraph) { neighbors = x.neighbors; }

        let connections = cons;
        if(x instanceof PointGraph) { connections = x.connections; }

        let metadata = meta;
        if(x instanceof PointGraph) { metadata = Object.assign({}, x.metadata); }

        this.neighbors = neighbors; // any point it CAN reach
        this.connections = connections; // LineGraph representing connection to other points
        this.metadata = metadata;
    }
    
    clone()
    {
        return new PointGraph(this);
    }

    // neighbors
    addNeighbor(p = new PointGraph()) { this.neighbors.push(p); }
    removeNeighbor(p = new PointGraph())
    {
        const idx = this.getNeighborIndex(p);
        if(idx < 0) { return; }
        this.neighbors.splice(idx, 1);
    }
    countNeighbors() { return this.neighbors.length; }
    getNeighborIndex(p:PointGraph) { return this.neighbors.indexOf(p); }
    hasNeighbor(p:PointGraph) { return this.neighbors.includes(p); }
    canConnectTo(p:PointGraph) { return this.hasNeighbor(p); }
    hasNeighbors() { return this.countNeighbors() > 0; }
    getNeighbors() { return this.neighbors.slice(); }
    clearNeighbors() { this.neighbors = []; }

    // connections
    addConnectionByPoint(p = new PointGraph()) 
    {
        if(this.isConnectedTo(p)) { return; }

        const newLine = new LineGraph(this, p);
        this.connections.push(newLine); 
        p.addConnectionByLine(newLine);
    }

    addConnectionByLine(l:LineGraph = null)
    {
        const otherSide = l.getOther(this) as PointGraph;
        
        if(this.isConnectedTo(otherSide)) { return; }
        this.connections.push(l);
        otherSide.addConnectionByLine(l);
    }

    removeConnectionByIndex(idx:number)
    {
        if(idx < 0 || idx >= this.connections.length) { return; }
        const otherSide = this.connections[idx].getOther(this) as PointGraph;
        this.connections.splice(idx, 1);
        otherSide.removeConnectionByPoint(this);
    }

    clearConnections() { this.connections = []; }
    removeConnectionByPoint(p:PointGraph)
    {
        const idx = this.getConnectionIndexByPoint(p);
        this.removeConnectionByIndex(idx);
    }

    removeConnectionByLine(l:LineGraph)
    {
        const idx = this.getConnectionIndexByLine(l);
        this.removeConnectionByIndex(idx);
    }

    countConnections() { return this.connections.length; }
    getConnectionLineByIndex(idx:number) { return this.connections[idx]; }
    getConnectionPointByIndex(idx:number) { return this.getConnectionsByPoint()[idx]; }
    
    getConnectionIndexByPoint(p:PointGraph) { return this.getConnectionsByPoint().indexOf(p); }
    getConnectionIndexByLine(l:LineGraph) { return this.connections.indexOf(l); }
    
    hasConnection(p:PointGraph) { return this.getConnectionsByPoint().includes(p); }
    isConnectedTo(p:PointGraph) { return this.hasConnection(p); }
    hasConnections() { return this.countConnections() > 0; }

    getConnectionLineTo(p:PointGraph)
    {
        const idx = this.getConnectionIndexByPoint(p);
        return this.connections[idx];
    }
    
    getConnectionsByLine() { return this.connections.slice(); }
    getConnectionsByPoint()
    {
        const arr = [];
        for(const conn of this.connections)
        {
            arr.push(conn.getOther(this));
        }
        return arr;
    }
    

    // metadata
    setMetadata(obj:any) { this.metadata = obj; }
    getMetadata() { return this.metadata; }

}