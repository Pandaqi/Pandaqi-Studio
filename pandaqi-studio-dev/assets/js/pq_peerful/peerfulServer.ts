import { sendEvent } from "./events";
import { log } from "./log";
import { GameState, PeerfulConfig, PeerfulLoginData } from "./main";
import { answerQuestion, receiveAction } from "./peerfulUtilities";
import instantiatePhaser from "./phaser";
import { joinRoom, selfId } from './trystero-torrent.min.js';

export default class PeerfulServer
{
    state: GameState;

    roomCode: string;
    room: any;
    idToUsn: Record<string, string>;
    playerNames: string[];
    config: PeerfulConfig;
    phaser: any;

    // callbacks to plug into by the actual game
    // @TODO: extend to more general functionality where a player can have any data attached (username, profile pic, hidden role, etcetera?)
    // @TODO: Switch to custom events signaling?
    onPlayerJoined: Function;
    onPlayerThrown: Function;

    onClose: Function;
    onOpen: Function;

    onReconnectDataAsked: Function;

    constructor(roomCode:string, config:PeerfulConfig)
    {
        this.config = config;
        this.roomCode = roomCode;
        
        this.preparePhaser();

        this.room = joinRoom(config, roomCode);
        this.prepareActions();
        this.changeState(GameState.GAMELOGIN);
    }

    changeState(s:GameState)
    {
        this.state = s;
        if(this.state == GameState.GAMELOGIN)
        {
            this.openToPublic();
            this.idToUsn = {};
            
            log("Game ready for logins (code = " + this.roomCode + ").", this.config);
        }
        else if(this.state == GameState.GAME)
        {
            this.closeToPublic();
            // remember all original player names now to support reconnects later
            this.playerNames = Object.values(this.idToUsn);  
            
            log("Game should start!", this.config);
            sendEvent("game-start", null, this.config);
        }
        else if(this.state == GameState.GAMEOVER) 
        {
            // @TODO?
        }
    }

    getPhaserGame() { return this.phaser; }
    preparePhaser()
    {
        if(!this.config.phaserEnabled) { return; }
        this.phaser = instantiatePhaser(this.config);
    }

    prepareActions()
    {
        // the trigger to start the game
        receiveAction(this, "start", (data, peerID) => { this.changeState(GameState.GAME); })

        // save usernames sent by connecting players
        receiveAction(this, "usn", (data, peerID) => { this.joinPlayer(peerID, data); });

        // supply reconnecting players with the necessary data to hop back in
        const handler = (data) => 
        {
            if(!this.onReconnectDataAsked) { return null; }
            return this.onReconnectDataAsked(data);
        }
        answerQuestion(this, "reconnect", handler);
    }

    closeToPublic()
    {
        this.room.onPeerJoin((peerID) => {
            log("Player attempted to join (but room is closed) with id: " + peerID, this.config);
        })

        this.room.onPeerLeave((peerID) => {
            log("Player attempted to leave (but room is closed) with id: " + peerID, this.config);
        })

        if(this.onClose) { this.onClose(); }
    }

    openToPublic()
    {
        // @NOTE: newer callbacks overwrite previous once; only last set is executed
        this.room.onPeerJoin(async (peerID) => {
            log("Player joined with ID: " + peerID, this.config)

            // give the player data needed to finalize logins
            const [sendData,getData] = this.room.makeAction("checklogin");
            sendData(this.buildLoginData());
        })

        this.room.onPeerLeave((peerID) => {
            log("Player left with ID: " + peerID, this.config);
            this.cleanupPlayer(peerID);
        })

        if(this.onOpen) { this.onOpen(); }
    }

    buildLoginData() : PeerfulLoginData
    {
        return {
            auth: selfId,
            state: this.state,
            names: (this.state != GameState.GAMELOGIN) ? this.playerNames : Object.values(this.idToUsn)
        }
    }

    cleanupPlayer(peerID:string)
    {
        this.throwPlayer(peerID);
    }

    joinPlayer(id:string, usn:string)
    {
        this.idToUsn[id] = usn;
        log("Player username (" + usn + ") saved for ID " + id, this.config);
        if(this.onPlayerJoined) { this.onPlayerJoined(id, usn); }
    }

    throwPlayer(id:string)
    {
        const usn = this.idToUsn[id];
        if(!usn) { return; }
        log("Player thrown from the server (username = " + usn + ", id = " + id + ").", this.config);
        delete this.idToUsn[id];
        if(this.onPlayerThrown) { this.onPlayerThrown(id, usn); }
    }
}