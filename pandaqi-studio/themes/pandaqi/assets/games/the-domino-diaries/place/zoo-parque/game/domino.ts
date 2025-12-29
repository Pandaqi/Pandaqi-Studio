
import { fromArray, MaterialVisualizer, createContext, fillCanvas, ResourceGroup, Vector2, LayoutOperation, TextConfig, ResourceText, DropShadowEffect } from "lib/pq-games";
import { CAMPAIGN_MISSIONS, CAMPAIGN_RULES, CampType, DYNAMIC_REPLACEMENTS, DominoType, MISC } from "../shared/dict";
import DominoSide from "./dominoSide";

const CAMP_TYPES = {
    [CampType.WIN]: { frame: 0, textColor: "#dbffda" },
    [CampType.REPLACE]: { frame: 1, textColor: "#ebe2ff" },
    [CampType.ENDGAME]: { frame: 2, textColor: "#ffc2c8" },
}

export default class Domino
{
    type:DominoType;
    pawnIndex:number = -1; // just a quick hack to also reuse this class for drawing the pawns/claim cubes
    sides:{ top:DominoSide, bottom:DominoSide }
    set:string;
    entrance:boolean = false;

    campaignRuleKey:string
    campaignRuleText:string

    campaignScore: number
    campaignMissionKey: string
    campaignMissionText: string
    campaignMissionType: CampType

    constructor(type:DominoType)
    {
        this.type = type;
        this.sides = { top: null, bottom: null };
    }

    setPawnIndex(i:number)
    {
        this.pawnIndex = i;
    }
    
    getSidesAsArray()
    {
        return [this.sides.top, this.sides.bottom];
    }

    setSides(a:DominoSide, b:DominoSide)
    {
        this.sides.top = a;
        this.sides.bottom = b;
    }

    setSet(s:string)
    {
        this.set = s;
    }

    fillInDynamicValues(str:string)
    {
        for(const [key,options] of Object.entries(DYNAMIC_REPLACEMENTS))
        {
            if(!str.includes(key)) { continue; }
            str = str.replace(key, fromArray(options).toString());
        }
        return str;
    }

    getRuleData()
    {
        return CAMPAIGN_RULES[this.campaignRuleKey];
    }

    setCampaignRule(r:string)
    {
        this.campaignRuleKey = r;
        this.campaignRuleText = this.fillInDynamicValues(CAMPAIGN_RULES[r].desc);
    }

    getMissionData()
    {
        return CAMPAIGN_MISSIONS[this.campaignMissionKey];
    }

    setCampaignMission(data:{ missionKey:string, numIndex:number, type:CampType }, score:number)
    {
        this.campaignMissionKey = data.missionKey;
        this.campaignScore = score;

        // if set, already fill in the scaling num
        const missionData = CAMPAIGN_MISSIONS[data.missionKey];
        let str = missionData.desc;
        if(data.numIndex >= 0)
        {
            str = str.replace("%num%", missionData.numScale[data.numIndex]);
        }

        this.campaignMissionType = data.type;
        this.campaignMissionText = this.fillInDynamicValues(str);
    }

    async draw(vis:MaterialVisualizer)
    {
        const ctx = createContext({ size: vis.size });
        const bgColor = vis.inkFriendly ? "#FFFFFF" : vis.get("dominoes.bg.color");
        fillCanvas(ctx, bgColor);

        const group = new ResourceGroup();

        if(this.type == DominoType.PAWN) {
            this.drawPawn(vis, group);
        } else if(this.type == DominoType.CAMPAIGN) {
            this.drawCampaign(vis, group);
        } else if(this.type == DominoType.REGULAR) {
            this.drawBothParts(vis, group);
            this.drawSetIndicator(vis, group);
            this.drawEntrance(vis, group);
        }

        group.toCanvas(ctx);
        return ctx.canvas;
    }

    drawPawn(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const res = vis.getResource("pawns");
        const size = new Vector2(vis.sizeUnit);
        
        const opTop = new LayoutOperation({
            pos: new Vector2(vis.size.x, vis.center.y),
            frame: this.pawnIndex,
            size: size,
            rot: Math.PI
        });
        group.add(res, opTop);

        const opBottom = new LayoutOperation({
            pos: new Vector2(0, vis.center.y),
            frame: this.pawnIndex,
            size: size
        });
        group.add(res, opBottom);
    }

