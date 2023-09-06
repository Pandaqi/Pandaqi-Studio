export default class FourSideValue
{
    top : number
    right : number
    bottom : number
    left : number

    constructor(t: number|FourSideValue = null, r:number = null, b:number = null, l:number = null)
    {
        if(t instanceof FourSideValue)
        {
            this.copy(t);
            return;
        }

        this.top = t ?? 0;
        this.right = r ?? this.top;
        this.bottom = b ?? this.right;
        this.left = l ?? this.bottom;
    }

    copy(f:FourSideValue)
    {
        this.top = f.top;
        this.right = f.right;
        this.bottom = f.bottom;
        this.left = f.left;
    }

    isVisible() : boolean
    {
        return this.top != 0 || this.right != 0 || this.bottom != 0 || this.left != 0
    }
}