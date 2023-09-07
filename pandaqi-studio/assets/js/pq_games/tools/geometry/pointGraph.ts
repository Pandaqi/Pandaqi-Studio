import { Point, PointLike } from "./point"

export default class PointGraph extends Point
{
    neighbors:Point[]
    connections:Point[]
    metadata:any

    constructor(x:number|PointLike = new Point(), y:number = 0, nbs:Point[] = [], cons:Point[] = [], meta:any = {})
    {
        super(x,y);

        let neighbors = nbs;
        if(x instanceof PointGraph) { neighbors = x.neighbors; }

        let connections = cons;
        if(x instanceof PointGraph) { connections = cons; }

        let metadata = meta;
        if(x instanceof PointGraph) { metadata = Object.assign({}, x.metadata); }

        this.neighbors = neighbors; // any point it CAN reach
        this.connections = connections; // points to which it's actually connected
        this.metadata = metadata;
    }
    
    clone()
    {
        return new PointGraph(this);
    }

    // neighbors
    addNeighbor(p = new Point()) { this.neighbors.push(p); }
    removeNeighbor(p = new Point())
    {
        const idx = this.getNeighborIndex(p);
        if(idx < 0) { return; }
        this.neighbors.splice(idx, 1);
    }
    countNeighbors() { return this.neighbors.length; }
    getNeighborIndex(p:Point) { return this.neighbors.indexOf(p); }
    hasNeighbor(p:Point) { return this.neighbors.includes(p); }
    canConnectTo(p:Point) { return this.hasNeighbor(p); }
    hasNeighbors() { return this.countNeighbors() > 0; }
    getNeighbors() { return this.neighbors.slice(); }
    clearNeighbors() { this.neighbors = []; }

    // connections
    addConnection(p = new Point()) { this.connections.push(p); }
    removeConnection(p = new Point())
    {
        const idx = this.getConnectionIndex(p);
        if(idx < 0) { return; }
        this.connections.splice(idx, 1);
    }
    countConnections() { return this.connections.length; }
    getConnectionIndex(p:Point) { return this.connections.indexOf(p); }
    hasConnection(p:Point) { return this.connections.includes(p); }
    isConnectedTo(p:Point) { return this.hasConnection(p); }
    hasConnections() { return this.countConnections() > 0; }
    getConnections() { return this.connections.slice(); }
    clearConnections() { this.connections = []; }

    // metadata
    setMetadata(obj:any) { this.metadata = obj; }
    getMetadata() { return this.metadata; }

}