    drawCampaign(vis:MaterialVisualizer, group:ResourceGroup)
    {
        // background
        const campTypeData = CAMP_TYPES[this.campaignMissionType];
        const res = vis.getResource("campaign_templates");
        const op = new LayoutOperation({
            size: vis.size,
            frame: campTypeData.frame,
            effects: vis.inkFriendlyEffect
        });
        group.add(res, op);

        // specifics
        // > the score/value of this card
        const textConfigScore = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("dominoes.campaign.score.fontSize")
        }).alignCenter();
        const resTextScore = new ResourceText(this.campaignScore.toString(), textConfigScore);
        const opTextScore = new LayoutOperation({
            pos: vis.get("dominoes.campaign.score.pos"),
            size: new Vector2(3.0 * textConfigScore.size),
            pivot: Vector2.CENTER,
            fill: vis.inkFriendly ? "#EEEEEE" : campTypeData.textColor,
        })    
        group.add(resTextScore, opTextScore);

        // > the mission text
        const textBoxSize = vis.get("dominoes.campaign.textBoxSize");
        const textConfig = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("dominoes.campaign.fontSize"),
            resLoader: vis.resLoader
        }).alignCenter();
        const resTextEvent = new ResourceText(this.campaignMissionText, textConfig);
        const opTextEvent = new LayoutOperation({
            pos: vis.get("dominoes.campaign.posMission"),
            fill: "#000000",
            size: textBoxSize,
            pivot: Vector2.CENTER,
        })
        group.add(resTextEvent, opTextEvent);

        // > the challenge text
        const resTextChallenge = new ResourceText(this.campaignRuleText, textConfig);
        const opTextChallenge = new LayoutOperation({
            pos: vis.get("dominoes.campaign.posRule"),
            fill: "#000000",
            size: textBoxSize,
            pivot: Vector2.CENTER,
        })
        group.add(resTextChallenge, opTextChallenge);

        // > expansions needed
        const textConfigExpansions = new TextConfig({
            font: vis.get("fonts.body"),
            size: vis.get("dominoes.campaign.expansions.fontSize")
        }).alignCenter();
        const challengeSets = this.getMissionData().sets ?? ["base"];
        const strExp = challengeSets.join(", ");
        const resTextExpansions = new ResourceText(strExp, textConfigExpansions);
        const opTextExpansions = new LayoutOperation({
            pos: vis.get("dominoes.campaign.expansions.pos"),
            size: textBoxSize,
            fill: "#000000",
            alpha: vis.get("dominoes.campaign.expansions.alpha"),
            pivot: Vector2.CENTER
        })
        group.add(resTextExpansions, opTextExpansions);
    }

    drawBothParts(vis:MaterialVisualizer, group:ResourceGroup)
    {
        const opTop = new LayoutOperation({
            pos: new Vector2(vis.center.x, 0.25*vis.size.y),
            pivot: Vector2.CENTER
        });
        group.add(this.sides.top.draw(vis), opTop);

        const opBottom = new LayoutOperation({
            pos: new Vector2(vis.center.x, 0.75*vis.size.y),
            pivot: Vector2.CENTER
        })
        group.add(this.sides.bottom.draw(vis), opBottom);

        // fences go on top of everything!
        group.add(this.sides.top.drawFences(vis), opTop);
        group.add(this.sides.bottom.drawFences(vis), opBottom);
    }

    drawSetIndicator(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(this.set == "base" || !this.set) { return; }

        let setID = "B";
        if(this.set == "strong") { setID = "S"; }
        else if(this.set == "wildlife") { setID = "W"; }
        else if(this.set == "utilities") { setID = "U"; }

        const text = setID;
        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("dominoes.setText.fontSize")
        })
        const resText = new ResourceText({ text, textConfig });
        const textColor = vis.inkFriendly ? "#000000" : "#442200";
        const opText = new LayoutOperation({
            pos: new Vector2(1.33*textConfig.size), 
            pivot: Vector2.CENTER,
            fill: textColor,
            alpha: 0.75,
            size: new Vector2(2*textConfig.size)
        });
        group.add(resText, opText);
    }

    drawEntrance(vis:MaterialVisualizer, group:ResourceGroup)
    {
        if(!this.entrance) { return; }

        const res = vis.getResource("misc");
        const glowEffect = new DropShadowEffect({ color: "#FFFFFF", blurRadius: 0.05 * vis.sizeUnit });
        const op = new LayoutOperation({
            frame: MISC.entrance.frame,
            pos: new Vector2(vis.center.x, 0.25*vis.size.y),
            size: vis.get("dominoes.entrance.size"),
            effects: [glowEffect, vis.inkFriendlyEffect].flat(),
            pivot: Vector2.CENTER
        });
        group.add(res, op);
    }

}