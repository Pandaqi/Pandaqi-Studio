import { PeerfulComponent } from "../peerfulGame";
import QRCode from "./qrcode";
import QrScanner from './qr-scanner.min.js';

export const displayQRCode = (obj: PeerfulComponent) =>
{
    const elem = document.createElement("div");
    const qrcode = new QRCode(elem, {
        text: obj.roomCode,
        width: 128,
        height: 128,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
    return elem;
}

export const scanQRCode = (node:HTMLElement) =>
{
    const videoElem = document.createElement("video");
    node.appendChild(videoElem)

    return new Promise((resolve, reject) => {
        const qrScanner = new QrScanner(
            videoElem,
            (result) => { 
                console.log('Decoded QR code:', result);
                resolve(result)
            },
        );
    })
    
}