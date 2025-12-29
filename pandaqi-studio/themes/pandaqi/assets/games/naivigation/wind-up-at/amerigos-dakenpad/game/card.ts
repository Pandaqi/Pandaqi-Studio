
import { MaterialVisualizer, ResourceGroup, LayoutOperation, DropShadowEffect, getPositionsCenteredAround, Vector2, TextConfig, TextStyle, ResourceText, ResourceShape, Circle } from "lib/pq-games";
import { CARD_TEMPLATES, CardType, GiftType, KAARTEN, MISC, ROUTEKAARTEN } from "../shared/dict";

export default class Card
{
    type: CardType;
    key: string;
    num: number; // not used by route cards

    gifts: GiftType[] = []; // only used by route cards that require gifts

    constructor(type:CardType, key:string = "", num:number = 0)
    {
        this.type = type;
        this.key = key;
        this.num = num;
    }

    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        this.drawBackground(vis, group);

        if(this.type == CardType.PAWN) {
            this.drawPawn(vis, group);
        } else if(this.type == CardType.ROUTE) {
            this.drawRouteCard(vis, group);
        } else if(this.type == CardType.VAREN) {
            this.drawVaarCard(vis, group);
        } else if(this.type == CardType.PAKJE) {
            this.drawPakjeCard(vis, group);
        }

