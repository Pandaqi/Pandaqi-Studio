import LayoutOperation from "js/pq_games/layout/layoutOperation"
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup"
import ResourceShape from "js/pq_games/layout/resources/resourceShape"
import ResourceText from "js/pq_games/layout/resources/resourceText"
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig"
import BoardVisualizer from "js/pq_games/tools/generation/boardVisualizer"
import Circle from "js/pq_games/tools/geometry/circle"
import Line from "js/pq_games/tools/geometry/line"
import Point from "js/pq_games/tools/geometry/point"
import Rectangle from "js/pq_games/tools/geometry/rectangle"
import PHOTOMONE_BASE_PARAMS from "../../../js_shared/config"
import Map from "../../../js_shared/map"
import { MapVisualizer, VisResult } from "../../../js_shared/mapVisualizer"
import WordsPhotomone from "../../../js_shared/wordsPhotomone"

export default class BoardGeneration
{
    cfg:Record<string,any>
    map:Map

    async draw(vis:BoardVisualizer) : Promise<ResourceGroup[]>
    {;
        this.setup(vis);
        await this.generate();
        return this.visualize(vis);
    }

    preparePointTypes(cfg)
    {
        const dict : Record<string,any> = cfg.pointTypesDictionary;
        const newDict = {};
        for(const [key, value] of Object.entries(dict))
        {
            if(value.expansion && !cfg.expansions[value.expansion]) { continue; }
            newDict[key] = value;
        }
        return newDict;
    }

    setup(vis:BoardVisualizer)
    {
        const userConfig = vis.config;
        this.cfg = Object.assign({}, PHOTOMONE_BASE_PARAMS);
        Object.assign(this.cfg, userConfig);

        this.cfg.pointTypesDictionary = this.cfg.pointTypesDictionaries.photomone;
        this.cfg.pointTypes = this.preparePointTypes(this.cfg);
        this.cfg.width = vis.size.x;
        this.cfg.height = vis.size.y;

        this.cfg.debugSmoothing = false; // @DEBUGGING (should be false)
        if(this.cfg.debugSmoothing) { this.cfg.smoothSteps = 1; }

        const minSize = Math.min(this.cfg.width, this.cfg.height);
        this.cfg.edgeMargin = 0.05*minSize;
        this.cfg.minDistBetweenPoints = 0.08*minSize;
        this.cfg.pointBounds = { min: minSize*0.15, max: minSize*0.175 };
        this.cfg.startingLineMaxDist = 2.5*this.cfg.minDistBetweenPoints;
        this.cfg.startingLinePointRadius = (this.cfg.pointRadiusFactor + 0.025)*minSize; // a small margin because it looks better

        this.cfg.createImage = !this.cfg.debugSmoothing;

        console.log(this.cfg);
    }

    async generate()
    {
        const WORDS = new WordsPhotomone();
        await WORDS.prepare(this.cfg);
        this.cfg.WORDS = WORDS;
        this.map = new Map(this.cfg);
        console.log(this.cfg);
        this.map.generate();
    }

    visualize(vis:BoardVisualizer)
    {
        const group = new ResourceGroup();

        const visualizerObject = new MapVisualizer(this.map);
        const visRes : VisResult = visualizerObject.getVisualization(this.cfg);

        for(const rect of visRes.rects)
        {
            console.log(rect);

            const rectObj = new Rectangle({ center: new Point(rect.p.x, rect.p.y), extents: new Point(rect.size.x, rect.size.y) });
            const op = new LayoutOperation({
                fill: rect.color,
                alpha: rect.alpha ?? 1
            })
            group.add(new ResourceShape(rectObj), op);
        }

        for(const line of visRes.lines)
        {
            const lineObj = new Line(line.p1, line.p2);
            const op = new LayoutOperation({
                stroke: line.color,
                strokeWidth: line.width,
                alpha: line.alpha,
            })
            group.add(new ResourceShape(lineObj), op);
        }

        for(const circ of visRes.circles)
        {
            const circObj = new Circle({ center: circ.p, radius: circ.radius });
            const op = new LayoutOperation({
                fill: circ.color
            });
            group.add(new ResourceShape(circObj), op);
        }

        for(const sprite of visRes.sprites)
        {
            const resSprite = PHOTOMONE_BASE_PARAMS.RESOURCE_LOADER.getResource(sprite.textureKey);
            const opSprite = new LayoutOperation({
                translate: sprite.p,
                rotation: sprite.rotation ?? 0,
                dims: new Point(sprite.size),
                frame: sprite.frame ?? 0,
                pivot: Point.CENTER
            })
            group.add(resSprite, opSprite);
        }

        for(const text of visRes.text)
        {
            let originX = 0;
            let originY = 0;
            if(text.textAlign == "center") { originX = 0.5; }
            if(text.textBaseline == "middle") { originY = 0.5; }
            const pivot = new Point(originX, originY);

            const op = new LayoutOperation({
                translate: text.p,
                dims: new Point(0.5*vis.size.y, 2*text.fontSize),
                fill: text.color ?? "#000000",
                stroke: text.stroke ?? "#FFFFFF",
                strokeWidth: text.strokeWidth ?? 0,
                rotation: text.rotation ?? 0,
                pivot: pivot
            })

            // @TODO: alignment is good now thanks to Phaser magic I don't really understand
            // if we ever move to my own raw system, reevaluate the pivot + alignment of these things
            const textConfig = new TextConfig({
                font: text.fontFamily,
                size: text.fontSize ?? 12,
                alignHorizontal: originX == 0 ? TextAlign.START : TextAlign.MIDDLE,
                alignVertical: originY == 0 ? TextAlign.START : TextAlign.MIDDLE           
            })

            const resText = new ResourceText({ text: text.text, textConfig: textConfig });
            group.add(resText, op);
        }

        // draw target food on top of everything
        // @NOTE: There is _no_ check whether there's a point underneath this
        // We can still do this: get the bounding box, check if any points intersect, just delete those---but nah
        const minSize = vis.sizeUnit;
        const spriteSize = 0.033*minSize;
        const fontSize = 0.5*spriteSize;
        const edgeMargin = 0.33*spriteSize;
        const yHeightFactor = 0.66
        const xOffset = edgeMargin + spriteSize, yOffset = edgeMargin + (1.0 - 0.5*yHeightFactor) * spriteSize

        const rectAnchor = new Point((xOffset + 1.5*xOffset)*0.5, yOffset);
        const rectSize = new Point(spriteSize*3, (1 + yHeightFactor)*spriteSize);
        const rect = new Rectangle({ center: rectAnchor, extents: rectSize });
        const op = new LayoutOperation({
            fill: "#EEEEEE",
            alpha: 1.0
        })
        group.add(new ResourceShape(rect), op);

        const resPoints = vis.getResource("icon_points");
        const opPoints = new LayoutOperation({
            translate: new Point(xOffset, yOffset),
            dims: new Point(spriteSize),
            pivot: Point.CENTER
        });
        group.add(resPoints, opPoints);

        const textConfig = new TextConfig({
            font: "geldotica",
            size: fontSize,
            alignHorizontal: TextAlign.START,
            alignVertical: TextAlign.MIDDLE
        })

        const textString = this.map.getObjectiveScore().toString();
        const opText = new LayoutOperation({
            translate: new Point(1.5*xOffset, yOffset),
            dims: new Point(rect.getSize()),
            fill: "#000000",
        })
        const resText = new ResourceText({ text: textString, textConfig: textConfig });
        group.add(resText, opText);

        return [group];
    }
}
