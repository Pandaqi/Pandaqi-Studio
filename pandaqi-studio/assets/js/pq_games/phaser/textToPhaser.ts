import Color from "../layout/color/color";
import LayoutOperation from "../layout/layoutOperation";
import ResourceText from "../layout/resources/resourceText";
import { TextAlign } from "../layout/text/textConfig";
import textConfigToPhaser from "./textConfigToPhaser";

const textToPhaser = (res:ResourceText, op:LayoutOperation, game) =>
{
    // convert the text config basics
    const cfg = textConfigToPhaser(res.textConfig);
 
    // enhance with extra properties (from resource or layout operation)
    cfg.wordWrap = {
        width: op.size.x,
        useAdvancedWrap: true
    }

    cfg.color = (op.fill.get() as Color).toHEX();
    cfg.stroke = (op.stroke.get() as Color).toHEX();
    cfg.strokeThickness = op.strokeWidth;

    // @TODO: also support shadow?

    // create text
    const text = game.add.text(op.pos.x, op.pos.y, res.text, cfg);
    
    // make sure its alignment/placement is correct
    const pivot = op.pivot.clone();
    if(res.textConfig.alignHorizontal == TextAlign.START) { pivot.x = 0.0; }
    else if(res.textConfig.alignHorizontal == TextAlign.MIDDLE) { pivot.x = 0.5; }
    else if(res.textConfig.alignHorizontal == TextAlign.END) { pivot.x = 1.0; }

    if(res.textConfig.alignVertical == TextAlign.START) { pivot.y = 0.0; }
    else if(res.textConfig.alignVertical == TextAlign.MIDDLE) { pivot.y = 0.5; }
    else if(res.textConfig.alignVertical == TextAlign.END) { pivot.y = 1.0; }
    text.setOrigin(pivot.x, pivot.y);
    
    text.setAlpha(op.alpha);
    text.setRotation(op.rot);
    if(op.hasDepth()) { text.setDepth(op.depth) };

    return text;
}

export default textToPhaser;