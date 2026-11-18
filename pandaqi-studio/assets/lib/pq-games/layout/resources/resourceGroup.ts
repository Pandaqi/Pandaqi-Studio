import { LayoutOperation, ResourceLike } from "../layoutOperation";
import { Resource } from "./resource";
import type { CanvasLike } from "./resourceImage";
import type { DrawOrderHook } from "./drawOrder";

class LayoutCombo
{
    resource: ResourceLike;
    operation: LayoutOperation;
    // Optional override for the batching key (see drawOrder.ts). Elements that share a key are drawn
    // consecutively when the group enables batching.
    batchKey: string;

    constructor(res:ResourceLike, op = new LayoutOperation())
    {
        this.resource = res;
        this.operation = op;
    }

    toCanvas(ctx:CanvasLike, parentOperation = new LayoutOperation())
    {
        this.operation.parentOperation = parentOperation;
        this.operation.renderer = parentOperation.renderer;
        this.resource.toCanvas(ctx, this.operation);
    }

    toPixi(app, parent, parentOperation = new LayoutOperation())
    {
        this.operation.parentOperation = parentOperation;
        this.operation.renderer = parentOperation.renderer;
        return this.resource.toPixi(app, parent, this.operation);
    }
}

export { LayoutCombo };
export class ResourceGroup extends Resource
{
    combos: LayoutCombo[]

    // Optional hook to reorder the children before a renderer draws them. Receives the current order
    // and must return the array to draw (returning the argument unchanged is fine).
    order: DrawOrderHook = null

    // Opt-in smart batching: children with the same draw style are drawn consecutively, which keeps
    // the canvas state stable. This reorders overlapping elements, so only enable it when the children
    // of this group do not overlap.
    batch: boolean = false

    constructor()
    {
        super()
        this.combos = [];
    }

    clear() { this.combos = []; }

    setOrder(hook:DrawOrderHook) { this.order = hook; return this; }
    setBatch(batch:boolean) { this.batch = batch; return this; }
    add(res:ResourceLike, op:LayoutOperation = undefined)
    {
        const combo = new LayoutCombo(res, op);
        this.combos.push(combo);
        return combo;
    }

    // Adds a batch of children at once; handy when a game builds a long list of similar elements.
    addMany(combos:LayoutCombo[])
    {
        for(const combo of combos) { this.combos.push(combo); }
        return combos;
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