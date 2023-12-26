import { PeerfulConfig } from "./main";

const sendEvent = (name:string, data:any = null, config:PeerfulConfig) => 
{
    const ev = new CustomEvent(name, { detail: data });
    config.node.dispatchEvent(ev);
}

const listenForEvent = (name:string, callback:EventListenerOrEventListenerObject, config:PeerfulConfig) => 
{
    config.node.addEventListener(name, callback);
}

const stopListeningForEvent = (name: string, callback: EventListenerOrEventListenerObject, config: PeerfulConfig) =>
{
    config.node.removeEventListener(name, callback);
}

export
{
    sendEvent,
    listenForEvent,
    stopListeningForEvent
}