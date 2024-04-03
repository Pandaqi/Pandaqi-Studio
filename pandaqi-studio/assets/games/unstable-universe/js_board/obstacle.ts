import GraphElement from "./graphElement"

export default class Obstacle extends GraphElement
{
    radius = 0
    type = "obstacle"

    setRadius(r:number)
    {
        this.radius = r;
    }
}