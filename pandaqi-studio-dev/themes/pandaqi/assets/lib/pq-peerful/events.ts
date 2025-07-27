import { PeerfulConfig } from "./peerfulGame";

export const sendEvent = (name:string, data:any = null, config:PeerfulConfig) => 
{
    const ev = new CustomEvent(name, { detail: data });
    config.node.dispatchEvent(ev);
}

export const listenForEvent = (name:string, callback:EventListenerOrEventListenerObject, config:PeerfulConfig) => 
{
    config.node.addEventListener(name, callback);
}

export const stopListeningForEvent = (name: string, callback: EventListenerOrEventListenerObject, config:PeerfulConfig) =>
{
    config.node.removeEventListener(name, callback);
}