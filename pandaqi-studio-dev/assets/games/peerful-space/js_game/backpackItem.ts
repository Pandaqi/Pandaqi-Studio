import Point from "js/pq_games/tools/geometry/point";
import GameServer from "./gameServer";
import CONFIG from "./config";
import { ITEMS } from "./dict";

interface BackpackItemRaw
{
    type?: string;
    target?: string;
    timestamp?: number;
}

// @NOTE: This class covers both Client and Server representation of items
// All the extra functions and helper variables are only for the server
// The "raw" object holds the only variables transmitted across the network that uniquely define it
// Not sure if the best approach, but it's what I'll try.
export { BackpackItem, BackpackItemRaw }
export default class BackpackItem
{
    raw: BackpackItemRaw = {};
    position: Point
    sprite: any;

    setPosition(pos)
    {
        this.position = pos;
        this.refreshSprites();
    }

    getRaw() { return this.raw; }
    from(otherItem:BackpackItemRaw)
    {
        Object.assign(this.raw, otherItem);
        return this;
    }

    matches(otherItem:BackpackItem|BackpackItemRaw)
    {
        otherItem = (otherItem instanceof BackpackItem) ? otherItem.getRaw() : otherItem;
        if(Object.keys(this.raw).length != Object.keys(otherItem).length) { return false; }

        for(const [key,data] of Object.entries(this.raw))
        {
            if(data != otherItem[key]) { return false; }
        }

        return true;
    }

    hasTarget(peerID:string)
    {
        return this.raw.target == peerID;
    }

    remove()
    {
        this.sprite.destroy();
    }

    getItemData()
    {
        return ITEMS[this.raw.type];
    }

    pastTimestamp(currentTime:number)
    {
        return this.raw.timestamp >= currentTime;
    }

    updateTimestamp(curTime)
    {
        // convert ms to s for less data to send over internet
        const newEndTime = curTime + (this.getItemData().duration ?? CONFIG.defaultItemDuration);
        this.raw.timestamp = newEndTime;
    }

    createSprites(game:GameServer)
    {
        const scene = game.getPhaserScene();
        const sprite = scene.add.sprite(0, 0, "item");
        sprite.displayWidth = sprite.displayHeight = CONFIG.itemSize;
        sprite.setFrame(0);
        sprite.setOrigin(0.5, 1.0);
        this.sprite = sprite;
    }

    refreshSprites()
    {
        this.sprite.setPosition(this.position.x, this.position.y);

        if(this.raw.type)
        {
            const frame = ITEMS[this.raw.type].frame;
            this.sprite.setFrame(frame);
        }
    }
}