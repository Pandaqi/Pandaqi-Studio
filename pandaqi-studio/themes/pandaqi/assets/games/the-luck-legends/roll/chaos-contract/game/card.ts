
import { fromArray, MaterialVisualizer, Color, createContext, fillCanvas, ResourceGroup, ResourceShape, Rectangle, Vector2, LayoutOperation, TintEffect, TextConfig, getRectangleCornersWithOffset, ResourceText, GlowEffect, BlurEffect, getPositionsCenteredAround, colorDarken } from "lib/pq-games";
import { CARD_ACTIONS, CardType, ContractType, MISC, NUMBERS, TEMPLATES } from "../shared/dict";
import Contract from "./contracts/contract";


export default class Card
{
    type: CardType
    contract: Contract
    num: number = -1;
    action: string = "";
    actionText: string = "";
    specialType:string = ""; // only for wildcard / duo dice cards

    constructor(type:CardType)
    {
        this.type = type;
    }

    setContract(c:Contract) { this.contract = c; }
    setDiceData(n:number, a:string)
    {
        this.num = n;
        this.action = a;
        
        if(this.hasAction())
        {
            let str = CARD_ACTIONS[this.action].desc; 
            str = str.replace("%numlow%", fromArray([1,2]).toString());
            str = str.replace("%numhigh%", fromArray([5,6]).toString());
            str = str.replace("%rank%", fromArray(["lowest", "highest"]));
            this.actionText = str;
        }
    }

    hasAction()
    {
        return this.action != "";
    }

    setSpecialType(st:string)
    {
        this.specialType = st;
    }

    isSpecialType()
    {
        return this.specialType != "";
    }

    isWildCard()
    {
        return this.specialType == "wildcard";
    }

    isDuoNumber()
    {
        return this.specialType == "duo";
    }

    getNumberData()
    {
        return NUMBERS[this.num] ?? {};
    }

    getBackgroundColor(vis:MaterialVisualizer)
    {
        if(this.isWildCard()) { return vis.inkFriendly ? "#FFFFFF" : vis.get("cards.wildcard.bgColor") }
        return vis.inkFriendly ? "#FFFFFF" : this.getNumberData().color;
    }

