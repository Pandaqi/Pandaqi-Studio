import { sendEvent } from "./events";
import { log } from "./log";
import { GameState, PeerfulConfig, PeerfulLoginData } from "./main";
import { askQuestion, sendAction } from "./peerfulUtilities";
import { joinRoom, getTrackers } from './trystero-torrent.min.js';

export default class PeerfulClient
{
    roomCode: string
    userName: string
    room: any
    joined: boolean
    authority: string
    config: PeerfulConfig

    onReconnectDataReceived: Function

    constructor(roomCode:string, userName: string, config:PeerfulConfig)
    {
        this.config = config;
        this.roomCode = roomCode;
        this.userName = userName;
        this.joined = false;
        this.room = joinRoom(config, roomCode);
        this.connectToAuthority();
    }

    connectToAuthority()
    {
        // request data from authority and save/use that
        const [sendData, getData] = this.room.makeAction("checklogin");
        getData((data, peerId) => {
            const invalid = (data.auth != peerId);
            if(invalid) { return; }

            this.setAuth(data.auth);
            this.handleReconnects(data);
            this.onConnectedToAuthority();
        });

        // listen to the AUTHORITY leaving the game; 
        // it's unrecoverable, so destruct all
        this.room.onPeerLeave((peerID) => {
            if(peerID != this.authority) { return; }
            log("Authority disconnected. Unrecoverable; game is destroyed.", this.config);
            sendEvent("game-destroyed", null, this.config);
            this.room.leave();
        })
    }

    setAuth(peerID:string)
    {
        this.authority = peerID;
    }

    handleReconnects(data:PeerfulLoginData)
    {
        const isReconnect = data.state != GameState.GAMELOGIN && data.names.includes(this.userName);
        if(!isReconnect) { return; }

        const noActionRequired = !this.onReconnectDataReceived;
        if(noActionRequired) { return; }
        
        log("This is a reconnect! Requesting what I missed ...", this.config);
        const handler = (data, peerID) => {
            this.onReconnectDataReceived(data);
        };
        askQuestion(this, "reconnect", null, handler);
    }

    onConnectedToAuthority()
    {
        this.joined = true;
        log("Connected to authority: " + this.authority, this.config);
        sendAction(this, "usn", this.userName);
        sendEvent("connected-to-authority", null, this.config);
    }

    requestGameStart()
    {
        sendAction(this, "start");
    }
}