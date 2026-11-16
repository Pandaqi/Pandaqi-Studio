import { ResourceImage, ResourceLoader, Vector2, LayoutEffect, GrayScaleEffect } from "lib/pq-games";

export default class Visualizer
{
    patternCat: ResourceImage
    patternHeart: ResourceImage
    patternHeartOutline: ResourceImage
    resLoader: ResourceLoader;
    size: Vector2;
    sizeUnit: number;
    center: Vector2;
    inkFriendly: boolean;
    effects: LayoutEffect[];

    constructor(r:ResourceLoader, itemSize:Vector2, inkFriendly:boolean)
    {
        this.resLoader = r;
        this.inkFriendly = inkFriendly;
        this.size = itemSize;
        this.sizeUnit = Math.min(this.size.x, this.size.y);
        this.center = this.size.clone().scale(0.5);
        
        this.effects = [];
        if(inkFriendly) { this.effects.push(new GrayScaleEffect()); }
    }

    async prepare()
    {
    }
}