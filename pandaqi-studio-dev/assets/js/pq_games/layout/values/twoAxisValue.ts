import { SizeValue, SizeType } from "./sizeValue"
import AlignValue from "./alignValue"
import Point from "js/pq_games/tools/geometry/point"
import Value from "./value"

type value = number|SizeValue
interface dict {
    x:value,
    y:value
}

export default class TwoAxisValue extends Value
{
    x:SizeValue
    y:SizeValue

    constructor(a:value|dict|TwoAxisValue = 0, b:value = 0)
    {
        super()

        let x = a;
        let y = b;
        
        if(a instanceof TwoAxisValue)
        {
            x = a.x;
            y = a.y;
        }

        if(a && typeof a == "object" && ("x" in a && "y" in a))
        {
            x = a.x;
            y = a.y;
        }
        
        this.x = new SizeValue(x as value);
        this.y = new SizeValue(y);
    }

    fromSingle(val:value) : TwoAxisValue
    {
        if(!(val instanceof SizeValue)) { val = new SizeValue(val); }
        this.x = val;
        this.y = val;
        return this;
    }

    fromPoint(p:Point) : TwoAxisValue
    {
        this.x = new SizeValue(p.x);
        this.y = new SizeValue(p.y);
        return this;
    }

    setBlock() : TwoAxisValue
    {
        this.x = new SizeValue(1.0, SizeType.PARENT),
        this.y = new SizeValue(1.0, SizeType.CONTENT)
        return this;
    }

    setFreeGrow() : TwoAxisValue
    {
        this.x = new SizeValue(0, SizeType.CONTENT)
        this.y = new SizeValue(0, SizeType.CONTENT)
        return this;
    }

    isVariable() : boolean
    {
        return this.x.isVariable() || this.y.isVariable();
    }

    dependsOnContent() : boolean
    {
        return this.x.dependsOnContent() || this.y.dependsOnContent();
    }

    get() : Point
    {
        return new Point().setXY(this.x.get(), this.y.get());
    }

    calc(parentSize : Point, contentSize : Point) : Point
    {
        return new Point().setXY(
            this.x.calcs(parentSize.x, contentSize.x),
            this.y.calcs(parentSize.y, contentSize.y)
        );
    }
}