import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import { CARD_TEMPLATES, CardType, KALENDER_KAARTEN, MAP_TILES, PAKJE_CARDS, STOOM_CARDS, VAAR_CARDS } from "../shared/dict";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";
import Point from "js/pq_games/tools/geometry/point";
import TextConfig, { TextStyle } from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import fromArray from "js/pq_games/tools/random/fromArray";

export default class Card
{
    type: CardType;
    key: string;
    pakjesWanted: string[];
    set: string;
    isFlipped: boolean;

    constructor(type:CardType, key:string, set:string = "base")
    {
        this.type = type;
        this.key = key;
        this.set = set;
        this.pakjesWanted = [];
        this.isFlipped = false;
    }

    addPakje(p:string)
    {
        this.pakjesWanted.push(p);
    }

    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();
        this.drawBackground(vis, group);

        if(this.type == CardType.BORD) {
            this.drawBordTegel(vis, group);
        } else if(this.type == CardType.VAREN || this.type == CardType.PAKJE) {
            this.drawVaarOfPakjeKaart(vis, group);
        } else if(this.type == CardType.STOOMBOOT) {
            this.drawStoomKaart(vis, group);
        } else if(this.type == CardType.KALENDER) {
            this.drawKalenderKaart(vis, group);
        }

        return vis.renderer.finishDraw({ group: group, size: vis.size });
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // @EXCEPTION: map tiles just have one fixed/static background image, which isn't even there on inkfriendly
        const resMap = vis.getResource("map_tiles");
        if(this.type == CardType.BORD)
        {
            const opMap = new LayoutOperation({
                size: vis.size,
                frame: 9
            });
            if(!vis.inkFriendly) { group.add(resMap, opMap); }
            return;
        }

        // @EXCEPTION: "rebelse pietjes" pionnen just draw their tile and are done
        if(this.type == CardType.PAWN && this.key != "stoomboot")
        {
            const baseFrame = 10
            const offset = parseInt(this.key.charAt(this.key.length - 1));
            const opPietje = new LayoutOperation({
                size: vis.size,
                frame: baseFrame + offset,
                effects: vis.inkFriendlyEffect
            })
            group.add(resMap, opPietje);
            return;
        }

        // the full background (color/pattern)
        const resTemp = vis.getResource("card_templates");
        const flipY = (this.type == CardType.STOOMBOOT && this.isFlipped);
        const bgData = CARD_TEMPLATES[this.type + "_bg"];

        if(!vis.inkFriendly && bgData)
        {
            const opBG = new LayoutOperation({
                size: vis.size,
                flipY: flipY,
                frame: bgData.frame
            })
            group.add(resTemp, opBG);
        }

