


/* 

OLD CODE for "retry X times until image successfully decodes"
Was a bad idea anyway, not needed anymore with cleaner code and better cashing


const RETRY_INTERVAL = 500;
const MAX_TRIES = 10;
const rejectDelay = (reason) => 
{
return new Promise(function(resolve, reject) {
    setTimeout(reject.bind(null, reason), RETRY_INTERVAL); 
});
}

const decode = () => { return image.decode(); }
let p:Promise<any> = Promise.reject();
for(let i = 0; i < MAX_TRIES; i++) {
    p = p.catch(decode).catch(rejectDelay);
}
await p;

*/

export default async (canvas:HTMLCanvasElement) : Promise<HTMLImageElement> =>
{
    let image = new Image();
    image.src = canvas.toDataURL();
    await image.decode();
    image.dataset.index = canvas.dataset.index ?? "0";
    return image;
}