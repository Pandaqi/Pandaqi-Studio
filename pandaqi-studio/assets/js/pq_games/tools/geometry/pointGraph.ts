import { Point, PointLike } from "./point"

export default class PointGraph extends Point
{
    neighbors:PointGraph[]
    connections:PointGraph[]
    metadata:Record<string,any>

    constructor(x:number|PointLike = new Point(), y:number = 0, nbs:PointGraph[] = [], cons:PointGraph[] = [], meta:any = {})
    {
        super(x,y);

        let neighbors = nbs;
        if(x instanceof PointGraph) { neighbors = x.neighbors; }

        let connections = cons;
        if(x instanceof PointGraph) { connections = x.connections; }

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
    addConnection(p = new PointGraph()) { this.connections.push(p); }
    removeConnectionByIndex(idx:number)
    {
        if(idx < 0 || idx >= this.connections.length) { return; }
        const otherSide = this.connections[idx];
        this.connections.splice(idx, 1);
        otherSide.removeConnection(this);
    }
    removeConnection(p = new PointGraph())
    {
        const idx = this.getConnectionIndex(p);
        this.removeConnectionByIndex(idx);
    }
    countConnections() { return this.connections.length; }
    getConnectionByIndex(idx:number) { return this.connections[idx]; }
    getConnectionIndex(p:PointGraph) { return this.connections.indexOf(p); }
    hasConnection(p:PointGraph) { return this.connections.includes(p); }
    isConnectedTo(p:PointGraph) { return this.hasConnection(p); }
    hasConnections() { return this.countConnections() > 0; }
    getConnections() { return this.connections.slice(); }
    clearConnections() { this.connections = []; }

    // metadata
    setMetadata(obj:any) { this.metadata = obj; }
    getMetadata() { return this.metadata; }

}