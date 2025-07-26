import PeerfulGame from "lib/pq-peerful/main";
import GameServer from "./gameServer";
import GameClient from "./gameClient";
import CONFIG from "./config";

const config = {
    debug: true,
    appId: "pandaqi_peerful_space",

    serverClass: GameServer,
    clientClass: GameClient,

    logToScreen: true,
    logToConsole: true,
}

const game = new PeerfulGame(config);