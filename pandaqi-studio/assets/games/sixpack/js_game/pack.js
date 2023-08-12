import Card from "./card"

export default class Pack {
    constructor(type, config)
    {
        this.type = type;
        this.config = config;
        this.setupHands();
        this.setupCards();
        this.visualize();
    }

    getNumberWithLeastHands(dict, exclude = [])
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
            return this.config.numberList[Math.floor(Math.random() * this.config.numberList.length)];
        }

        return arr[Math.floor(Math.random() * arr.length)];
    }

    setupHands()
    {
        const hands = [];
        this.hands = hands;
        for(let i = 0; i < this.config.numHandsPerPack; i++)
        {
            const num = this.getNumberWithLeastHands(this.config.handsPerNumber, hands);
            hands.push(num);
            this.config.handsPerNumber[num]++;
        }
    }

    setupCards()
    {
        const cards = [];
        this.cards = cards;
        for(const num of this.config.numberList)
        {
            const cardParams = {
                num: num,
                type: this.type,
                hand: this.hands.includes(num)
            }

            const c = new Card(cardParams, this.config);
            cards.push(c);
        }
    }

    visualize()
    {
        for(const card of this.cards)
        {
            card.visualize();
            this.config.gridMapper.addElement(card.getCanvas());
        }
    }
}