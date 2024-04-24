import GridMapper from "js/pq_games/layout/gridMapper";
import CONFIG from "../js_shared/config";
import PandaqiWords from "js/pq_words/main";
import WordData from "js/pq_words/wordData";
import createContext from "js/pq_games/layout/canvas/createContext";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import equidistantColorsBetweenOpposites from "./tools/equidistantColorsBetweenOpposites";
import createWavyRect from "./tools/createWavyRect";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import Color from "js/pq_games/layout/color/color";
import ColorLike from "js/pq_games/layout/color/colorLike";

export default class WordCards
{
    words: WordData[];
    gridMapper: GridMapper;
    pqWords: PandaqiWords;
    
    constructor() { }

    generate()
    {
        if(!CONFIG.generateWords) { return; }

        this.setup();
        this.pickWords();
    }

    setup()
    {
        const dims = CONFIG.wordCards.dims[CONFIG.itemSize ?? "regular"];

        const gridConfig = { pdfBuilder: CONFIG.pdfBuilder, dims: dims, dimsElement: CONFIG.wordCards.dimsElement };
        const gridMapper = new GridMapper(gridConfig);
        this.gridMapper = gridMapper; 

        const itemSize = gridMapper.getMaxElementSize();
        CONFIG.wordCards.size = itemSize.clone();
    }
    
    pickWords()
    {        
        const wordsNeeded = CONFIG.wordCards.num * CONFIG.wordCards.numPerCard;
        this.words = CONFIG.pandaqiWords.getRandomMultiple(wordsNeeded, true);
    }

    async draw()
    {
        if(!CONFIG.generateWords) { return []; }

        const numCards = CONFIG.wordCards.num;
        const wordsPerCard = CONFIG.wordCards.numPerCard;
        const blockHeight = CONFIG.wordCards.size.y / wordsPerCard;
        const amp = CONFIG.wavyRect.amplitude * blockHeight;
        const wavyRectSize = new Point(CONFIG.wordCards.size.x, blockHeight + 4*amp);
        const wavyRect = createWavyRect(wavyRectSize, amp, CONFIG.wavyRect.frequency, CONFIG.wavyRect.stepSize);

        const promises = [];
        for(let i = 0; i < numCards; i++)
        {
            const words = this.words.splice(0,4);
            promises.push(this.drawCard(words, wavyRect, wordsPerCard, blockHeight));
        }
        const canvases = await Promise.all(promises);
        this.gridMapper.addElements(canvases.flat());

        return this.gridMapper.getCanvases();
    }

    async drawCard(words:WordData[], wavyRect:ResourceShape, wordsPerCard:number, blockHeight:number)
    {
        const textConfig = CONFIG.cards.textConfig;
        textConfig.size = CONFIG.wordCards.textScale * blockHeight;

        const subTextConfig = CONFIG.cards.subTextConfig;

        const itemSize = CONFIG.wordCards.size;
        const ctx = createContext({ size: itemSize });
        const saturation = CONFIG.inkFriendly ? 0 : CONFIG.wavyRect.saturation;
        const lightness = CONFIG.inkFriendly ? 100 : CONFIG.wavyRect.lightness;
        const colors = equidistantColorsBetweenOpposites(wordsPerCard, saturation, lightness);
        const textDarken = CONFIG.cards.textDarkenFactor;

        const amp = CONFIG.wavyRect.amplitude * blockHeight;

        for(let a = 0; a < wordsPerCard; a++)
        {
            const color = colors[a];
            let textColor = color.getHighestContrast([color.darken(textDarken), color.lighten(textDarken)]);
            if(CONFIG.inkFriendly) { textColor = Color.BLACK; }

            const topOffset = a == 0 ? -2*amp : 0;
            const canvOp = new LayoutOperation({
                translate: new Point(0, blockHeight*a + topOffset),
                fill: color,
                stroke: "#000000",
                strokeWidth: 1,
            });
            await wavyRect.toCanvas(ctx, canvOp);

            const wordData = words[a];
            const text = new ResourceText({ text: wordData.getWord(), textConfig: textConfig })

            canvOp.translate = new Point(0, blockHeight * a - amp);
            canvOp.dims = new Point(itemSize.x, blockHeight);
            canvOp.fill = new ColorLike(textColor);
            await text.toCanvas(ctx, canvOp);

            canvOp.translate.y += 0.715*textConfig.size;
            canvOp.alpha = 0.66

            subTextConfig.size = 0.3 * CONFIG.wordCards.textScale * blockHeight;
            const subText = new ResourceText({ text: wordData.getMetadata().cat, textConfig: subTextConfig });
            await subText.toCanvas(ctx, canvOp);
        }

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = CONFIG.cards.outline.color;
        ctx.lineWidth = CONFIG.cards.outline.width * itemSize.x;
        ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();

        return ctx.canvas;
    }
}