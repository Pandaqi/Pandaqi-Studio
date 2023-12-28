import { sendEvent } from "./events";
import { log } from "./log";
import { GameState, PeerfulConfig, PeerfulLoginData } from "./main";
import { askQuestion, receiveAction, sendAction } from "./peerfulUtilities";
import { joinRoom, getTrackers } from './trystero-torrent.min.js';

export default class PeerfulClient
{
    custom: any
    roomCode: string
    userName: string
    room: any
    joined: boolean
    authority: string
    vip: boolean
    config: PeerfulConfig

    onReconnectDataReceived: Function

    constructor(roomCode:string, userName: string, config:PeerfulConfig)
    {
        this.config = config;
        this.roomCode = roomCode;
        this.userName = userName;
        this.joined = false;
        this.vip = false;
        this.room = joinRoom(config, roomCode);

        // the client must first establish which server runs the game and get their data
        // only once connected are all other actions/listeners/etcetera engaged
        this.connectToAuthority();
        this.connectToCustomCode();
    }

    connectToCustomCode()
    {
        if(!this.config.clientClass) { return; }
        this.custom = new this.config.clientClass(this);
    }

    connectToAuthority()
    {
        // request data from authority and save/use that
        const loginHandler = (data, peerId) => 
        {
            const invalid = (data.auth != peerId);
            if(invalid) { return; }

            this.setAuth(data.auth);
            this.handleReconnects(data);
            this.onConnectedToAuthority();
        }
        receiveAction(this, "checklogin", loginHandler);

        // listen to the AUTHORITY leaving the game; 
        // it's unrecoverable, so destruct all
        const authorityDiedHandler = (peerID) => 
        {
            if(peerID != this.authority) { return; }
            log("Authority disconnected. Unrecoverable; game is destroyed.", this.config);
            sendEvent("game-destroyed", null, this.config.node);
            this.room.leave();
        }
        this.room.onPeerLeave(authorityDiedHandler);
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
        sendEvent("connected-to-authority", null, this.config.node);

        this.prepareActions();        
    }

    prepareActions()
    {
        // immediately send the authority our username
        sendAction(this, "usn", this.userName);

        // react to being told you're the VIP
        // (if there are choices to be made, such as "start the game?", the VIP has that power alone)
        const handlerVIP = (data, peerID) => {
            this.vip = true;
            sendEvent("became-vip", null, this.config.node);
            log("Congratulations, you were assigned VIP rights!", this.config);
        }
        receiveAction(this, "vip", handlerVIP); 
    }

    requestGameStart()
    {
        sendAction(this, "start");
    }
}