        // the template above
        let contentData = CARD_TEMPLATES[this.type + "_overlay"];
        if(this.type == CardType.PAWN) { contentData = CARD_TEMPLATES.pawn;}
        if(!contentData) { return; }
        const opContent = new LayoutOperation({
            size: vis.size,
            flipY: flipY,
            frame: contentData.frame,
            effects: vis.inkFriendlyEffect,
        })
        group.add(resTemp, opContent);
    }

    drawBordTegel(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // general icon
        const data = MAP_TILES[this.key] ?? {};
        const res = vis.getResource("map_tiles");
        const op = new LayoutOperation({
            size: vis.size,
            frame: data.frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(res, op);

        // list of pakjes wanted, if applicable
        const numPakjes = this.pakjesWanted.length;
        const wantsPakjes = numPakjes > 0;
        if(wantsPakjes)
        {
            const resPakje = vis.getResource("pakje_cards");
            
            const iconSize = vis.get("tiles.giftsWanted.size");
            const effects = [new DropShadowEffect({ color: "#00000099", blur: 0.025*iconSize.x }), vis.inkFriendlyEffect].flat();
            const positions = getPositionsCenteredAround({
                pos: vis.get("tiles.giftsWanted.pos"),
                size: iconSize,
                num: numPakjes
            });
            for(let i = 0; i < positions.length; i++)
            {
                const data = PAKJE_CARDS[this.pakjesWanted[i]];
                const opPakje = new LayoutOperation({
                    pos: positions[i],
                    size: iconSize,
                    frame: data.frame,
                    pivot: Point.CENTER,
                    effects: effects
                });
                group.add(resPakje, opPakje);
            }
        }
    }

    getRandomPakje(exclude = [])
    {
        const pakjesAll = Object.keys(PAKJE_CARDS);
        const pakjesAllowed = [];
        for(const pakje of pakjesAll)
        {
            if(PAKJE_CARDS[pakje].cantDuo) { continue; }
            if(exclude.includes(pakje)) { continue; }
            pakjesAllowed.push(pakje);
        }
        return fromArray(pakjesAllowed);
    }

    drawVaarOfPakjeKaart(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const resIcon = (this.type == CardType.VAREN) ? vis.getResource("vaar_cards") : vis.getResource("pakje_cards");
        const data = (this.type == CardType.VAREN) ? VAAR_CARDS[this.key] : PAKJE_CARDS[this.key];
        const isDuoCard = this.key == "duo";
        const iconPos = vis.get("cards.shared.icon.pos").clone();
        const iconSize = vis.get("cards.shared.icon.size").clone();

        let positions = [iconPos];
        let frames = [data.frame];
        if(isDuoCard)
        {
            iconSize.scale(0.5);
            positions = [
                iconPos.clone().sub(iconSize.clone().scale(0.5)),
                iconPos.clone().add(iconSize.clone().scale(0.5))
            ]

            const pakje1 = this.getRandomPakje();
            const pakje2 = this.getRandomPakje([pakje1]);
            frames = [
                PAKJE_CARDS[pakje1].frame,
                PAKJE_CARDS[pakje2].frame
            ]
        }

        // the main icon(s)
        for(let i = 0; i < positions.length; i++)
        {
            const opIcon = new LayoutOperation({
                pos: positions[i],
                size: iconSize,
                pivot: Point.CENTER,
                frame: frames[i],
                effects: vis.inkFriendlyEffect,
            });
            group.add(resIcon, opIcon);
        }

        // the action text
        const displayText = (this.type == CardType.PAKJE && this.set != "base") || this.type == CardType.VAREN;
        if(displayText)
        {
            const textConfig = new TextConfig({
                font: vis.get("fonts.body"),
                size: vis.get("cards.shared.text.fontSize"),
                style: TextStyle.ITALIC
            }).alignCenter();
    
            const resText = new ResourceText(data.desc, textConfig);
            const opText = new LayoutOperation({
                pos: vis.get("cards.shared.text.pos"),
                size: vis.get("cards.shared.text.boxSize"),
                fill: "#000000",
                pivot: Point.CENTER
            })
            group.add(resText, opText);
        }
    }

    // @TODO: Maybe find better solution than FLIPPING these cards on Y-axis. Because now text ("Stoombootkaart") will be flipped too.
    drawStoomKaart(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const resIcon = vis.getResource("stoom_cards");
        const data = STOOM_CARDS[this.key] ?? {};

        let pos = vis.get("cards.stoom.iconPos").clone();
        if(this.isFlipped)
        {
            pos = new Point(pos.x, vis.size.y - pos.y);
        }

        const opIcon = new LayoutOperation({
            pos: pos,
            size: vis.get("cards.stoom.iconSize"),
            pivot: Point.CENTER,
            rotation: 0.5*Math.PI,
            frame: data.frame,
            effects: vis.inkFriendlyEffect,
            composite: vis.get("cards.stoom.composite"),
        });
        group.add(resIcon, opIcon);
    }

    drawKalenderKaart(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const resIcon = vis.getResource("kalender_cards");
        const data = KALENDER_KAARTEN[this.key] ?? {};

        // main icon
        const opIcon = new LayoutOperation({
            pos: vis.get("cards.kalender.icon.pos"),
            size: vis.get("cards.kalender.icon.size"),
            pivot: Point.CENTER,
            frame: data.frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(resIcon, opIcon);

        // label of event
        const textConfigLabel = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.kalender.label.fontSize"),
            style: TextStyle.ITALIC
        }).alignCenter();

        const resTextLabel = new ResourceText(data.label, textConfigLabel);
        const opTextLabel = new LayoutOperation({
            pos: vis.get("cards.kalender.label.pos"),
            size: vis.get("cards.kalender.label.boxSize"),
            fill: "#000000",
            pivot: Point.CENTER
        })
        group.add(resTextLabel, opTextLabel);

        // main text
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("cards.kalender.text.fontSize"),
            style: TextStyle.ITALIC
        }).alignCenter();

        const resText = new ResourceText(data.desc, textConfig);
        const opText = new LayoutOperation({
            pos: vis.get("cards.kalender.text.pos"),
            size: vis.get("cards.kalender.text.boxSize"),
            fill: "#000000",
            pivot: Point.CENTER
        })
        group.add(resText, opText);
    }
}