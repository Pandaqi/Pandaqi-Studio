import { WordData } from "lib/pq-words";
import equidistantColorsBetweenOpposites from "../game/tools/equidistantColorsBetweenOpposites";
import createWavyRect from "../game/tools/createWavyRect";
import { CONFIG } from "./config";
import { Vector2, createContext, Color, LayoutOperation, MaterialVisualizer, ResourceText } from "lib/pq-games";

export default class WordCard
{
    words: WordData[]
    
    constructor(w:WordData[])
    {
        this.words = w;
    }

    async draw(vis:MaterialVisualizer)
    {
        const wordsPerCard = this.words.length;
        const blockHeight = vis.size.y / wordsPerCard;
        const amp = CONFIG.wavyRect.amplitude * blockHeight;
        const wavyRectSize = new Vector2(vis.size.x, blockHeight + 4*amp);
        const wavyRect = createWavyRect(wavyRectSize, amp, CONFIG.wavyRect.frequency, CONFIG.wavyRect.stepSize);

        const textConfig = vis.get("cards.textConfig");
        textConfig.size = vis.get("wordCards.textScale") * blockHeight;

        const subTextConfig = vis.get("cards.subTextConfig");

        const ctx = createContext({ size: vis.size });
        const saturation = vis.inkFriendly ? 0 : CONFIG.wavyRect.saturation;
        const lightness = vis.inkFriendly ? 100 : CONFIG.wavyRect.lightness;
        const colors = equidistantColorsBetweenOpposites(wordsPerCard, saturation, lightness);
        const textDarken = vis.get("cards.textDarkenFactor");

        for(let a = 0; a < wordsPerCard; a++)
        {
            const color = colors[a];
            let textColor = color.getHighestContrast([color.darken(textDarken), color.lighten(textDarken)]);
            if(vis.inkFriendly) { textColor = Color.BLACK; }

            const topOffset = a == 0 ? -2*amp : 0;
            const canvOp = new LayoutOperation({
                pos: new Vector2(0, blockHeight*a + topOffset),
                fill: color,
                stroke: "#000000",
                strokeWidth: 1,
            });
            wavyRect.toCanvas(ctx, canvOp);

            const wordData = this.words[a];
            const text = new ResourceText(wordData.getWord(), textConfig)

            const opText = new LayoutOperation({
                pos: new Vector2(0, blockHeight * a - amp),
                size: new Vector2(vis.size.x, blockHeight),
                fill: textColor
            });
            text.toCanvas(ctx, opText);

            const opTextSub = new LayoutOperation({
                pos: new Vector2(0, blockHeight * a - amp + 0.715 * textConfig.size),
                size: new Vector2(vis.size.x, blockHeight),
                fill: textColor,
                alpha: 0.5
            })

            subTextConfig.size = 0.3 * vis.get("wordCards.textScale") * blockHeight;
            const subText = new ResourceText(wordData.getMetadata().cat, subTextConfig);
            subText.toCanvas(ctx, opTextSub);
        }

        return ctx.canvas;
    }
}