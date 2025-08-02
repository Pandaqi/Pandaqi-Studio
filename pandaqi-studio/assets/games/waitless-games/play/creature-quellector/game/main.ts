import Pack from "./pack"
import ResourceLoader from "js/pq_games/layout/resources/resourceLoader"
import GridMapper from "js/pq_games/layout/gridMapper"
import PdfBuilder from "js/pq_games/pdf/pdfBuilder";
import { PageFormat, PageOrientation } from "js/pq_games/pdf/pdfEnums";
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple"
import ProgressBar from "js/pq_games/website/progressBar"

import { CONFIG } from "../shared/config"
import takeBitesOutOfPath from "js/pq_games/tools/geometry/paths/takeBitesOutOfPath"
import Point from "js/pq_games/tools/geometry/point"
import LayoutOperation from "js/pq_games/layout/layoutOperation"
import Path from "js/pq_games/tools/geometry/paths/path"
import ResourceImage from "js/pq_games/layout/resources/resourceImage"
import { CATEGORIES, ELEMENTS } from "../shared/dict"
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas"
import createContext from "js/pq_games/layout/canvas/createContext"
import ResourceShape from "js/pq_games/layout/resources/resourceShape"
import Line from "js/pq_games/tools/geometry/line"
import Bounds from "js/pq_games/tools/numbers/bounds"
import fromArray from "js/pq_games/tools/random/fromArray"

type TypeStats = Record<string,TypeStat>

interface TypeStat {
    regular: number,
    action: number,
    total: number
}

export { Generator, TypeStats, TypeStat }
export default class Generator 
{
    constructor()
    {
        const userConfig = JSON.parse(window.localStorage[CONFIG.configKey] || "{}");
        Object.assign(CONFIG, userConfig);

        if(CONFIG.debugRandomizeTypes)
        {
            const customElements = {
                red: fromArray(["fire", "electric", "star", "dragon"]),
                blue: fromArray(["water", "ice", "poison", "weather"]),
                green: fromArray(["earth", "grass", "rock", "bug"]),
                purple: fromArray(["air", "magic", "ghost", "dark"])
            }
            CONFIG.elements = customElements;
        }

        CONFIG.progressBar = new ProgressBar();
        CONFIG.progressBar.setPhases(["Loading Assets", "Creating Cards", "Preparing PDF", "Done!"]);
    }

    async start()
    {
        await this.loadAssets();
        const packs = this.createPacks();
        await this.drawPacks(packs);
        await this.downloadPDF();
        CONFIG.progressBar.gotoNextPhase();
    }

    async loadAssets()
    {
        CONFIG.progressBar.gotoNextPhase();

        const resLoader = new ResourceLoader({ base: CONFIG.assetsBase });
        for(const [key,data] of Object.entries(CONFIG.assets))
        {
            resLoader.planLoad(key, data);
        }
        await resLoader.loadPlannedResources();
        CONFIG.resLoader = resLoader;

        // convert image icons into ones with a random cutout
        await this.bakeCutoutInto("icons");
        await this.bakeCutoutInto("icons_actions");

        if(CONFIG.multiType)
        {
            await this.createMultiTypeIcons("icons");
        }

        const pdfBuilderConfig = { orientation: PageOrientation.PORTRAIT, format: CONFIG.pageSize as PageFormat };
        const pdfBuilder = new PdfBuilder(pdfBuilderConfig);
        CONFIG.pdfBuilder = pdfBuilder;

        const size = CONFIG.cards.size[CONFIG.itemSize ?? "regular"];

        const gridConfig = { pdfBuilder: pdfBuilder, size: size, sizeElement: CONFIG.cards.sizeElement };
        const gridMapper = new GridMapper(gridConfig);
        CONFIG.gridMapper = gridMapper;     

        CONFIG.cards.sizeResult = gridMapper.getMaxElementSize();
    }

    createPacks() : Pack[]
    {
        CONFIG.progressBar.gotoNextPhase();

        let elemDict : Record<string,string> = CONFIG.elements;

        const numElementUsed:TypeStats = {}        
        for(const [element,subtype] of Object.entries(elemDict))
        {
            numElementUsed[subtype] = { regular: 0, action: 0, total: 0 };
        }

        // to get a quick reference about what type counters what other type
        // and a reverse dictionary to quickly look up main type from sub type
        const elementCycleSubtype = ["","","",""];
        const elemDictReverse:Record<string,string> = {};
        CONFIG.gameplay.elementCycleSubtype = elementCycleSubtype;
        CONFIG.elementsReverse = elemDictReverse;
        for(const [element, subtype] of Object.entries(elemDict))
        {
            const idx = CONFIG.gameplay.elementCycle.indexOf(element);
            elementCycleSubtype[idx] = subtype;
            elemDictReverse[subtype] = element;
        }

        const packs = [];    
        let counter = 0;  
        if(CONFIG.debugSingleCard) { elemDict = { "red": elemDict.red } }

        const numElements = Object.keys(elemDict).length;
        for(const [element,subtype] of Object.entries(elemDict))
        {
            const progressText = "Creating element " + element + " => " + subtype + " (" + counter + "/" + numElements + ")"
            CONFIG.progressBar.setInfo(progressText);
            const p = new Pack(element, subtype);
            p.createCards(numElementUsed);
            packs.push(p);
            counter++;
        }

        return packs;
    }

