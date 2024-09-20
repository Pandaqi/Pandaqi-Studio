import LayoutOperation, { ResourceLike } from "../layoutOperation";
import TransformationMatrix from "../tools/transformationMatrix";
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

    toCanvas(ctx:CanvasLike, trans = new TransformationMatrix())
    {
        this.operation.transformParent = trans;
        this.resource.toCanvas(ctx, this.operation);
    }

    toPixi(app, parent)
    {
        return this.resource.toPixi(app, parent, this.operation);
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

    toCanvas(ctx:CanvasLike, op = new LayoutOperation())
    {
        op.resource = this;
        return op.applyToCanvas(ctx);
    }

    toPixi(app, parent, op = new LayoutOperation())
    {
        op.resource = this;
        return op.applyToPixi(app, parent);
    }
}