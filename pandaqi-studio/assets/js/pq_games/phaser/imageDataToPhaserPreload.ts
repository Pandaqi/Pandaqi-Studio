export default (key:string, res:Record<string,any>, game) =>
{
    const path = res.path;
    const sheetData = {
        frameWidth: res.frames.x,
        frameHeight: res.frames.y
    }

    const isSingleFrame = (res.frames.x*res.frames.y <= 1);

    if(isSingleFrame) {
        game.load.image(key, path);
    } else {
        game.load.spritesheet(key, path, sheetData);
    }
}