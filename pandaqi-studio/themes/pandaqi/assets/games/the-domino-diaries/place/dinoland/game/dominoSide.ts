
import { TerrainType, DinoType, TERRAINS, DINOS, MISC } from "../shared/dict"
import { CONFIG } from "../shared/config";
import { MaterialVisualizer, ResourceGroup, LayoutOperation, Vector2, DropShadowEffect, TextConfig, TextStyle, ResourceText } from "lib/pq-games";
import { drawBlurryRectangle } from "lib/pq-games/layout/tools/drawBlurryRectangle";

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
            size: new Vector2(vis.sizeUnit),
            rot: randRotation,
            pivot: Vector2.CENTER
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
                pivot: Vector2.CENTER,
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
                    pivot: Vector2.CENTER,
                    size: vis.get("dominoes.dino.sizeArrow"),
                    rot: randRotation,
                    alpha: 0.85
                })
                group.add(resMisc, opArrow);
            }

            const partHeight = 0.5*vis.size.y;
            if(CONFIG._settings.addText.value)
            {
                const textPos = new Vector2(0, 0.33*partHeight);
                const textDims = new Vector2(0.9*vis.size.x, 0.275*partHeight);
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
                    pivot: Vector2.CENTER,
                    fill: "#FFEEEE",
                    size: new Vector2(0.9*textDims.x, textDims.y)
                });
                group.add(resText, opText);
            }
        }

        return group;
    }
}