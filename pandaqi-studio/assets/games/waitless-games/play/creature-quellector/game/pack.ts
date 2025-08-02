import Card from "./card"
import { CONFIG } from "../shared/config"
import Random from "js/pq_games/tools/random/main"
import { TypeStats } from "./main"
import ElementIcon from "./elementIcon"

export default class Pack
{
    element : string = "fire"
    subtype : string = "fire"
    cards : Card[]

    constructor(e:string, s:string)
    {
        this.element = e;
        this.subtype = s;
    }

    async draw()
    {
        const promises = [];
        for(const card of this.cards)
        {
            promises.push(card.draw());
        }
        return await Promise.all(promises);
    }

    createCards(stats:TypeStats)
    {
        let num = CONFIG.cards.numPerElement;
        if(CONFIG.debugSingleCard) { num = 1; }

        const cards = [];

        const iconDistribution = [];
        const maxIcons = CONFIG.cards.iconsPerCard;
        for(let i = 0; i < Math.ceil(num/maxIcons); i++)
        {
            for(let a = 1; a <= maxIcons; a++)
            {
                iconDistribution.push(a);
            }
        }

        Random.shuffle(iconDistribution);

        const subtypeAsIcon = new ElementIcon(this.subtype, false, "");

        for(let i = 0; i < num; i++)
        {
            var numIcons = iconDistribution[i];
            var iconList = this.getBalancedIconList(numIcons, stats);
            var c = new Card(subtypeAsIcon, iconList);
            cards.push(c);
        }

        this.cards = cards;
    }

    registerTypePicked(elem:ElementIcon, stats:TypeStats)
    {
        if(elem.action) { stats[elem.type].action += 1; }
        else { stats[elem.type].regular += 1; }
        stats[elem.type].total = stats[elem.type].regular + stats[elem.type].action;
    }

    shouldTurnIntoAction(elem: ElementIcon, stats:TypeStats) : boolean
    {
        let numIcons = 0;
        let numActionIcons = 0;
        let numActionIconsType = 0;

        const numUniqueTypes = Object.values(stats).length;
        for(const [element,data] of Object.entries(stats))
        {
            numIcons += data.total;
            numActionIcons += data.action;
            if(element == elem.type) { numActionIconsType += data.action; }
        }

        // at very low icon counts (just starting generation), these calculations are useless and
        // most likely to screw up the balance of early cards
        if(numIcons < CONFIG.gameplay.actionPickThreshold) { return false; }

        const ap = CONFIG.gameplay.actionPercentage;
        const upperBound = ap.max * numIcons;
        if(numActionIcons >= upperBound) { return false; }

        const lowerBound = ap.min * numIcons;
        if(numActionIcons <= lowerBound) { return true; }

        const apt = CONFIG.gameplay.actionPercentagePerType;
        const upperBoundType = apt.max * (numIcons / numUniqueTypes);
        if(numActionIconsType >= upperBoundType) { return false; }

        const lowerBoundType = apt.min * (numIcons / numUniqueTypes);
        if(numActionIconsType <= lowerBoundType) { return true; }

        return Math.random() <= CONFIG.gameplay.actionProbability;
    }
    
    getDefaultElement()
    {
        return new ElementIcon(this.subtype, false);
    }

    getBalancedIconList(num:number, stats:TypeStats) : ElementIcon[]
    {
        const arr = [];
        if(CONFIG.alwaysAddMainTypeOnce)
        {
            const elem = this.getDefaultElement();
            arr.push(elem);
            this.registerTypePicked(elem, stats);
        }

        while(arr.length < num)
        {
            const icon = this.drawRandomIconBalanced(stats);
            this.registerTypePicked(icon, stats);
            arr.push(icon);
        }

        return arr;
    }

    getMultiIconType(icon:ElementIcon, stats:TypeStats) : string
    {
        const isAction = icon.action; // action types can't be multitype
        if(!CONFIG.multiType || isAction) { return ""; }
        
        let shouldAdd = Math.random() <= CONFIG.gameplay.multiTypeProbability;
        if(!shouldAdd) { return ""; }

        // @TODO: more balancing checks for whether we should add; possibly track in stats

        const allTypes = Object.values(CONFIG.elements);
        allTypes.splice(allTypes.indexOf(icon.type), 1);
        return Random.fromArray(allTypes) as string;
    }

    drawRandomIconBalanced(stats:TypeStats) : ElementIcon
    {
        const options = Object.keys(stats);
        options.sort((a:string, b:string) => {
            return stats[a].total - stats[b].total;
        })

        const rarestElement = options[0];
        const mostCommonElement = options[options.length - 1];

        // by default, pick randomly
        let finalType = Random.fromArray(options);

        // picking our main type (for this card) again has a higher probability
        const pickSubType = Math.random() <= CONFIG.cards.generator.subTypeExtraProb;
        if(pickSubType) { finalType = this.subtype; }

        // if one element is used WAAAY too little, always pick that
        const maxDiff = CONFIG.cards.generator.maxDifferenceBetweenTypes;
        const elementTooRare = (stats[mostCommonElement].total - stats[rarestElement].total) >= maxDiff;
        if(elementTooRare) { finalType = rarestElement; }

        const icon = new ElementIcon(finalType);
        icon.action = this.shouldTurnIntoAction(icon, stats);
        icon.multi = this.getMultiIconType(icon, stats);
        return icon;
    }
}