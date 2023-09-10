import Card from "./card"
import CONFIG from "./config"
import Random from "js/pq_games/tools/random/main"

export default class Pack
{
    element : string = "fire"
    subtype : string = "fire"
    cards : Card[]

    constructor(e:string, s:string, stats:Record<string, number>)
    {
        this.element = e;
        this.subtype = s;

        this.createCards(stats);
    }

    async draw()
    {
        for(const card of this.cards)
        {
            await card.draw();
            CONFIG.gridMapper.addElement(card.getCanvas());
        }
    }

    createCards(stats:Record<string,number>)
    {
        let num = CONFIG.cards.numPerElement;
        if(CONFIG.debugSingleCard) { num = 1; }

        const cards = [];

        const iconDistribution = [];
        const maxIcons = CONFIG.cards.iconsPerCard;
        for(let i = 0; i < Math.ceil(num/maxIcons); i++)
        {
            for(let a = 0; a < maxIcons; a++)
            {
                iconDistribution.push(a);
            }
        }

        Random.shuffle(iconDistribution);

        for(let i = 0; i < num; i++)
        {
            var numIcons = iconDistribution[i];
            var iconList = this.getBalancedIconList(numIcons, stats);
            var c = new Card(iconList);
            cards.push(c);
        }

        this.cards = cards;
    }

    getBalancedIconList(num:number, stats:Record<string, number>) : string[]
    {
        const arr = [this.subtype];
        stats[this.subtype] += 1;

        while(arr.length < num)
        {
            const icon = this.drawRandomIconBalanced(stats);
            stats[icon] += 1;
            arr.push(icon);
        }

        return arr;
    }

    drawRandomIconBalanced(stats:Record<string, number>) : string
    {
        const options = Object.keys(stats);
        options.sort((a:string, b:string) => {
            return stats[a] - stats[b];
        })

        const rarestElement = options[0];
        const mostCommonElement = options[options.length - 1];

        const maxDiff = CONFIG.cards.generator.maxDifferenceBetweenTypes;
        const elementTooRare = (stats[mostCommonElement] - stats[rarestElement]) >= maxDiff;
        if(elementTooRare) { return rarestElement; }

        const pickSubType = Math.random() <= CONFIG.cards.generator.subTypeExtraProb;
        if(pickSubType) { return this.subtype; }

        return Random.fromArray(options);
    }
}