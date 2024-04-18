import fromArray from "js/pq_games/tools/random/fromArray";
import CONFIG from "../js_shared/config";
import { CardType, ICONS, VoteDetails, VoteType } from "../js_shared/dict";
import Card from "./card";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class VotePicker
{
    cards: Card[]

    get() { return this.cards.slice(); }
    generate()
    {
        this.cards = [];
        this.generateVotesBase();
        this.generateVotesChange();
        console.log(this.cards);
    }

    drawBalancedCombo(stats:Record<string, number>, subType:VoteType) : VoteDetails
    {
        let num = CONFIG.generation.comboNumBounds[subType].randomInteger();

        // find least used icon
        let leastUsedIcon = null;
        let leastUsedFreq = Infinity;
        for(const icon of Object.keys(ICONS))
        {
            const freq = stats[icon] ?? 0;
            if(freq >= leastUsedFreq) { continue; }
            leastUsedFreq = freq;
            leastUsedIcon = icon;
        }

        // check how bad the situation is
        // any icons still close to it are still considered as valid options
        const iconOptions = [];
        for(const icon of Object.keys(ICONS))
        {
            const freq = stats[icon] ?? 0;
            const dist = Math.abs(freq - leastUsedFreq);
            if(dist > num) { continue; }
            iconOptions.push(icon);
        }
        
        const finalIcon = fromArray(iconOptions);
        return { icon: finalIcon, num: num };
    }

    registerComboStats(stats:Record<string,number>, combo:VoteDetails)
    {
        if(!stats[combo.icon]) { stats[combo.icon] = 0; }
        stats[combo.icon] += combo.num;
    }

    generateVotesBase()
    {
        if(!CONFIG.sets.base) { return; }

        const num = CONFIG.generation.numVoteCards;

        // first prepare a balanced set of icon + number combinations
        const combos = { [VoteType.YES]: [], [VoteType.NO]: [] };
        const stats = {};

        for(let i = 0; i < num; i++)
        {
            const subType = (i % 2 == 0) ? VoteType.YES : VoteType.NO;
            const combo = this.drawBalancedCombo(stats, subType);
            this.registerComboStats(stats, combo);
            combos[subType].push(combo);
        }

        shuffle(combos[VoteType.YES]);
        shuffle(combos[VoteType.NO]);

        // then just add those to 50% YES and 50% NO cards
        for(let i = 0; i < num; i++)
        {
            const subType = (i % 2 == 0) ? VoteType.YES : VoteType.NO;
            const card = new Card(CardType.VOTE, subType);
            const combo = combos[subType].pop();
            card.setVoteDetails(combo);
            this.cards.push(card);
        }

        console.log("== (DEBUGGING) VOTE STATS ==");
        console.log(stats);
    }

    generateVotesChange()
    {
        if(!CONFIG.sets.breakingChanges) { return; }
        
        // create change cards with unique, ascending numbers
        const numChange = CONFIG.generation.numChangeCards;
        for(let i = 1; i <= numChange; i++)
        {
            const card = new Card(CardType.VOTE, VoteType.CHANGE);
            card.setVoteDetails({ icon: null, num: i });
            this.cards.push(card);
        }
    }
}