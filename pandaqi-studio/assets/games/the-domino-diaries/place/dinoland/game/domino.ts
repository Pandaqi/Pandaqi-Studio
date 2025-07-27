import createContext from "js/pq_games/layout/canvas/createContext";
import fillCanvas from "js/pq_games/layout/canvas/fillCanvas";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { ASTEROID_TILES, DinoType, DominoType, IMPACT_TILES, MISC, TerrainType } from "../shared/dict";
import DominoSide from "./dominoSide";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import CONFIG from "../shared/config";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import TextConfig, { TextStyle } from "js/pq_games/layout/text/textConfig";

export default class Domino
{
    type:DominoType;
    pawnIndex:number = -1; // just a quick hack to also reuse this class for drawing the pawns/claim cubes
    sides:{ top:DominoSide, bottom:DominoSide }
    key:string; // only used on special dominoes to index into dictionary and get data
    set:string;

    constructor(type:DominoType, key:string = "")
    {
        this.type = type;
        this.key = key;
        this.sides = { top: new DominoSide(), bottom: new DominoSide() };
    }

    setPawnIndex(i:number)
    {
        this.pawnIndex = i;
    }

    setTerrains(a:TerrainType, b:TerrainType)
    {
        this.sides.top.setTerrain(a);
        this.sides.bottom.setTerrain(b);
    }

    setDinosaurs(a:DinoType, b:DinoType)
    {
        this.sides.top.setDinosaur(a);
        this.sides.bottom.setDinosaur(b)
    }

    setSet(s:string)
    {
        this.set = s;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });

        let bgColor = CONFIG.dominoes.bgColor;
        if(this.type == DominoType.ASTEROID) { bgColor = CONFIG.dominoes.bgColorAsteroid; }
        else if(this.type == DominoType.IMPACT) { bgColor = CONFIG.dominoes.bgColorImpact; }
        if(vis.inkFriendly) { bgColor = "#FFFFFF"; }
        fillCanvas(ctx, bgColor);

        const group = new ResourceGroup();

        if(this.type == DominoType.PAWN) {
            this.drawPawn(vis, group);
        } else if(this.type == DominoType.IMPACT) {
            this.drawImpactTile(vis, group);
        } else if(this.type == DominoType.REGULAR) {
            const opTop = new LayoutOperation({
                pos: new Point(vis.center.x, 0.25*vis.size.y),
                pivot: Point.CENTER
            });
            group.add(this.sides.top.draw(vis), opTop);

            const opBottom = new LayoutOperation({
                pos: new Point(vis.center.x, 0.75*vis.size.y),
                pivot: Point.CENTER
            })
            group.add(this.sides.bottom.draw(vis), opBottom);
            this.drawSetText(vis, group);
        } else {
            this.drawAsteroidTile(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawPawn(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("pawns");
        const size = new Point(vis.sizeUnit);
        
        const opTop = new LayoutOperation({
            pos: new Point(vis.size.x, vis.center.y),
            frame: this.pawnIndex,
            size: size,
            rot: Math.PI
        });
        group.add(res, opTop);

        const opBottom = new LayoutOperation({
            pos: new Point(0, vis.center.y),
            frame: this.pawnIndex,
            size: size
        });
        group.add(res, opBottom);
    }

    // to help people quickly sort out base game / expansion
    drawSetText(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.set != "expansion") { return; }

        const text = "E";
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("dominoes.setText.size")
        })
        const resText = new ResourceText({ text, textConfig });
        const opText = new LayoutOperation({
            pos: new Point(1.33*textConfig.size), 
            pivot: Point.CENTER,
            fill: "#442200",
            alpha: 0.5,
            size: new Point(2*textConfig.size)
        });
        group.add(resText, opText);
    }
    
    drawImpactTile(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = IMPACT_TILES[this.key];

        // the sprite visualizing how the impact works
        const res = vis.getResource("impact_tiles");
        const op = new LayoutOperation({
            pos: new Point(vis.center.x, 0.25*vis.size.y),
            frame: data.frame,
            size: vis.get("dominoes.impact.size"),
            effects: vis.inkFriendlyEffect,
            pivot: Point.CENTER
        })
        group.add(res, op);

        // any extra text to explain it / tweak rules
        const text = data.desc;
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("dominoes.impact.fontSize"),
            style: TextStyle.ITALIC
        }).alignCenter();

        const textColor = vis.inkFriendly ? "#111111" : "#FCFCFC";
        const resText = new ResourceText({ text, textConfig });
        const opText = new LayoutOperation({
            pos: new Point(vis.center.x, 0.75*vis.size.y), 
            pivot: Point.CENTER,
            fill: textColor,
            size: new Point(0.925*vis.size.x, 0.5*vis.size.y)
        });
        group.add(resText, opText);
    }

    drawAsteroidTile(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // determine the specific graphic to display
        const resMisc = vis.getResource("misc");
        let res = vis.getResource("asteroid_tiles");
        let data = ASTEROID_TILES[this.key];

        if(!data)
        {
            res = resMisc;
            data = MISC["asteroid_" + this.key];
        }

        const op = new LayoutOperation({
            pos: new Point(vis.center.x, 0.25*vis.size.y),
            size: vis.get("dominoes.asteroid.size"),
            frame: data.frame,
            effects: vis.inkFriendlyEffect,
            pivot: Point.CENTER
        })
        group.add(res, op);

        // any extra text to explain it / tweak rules
        const text = data.desc;
        if(text)
        {
            const textColor = vis.inkFriendly ? "#111111" : "#FCFCFC";
            const textConfig = new TextConfig({
                font: vis.get("fonts.body"),
                size: vis.get("dominoes.asteroid.fontSize"),
                style: TextStyle.ITALIC
            }).alignCenter();
    
            const resText = new ResourceText({ text, textConfig });
            const opText = new LayoutOperation({
                pos: new Point(vis.center.x, 0.75*vis.size.y), 
                pivot: Point.CENTER,
                fill: textColor,
                size: new Point(0.925*vis.size.x, 0.5*vis.size.y)
            });
            group.add(resText, opText);
        }

    }

}