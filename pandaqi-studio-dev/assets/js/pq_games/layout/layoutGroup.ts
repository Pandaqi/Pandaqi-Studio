import LayoutOperation, { ResourceLike } from "./layoutOperation";
import { CanvasLike } from "./resources/resourceImage";

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
}

export { LayoutGroup, LayoutCombo }
export default class LayoutGroup
{
    combos: LayoutCombo[]

    constructor()
    {
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
        op.resource = this.combos.slice();
        await op.applyToCanvas(ctx);
    }
}