import Color from "../layout/color/color";
import LayoutOperation from "../layout/layoutOperation";

const layoutOperationToObject = (obj, op:LayoutOperation) =>
{
    if(op.hasFill())
    {
        const col = op.fill.get() as Color;
        obj.setFillStyle(col.toHEXNumber(), col.a);
    }

    if(op.hasStroke())
    {
        const stroke = op.stroke.get() as Color;
        obj.setStrokeStyle(op.strokeWidth, stroke.toHEXNumber(), stroke.a);
        if(obj.setLineWidth)
        {
            obj.setLineWidth(op.strokeWidth, op.strokeWidth); // @NOTE: only used in webgl, but REQUIRED there otherwise it just draws one hair thin line and ignores stroke width
        }
        
    }

    obj.x += op.translate.x;
    obj.y += op.translate.y;

    obj.setOrigin(op.pivot.x, op.pivot.y);
    
    obj.setRotation(op.rotation);
}

const layoutOperationToGraphics = (graphics, op:LayoutOperation) =>
{
    if(op.hasFill()) 
    { 
        const col = op.fill.get() as Color;
        graphics.fillStyle(col.toHEXNumber(), col.a); 
    }

    if(op.hasStroke()) 
    { 
        const stroke = op.stroke.get() as Color;
        graphics.lineStyle(op.strokeWidth, stroke.toHEXNumber(), stroke.a);
    }
}

export { layoutOperationToGraphics, layoutOperationToObject }