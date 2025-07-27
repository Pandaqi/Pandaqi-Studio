import GameServer from "./gameServer";
import GameClient from "./gameClient";
import { PeerfulGame } from "lib/pq-peerful";

const config = {
    debug: true,
    appId: "pandaqi_peerful_space",

    serverClass: GameServer,
    clientClass: GameClient,

    logToScreen: true,
    logToConsole: true,
}

const game = new PeerfulGame(config);