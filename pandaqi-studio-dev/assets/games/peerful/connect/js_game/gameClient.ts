import PeerfulClient from "lib/pq-peerful/peerfulClient";
import { receiveAction, sendAction } from "lib/pq-peerful/peerfulUtilities";
import BackpackItem from "./backpackItem";
import addTouchEvents from "lib/pq-games/tools/dom/addTouchEvents";
import convertEventToLocal from "lib/pq-games/tools/dom/convertEventToLocal";
import Point from "lib/pq-games/tools/geometry/point";

export default class GameClient
{
    client: PeerfulClient
    radar: HTMLDivElement;
    backpack: HTMLDivElement;
    playersInRange: string[];
    backpackItems: BackpackItem[];
    joystick: HTMLDivElement;

    constructor(client: PeerfulClient)
    {
        this.client = client;
        this.prepareActions();
        this.createHTML();
    }

    createHTML()
    {
        // @TODO: create separate HTML for welcome message + VIP button to start

        // the HTML below is for the in-game play interface
        const cont = document.createElement("div");
        const joystick = document.createElement("div");
        this.joystick = joystick;
        cont.appendChild(joystick);

        const joystickHandler = (ev) => {
            const pos = convertEventToLocal(ev, this.joystick);
            this.move(this.joystick, pos);
        }
        addTouchEvents({ node: this.joystick, all: joystickHandler })

        const radar = document.createElement("div");
        this.radar = radar;
        cont.appendChild(radar);

        const backpack = document.createElement("div");
        this.backpack = backpack;
        cont.appendChild(backpack);

        this.client.config.node.appendChild(cont);
    }

    prepareActions()
    {
        // listen for interface reset
        const resetHandler = (data, peerID) => {
            this.reset();
        }
        receiveAction(this.client, "player-reset", resetHandler);

        // listen for players entering and leaving our trade range
        const rangeHandler = (data, peerID) => {
            if(data.inRange) { this.playersInRange.push(data.sender); }
            else { this.playersInRange.splice(this.playersInRange.indexOf(data.sender), 1); }
            this.refreshRadar();
        };
        receiveAction(this.client, "range", rangeHandler);

        // listen for backpack changes
        const backpackHandler = (data, peerID) => {
            this.backpackItems = data;
            this.refreshBackpack();
        }
        receiveAction(this.client, "backpack", backpackHandler);
    }

    move(node:HTMLElement, pos:Point)
    {
        const bounds = node.getBoundingClientRect();
        const size = new Point(bounds.width, bounds.height);
        const center = size.clone().scale(0.5);
        const moveVec = center.vecTo(pos);
        const moveVecRaw = { x: moveVec.x, y: moveVec.y };
        sendAction(this.client, "move", moveVecRaw);
    }

    trade(item)
    {
        if(!this.canTrade()) { return; }
        if(!this.canTradeItem(item)) { return; }

        // @TODO: deactivate item immediately (only removed if trade is accepted)

        const itemRaw = item.getRaw(); 
        for(const player of this.playersInRange)
        {
            sendAction(this.client, "trade", { who: player, item: itemRaw });
        }
    }

    // @TODO: some types might have specific restrictions on this
    canTradeItem(item:BackpackItem)
    {
        return true;
    }

    canTrade()
    {
        return this.playersInRange.length > 0;
    }

    reset()
    {
        this.playersInRange = [];
        this.refreshRadar();
        this.backpackItems = [];
        this.refreshBackpack();
    }

    refreshRadar()
    {
        this.radar.innerHTML = this.playersInRange.join(" | ");
    }

    refreshBackpack()
    {
        this.backpack.innerHTML = "";

        for(const item of this.backpackItems)
        {
            const elem = document.createElement("div");
            elem.innerHTML = item.toString();
            this.backpack.appendChild(elem);
            elem.addEventListener("click", (ev) => { this.trade(item); })
        }
    }
}