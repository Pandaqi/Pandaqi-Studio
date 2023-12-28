import PeerfulServer from "js/pq_peerful/peerfulServer";
import { receiveAction, sendAction } from "js/pq_peerful/peerfulUtilities";
import Player from "./player";
import CONFIG from "./config";
import instantiatePhaser from "js/pq_peerful/phaser/instantiatePhaser";
import GameMap from "./gameMap";
import fromArray from "js/pq_games/tools/random/fromArray";
import createPhaserSceneTemplate, { PHASER_SCENE_KEY } from "js/pq_peerful/phaser/createPhaserSceneTemplate";

// The GameServer runs the whole game and is like the root / global manager
// -> It knows the Server peer to hook into online messaging.
// -> It holds any Backend (such as Phaser) to hook into running/displaying the game.
// -> It holds the Player list, needed for pretty much anything. (It's not just relevant while playing, it's relevant _at all times_.)
// -> Anything else, however, must be outsourced to smaller classes/functions that handle specific game logic.

export default class GameServer
{
    server: PeerfulServer
    phaser: any;
    players: Record<string,Player> = {}; // players (peerID -> Player instance)
    map: GameMap;

    constructor(server: PeerfulServer)
    {
        this.server = server;
        this.map = new GameMap(this);
        this.server.onStart = this.startNewGame;

        const node = this.server.config.node;
        const phaserClass = createPhaserSceneTemplate(node, CONFIG);
        this.phaser = instantiatePhaser(node, phaserClass, CONFIG.phaser);
        this.prepareActions();
    }

    getPhaserScene() { return this.phaser.scene.getScene(PHASER_SCENE_KEY); }
    prepareActions()
    {
        // joining/leaving
        this.server.onPlayerJoined = (id, usn) => {
            this.addPlayer(id, usn);
        }

        this.server.onPlayerThrown = (id, usn) => {
            this.removePlayer(id);
        }

        // relay trades (if valid)
        const tradeHandler = (data, peerID) => 
        {
            const tradeAllowed = this.isTradeAllowed(peerID, data);
            if(!tradeAllowed) { return; }

            this.getPlayer(peerID).updateBackpack(data.item, false);
            this.getPlayer(data.who).updateBackpack(data.item, true);

            this.handleGameOver();
        }
        receiveAction(this.server, "trade", tradeHandler);
    }

    startNewGame()
    {
        this.map.generate();
    }

    addPlayer(id, usn)
    {
        const p = new Player(this, id, usn);
        p.createSprites();
        this.players[id] = p;
    }

    removePlayer(id)
    {
        delete this.players[id];
    }
    
    isTradeAllowed(trader:string, data)
    {
        const giver = this.getPlayer(trader);
        const receiver = data.who;
        const item = data.item;
        if(!giver.hasItem(item)) { return false; }
        if(!giver.inRangeWith(receiver)) { return false; }
        return true;
    }

    getPlayer(peerID) { return this.players[peerID]; }
    getRandomPlayer()
    {
        return fromArray(Object.keys(this.players));
    }

    countItemsInBackpacks() 
    {
        let sum = 0;
        for(const player of Object.values(this.players))
        {
            sum += player.countItems();
        }
        return sum;
    }

    isGameOver()
    {
        const numItemsInBackpacks = this.countItemsInBackpacks();
        if(numItemsInBackpacks > 0) { return false; }

        if(this.map.isGameOver()) { return true; }
        return false;
    }

    handleGameOver()
    {
        if(!this.isGameOver()) { return; }
        this.server.gotoGameOver();
        return true;
    }
}