import GridMapper from "js/pq_games/layout/gridMapper";
import CONFIG from "./config";
import PandaqiWords from "js/pq_words/main";
import WordData from "js/pq_words/wordData";
import createContext from "js/pq_games/layout/canvas/createContext";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import equidistantColorsBetweenOpposites from "./tools/equidistantColorsBetweenOpposites";
import createWavyRect from "./tools/createWavyRect";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";

export default class WordCards
{
    words: WordData[];
    gridMapper: GridMapper;
    
    constructor() { }

    async generate()
    {
        if(!CONFIG.generateWords) { return; }

        this.setup();
        await this.pickWords();
    }

    setup()
    {
        const dims = CONFIG.wordCards.dims[CONFIG.cardSize ?? "regular"];

        const gridConfig = { pdfBuilder: CONFIG.pdfBuilder, dims: dims, dimsElement: CONFIG.wordCards.dimsElement };
        const gridMapper = new GridMapper(gridConfig);
        this.gridMapper = gridMapper; 

        const cardSize = gridMapper.getMaxElementSize();
        CONFIG.wordCards.size = cardSize.clone();
    }
    
    async pickWords()
    {
        const pqWords = new PandaqiWords();
        const wordParams = {}; // @TODO: read/set this
        await pqWords.loadWithParams(wordParams);
        const wordsNeeded = CONFIG.wordCards.num * CONFIG.wordCards.numPerCard;
        this.words = pqWords.getRandomMultiple(wordsNeeded, true);
    }

    async draw()
    {
        if(!CONFIG.generateWords) { return []; }

        const numCards = CONFIG.wordCards.num;
        const wordsPerCard = CONFIG.wordCards.numPerCard;
        const blockHeight = CONFIG.wordCards.size.y / wordsPerCard;
        const wavyRectSize = new Point(CONFIG.wordCards.size.x, blockHeight);
        const wavyRect = createWavyRect(wavyRectSize, 5, 5, 3);

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
        textConfig.size = CONFIG.cards.textScale * blockHeight;

        const ctx = createContext({ size: CONFIG.wordCards.size });
        const saturation = CONFIG.inkFriendly ? 0 : 85;
        const colors = equidistantColorsBetweenOpposites(wordsPerCard, saturation, 50);
        const textDarken = CONFIG.cards.textDarkenFactor;

        for(let a = 0; a < wordsPerCard; a++)
        {
            const color = colors[a];
            const canvOp = new LayoutOperation({
                translate: new Point(0, blockHeight*a),
                fill: color
            });
            await wavyRect.toCanvas(ctx, canvOp);

            const wordData = words[a];
            const text = new ResourceText({ text: wordData.getWord(), textConfig: textConfig })

            canvOp.translate.y += 0.5*blockHeight;
            canvOp.fill = color.darken(textDarken);
            await text.toCanvas(ctx, canvOp);
        }

        return ctx.canvas;
    }
}