        return vis.renderer.finishDraw({ group: group, size: vis.size });
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.type == CardType.PAWN) { return; }

        const res = vis.getResource("card_templates");
        const frameBG = CARD_TEMPLATES[this.type + "_bg"].frame;
        const frameOverlay = CARD_TEMPLATES[this.type + "_overlay"].frame;

        // ink friendly just discards the entire background
        if(!vis.inkFriendly)
        {
            const opBG = new LayoutOperation({
                size: vis.size,
                frame: frameBG
            })
            group.add(res, opBG);
        }

        // the overlay must be present though (with grayscale effect)
        const opOverlay = new LayoutOperation({
            pivot: Vector2.ZERO,
            size: vis.size,
            frame: frameOverlay,
            effects: vis.inkFriendlyEffect
        })
        group.add(res, opOverlay)
    }

    drawPawn(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("card_templates");
        const op = new LayoutOperation({
            pivot: Vector2.ZERO,
            size: vis.size,
            frame: CARD_TEMPLATES.pawn.frame,
            effects: vis.inkFriendlyEffect
        })
        group.add(res, op);
    }

    drawRouteCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const resMisc = vis.getResource("misc");
        const data = ROUTEKAARTEN[this.key] ?? {};

        // display the gifts wanted (if any are set)
        const numGifts = this.gifts.length;
        const hasGifts = numGifts > 0;
        if(hasGifts)
        {
            const iconSize = vis.get("cards.route.giftSize");
            const effects = [new DropShadowEffect({ color: "#00000099", blur: 0.025*iconSize.x }), vis.inkFriendlyEffect].flat();
            const positions = getPositionsCenteredAround({
                pos: vis.get("cards.route.giftPos"),
                size: iconSize,
                num: numGifts
            });
            for(let i = 0; i < positions.length; i++)
            {
                const op = new LayoutOperation({
                    pos: positions[i],
                    size: iconSize,
                    frame: MISC["pakje_" + this.gifts[i]].frame,
                    pivot: Vector2.CENTER,
                    effects: effects
                });
                group.add(resMisc, op);
            }
        }

        // the text explaining what something does (if needed)
        const hasDescription = (data.desc ?? "").length > 0;
        const showPowerText = hasDescription && !hasGifts;
        if(showPowerText)
        {
            const textConfig = new TextConfig({
                font: vis.get("fonts.body"),
                size: vis.get("cards.route.text.fontSize"),
                style: TextStyle.ITALIC
            }).alignCenter();
    
            const resText = new ResourceText(data.desc, textConfig);
            const opText = new LayoutOperation({
                pos: vis.get("cards.route.giftPos"),
                size: vis.get("cards.route.text.boxSize"),
                fill: "#000000",
                pivot: Vector2.CENTER
            })
            group.add(resText, opText);
        }

        // the big icon of the type
        const resKey = data.textureKey ?? "none";
        if(resKey != "none")
        {
            // the big home
            const resIcon = vis.getResource(resKey);
            let frame = data.frame ?? -1;

            if(frame < 0)
            {
                const randHomeIndex = Math.floor(Math.random() * 4);
                frame = MISC["home_" + randHomeIndex].frame;
            }

            const op = new LayoutOperation({
                pos: vis.get("cards.route.homePos"),
                size: vis.get("cards.route.homeSize"),
                frame: frame,
                pivot: Vector2.CENTER,
                effects: vis.inkFriendlyEffect
            })
            group.add(resIcon, op);
        }

    }

    drawVaarCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const data = KAARTEN[this.key] ?? {};

        // the icon illustrating what the card does
        const res = vis.getResource(data.textureKey ?? "misc");
        const customScale = data.customScale ?? 1;
        const op = new LayoutOperation({
            pos: vis.get("cards.varen.pos"),
            size: vis.get("cards.varen.size").clone().scale(customScale),
            frame: data.frame,
            effects: vis.inkFriendlyEffect,
            pivot: Vector2.CENTER
        })
        group.add(res, op);

        // text explaining the action
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.varen.text.fontSize"),
            style: TextStyle.ITALIC
        }).alignCenter();

        const resText = new ResourceText(data.desc, textConfig);
        const opText = new LayoutOperation({
            pos: vis.get("cards.varen.text.pos"),
            size: vis.get("cards.varen.text.size"),
            fill: "#000000",
            pivot: Vector2.CENTER
        })
        group.add(resText, opText);

        // the repeating icons at bottom right to reinforce
        const anchorPos = vis.get("cards.varen.icons.anchor");
        const maxDistance = vis.get("cards.varen.icons.maxDist");
        const numRepeats = vis.get("cards.varen.icons.numRepeats");
        const offsetPerStep = new Vector2(maxDistance / numRepeats, 0);
        const iconSize = new Vector2(offsetPerStep.x).scale(customScale);
        for(let i = 0; i < numRepeats; i++)
        {
            const op = new LayoutOperation({
                pos: anchorPos.clone().add(offsetPerStep.clone().scale(i)),
                size: iconSize,
                frame: data.frame + 4, // @NOTE: the simplified icon is always +4 the original, don't ask why
                pivot: Vector2.CENTER,
                effects: vis.inkFriendlyEffect,
                alpha: vis.get("cards.varen.icons.alpha") ?? 0.75
            })
            group.add(res, op);
        }

        // the standard corner numbers
        this.drawCornerNumbers(vis, group);
    }

    drawPakjeCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the actual package icon in the center
        const res = vis.getResource("misc");
        const iconSize = vis.get("cards.pakje.size");
        const effects = [new DropShadowEffect({ color: "#00000099", blur: 0.025*iconSize.x }), vis.inkFriendlyEffect].flat();
        const op = new LayoutOperation({
            pos: vis.get("cards.pakje.pos"),
            size: iconSize,
            frame: MISC["pakje_" + this.key].frame,
            effects: effects,
            pivot: Vector2.CENTER
        })
        group.add(res, op);

        // the standard corner numbers
        this.drawCornerNumbers(vis, group, true);
    }

    drawCornerNumbers(vis:MaterialVisualizer, group:ResourceGroup, invert = false)
    {
        const isWildcard = this.num <= 0;

        const offset = vis.get("cards.numbers.offset");
        const positions = [
            offset.clone(),
            vis.size.clone().sub(offset)
        ]

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.numbers.fontSize")
        }).alignCenter();

        const textString = isWildcard ? "X" : this.num.toString();
        const resText = new ResourceText(textString, textConfig);
        const textColor = invert ? "#FFFFFF" : "#000000";

        const dotInterval = vis.get("cards.numbers.dots.interval") ?? 5;
        const dotOffset = vis.get("cards.numbers.dots.offset");
        const numDots = isWildcard ? 0 : Math.ceil(this.num / dotInterval);
        const dotSize = vis.get("cards.numbers.dots.size");
        const dotSizePadded = vis.get("cards.numbers.dots.sizePadded");

        const dotAnchors = [
            positions[0].clone().add(dotOffset),
            positions[1].clone().sub(dotOffset)
        ]

        const resDot = new ResourceShape(new Circle({ center: Vector2.ZERO, radius: 0.5*dotSize.x }));

        for(let i = 0; i < positions.length; i++)
        {
            // the actual number
            const opText = new LayoutOperation({
                pos: positions[i],
                size: new Vector2(2.0*textConfig.size),
                rot: i == 0 ? 0 : Math.PI,
                fill: textColor,
                pivot: Vector2.CENTER
            });
            group.add(resText, opText);

            // some dots below it to help recognize order more quickly.
            const dotPositions = getPositionsCenteredAround({
                pos: dotAnchors[i],
                size: dotSizePadded,
                num: numDots
            });
            for(let d = 0; d < numDots; d++)
            {
                const opDot = new LayoutOperation({
                    pos: dotPositions[d],
                    fill: vis.inkFriendly ? "#000000" : textColor,
                    composite: vis.inkFriendly ? "source-over" : "overlay"
                })
                group.add(resDot, opDot);
            }
        } 
    }
}