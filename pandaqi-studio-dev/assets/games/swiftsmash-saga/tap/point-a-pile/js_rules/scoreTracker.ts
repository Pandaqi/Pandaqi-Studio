import Card from "../js_game/card";

export default class ScoreTracker
{
    calculate(c:Card, allCards:Card[])
    {
        const key = c.action;
        const func = this[key];
        if(typeof func != "function") { return 0; }
        return func.call(this, c, allCards);
    }
    
    getColorFrequencies(cards:Card[])
    {
        const freqs = {};
        for(const card of cards)
        {
            freqs[card.color] = (freqs[card.color] ?? 0) + 1;
        }
        return freqs;
    }

    score_raw(c:Card, all:Card[])
    {
        return c.dynamicValues[0];
    }

    color_match(c:Card, all:Card[])
    {
        const color = c.dynamicValues[1];
        const freq = this.getColorFrequencies(all)[color] ?? 0;
        return freq * c.dynamicValues[0];
    }

    color_diff(c:Card, all:Card[])
    {
        const hasAllColors = Object.keys(this.getColorFrequencies(all)).length >= 4;
        return hasAllColors ? c.dynamicValues[0] : 0;
    }

    color_group(c:Card, all:Card[])
    {
        const freqs = this.getColorFrequencies(all);
        const score = c.dynamicValues[0];
        const threshold = c.dynamicValues[1];
        for(const [key,freq] of Object.entries(freqs))
        {
            if(freq >= threshold) { return score; }
        }
        return 0;
    }

    color_specific(c:Card, all:Card[])
    {
        const color = c.dynamicValues[1];
        const threshold = c.dynamicValues[2];
        const freq = this.getColorFrequencies(all)[color] ?? 0;
        return freq >= threshold ? c.dynamicValues[3] : 0;
    }

    num_cards(c:Card, all:Card[])
    {
        return all.length >= c.dynamicValues[1] ? c.dynamicValues[0] : 0;
    }

    empty_bonus(c:Card, all:Card[])
    {
        let numTextless = all.filter((c:Card) => c.action == "empty").length;
        return numTextless * c.dynamicValues[0];
    }

    score_temporary(c:Card, all:Card[])
    {
        const isLastCard = all.indexOf(c) == (all.length - 1);
        return isLastCard ? c.dynamicValues[0] : 0;
    }

    // left out score_headpointer; too much hassle for no real benefit
}