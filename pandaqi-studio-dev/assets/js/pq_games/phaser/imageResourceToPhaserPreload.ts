import ResourceImage from "../layout/resources/resourceImage";

export default (res:ResourceImage, game) =>
{
    const key = res.getUniqueKey();
    const path = res.getSRCString();
    const sheetData = {
        frameWidth: res.frameSize.x,
        frameHeight: res.frameSize.y
    }

    if(res.isSingleFrame()) {
        game.load.image(key, path);
    } else {
        game.load.spritesheet(key, path, sheetData);
    }
}