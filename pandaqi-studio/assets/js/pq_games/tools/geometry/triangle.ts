import Point from "./point"

export default class Triangle 
{
    edges: Point[]

    constructor(t:Record<string,any> = {}) 
    {
        this.edges = t.edges ?? [];
    }
}