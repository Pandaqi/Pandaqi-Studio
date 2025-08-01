import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { TerrainType, DinoType, TERRAINS, DINOS, MISC } from "../shared/dict"
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import Point from "js/pq_games/tools/geometry/point";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import TextConfig, { TextStyle } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import { CONFIG } from "../shared/config";
import drawBlurryRectangle from "js/pq_games/layout/tools/drawBlurryRectangle";

export default class DominoSide
{
    terrain:TerrainType
    dino:DinoType

    setTerrain(t:TerrainType) { this.terrain = t; }
    setDinosaur(d:DinoType) { this.dino = d; }
    hasDinosaur() { return this.dino != undefined; }

    draw(vis:MaterialVisualizer) : ResourceGroup
    {
        const group = new ResourceGroup();

        const disableTerrain = vis.inkFriendly && this.terrain == TerrainType.LAVA;
        const resTerrain = vis.getResource("terrains");
        const randRotation = Math.floor(Math.random() * 4) * 0.5 * Math.PI;
        const opTerrain = new LayoutOperation({
            frame: TERRAINS[this.terrain].frame,
            size: new Point(vis.sizeUnit),
            rot: randRotation,
            pivot: Point.CENTER
        });
        
        if(!disableTerrain)
        {
            group.add(resTerrain, opTerrain);
        }
        

        if(this.hasDinosaur())
        {
            const resDino = vis.getResource("dinosaurs");
            const dinoData = DINOS[this.dino];
            const shadow = new DropShadowEffect({ color: vis.get("dominoes.dino.shadowColor"), blurRadius: vis.get("dominoes.dino.shadowBlur") });
            let wiggleRotation = this.dino == DinoType.EGG ? (Math.random()-0.5)*0.1*Math.PI : 0;

            const opDino = new LayoutOperation({
                frame: dinoData.frame,
                pivot: Point.CENTER,
                size: vis.get("dominoes.dino.size"),
                effects: [shadow, vis.inkFriendlyEffect].flat(),
                rot: wiggleRotation
            })
            group.add(resDino, opDino);

            if(dinoData.needsArrow)
            {
                const resMisc = vis.getResource("misc");
                const opArrow = new LayoutOperation({
                    frame: MISC.arrow.frame,
                    pivot: Point.CENTER,
                    size: vis.get("dominoes.dino.sizeArrow"),
                    rot: randRotation,
                    alpha: 0.85
                })
                group.add(resMisc, opArrow);
            }

            const partHeight = 0.5*vis.size.y;
            if(CONFIG.addText)
            {
                const textPos = new Point(0, 0.33*partHeight);
                const textDims = new Point(0.9*vis.size.x, 0.275*partHeight);
                const rectParams = { pos: textPos, size: textDims, color: "#110000", alpha: 0.75 };
                drawBlurryRectangle(rectParams, group);

                const text = dinoData.desc;
                const textConfig = new TextConfig({
                    font: vis.get("fonts.body"),
                    size: vis.get("dominoes.dino.fontSize"),
                    style: TextStyle.ITALIC
                }).alignCenter();

                const resText = new ResourceText({ text, textConfig });
                const opText = new LayoutOperation({
                    pos: textPos, 
                    pivot: Point.CENTER,
                    fill: "#FFEEEE",
                    size: new Point(0.9*textDims.x, textDims.y)
                });
                group.add(resText, opText);
            }
        }

        return group;
    }
}