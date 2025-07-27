import TintEffect from "js/pq_games/layout/effects/tintEffect";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { ACTIEPIETEN, CARD_TEMPLATES, CardType, ColorType, ICON_POSITIONS, MISC, POSITION_INDICES } from "../shared/dict";
import Point from "js/pq_games/tools/geometry/point";
import TextConfig, { TextAlign } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import StrokeAlign from "js/pq_games/layout/values/strokeAlign";
import fillResourceGroup from "js/pq_games/layout/canvas/fillResourceGroup";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import Circle from "js/pq_games/tools/geometry/circle";

export default class Card
{
    type: CardType;
    key: string;
    num: number;
    color: ColorType;

    hasSurpriseIcon:boolean = false;
    hasBidIcon:boolean = false;

    constructor(type:CardType, num:number = 0, col = ColorType.PURPLE, key:string = "")
    {
        this.type = type;
        this.num = num;
        this.color = col;
        this.key = key;
    }

    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        this.drawBackground(vis, group);
        this.drawNumbers(vis, group);
        this.drawIcons(vis, group);
        this.drawLabels(vis, group);
        this.drawAction(vis, group);
        this.drawSpecialIcons(vis, group);
        return vis.renderer.finishDraw({ group: group, size: vis.size });
    }

    getTintColor(vis:MaterialVisualizer)
    {
        return vis.inkFriendly ? "#EDEDED" : (this.type == CardType.SINT ? MISC.sint.light : MISC[this.color].light);
    }

    getTextColor(vis:MaterialVisualizer)
    {
        return vis.inkFriendly ? "#333333" : (this.type == CardType.SINT ? MISC.sint.dark : MISC[this.color].dark);
    }

    getTypeFrame() : number
    {
        return MISC[this.color].frame;
    }

    getActionData()
    {
        return ACTIEPIETEN[this.key] ?? {};
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        fillResourceGroup(vis.size, group, "#FFFFFF");

        const res = vis.getResource("card_templates");
        const opOverlay = new LayoutOperation({
            size: vis.size,
            frame: CARD_TEMPLATES.bg.frame,
            effects: [new TintEffect(this.getTintColor(vis))]
        })
        group.add(res, opOverlay);   
    }

    drawLabels(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.type == CardType.REGULAR)
        {
            const offset = vis.get("cards.text.colorLabel.offset");
            const positions = [
                offset.clone(),
                vis.size.clone().sub(offset)
            ]

            const textConfig = new TextConfig({
                font: vis.get("fonts.heading"),
                size: vis.get("cards.text.colorLabel.fontSize"),
                alignVertical: TextAlign.MIDDLE
            });
            const resText = new ResourceText(MISC[this.color].label, textConfig);

            for(let i = 0; i < 2; i++)
            {
                const rot = (i == 0) ? vis.get("cards.text.rotAbove") : vis.get("cards.text.rotBelow");
                const opText = new LayoutOperation({
                    pos: positions[i],
                    rot: rot,
                    size: new Point(vis.size.x, 2.0*textConfig.size),
                    fill: this.getTintColor(vis),
                    pivot: new Point(0, 0.5)
                });
                group.add(resText, opText);
            }
        }

        if(this.type == CardType.SINT)
        {
            const offset = vis.get("cards.text.sintLabel.offset");
            const positions = [
                offset.clone(),
                vis.size.clone().sub(offset)
            ]

            const textConfig = new TextConfig({
                font: vis.get("fonts.heading"),
                size: vis.get("cards.action.label.fontSize")
            }).alignCenter();

            const text = this.key == "small" ? "Small Sint" : "Big Sint";
            const resText = new ResourceText(text, textConfig);

            for(let i = 0; i < 2; i++)
            {
                const rot = (i == 0) ? vis.get("cards.text.rotAbove") : vis.get("cards.text.rotBelow");
                const opText = new LayoutOperation({
                    pos: positions[i],
                    rot: rot,
                    size: new Point(vis.size.x, 2.0*textConfig.size),
                    pivot: Point.CENTER,
                    fill: this.getTextColor(vis),
                    stroke: "#FFFFFF",
                    strokeWidth: vis.get("cards.action.label.strokeWidth"),
                    strokeAlign: StrokeAlign.OUTSIDE,
                })
                group.add(resText, opText);
            }
        }
    }

    drawNumbers(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const offset = vis.get("cards.corners.numberOffset");
        const positions = [
            offset.clone(),
            vis.size.clone().sub(offset)
        ]

        const iconSize = vis.get("cards.corners.iconSize");
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.corners.fontSize")
        }).alignCenter();

        for(let i = 0; i < 2; i++)
        {
            const op = new LayoutOperation({
                pos: positions[i],
                rot: i == 0 ? 0 : Math.PI,
                size: iconSize,
                pivot: Point.CENTER
            })

            // the sint just adds their icons, no numbers
            if(this.type == CardType.SINT) 
            {
                op.frame = MISC.mijter.frame;
                group.add(vis.getResource("misc"), op);
                continue;
            }

            // otherwise add numbers
            const resText = new ResourceText(this.num.toString(), textConfig);
            op.setFill(this.getTextColor(vis));
            group.add(resText, op);
        }
    }

    drawSpecialIcons(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.type == CardType.SINT) { return; }

        // collect what we actually want to place
        const anchors : Record<string,Point> = {};
        if(this.hasSurpriseIcon)
        {
            anchors.surprise = vis.get("cards.icons.special.surprise");
        }

        if(this.hasBidIcon)
        {
            anchors.bieden = vis.get("cards.icons.special.bid");
        }

        if(Object.keys(anchors).length <= 0) { return; }

        // actually place it
        const resCirc = new ResourceShape(new Circle({ radius: vis.get("cards.icons.special.circleRadius") }));
        const resIcon = vis.getResource("misc");
        const iconSize = vis.get("cards.icons.special.size");
        for(const [key,anchor] of Object.entries(anchors))
        {
            // modify to get final point
            const variation = 0.5*(Math.random()*2 - 1) * vis.get("cards.icons.special.randomVariation").y;
            const pos = anchor.clone().add(new Point(0, variation));

            // place circle behind
            const opCirc = new LayoutOperation({
                pos: pos,
                fill: this.getTintColor(vis)
            })
            group.add(resCirc, opCirc);

            // place icon on top
            const opIcon = new LayoutOperation({
                pos: pos,
                size: iconSize,
                frame: MISC[key].frame,
                pivot: Point.CENTER,
                effects: vis.inkFriendlyEffect
            })
            group.add(resIcon, opIcon);
        }
    }

    drawIcons(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // sint just adds their main illustration in the center and that's that
        const resMisc = vis.getResource("misc");
        if(this.type == CardType.SINT) 
        { 
            let illuSize = vis.get("cards.icons.sintSize").clone();
            if(this.key == "small") { illuSize.div(2.0); }

            const op = new LayoutOperation({
                pos: vis.center,
                size: illuSize,
                frame: MISC.sint.frame,
                pivot: Point.CENTER
            })
            group.add(resMisc, op);
            return; 
        }

        // action cards add the icons in a row at the top
        if(this.type == CardType.ACTION)
        {
            const offset = vis.get("cards.icons.rowDisplay.offset");
            const anchors = [
                offset.clone(),
                vis.size.clone().sub(offset)
            ];

            const iconSize = vis.get("cards.icons.rowDisplay.size");
            const subGroup = new ResourceGroup();
            const tempAnchor = new Point();
            for(let n = 0; n < this.num; n++)
            {
                // anchored to top left to make it align with top and properly flip at bottom copy
                const op = new LayoutOperation({
                    pos: tempAnchor.clone(),
                    frame: this.getTypeFrame(),
                    size: iconSize
                })
                tempAnchor.add(new Point(iconSize.x, 0));
                subGroup.add(resMisc, op);
            }

            for(let i = 0; i < 2; i++)
            {
                const opGroup = new LayoutOperation({
                    pos: anchors[i],
                    rot: i == 0 ? 0 : Math.PI
                })
                group.add(subGroup, opGroup);
                
            }
            return;
        }

        // regular cards display icons in a regular "playing card" pattern for that number
        if(this.type == CardType.REGULAR)
        {
            const posIndices = POSITION_INDICES[this.num];
            const posScale = vis.get("cards.icons.templateScaleFactor");
            const iconSize = vis.get("cards.icons.size");
            for(const idx of posIndices)
            {
                const realPosRelative = ICON_POSITIONS[idx].clone();
                const realPos = vis.center.clone().add(realPosRelative.scale(posScale));
                const op = new LayoutOperation({
                    pos: realPos,
                    frame: this.getTypeFrame(),
                    size: iconSize,
                    pivot: Point.CENTER
                });
                group.add(resMisc, op);
            }
        }
    }

    drawAction(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.type != CardType.ACTION) { return; }

        const data = this.getActionData();

        // the two boxes for containing content
        const resOverlay = vis.getResource("card_templates");
        const opOverlay = new LayoutOperation({
            size: vis.size,
            frame: CARD_TEMPLATES.action_overlay.frame,
        });
        group.add(resOverlay, opOverlay);

        // the illustration at the top
        const resIcons = vis.getResource("action_icons");
        const opIllu = new LayoutOperation({
            pos: vis.get("cards.action.illu.pos"),
            rot: vis.get("cards.action.illu.rot"),
            size: vis.get("cards.action.illu.size"),
            frame: data.frame,
            pivot: Point.CENTER,
            effects: vis.inkFriendlyEffect
        })
        group.add(resIcons, opIllu);

        // the text at the bottom
        const textConfigDesc = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.action.desc.fontSize")
        }).alignCenter();
        const resTextDesc = new ResourceText(data.desc, textConfigDesc);
        const opTextDesc = new LayoutOperation({
            pos: vis.get("cards.action.desc.pos"),
            rot: vis.get("cards.action.desc.rot"),
            size: vis.get("cards.action.desc.textBoxSize"),
            pivot: Point.CENTER,
            fill: this.getTextColor(vis),
        })
        group.add(resTextDesc, opTextDesc);

        // the slanted title
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.action.label.fontSize")
        }).alignCenter();
        const resText = new ResourceText(data.label, textConfig);
        const opText = new LayoutOperation({
            pos: vis.get("cards.action.label.pos"),
            rot: vis.get("cards.action.label.rot"),
            size: new Point(vis.size.x, 2.0*textConfig.size),
            pivot: Point.CENTER,
            fill: this.getTextColor(vis),
            stroke: "#FFFFFF",
            strokeWidth: vis.get("cards.action.label.strokeWidth"),
            strokeAlign: StrokeAlign.OUTSIDE,
        })
        group.add(resText, opText);
    }
}