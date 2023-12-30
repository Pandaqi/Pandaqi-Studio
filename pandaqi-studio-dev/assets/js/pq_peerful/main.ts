import { listenForEvent } from './events.js';
import { Logger, log } from './log.js';
import PeerfulClient from './peerfulClient.js';
import PeerfulServer from './peerfulServer.js';
import { joinRoom, selfId, getTrackers } from './trystero-torrent.min.js';
import { UUID } from "./qr/uuid.js";

const DEF_NAME_BOUNDS = { min: 4, max: 12 };
const DEF_ROOM_CODE_LENGTH_BOUNDS = { min: 4, max: 6 };
const DEF_ROOM_USED_TIMEOUT = 3000;
const DEF_MAX_ROOM_CODE_RETRIES = 15;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type PeerfulComponent = PeerfulClient | PeerfulServer

interface PeerfulConfig
{
    debug?: boolean,
    node?: HTMLElement,
    appId: string,

    useQRCode?: boolean, // if true, creates UUID room codes, and a button to scan them

    serverClass?: any,
    clientClass?: any,

    connectAllToAll?: boolean, // for games without an external main screen; device-to-device only

    nameBounds?: { min: number, max: number }
    roomCodeLength?: { min: number, max: number } 
    roomUsedTimeout?: number

    logToConsole?: boolean
    logToScreen?: boolean
}

interface PeerfulLoginData
{
    auth: string,
    state: GameState,
    names: string[]
}

enum PeerType
{
    CLIENT,
    SERVER
}

enum GameState
{
    GAMELOGIN,
    GAME,
    GAMEOVER
}

export { PeerfulConfig, PeerfulLoginData, PeerfulComponent, GameState, PeerfulGame }
export default class PeerfulGame
{
    server: PeerfulServer
    client: PeerfulClient
    roomCodeInput: HTMLInputElement
    nameInput: HTMLInputElement
    config: PeerfulConfig
    logger: Logger

    constructor(config:PeerfulConfig)
    {
        this.config = config;
        this.config.node = this.config.node ?? document.body;

        this.logger = new Logger(this.config);
        log("Self ID: " + selfId, this.config);

        this.createHTML();
    }

    createHTML()
    {
        const cont = document.createElement("div");
        cont.classList.add("peerful-login");

        const successHandler = (val) => { cont.remove(); }
        listenForEvent("peer-creation-success", successHandler, this.config.node);

        const subCont = document.createElement("div");
        cont.appendChild(subCont);
        subCont.classList.add("peerful-login-container");

        const roomCodeInput = document.createElement("input");
        subCont.appendChild(roomCodeInput);
        this.roomCodeInput = roomCodeInput;
        roomCodeInput.classList.add("peerful-input-room-code");
        roomCodeInput.type = "text";
        roomCodeInput.placeholder = "... room code here ...";

        const nameInput = document.createElement("input");
        subCont.appendChild(nameInput);
        this.nameInput = nameInput;
        nameInput.classList.add("peerful-input-username");
        nameInput.type = "text";
        nameInput.placeholder = "... username here ...";

        const createButton = document.createElement("button");
        subCont.appendChild(createButton);
        createButton.classList.add("peerful-button-new-game");
        createButton.innerHTML = "Create New Game";
        createButton.addEventListener("click", (ev) => {
            this.addServer();
        });

        const joinButton = document.createElement("button");
        subCont.appendChild(joinButton);
        joinButton.classList.add("peerful-button-join-game");
        joinButton.innerHTML = "Join Game";
        joinButton.addEventListener("click", (ev) => {
            this.addClient();
        });

        const anchor = this.config.node;
        anchor.appendChild(cont);
    }

    isUserNameValid()
    {
        const val = this.getUserName();
        const nameBounds = this.config.nameBounds ?? DEF_NAME_BOUNDS;
        const wrongLength = val.length < nameBounds.min || val.length > nameBounds.max;
        if(wrongLength) { return [false, "Username wrong length."]; }
        return [true, ""];
    }

