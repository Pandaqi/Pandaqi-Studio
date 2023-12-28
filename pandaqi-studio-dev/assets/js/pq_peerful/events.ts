import { PeerfulConfig } from "./main";


const sendEvent = (name:string, data:any = null, node:HTMLElement) => 
{
    const ev = new CustomEvent(name, { detail: data });
    node.dispatchEvent(ev);
}

const listenForEvent = (name:string, callback:EventListenerOrEventListenerObject, node:HTMLElement) => 
{
    node.addEventListener(name, callback);
}

const stopListeningForEvent = (name: string, callback: EventListenerOrEventListenerObject, node:HTMLElement) =>
{
    node.removeEventListener(name, callback);
}

export
{
    sendEvent,
    listenForEvent,
    stopListeningForEvent
}