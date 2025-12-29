
import { shuffle, MaterialVisualizer, ResourceGroup, fillResourceGroup, LayoutOperation, TintEffect, Vector2, TextConfig, ResourceText, Rectangle, ResourceShape, getPositionsCenteredAround } from "lib/pq-games";
import { COLORS, CardType, Color, DYNAMIC_STRINGS, MISC, POSITIONS, SPECIAL_ACTIONS, Shape } from "../shared/dict";

export default class Card
{
    type: CardType;
    shape: Shape;
    number: number;
    color: Color;
    ranking: string[];
    action: string = "";
    actionString: string = "";

    constructor(type:CardType, shp:Shape, num:number, col = Color.RED)
    {
        this.type = type;
        this.shape = shp;
        this.number = num;
        this.color = col;
    }

    hasSpecialAction()
    {
        return this.type == CardType.SPECIAL && this.action != "";
    }
    getActionData() { return SPECIAL_ACTIONS[this.action]; }
    setAction(key:string)
    {
        this.action = key;

        let str = this.getActionData().desc;
        const replacements = structuredClone(DYNAMIC_STRINGS);
        
        let replacedSomething = true;
        while(replacedSomething)
        {
            replacedSomething = false;

            for(const [needle,options] of Object.entries(replacements))
            {
                if(!str.includes(needle)) { continue; }

                const option = shuffle(options).pop().toString();
                str = str.replace(needle, option);
                replacedSomething = true;
            }
        }

        this.actionString = str;
    }

    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        this.drawBackground(vis, group);
        this.drawShapes(vis, group);
        this.drawAction(vis, group);
        this.drawRanking(vis, group);
        return vis.renderer.finishDraw({ group: group, size: vis.size });
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        fillResourceGroup(vis.size, group, "#FFFFFF");
        
        const res = vis.getResource("card_templates");
        const op = new LayoutOperation({
            pivot: Vector2.ZERO,
            size: vis.size,
            frame: 0
        });
        group.add(res, op);
    }

    drawShapes(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const finalIndex = this.hasSpecialAction() ? vis.get("cards.action.positionCutoffIndex") : POSITIONS.length;
        const positions = POSITIONS.slice(0, finalIndex);
        shuffle(positions);

        const res = vis.getResource("misc");
        const iconSize = vis.get("cards.shapes.iconSize");
        const effects = [new TintEffect(COLORS[this.color].hex)];
        for(let i = 0; i < this.number; i++)
        {
            const posRaw = positions.pop();
            const posCard = vis.get("cards.shapes.topLeft").clone().add(posRaw.clone().scale(vis.get("cards.shapes.boxSize")));
            const op = new LayoutOperation({
                pos: posCard,
                rot: Math.floor(Math.random() * 4) * 0.5 * Math.PI,
                frame: MISC[this.shape].frame,
                size: iconSize,
                pivot: Vector2.CENTER,
                effects: effects
            });
            group.add(res, op);
        }
    }

    drawAction(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasSpecialAction()) { return; }

        // the action icon to the left
        const resIcon = vis.getResource("misc");
        const opIcon = new LayoutOperation({
            pos: vis.get("cards.action.icon.pos"),
            rot: ((Math.random() <= 0.5) ? 1 : -1) * 0.05 * Math.PI,
            size: vis.get("cards.action.icon.size"),
            frame: MISC.action.frame,
            pivot: Vector2.CENTER,
            effects: vis.inkFriendlyEffect
        });
        group.add(resIcon, opIcon)

        // the actual text
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.action.text.fontSize")
        }).alignCenter();
        const resText = new ResourceText(this.actionString, textConfig);
        const opText = new LayoutOperation({
            pos: vis.get("cards.action.text.pos"),
            size: vis.get("cards.action.text.boxSize"),
            fill: "#000000",
            pivot: Vector2.CENTER
        })
        group.add(resText, opText);
    }

    drawRanking(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the rectangle behind it
        if(!vis.inkFriendly)
        {
            const rect = new Rectangle({ center: vis.get("cards.ranking.rectPos"), extents: vis.get("cards.ranking.rectSize") });
            const fillColor = this.hasSpecialAction() ? vis.get("cards.ranking.bgColorAction") : vis.get("cards.ranking.bgColorNormal");
            const opRect = new LayoutOperation({
                fill: fillColor
            });
            group.add(new ResourceShape(rect), opRect);
        }

        // the actual icons
        // (we insert a ">" sign in-between each)
        // (turned completely black by tinting)
        const numPositions = this.ranking.length + (this.ranking.length - 1);
        const iconSize = vis.get("cards.ranking.iconSize");
        const iconSizeArrow = iconSize.clone().scale(0.66);
        const positions = getPositionsCenteredAround({
            pos: vis.get("cards.ranking.rectPos"),
            size: iconSize,
            num: numPositions
        });

        const res = vis.getResource("misc");
        const effects = [new TintEffect("#000000")];

        for(let i = 0; i < positions.length; i++)
        {
            const isArrow = i % 2 == 1;
            const indexRanking = Math.floor(i / 2);
            const op = new LayoutOperation({
                pos: positions[i],
                size: isArrow ? iconSizeArrow : iconSize,
                frame: isArrow ? MISC.arrow.frame : MISC[this.ranking[indexRanking]].frame,
                effects: effects,
                pivot: Vector2.CENTER
            });
            group.add(res, op);
        }
    }
}