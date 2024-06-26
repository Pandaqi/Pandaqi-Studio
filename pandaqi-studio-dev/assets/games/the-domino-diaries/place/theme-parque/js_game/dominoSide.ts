import fromArray from "js/pq_games/tools/random/fromArray";
import { CoasterType, ItemType, PATHS, PathType } from "../js_shared/dict";
import CONFIG from "../js_shared/config";

export default class DominoSide
{
    type:ItemType;
    typePath:PathType;
    keyPath:string;
    typeCoaster:CoasterType;
    rotation:number; // integer; 0-4; 0 = right, 1 = down, 2 = left, 3 = up

    constructor(it:ItemType)
    {
        this.type = it;
        this.rotation = Math.floor(Math.random() * 4);

        if(this.type == ItemType.ATTRACTION)
        {
            this.setPathType(PathType.ATTRACTION);
            const randPathKey = fromArray(Object.keys(PATHS));
            this.setPathKey(randPathKey);
        }
    }

    isOpenAt(rot:number)
    {
        const pathData = PATHS[this.keyPath];
        if(!pathData) { return true; }

        const sides = pathData.sides;
        const rotOffset = ((rot - this.rotation) + 4) % 4;
        return sides[rotOffset];
    }

    rotateUntilOpenAt(rot:number)
    {
        for(let i = 0; i < 4; i++)
        {
            if(this.isOpenAt(rot)) { break; }
            this.rotation = (this.rotation + 1) % 4;
        }
    }

    rotateUntilClosedAt(rot:number)
    {
        for(let i = 0; i < 4; i++)
        {
            if(!this.isOpenAt(rot)) { break; }
            this.rotation = (this.rotation + 1) % 4;
        }
    }

    hasPathLike()
    {
        return this.typePath || this.typeCoaster;
    }

    setPathKey(k:string)
    {
        this.keyPath = k;
    }

    setPathType(t:PathType)
    {
        this.typePath = t;
    }

    isQueue()
    {
        return this.typePath == PathType.QUEUE1 || this.typePath == PathType.QUEUE2;
    }

    needsTunnel()
    {
        return this.keyPath == "deadend";
    }
}