    async bakeCutoutInto(key:string)
    {
        const iconRes = CONFIG.resLoader.getResource(key) as ResourceImage;
        const numFrames = iconRes.countFrames();
        let newCanvases = [];
        
        const bgTypes = ["red", "blue", "green", "purple"];
        const frameSize = 512;
        const biteSize = { min: 0.05*frameSize, max: 0.15*frameSize };
        const isAction = (key == "icons_actions");

        for(let i = 0; i < numFrames; i++)
        {
            const categoryData = CATEGORIES[ bgTypes[Math.floor(i / 4)] ];
            let col = categoryData.color;
            let colPattern = categoryData.colorDark;
            if(CONFIG.inkFriendly) 
            { 
                col = CONFIG.cards.icon.backgroundInkFriendly; 
                colPattern = CONFIG.cards.icon.backgroundDarkInkFriendly;
            }

            // grab only this frame
            const img = iconRes.getImageFrameAsResource(i);
            const op = new LayoutOperation();

            // fill background with correct color
            const ctx = createContext({ size: img.size });
            ctx.clip(this.getFunkyClipPath(img.size, biteSize).toPath2D());
            fillCanvas(ctx, col);

            // if an action, also add a pattern
            if(isAction)
            {
                await this.addActionPattern(ctx, colPattern);
            }

            const canv = await img.toCanvas(ctx, op);
            newCanvases.push(canv);
        }

        const newFrames = await convertCanvasToImageMultiple(newCanvases, true);
        for(let i = 0; i < numFrames; i++)
        {
            await iconRes.swapFrame(i, newFrames[i]);
        }
    }

    async addActionPattern(ctx:CanvasRenderingContext2D, col:string)
    {
        const numLines = 5;
        const size = new Point(ctx.canvas.width, ctx.canvas.height);
        const op = new LayoutOperation({
            stroke: col,
            strokeWidth: CONFIG.cards.actionIconPatternStrokeWidth * ctx.canvas.width,
            alpha: CONFIG.cards.actionIconPatternAlpha,
        })

        let stepSize = size.x / numLines;

        for(let i = -1; i <= (numLines+1); i++)
        {
            const start = new Point(stepSize*i, size.y);
            const end = new Point(stepSize*(i+1), 0);
            const l = new Line(start, end);
            const res = new ResourceShape({ shape: l });
            await res.toCanvas(ctx, op);
        }
    }

    async createMultiTypeIcons(key:string)
    {
        const res = new ResourceImage();

        // for this spritesheet, we only grab the 4 types actually used in the game
        // (because multityping them, we get 4x4 = 16 icons in total that way)
        const framesUsed = [];

        // given by user, maps main type (e.g. red) to sub type (e.g. fire)
        let elemDict : Record<string,string> = CONFIG.elements;
        for(const [mainType, subType] of Object.entries(elemDict))
        {
            framesUsed.push(ELEMENTS[subType].frame);
        }

        const iconRes = CONFIG.resLoader.getResource(key) as ResourceImage;
        const newCanvases = [];

        for(let i = 0; i < 4; i++)
        {
            const img1 = iconRes.getImageFrameAsResource(framesUsed[i]);

            for(let j = 0; j < 4; j++)
            {
                // just a triangle from top left
                const clipPath1 = [
                    new Point(),
                    new Point(img1.size.x, 0),
                    new Point(0, img1.size.y)
                ]

                // image 1 is added fully
                const ctx = createContext({ size: img1.size });
                const op1 = new LayoutOperation({
                    clip: new Path({ points: clipPath1 })
                })
                await img1.toCanvas(ctx, op1);

                // and a triangle from bottom right
                const clipPath2 = [
                    new Point(img1.size.x, 0),
                    img1.size.clone(),
                    new Point(0, img1.size.y)
                ]

                // image 2 is added with a clip so it only shows half (cut diagonally)
                const img2 = iconRes.getImageFrameAsResource(framesUsed[j]);
                const op2 = new LayoutOperation({
                    clip: new Path({ points: clipPath2 })
                });

                const canv = await img2.toCanvas(ctx, op2);
                newCanvases.push(canv);
            }
        }

        const newFrames = await convertCanvasToImageMultiple(newCanvases, true);
        for(const frame of newFrames)
        {
            await res.addFrame(frame);
        }

        console.log(res);

        CONFIG.multiTypeImageResource = res;
    }

    getFunkyClipPath(size:Point, bounds = { min: 3, max: 6 }) : Path
    {
        const path = [
            new Point(),
            new Point(size.x, 0),
            new Point(size.x, size.y),
            new Point(0, size.y),
            new Point() // to close it
        ]
        const chunkSize = 0.5*(bounds.min + bounds.max);
        const funkyPath = takeBitesOutOfPath({ path: path, biteBounds: bounds, chunkSize: chunkSize, chunksInterval: new Bounds(6, 11) });
        return new Path({ points: funkyPath });
    }

    async drawPacks(packs:Pack[])
    {
        const promises = [];
        for(const pack of packs)
        {
            promises.push(pack.draw());
        }

        const canvases = await Promise.all(promises);
        CONFIG.gridMapper.addElements(canvases.flat());
    }

    async downloadPDF()
    {
        CONFIG.progressBar.gotoNextPhase();

        const images = await convertCanvasToImageMultiple(CONFIG.gridMapper.getCanvases());
        if(CONFIG.debugWithoutPDF)
        {
            for(const img of images) { 
                img.style.maxWidth = "100%";
                document.body.appendChild(img);
            }
            return;
        }

        CONFIG.pdfBuilder.addImages(images);
        const pdfConfig = { customFileName: CONFIG.fileName }
        CONFIG.pdfBuilder.downloadPDF(pdfConfig);
    }
}

new Generator().start();