    getTintColor(vis:MaterialVisualizer)
    {
        if(vis.inkFriendly) { return "#111111"; }
        if(this.isWildCard()) { return vis.get("cards.wildcard.tintColor"); }
        const darkenedColor = colorDarken(new Color(this.getNumberData().color), vis.get("cards.outline.darken"));
        return darkenedColor;
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        fillCanvas(ctx, "#FFFFFF");

        const group = new ResourceGroup();
        if(this.type == CardType.DICE) {
            this.drawBackground(vis, group);
            this.drawNumbers(vis, group);
            this.drawMetadata(vis, group);
            this.drawAction(vis, group);
        } else if(this.type == CardType.CONTRACT) {
            this.drawContract(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    getOtherNumber()
    {
        const options = [1,2,3,4,5,6]
        options.splice(options.indexOf(this.num), 1);
        return fromArray(options);
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const resTemp = vis.getResource("card_templates");
        if(!vis.inkFriendly)
        {
            // the main texture
            const rect = new ResourceShape(new Rectangle().fromTopLeft(new Vector2(), vis.size));
            const opRect = new LayoutOperation({
                fill: this.getBackgroundColor(vis)
            });
            group.add(rect, opRect);

            const opTexture = new LayoutOperation({
                size: vis.size,
                frame: this.isWildCard() ? TEMPLATES.texture_wildcard.frame : TEMPLATES.texture.frame,
                composite: this.isWildCard() ? "luminosity" : "overlay",
                alpha: vis.get("cards.bg.textureAlpha")
            })
            group.add(resTemp, opTexture);

            // subtle gradient
            if(!this.isWildCard())
            {
                const opGrad = new LayoutOperation({
                    size: vis.size,
                    frame: TEMPLATES.gradient.frame,
                    composite: "overlay"
                });
                group.add(resTemp, opGrad);
            }
        }
        
        // outline (tinted)
        const col = this.getTintColor(vis);
        const opOutline = new LayoutOperation({
            size: vis.size,
            frame: TEMPLATES.outline.frame,
            effects: [new TintEffect(col)]
        })
        group.add(resTemp, opOutline);
        
    }

    drawNumbers(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // draw the four smaller numbers in the corners
        const textColor = this.getTintColor(vis);
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.numbers.fontSize")
        }).alignCenter();

        const otherNum = this.getOtherNumber();
        const positions = getRectangleCornersWithOffset(vis.size, vis.get("cards.numbers.offset"));
        for(let i = 0; i < positions.length; i++)
        {
            let numberText = this.num.toString();
            
            if(this.isDuoNumber() && (i % 2) == 1)
            {
                numberText = otherNum.toString()
            }

            if(this.isWildCard())
            {
                numberText = "?"
            }

            const resText = new ResourceText({ text: numberText, textConfig: textConfig });
            const opText = new LayoutOperation({
                pos: positions[i],
                size: new Vector2(2.0 * textConfig.size),
                rot: (i <= 1) ? 0 : Math.PI,
                pivot: Vector2.CENTER,
                fill: textColor
            });
            group.add(resText, opText);
        }

        // draw the main number
        // (or two main numbers, offset and smaller, if duo card)
        const numbers = [this.num.toString()];
        if(this.isWildCard()) { numbers[0] = "?"; }
        if(this.isDuoNumber()) { numbers.push(otherNum.toString()); }
        const fontSize = vis.get("cards.mainNumber.fontSize") / numbers.length;

        const textConfigMain = new TextConfig({
            font: vis.get("fonts.heading"),
            size: fontSize
        }).alignCenter();

        const shadowColor = this.isWildCard() ? "#000000" : "#ffffff";
        const mainEffects = vis.inkFriendly ? [] : [new GlowEffect({ color: shadowColor, blur: vis.get("cards.mainNumber.glowBlur") })]

        const anchorPos = vis.get("cards.mainNumber.pos");
        let positionsMain = [anchorPos]; 
        if(numbers.length >= 2)
        {
            const offsetFromAnchor = new Vector2(0.5*fontSize);
            positionsMain = [
                anchorPos.clone().sub(offsetFromAnchor),
                anchorPos.clone().add(offsetFromAnchor)
            ]
        }

        for(let i = 0; i < positionsMain.length; i++)
        {
            const resText = new ResourceText({ text: numbers[i], textConfig: textConfigMain });
            const opText = new LayoutOperation({
                pos: positionsMain[i],
                size: new Vector2(2.0 * textConfigMain.size),
                pivot: Vector2.CENTER,
                fill: textColor,
                effects: mainEffects
            });
            group.add(resText, opText);
        }
    }

    drawMetadata(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.metadata.fontSize")
        }).alignCenter();
        const textColor = (this.isWildCard() && !vis.inkFriendly) ? "#FFFFFF" : "#000000";

        // create a subgroup with the right text and distances
        const subGroup = new ResourceGroup();
        
        const label = this.isWildCard() ? "Wildcard" : this.getNumberData().label;
        const resTextNum = new ResourceText({ text: label, textConfig: textConfig });
        const opTextNum = new LayoutOperation({
            pos: vis.get("cards.metadata.numberPos"), // this is relative to center of subgroup, not card
            size: new Vector2(vis.size.x, 2.0 * textConfig.size),
            pivot: Vector2.CENTER,
            fill: textColor
        })
        subGroup.add(resTextNum, opTextNum);

        if(this.hasAction())
        {
            const resTextAction = new ResourceText({ text: CARD_ACTIONS[this.action].label, textConfig: textConfig });
            const opTextAction = new LayoutOperation({
                pos: vis.get("cards.metadata.actionPos"),
                size: new Vector2(vis.size.x, 2.0 * textConfig.size),
                pivot: Vector2.CENTER,
                fill: textColor
            })
            subGroup.add(resTextAction, opTextAction);
        }

        // then add this subgroup twice, rotated along edge of card
        const op1 = new LayoutOperation({
            pos: vis.get("cards.metadata.anchorPos1"),
            rot: -0.5*Math.PI
        })
        group.add(subGroup, op1);

