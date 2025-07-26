import Point from "lib/pq-games/tools/geometry/point";
import BackpackItem from "./backpackItem";
import CONFIG from "./config";
import GameServer from "./gameServer";
import Player from "./player";

export default class GameMap
{
    items: BackpackItem[]; // items scattered around the map
    game: GameServer;

    constructor(game:GameServer)
    {
        this.game = game;
    }

    // @TODO: Check for overlaps and minimum distances between everything
    generate()
    {
        // place all players at random positions
        for(const player of Object.values(this.game.players))
        {
            player.setPosition(this.getRandomPosition());
        }

        // place all items at random positions + with random targets
        const numItems = CONFIG.numItems.randomInteger();
        for(let i = 0; i < numItems; i++)
        {
            const type = "whatever";
            const pos = this.getRandomPosition();
            const target = this.game.getRandomPlayer();
            this.placeItem(pos, type, target);
        }
    }


    getRandomPosition()
    {
        const size = CONFIG.phaser.size;
        return new Point(Math.random(), Math.random()).scale(size);
    }

    getPlayersWithinRange(players:Record<string,Player>, p:Player, range:number)
    {
        const pos = p.position;
        const arr = [];
        for(const [key,obj] of Object.entries(players))
        {
            const itsUs = obj == p;
            if(itsUs) { continue; }
            
            const dist = pos.distTo(obj.position);
            if(dist > range) { continue; }
            
            arr.push(key);
        }
        return arr;
    }

    getItemsWithinRange(p:Player, range:number)
    {
        const pos = p.position;
        const arr = [];
        for(const item of this.items)
        {
            const dist = pos.distTo(item.position);
            if(dist > range) { continue; }
            arr.push(item);
        }
        return arr;
    }

    placeItem(pos:Point, type:string, target: string)
    {
        const item = new BackpackItem().from({ type: type, target: target });
        item.createSprites(this.game);
        item.setPosition(pos);
        this.items.push(item);
    }

    removeItem(item:BackpackItem)
    {
        item.remove();
        this.items.splice(this.items.indexOf(item), 1);
    }

    countItemsOnField() { return this.items.length; }
    isGameOver()
    {
        const numItemsOnMap = this.countItemsOnField();
        if(numItemsOnMap > 0) { return false; }
        return true;
    }

}