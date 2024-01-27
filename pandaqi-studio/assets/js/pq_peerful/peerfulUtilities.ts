import { PeerfulComponent } from "./main";
import PeerfulClient from "./peerfulClient";

const sendAction = async (obj: PeerfulComponent, actionName:string, data:any = null, mask:string[] = undefined) =>
{
    const [send,receive] = obj.room.makeAction(actionName);
    if(!obj.config.connectAllToAll && obj instanceof PeerfulClient) { mask = [obj.authority]; }
    if(mask && !Array.isArray(mask)) { mask = [mask]; }
    return await send(data, mask);
}

const receiveAction = (obj: PeerfulComponent, actionName:string, callback:Function) =>
{
    const [send,receive] = obj.room.makeAction(actionName);
    receive(callback);
}

// this signals another peer that we want something (a- = ask)
// and listens for the response (z-) 
const askQuestion = (obj: PeerfulComponent, actionName: string, data:any = "", callback: Function) =>
{
    receiveAction(obj, "z-" + actionName, callback);
    sendAction(obj, "a-" + actionName, data);
}

// this receives the ask signal of another peer
// then replies with the listener signal and the correct data
const answerQuestion = (obj: PeerfulComponent, actionName: string, dataTransformation: Function) => 
{
    receiveAction(obj, "a-" + actionName, (data, peerID) => {
        const returnData = dataTransformation(data); // determine response
        sendAction(obj, "z-" + actionName, returnData, peerID); // send it, only to the asker
    });
}

export
{
    sendAction,
    receiveAction,
    askQuestion,
    answerQuestion
}