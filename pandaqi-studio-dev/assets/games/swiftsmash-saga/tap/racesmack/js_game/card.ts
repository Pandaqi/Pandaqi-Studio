import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import shuffle from "js/pq_games/tools/random/shuffle";
import { COLORS, CardDisplayType, CardType, ColorType, DYNAMIC_STRINGS, FINISH_REQUIREMENTS, MISC, POSITIONS, RULE_CARDS, ShapeType } from "../js_shared/dict";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import TintEffect from "js/pq_games/layout/effects/tintEffect";
import Point from "js/pq_games/tools/geometry/point";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import GlowEffect from "js/pq_games/layout/effects/glowEffect";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";

export default class Card
{
    type: CardType;
    
    displayType:CardDisplayType;
    symbols:ShapeType[];
    colors:ColorType[];

    action:string;
    actionString:string;
    finishReq:string;
    finishReqString: string;

    uniqueNumber: number;
    dynamicValues: any[];
    dynamicValuesRule: any[];

    constructor(type:CardType)
    {
        this.type = type;
        this.symbols = [];
        this.colors = [];

        this.dynamicValues = [];
        this.dynamicValuesRule = [];
    }

    getNumber() { return this.symbols.length; }
    setRegularProperties(dt:CardDisplayType, symbols:ShapeType[], cols:ColorType[])
    {
        this.displayType = dt;
        this.symbols = symbols;
        this.colors = cols;
    }

    getActionData() { return RULE_CARDS[this.action] ?? {}; }
    getFinishReqData() { return FINISH_REQUIREMENTS[this.finishReq] ?? {}; }
    setRuleProperties(actionKey:string, finishReq:string)
    {
        this.action = actionKey;
        this.actionString = this.replaceDynamicStrings(this.getActionData().desc, "rule");

        this.finishReq = finishReq;
        this.finishReqString = this.replaceDynamicStrings(this.getFinishReqData().desc, "finish");
    }

    replaceDynamicStrings(str:string, saveKey = "finish")
    {
        const replacements = structuredClone(DYNAMIC_STRINGS);
        
        let replacedSomething = true;
        while(replacedSomething)
        {
            replacedSomething = false;

            // first do dynamic replacements
            for(const [needle,options] of Object.entries(replacements))
            {
                if(!str.includes(needle)) { continue; }

                const option = shuffle(options).pop().toString();
                str = str.replace(needle, option);
                replacedSomething = true;

                const saveableValue = !isNaN(parseInt(option)) ? parseInt(option) : option;
                if(saveKey == "finish") {
                    this.dynamicValues.push(saveableValue);
                } else if(saveKey == "rule") {
                    this.dynamicValuesRule.push(saveableValue);
                }
            }

            // then shape => image replacements
            for(const shape of Object.values(ShapeType))
            {
                if(!str.includes(shape.toUpperCase())) { continue; }
                const imageString = '<img id="misc" frame="' + MISC[shape].frame + '">';
                str = str.replace(shape.toUpperCase(), imageString);
            }
        }

        return str;
    }

    hasIdentifierMatch(id:string)
    {
        return this.symbols.includes(id as ShapeType) || this.colors.includes(id as ColorType);
    }

    async draw(vis:MaterialVisualizer)
    {
        const group = vis.renderer.prepareDraw();

        this.drawBackground(vis, group);
        if(this.type == CardType.REGULAR) {
            this.drawSymbols(vis, group);
        } else if(this.type == CardType.RULE) {
            this.drawRuleCard(vis, group);
        }

        return vis.renderer.finishDraw({ group: group, size: vis.size });
    }

    drawBackground(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(vis.inkFriendly && this.type == CardType.REGULAR) { return; }

        const frame = (this.type == CardType.REGULAR) ? 0 : 1;
        const res = vis.getResource("card_templates");
        const op = new LayoutOperation({
            size: vis.size,
            frame: frame,
            effects: vis.inkFriendlyEffect,
            alpha: vis.inkFriendly ? 0.66 : 1.0
        });
        group.add(res, op);
    }

