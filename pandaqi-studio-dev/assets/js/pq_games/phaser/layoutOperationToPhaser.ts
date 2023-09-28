import LayoutOperation from "../layout/layoutOperation";

const layoutOperationToObject = (obj, op:LayoutOperation) =>
{
    if(op.hasFill())
    {
        obj.setFillStyle(op.fill.toHEXNumber(), op.fill.a);
    }

    if(op.hasStroke())
    {
        obj.setLineStyle(op.strokeWidth, op.stroke.toHEXNumber(), op.stroke.a);
    }

    obj.setOrigin(op.pivot.x, op.pivot.y);
    obj.x = op.translate.x;
    obj.y = op.translate.y;
}

const layoutOperationToGraphics = (graphics, op:LayoutOperation) =>
{
    if(op.hasFill()) 
    { 
        graphics.fillStyle(op.fill.toHEXNumber(), op.fill.a); 
    }

    if(op.hasStroke()) 
    { 
        graphics.lineStyle(op.strokeWidth, op.stroke.toHEXNumber(), op.stroke.a);
    }
}

export { layoutOperationToGraphics, layoutOperationToObject }