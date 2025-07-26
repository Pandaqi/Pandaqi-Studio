import Point from "../point";
import Shape, { PathLike } from "../shape";

export default class PathFollower
{
    path: Point[]
    offset: number

    constructor(path:PathLike, offset = 0)
    {
        if(path instanceof Shape) { path = path.toPath(); }
        this.path = path ?? [];
        this.offset = offset;
    }

    getCurrentLocation() : Point
    {
        const prevPos = this.path[Math.floor(this.offset)];
        const nextPos = this.path[Math.ceil(this.offset)];
        return prevPos.clone().lerp(nextPos, this.offset % 1);
    }
    
    setOffset(delta:number)
    {
        this.offset = delta;
        this.wrapOffset();
    }

    wrapOffset()
    {
        this.offset = this.offset % this.path.length;
    }

    changeOffset(delta:number)
    {
        this.setOffset(this.offset + delta);
        return this.getCurrentLocation();
    }

    moveToPointByChange(delta:number)
    {
        this.setOffset(Math.round(this.offset + delta));
        return this.getCurrentLocation();
    }

    moveToPointByIndex(idx:number)
    {
        this.setOffset(idx);
        return this.getCurrentLocation();
    }

    moveToNextPoint()
    {
        this.setOffset( Math.round(this.offset+0.001) );
        return this.getCurrentLocation();
    }

    moveToPreviousPoint()
    {
        this.setOffset( Math.floor(this.offset-0.001) );
        return this.getCurrentLocation();
    }
}