        const op2 = new LayoutOperation({
            pos: vis.get("cards.metadata.anchorPos2"),
            rot: 0.5*Math.PI
        })
        group.add(subGroup, op2);
    }

    drawAction(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.hasAction()) { return; }

        // draw blurry rectangle behind text (for contrast)
        if(!vis.inkFriendly)
        {
            const resRect = new ResourceShape(new Rectangle({ 
                center: vis.get("cards.action.textBoxPos"),
                extents: vis.get("cards.action.textBoxDims")
            }));
            const opRect = new LayoutOperation({
                fill: "#000000",
                composite: this.isWildCard() ? "luminosity" : "color-burn",
                effects: [new BlurEffect(vis.get("cards.action.textBoxBlur"))],
                alpha: this.isWildCard() ? 0.66 : 0.5
            })
            group.add(resRect, opRect);
        }

        // draw the actual text
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.action.fontSize")
        }).alignCenter();
        const resText = new ResourceText({ text: this.actionText, textConfig: textConfig });
        const opText = new LayoutOperation({
            pos: vis.get("cards.action.textBoxPos"),
            size: vis.get("cards.action.textDims"),
            pivot: Vector2.CENTER,
            fill: vis.inkFriendly ? "#111111" : vis.get("cards.action.textColor"),
            effects: [new GlowEffect({ color: "#ffffff77", blur: 0.5*vis.get("cards.mainNumber.glowBlur") })]
        })
        group.add(resText, opText);
    }

    drawContract(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // display background
        const resTemp = vis.getResource("card_templates");
        const opTemp = new LayoutOperation({
            size: vis.size,
            frame: TEMPLATES.contract.frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(resTemp, opTemp);

        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.contract.fontSize")
        }).alignCenter();
        const textDims = vis.get("cards.contract.textDims");

        // display the three main parts of a contract
        const positions = [
            vis.get("cards.contract.sections.posDo"),
            vis.get("cards.contract.sections.posTest"),
            vis.get("cards.contract.sections.posSpecial")
        ]

        const texts = [
            this.contract.do.toString(),
            this.contract.test.toString(),
            this.contract.special.toString()
        ]

        for(let i = 0; i < positions.length; i++)
        {
            const resText = new ResourceText({ text: texts[i], textConfig: textConfig });
            const opText = new LayoutOperation({
                pos: positions[i],
                size: textDims,
                pivot: Vector2.CENTER,
                fill: "#000000"
            })
            group.add(resText, opText);
        }

        // display rewards/penalties
        const posRews = [
            vis.get("cards.contract.rewards.posReward"),
            vis.get("cards.contract.rewards.posPenalty")
        ]

        const sizeRews = vis.get("cards.contract.rewards.iconDims")
        const content = [this.contract.rewards, this.contract.penalties]
        const keyStrings = ["reward", "penalty"];

        const resMisc = vis.getResource("misc");
        for(let i = 0; i < posRews.length; i++)
        {
            const ct = content[i];
            const ks = keyStrings[i];
            const subpos = getPositionsCenteredAround({ pos: posRews[i], size: sizeRews, num: ct.length, dir: Vector2.DOWN });
            for(let a = 0; a < subpos.length; a++)
            {
                const randRot = (Math.random() - 0.5) * 0.125 * Math.PI;
                const opIcon = new LayoutOperation({
                    pos: subpos[a],
                    size: sizeRews,
                    pivot: Vector2.CENTER,
                    frame: MISC[ct[a] + "_" + ks].frame,
                    rot: randRot
                });
                group.add(resMisc, opIcon);
            }
        }

        // display stars
        const starDims = vis.get("cards.contract.stars.size");
        const starAlpha = vis.get("cards.contracts.stars.alpha");
        const posStars = getPositionsCenteredAround({
            pos: vis.get("cards.contract.stars.pos"),
            size: starDims,
            num: this.contract.getStars(),
            dir: Vector2.DOWN
        });
        for(const posStar of posStars)
        {
            const opStar = new LayoutOperation({
                pos: posStar,
                size: starDims,
                pivot: Vector2.CENTER,
                frame: MISC.star.frame,
                alpha: starAlpha,
            });
            group.add(resMisc, opStar);
        }

        // display battle icon
        if(this.contract.type == ContractType.BATTLE)
        {
            const opBattleIcon = new LayoutOperation({
                pos: vis.get("cards.contract.battleIconPos"),
                size: starDims,
                pivot: Vector2.CENTER,
                frame: MISC.battle_icon.frame,
                alpha: starAlpha,
            });
            group.add(resMisc, opBattleIcon);
        }

        // display turnout icon
        if(this.contract.type == ContractType.FORCED)
        {
            const posTurnout = getPositionsCenteredAround({
                pos: vis.get("cards.contract.turnoutIconPos"),
                size: starDims,
                num: this.contract.minTurnout,
                dir: Vector2.DOWN
            });
            for(const pos of posTurnout)
            {
                const opTurnoutIcon = new LayoutOperation({
                    pos: pos,
                    size: starDims,
                    pivot: Vector2.CENTER,
                    frame: MISC.forced_icon.frame,
                    alpha: starAlpha,
                });
                group.add(resMisc, opTurnoutIcon);
            }

        }
    }
}