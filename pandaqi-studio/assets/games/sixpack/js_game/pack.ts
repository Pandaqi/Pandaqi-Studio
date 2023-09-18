import Card from "./card"
import CONFIG from "./config";

export default class Pack 
{
    type: string;
    hands: number[];
    cards: Card[];

    constructor(type: string)
    {
        this.type = type;
        this.setupHands();
        this.setupCards();
    }

    getNumberWithLeastHands(dict: Record<number, number>, exclude = [])
    {
        const nums = Object.keys(dict);
        for(const elem of exclude)
        {
            if(!nums.includes(elem)) { continue; }
            nums.splice(nums.indexOf(elem), 1);
        }

        let lowestCount = Infinity;
        for(const num of nums)
        {
            if(dict[num] >= lowestCount) { continue; }
            lowestCount = dict[num];
        }

        const arr = [];
        for(const num of nums)
        {
            if(dict[num] != lowestCount) { continue; }
            arr.push(parseInt(num));
        }

        if(arr.length <= 0) { 
            return CONFIG.numberList[Math.floor(Math.random() * CONFIG.numberList.length)];
        }

        return arr[Math.floor(Math.random() * arr.length)];
    }

    setupHands()
    {
        const hands = [];
        this.hands = hands;
        for(let i = 0; i < CONFIG.numHandsPerPack; i++)
        {
            const num = this.getNumberWithLeastHands(CONFIG.handsPerNumber, hands);
            hands.push(num);
            CONFIG.handsPerNumber[num]++;
        }
    }

    setupCards()
    {
        const cards = [];
        this.cards = cards;
        for(const num of CONFIG.numberList)
        {
            const cardParams = {
                num: num,
                type: this.type,
                hand: this.hands.includes(num)
            }

            const c = new Card(cardParams);
            cards.push(c);
        }
    }

    async visualize()
    {
        const promises = [];
        for(const card of this.cards)
        {
            promises.push(card.visualize());
        }
        return await Promise.all(promises);
    }
}