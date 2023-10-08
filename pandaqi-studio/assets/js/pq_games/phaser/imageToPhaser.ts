import LayoutOperation from "../layout/layoutOperation";
import ResourceImage from "../layout/resources/resourceImage";
import effectToPhaser from "./effectToPhaser";

const imageToPhaser = (img:ResourceImage, op:LayoutOperation, game) => 
{
    const sprite = game.add.sprite(op.translate.x, op.translate.y, img.getUniqueKey());
    sprite.displayWidth = op.dims.x;
    sprite.displayHeight = op.dims.y;
    sprite.setOrigin(op.pivot.x, op.pivot.y);
    sprite.setFrame(op.frame);

    for(const effect of op.effects)
    {
        effectToPhaser(effect, sprite);
    }

    return sprite;
}

export default imageToPhaser;