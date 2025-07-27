
import GameServer from "./gameServer";
import CONFIG from "./config";
import BackpackItem, { BackpackItemRaw } from "./backpackItem";
import { Vector2 } from "lib/pq-games";
import { receiveAction, listenForEvent, sendAction } from "lib/pq-peerful";

export default class Player
{
    id: string;
    username: string;
    position: Vector2;
    playersInRange: string[];
    game: GameServer;
    backpack: BackpackItem[];
    sprite: any;
    exploded: boolean;
    userNameText: any;

    constructor(game: GameServer, id, usn)
    {
        this.game = game;
        this.id = id;
        this.username = usn;
        this.reset();
        this.prepareActions();
    }

    createSprites()
    {
        const scene = this.game.getPhaserScene();
        const sprite = scene.add.sprite(0, 0, "player");
        sprite.displayWidth = sprite.displayHeight = CONFIG.playerSize;
        sprite.setFrame(0);
        sprite.setOrigin(0.5, 1.0);
        this.sprite = sprite;

        const text = scene.add.text(0, 0, this.username, CONFIG.phaser.userNameTextConfig);
        text.setOrigin(0.5);
        this.userNameText = text;
    }

    prepareActions()
    { 
        // listen for moving this specific player
        const movementHandler = (data, peerID) => {
            if(peerID != this.id) { return; }
            this.move(data);
        };
        receiveAction(this.game.server, "move", movementHandler);

        // check for backpack explosions
        const updateHandler = () => {
            const itemsExploded = this.getItemsPastTimestamp();
            if(itemsExploded.length > 0) { this.explode(); return; }
        }
        listenForEvent("phaser-update", updateHandler, this.game.server.config);
    }

    setPosition(pos)
    {
        this.position = pos;
        this.refreshSprites();
    }

    move(vec: { x: number, y: number })
    {
        const newPos = this.position.clone().move(vec);
        this.setPosition(newPos);
        this.grabItemsWithinRange();
        this.updatePlayersWithinRange();
    }

    grabItemsWithinRange()
    {
        const items = this.game.map.getItemsWithinRange(this, CONFIG.itemGrabRange);
        for(const item of items)
        {
            this.grab(item);
        }
    }

    updatePlayersWithinRange()
    {
        const otherPlayers = this.game.map.getPlayersWithinRange(this.game.players, this, CONFIG.playerTradeRange);

        for(const player of Object.keys(this.game.players))
        {
            const itsUs = player == this.id;
            if(itsUs) { continue; }

            const isInRange = otherPlayers.includes(player);
            const wasInRange = this.inRangeWith(player);
            const steppedOutOfRange = !isInRange && wasInRange;
            if(steppedOutOfRange) { this.updateRangeIndividual(player, false); }

            const steppedIntoRange = isInRange && !wasInRange;
            if(steppedIntoRange) { this.updateRangeIndividual(player, true); }
        }
    }

    inRangeWith(other:string) { return this.playersInRange.includes(other); }
    updateRangeIndividual(receiver:string, inRange:boolean)
    {
        if(inRange) { this.playersInRange.push(receiver); }
        else { this.playersInRange.splice(this.playersInRange.indexOf(receiver), 1); }

        sendAction(this.game.server, "range", { who: this.username, inRange: inRange }, [receiver]);
    }

    // @NOTE: can't do a simple "includes", because we're talking about an object instance recreated across two
    // different devices, so its reference point won't match (even if all fields inside match)
    getItemIndex(item: BackpackItem)
    {
        for(let i = 0; i < this.backpack.length; i++)
        {
            if(this.backpack[i].matches(item)) { return i; }
        }
        return -1;
    }

    isFull() { return this.countItems() >= CONFIG.maxBackpackSize; }
    hasItem(item: BackpackItem) { return this.getItemIndex(item) >= 0; }
    countItems() { return this.backpack.length; }
    updateBackpack(itemRaw: BackpackItemRaw, add: boolean)
    {
        const item = new BackpackItem().from(itemRaw);
        const itemIsDone = item.hasTarget(this.id) && add; // @TODO: perhaps check this on CLIENT, so they see the item for a few seconds, and then it disappears and sends a signal back
        const currentTime = this.game.getCurrentTime();
        item.updateTimestamp(currentTime);
        
        if(!itemIsDone) 
        { 
            if(add) { this.backpack.push(item); }
            else { this.backpack.splice(this.getItemIndex(item), 1); }
        }

        sendAction(this.game.server, "backpack", this.backpack);
    }

    grab(item:BackpackItem)
    {
        if(this.isFull()) { return; } // @TODO: error message on screen for this

        this.game.map.removeItem(item);
        this.updateBackpack(item.getRaw(), true);
    }

    getItemsPastTimestamp()
    {
        const arr = [];
        const time = Math.floor(Date.now() / 1000.0);
        for(const item of this.backpack)
        {
            if(!item.pastTimestamp(time)) { continue; }
            arr.push(item);
        }
        return arr;
    }

    isDead() { return this.exploded; }
    explode()
    {
        this.exploded = true;
        sendAction(this.game.server, "exploded", null, [this.id]);
        this.game.handleGameOver();
    }

    reset()
    {
        this.playersInRange = [];
        this.backpack = [];
        this.exploded = false;
        
        sendAction(this.game.server, "player-reset", null, [this.id]);
    }

    refreshSprites()
    {
        const oldPos = this.sprite.position;
        const vec = new Vector2(this.position.x - oldPos.x, this.position.y - oldPos.y);

        this.sprite.setPosition(this.position.x, this.position.y);
        this.sprite.flipX = (vec.x < 0); // make sprite face the way we last moved
        this.userNameText.setPosition(this.position.x, this.position.y - CONFIG.playerSize);
        this.userNameText.setText(this.username);
    }
}