    async isRoomCodeValid()
    {
        const val = this.getRoomCode();
        const codeLengthBounds = this.config.roomCodeLength ?? DEF_ROOM_CODE_LENGTH_BOUNDS;
        const wrongLength = val.length < codeLengthBounds.min || val.length > codeLengthBounds.max;
        if(wrongLength) { return [false, "Room code is an impossible length."]; } // @TODO: return actual error message

        const room = joinRoom(this.config, val);
        const [sendData,getData] = room.makeAction("checklogin");
        const roomDataPromise : Promise<PeerfulLoginData> = new Promise((resolve, reject) => {
            getData((data, peerID) => {
                resolve(data);
            });
        });
        const wrongRoom = !await this.roomAlreadyUsed(room, PeerType.CLIENT);
        if(wrongRoom) { room.leave(); return [false, "Room doesn't exist."]; }

        const usn = this.getUserName();
        const data = await roomDataPromise;
        const gameAlreadyStarted = data.state != GameState.GAMELOGIN;
        const userNameExists = data.names.includes(usn);
        if(gameAlreadyStarted && !userNameExists) { room.leave(); return [false, "Game already started; username doesn't exist."]; }
    
        room.leave();
        return [true, ""];
    }

    getUserName()
    {
        return this.nameInput.value.trim();
    }

    getRoomCode()
    {
        return this.roomCodeInput.value.trim().toUpperCase();
    }

    generateRandomRoomCode()
    {
        if(this.config.useQRCode) { return UUID.generate(); }
        
        const codePieces = [];
        const codeLengthBounds = this.config.roomCodeLength ?? DEF_ROOM_CODE_LENGTH_BOUNDS;
        const codeLength = codeLengthBounds.min + Math.floor(Math.random() * (codeLengthBounds.max - codeLengthBounds.min + 1));
        for(let i = 0; i < codeLength; i++)
        {
            const randIndex = Math.floor(Math.random() * ALPHABET.length);
            codePieces.push(ALPHABET.charAt(randIndex));
        }

        return codePieces.join("");
    }

    async getRandomRoomCode()
    {
        let roomAlreadyUsed = true;
        let code = "";

        let numTries = 0;
        const maxTries = DEF_MAX_ROOM_CODE_RETRIES;
        while(roomAlreadyUsed && numTries < maxTries)
        {
            code = this.generateRandomRoomCode();
            
            const room = joinRoom(this.config, code);
            const [sendData,getData] = room.makeAction("checklogin");
            roomAlreadyUsed = await this.roomAlreadyUsed(room, PeerType.SERVER);
            room.leave();
            numTries++;
        }

        if(numTries >= maxTries) { return null; }
        return code;
    }

    async roomAlreadyUsed(room, peerType: PeerType) : Promise<boolean>
    {
        // somehow, without a timeout the whole promise never resolves? 
        // @TODO: figure out exact reason for this as it's probably something obvious I'm missing.
        await new Promise(res => setTimeout(res, 10));        

        const timeout = this.config.roomUsedTimeout ?? DEF_ROOM_USED_TIMEOUT;
        return new Promise((resolve, reject) => 
        {
            // when debugging on localhost, just insta join without checks
            if(this.config.debug)
            {
                if(peerType == PeerType.CLIENT) { resolve(true); }
                else if(peerType == PeerType.SERVER) { resolve(false); }
            }    

            // keep polling peers until there's a true return
            const interval = setInterval(() => {
                if(Object.keys(room.getPeers()).length > 0) { clearInterval(interval); resolve(true); }
            }, 33);

            // until timeout is reached and we bail because there's probably no room there
            setTimeout(() => { clearInterval(interval); resolve(false) }, timeout);            
        });
    }


    // utility functions to quickly reach something you'll need often
    getPeer() { return this.client ? this.client : this.server; }
    getRoom() { return this.getPeer().room; }

    getServer() { return this.server; }
    async addServer()
    {
        const code = await this.getRandomRoomCode();
        if(!code) { return; }
        this.roomCodeInput.value = code; // save generated code for easy use in client logic too
        this.server = new PeerfulServer(code, this.config);

        // if true P2P, the server creator also becomes a client, so immediately invoke that
        if(this.config.connectAllToAll) { this.addClient(); }
    }

    getClient() { return this.client; }
    async addClient()
    {
        const [usnValid, usnError] = this.isUserNameValid();
        if(!usnValid) { log(usnError, this.config); return; }

        const [codeValid, codeError] = await this.isRoomCodeValid();
        if(!codeValid) { log(codeError, this.config); return; }

        const usn = this.getUserName();
        const code = this.getRoomCode();
        this.client = new PeerfulClient(code, usn, this.config);
    }
}