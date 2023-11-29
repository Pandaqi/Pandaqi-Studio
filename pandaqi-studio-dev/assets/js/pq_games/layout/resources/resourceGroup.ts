import LayoutOperation, { ResourceLike } from "../layoutOperation";
import Resource from "./resource";
import { CanvasLike } from "./resourceImage";

class LayoutCombo
{
    resource: ResourceLike;
    operation: LayoutOperation;

    constructor(res:ResourceLike, op = new LayoutOperation())
    {
        this.resource = res;
        this.operation = op;
    }

    async toCanvas(ctx:CanvasLike)
    {
        await this.resource.toCanvas(ctx, this.operation);
    }

    getBoundingBox()
    {
        const oldResource = this.operation.resource;
        this.operation.resource = this.resource;
        const bounds = this.operation.getBoundingBox();
        this.operation.resource = oldResource;
        return bounds;
    }
}

export { ResourceGroup, LayoutCombo }
export default class ResourceGroup extends Resource
{
    combos: LayoutCombo[]

    constructor()
    {
        super()
        this.combos = [];
    }

    clear() { this.combos = []; }
    add(res:ResourceLike, op:LayoutOperation = undefined)
    {
        const combo = new LayoutCombo(res, op);
        this.combos.push(combo);
        return combo;
    }

    remove(combo:LayoutCombo)
    {
        const idx = this.combos.indexOf(combo);
        if(idx < 0) { return; }
        this.combos.splice(idx, 1);
    }

    async toCanvas(ctx:CanvasLike, op = new LayoutOperation())
    {
        op.resource = this;
        return await op.applyToCanvas(ctx);
    }
}