    drawSymbols(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // some general properties we'll need all around
        const num = this.getNumber();
        const firstShape = this.symbols[0];
        const firstColor = this.colors[0];

        let displaySingleIcon = true;

        const resMisc = vis.getResource("misc");
        const iconSize = vis.get("cards.shapes.custom.size");
        const effects = [new DropShadowEffect({ color: "#00000099", blur: 0.05*iconSize.x })];
        const opLeft = new LayoutOperation({
            pos: vis.get("cards.shapes.custom.posLeft"),
            size: iconSize,
            pivot: Point.CENTER,
            effects: effects
        });

        // the exact drawing needed for each display type
        if(this.displayType == CardDisplayType.SYMBOLS)
        {
            displaySingleIcon = false;

            const positions = POSITIONS.slice();
            shuffle(positions);
    
            const res = vis.getResource("misc");
            for(let i = 0; i < num; i++)
            {
                const posRaw = positions.pop();
                const posCard = vis.get("cards.shapes.topLeft").clone().add(posRaw.clone().scale(vis.get("cards.shapes.boxSize")));
                const op = new LayoutOperation({
                    pos: posCard,
                    size: vis.get("cards.shapes.size"),
                    frame: MISC[this.symbols[i]].frame,
                    pivot: Point.CENTER,
                    effects: [new TintEffect(COLORS[this.colors[i]].hex), effects].flat()
                })
                group.add(res, op);
            }
        }
        else if(this.displayType == CardDisplayType.NUMBER)
        {
            const textConfig = new TextConfig({
                font: vis.get("fonts.heading"),
                size: vis.get("cards.shapes.custom.fontSizeNumber")
            }).alignCenter();
            const resText = new ResourceText(num.toString(), textConfig);
            opLeft.setFill("#000000");
            group.add(resText, opLeft);
            
        }
        else if(this.displayType == CardDisplayType.HAND)
        {
            opLeft.frame = MISC.hand_display.frame + (num-1);
            group.add(resMisc, opLeft);
        }
        else if(this.displayType == CardDisplayType.DICE)
        {
            opLeft.frame = MISC.dice_display.frame + (num-1);
            group.add(resMisc, opLeft);
        }
        else if(this.displayType == CardDisplayType.ROMAN)
        {
            const textConfig = new TextConfig({
                font: vis.get("fonts.heading"),
                size: vis.get("cards.shapes.custom.fontSizeRoman")
            }).alignCenter();
            const resText = new ResourceText(this.convertToRoman(num), textConfig);
            opLeft.setFill("#000000");
            group.add(resText, opLeft);
        }

        if(displaySingleIcon)
        {
            const opRight = new LayoutOperation({
                pos: vis.get("cards.shapes.custom.posRight"),
                size: iconSize,
                pivot: Point.CENTER,
                frame: MISC[firstShape].frame,
                effects: [new TintEffect(COLORS[firstColor].hex), effects].flat()
            });
            group.add(resMisc, opRight);
        }
    }

    convertToRoman(num:number) : string
    {
        let str = "";
        for(let i = 0; i < num; i++)
        {
            str += "I";
        }
        return str;
    }

    getBodyFont(vis:MaterialVisualizer)
    {
        return vis.get("useBiggerFont") ? vis.get("fonts.heading") : vis.get("fonts.body");
    }

    drawRuleCard(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // the unique number of this card
        const textConfigID = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.rules.id.fontSize")
        }).alignCenter();
        const resTextID = new ResourceText(this.uniqueNumber.toString(), textConfigID);
        const opTextID = new LayoutOperation({
            pos: vis.get("cards.rules.id.pos"),
            size: new Point(2.0 * textConfigID.size),
            fill: "#666666",
            pivot: Point.CENTER
        });
        group.add(resTextID, opTextID);

        // the rule text
        const textConfig = new TextConfig({
            font: this.getBodyFont(vis),
            size: vis.get("cards.rules.fontSize"),
            resLoader: vis.resLoader
        }).alignCenter();
        const resTextRule = new ResourceText(this.actionString, textConfig);
        const boxSize = vis.get("cards.rules.textBoxSize");
        const opTextRule = new LayoutOperation({
            pos: vis.get("cards.rules.rule.pos"),
            size: boxSize,
            pivot: Point.CENTER,
            fill: "#000000"
        });
        group.add(resTextRule, opTextRule);

        // the rule icon
        const iconSize = vis.get("cards.rules.iconSize");
        const resIconRule = vis.getResource("rule_icons");
        const ruleData = this.getActionData();
        const effects = [new GlowEffect({ blur: 0.05*iconSize.x })];
        const opIconRule = new LayoutOperation({
            pos: vis.get("cards.rules.rule.posIcon"),
            size: iconSize,
            pivot: Point.CENTER,
            frame: ruleData.frame,
            effects: effects,
            alpha: vis.inkFriendly ? 0.5 : 1.0
        });
        group.add(resIconRule, opIconRule);

        // the finish text
        const resTextFinish = new ResourceText(this.finishReqString, textConfig);
        const opTextFinish = new LayoutOperation({
            pos: vis.get("cards.rules.finish.pos"),
            size: boxSize,
            pivot: Point.CENTER,
            fill: "#000000"
        });
        group.add(resTextFinish, opTextFinish);

        // the finish icon
        const resIconFinish = vis.getResource("finish_icons");
        const finishData = this.getFinishReqData();
        const opIconFinish = new LayoutOperation({
            pos: vis.get("cards.rules.finish.posIcon"),
            size: iconSize,
            pivot: Point.CENTER,
            frame: finishData.frame,
            effects: effects,
            alpha: vis.inkFriendly ? 0.5 : 1.0
        });
        group.add(resIconFinish, opIconFinish);
    }
}