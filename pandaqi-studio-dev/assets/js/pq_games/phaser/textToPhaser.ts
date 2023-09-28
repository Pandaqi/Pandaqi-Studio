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
        width: op.dims.x,
        useAdvancedWrap: true
    }

    cfg.color = op.fill.toHEX();
    cfg.stroke = op.stroke.toHEX();
    cfg.strokeThickness = op.strokeWidth;

    // @TODO: also support shadow?

    // create text
    const text = game.add.text(op.translate.x, op.translate.y, res.text, cfg);
    
    // make sure its alignment/placement is correct
    const pivot = op.pivot.clone();
    if(res.textConfig.alignVertical == TextAlign.START) { pivot.y = 0.0; }
    else if(res.textConfig.alignVertical == TextAlign.MIDDLE) { pivot.y = 0.5; }
    else if(res.textConfig.alignVertical == TextAlign.END) { pivot.y = 1.0; }
    text.setOrigin(pivot.x, pivot.y);

    return text;
}

export default textToPhaser;