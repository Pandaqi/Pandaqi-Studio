import { listenForEvent, sendEvent } from "./events";
import { PeerfulConfig } from "./peerfulGame";

export const LOG_EVENT_NAME = "log";
export const log = (data:any, config:PeerfulConfig) => 
{
    sendEvent(LOG_EVENT_NAME, data, config);
}

export class Logger
{
    node: HTMLElement;
    config: PeerfulConfig;

    constructor(config:PeerfulConfig)
    {
        this.config = config;
        this.setupEvents();
        this.createHTML();
    }

    setupEvents()
    {
        listenForEvent(LOG_EVENT_NAME, (ev:CustomEvent) => {
            this.log(ev.detail);
        }, this.config)
    }

    createHTML()
    {
        const cont = document.createElement("div");
        cont.classList.add("log-container");
        this.config.node.appendChild(cont);
        this.node = cont;
    }

    log(data:any)
    {
        if(!this.config.debug) { return; }

        if(this.config.logToConsole)
        {
            if(Array.isArray(data)) { console.log(...data); }
            else { console.log(data); }
        }

        if(this.config.logToScreen)
        {
            this.node.appendChild(this.createMessageHTML(data));
        }
    }

    createMessageHTML(data)
    {
        const div = document.createElement("div");
        div.innerHTML = data.toString();
        return div;
    }
}