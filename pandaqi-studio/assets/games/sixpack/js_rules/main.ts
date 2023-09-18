import InteractiveExample from "js/pq_rulebook/examples/interactiveExample"
import shuffle from "js/pq_games/tools/random/shuffle"

const cardDrawConfig = {
    active: true,
    size: { width: 64, height: 96 },
    fontSize: 28,
    handFontSize: 14,
    fontFamily: "Londrina Solid",
    typeColors: {
        blank: "#FFFFFF",
        reverse: "#FFAAAA"
    }
}

class Card
{
    num: number;
    hand: boolean;
    type: string;

    constructor(num = 1, hand = false, type = "blank")
    {
        this.num = num;
        this.hand = hand;
        this.type = type;
    }

    copy(card)
    {
        this.setNum(card.getNum());
        this.setHand(card.hasHand());
        this.setType(card.getType());
    }

    getNum() { return this.num; }
    setNum(n) { this.num = n; }
    hasHand() { return this.hand; }
    setHand(h) { this.hand = h; }
    getType() { return this.type; }
    setType(t) { this.type = t; }

    print()
    {
        let txt = "<strong>" + this.num + "</strong>"
        if(this.hasHand()) { txt += " (hand)"; }
        return txt;
    }

    draw()
    {
        const canvas = document.createElement("canvas");
        canvas.width = cardDrawConfig.size.width;
        canvas.height = cardDrawConfig.size.height;

        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        // bg + outline
        console.log(this.getType());
        ctx.fillStyle = cardDrawConfig.typeColors[this.getType()];
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 5
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // main number
        ctx.font = cardDrawConfig.fontSize + "px " + cardDrawConfig.fontFamily;
        ctx.textAlign = "center";
        ctx.fillStyle = "#333333";
        ctx.fillText(this.getNum().toString(), 0.5*canvas.width, 0.5*canvas.height + cardDrawConfig.fontSize);

        // draw hand
        if(this.hasHand())
        {
            ctx.font = cardDrawConfig.handFontSize + "px " + cardDrawConfig.fontFamily;
            ctx.fillStyle = "#777777";
            ctx.fillText("H", 0.5*canvas.width, 0.2*canvas.height)
        }


        return canvas
    }
}

const tools = {
    getRandomNum()
    {
        return 1 + Math.floor(Math.random()*6);
    },

    getRandomHands()
    {
        return Math.random() <= 0.33;
    },

    printCardList(o, arr)
    {
        const list : any[] = [];
        const drawCards = cardDrawConfig.active;
        for(const card of arr)
        {
            const val = drawCards ? card.draw() : card.print();
            list.push(val);
        }

        if(drawCards) { o.addFlexList(list); }
        else { o.addParagraphList(list); }   
    },

    getClaimResult(card, isReversed = false) : string
    {
        const hasHand = isReversed ? !card.hasHand() : card.hasHand()

        let txt = "The player gets the <strong>" + card.getNum() + "</strong> card in their hand!"
        if(!hasHand) { txt = "The pile has no hand, so this player gets nothing back."; }
        return " <em>(" + txt + ")</em>";
    },

    isReversed(piles) : boolean
    {
        let numReverse = 0;
        for(const pile of piles)
        {
            if(pile.getType() != "reverse") { continue; }
            numReverse++;
        }

        return numReverse % 2 == 1
    },

    getFirstCard(cards, isReversed = false) : Card|null
    {
        const dir = isReversed ? "descending" : "ascending";
        let bestCard : Card|null = null;
        let bestNum = (dir == "descending") ? -1 : Infinity;
        for(const card of cards)
        {
            const num = card.getNum();
            if(dir == "ascending" && num >= bestNum) { continue; }
            if(dir == "descending" && num <= bestNum) { continue; }
            bestNum = num;
            bestCard = card;
        }
        return bestCard;
    },

    getClosestPile(card, piles, isReversed = false) : Card|null
    {
        const myNum = card.getNum();
        const dir = isReversed ? "descending" : "ascending";
        let bestPile : Card|null = null;
        let bestNum = (dir == "descending") ? Infinity : -1;
        for(const pileCard of piles)
        {
            const pileNum = pileCard.getNum()
            if(dir == "ascending" && pileNum >= myNum) { continue; }
            if(dir == "descending" && pileNum <= myNum) { continue; }

            if(dir == "ascending" && pileNum <= bestNum) { continue; }
            if(dir == "descending" && pileNum >= bestNum) { continue; }

            bestPile = pileCard;
            bestNum = pileNum;
        }

        return bestPile;
    },

    hasPileWithSameNumber(card, piles)
    {
        for(const pile of piles)
        {
            if(card.getNum() == pile.getNum()) { return true; }
        }
        return false;
    }
}

//
// For the default interactive example
//
function generate(o = o1, includeReverse = false)
{
    const maxPlayers = includeReverse ? 4 : 5;
    const numPlayers = e1.getNumPlayers(3,maxPlayers)
    const names = e1.getNames(numPlayers);
    const numPiles = 3;

    const types = ["blank"];
    const typesCached : string[] = [];
    if(includeReverse) 
    {
        types.push("reverse"); 
        typesCached.push("reverse"); 
    }

    while(typesCached.length < (numPiles + numPlayers))
    {
        typesCached.push(e1.getRandomFromList(types, 1)[0]);
    }

    shuffle(typesCached)

    // determine piles on the table
    const piles : Card[] = [];
    for(let i = 0; i < numPiles; i++)
    {
        const card = new Card(tools.getRandomNum(), tools.getRandomHands(), typesCached.pop());
        piles.push(card);
    }

    o.addParagraph("These piles are on the table: ");
    tools.printCardList(o, piles);

    // determine cards played
    const cardsPlayed : Card[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        const card = new Card(tools.getRandomNum(), tools.getRandomHands(), typesCached.pop());
        cardsPlayed.push(card);
    }

    o.addParagraph("These cards were played: ");
    tools.printCardList(o, cardsPlayed);

    // remove duplicates
    const numFrequency = [0,0,0,0,0,0];
    for(const card of cardsPlayed)
    {
        numFrequency[card.getNum()-1]++;
    }

    const cardsWithoutDuplicates : Card[] = [];
    for(const card of cardsPlayed)
    {
        if(numFrequency[card.getNum()-1] != 1) { continue; }
        cardsWithoutDuplicates.push(card);
    }

    // handle low to high
    const list : string[] = [];
    const noCardsToPlay = cardsWithoutDuplicates.length <= 0;
    while(cardsWithoutDuplicates.length > 0)
    {
        const isReversed = tools.isReversed(piles);
        const card = tools.getFirstCard(cardsWithoutDuplicates, isReversed) as Card;
        cardsWithoutDuplicates.splice(cardsWithoutDuplicates.indexOf(card), 1);

        const myNum = card.getNum();
        const closestPile = tools.getClosestPile(card, piles, isReversed);
        const samePile = tools.hasPileWithSameNumber(card, piles);

        console.log(card);

        if(includeReverse)
        {
            if(isReversed) { list.push("Play is currently <em>reversed</em>"); }
            else { list.push("Play is currently <em>normal</em>"); }
        }

        if(closestPile)
        {
            const closestNumber = closestPile.getNum();
            let txt = "The <strong>" + myNum + "</strong> card is played on the <strong>" + closestNumber + "</strong> pile.";

            const isExtreme = (myNum == 6);
            if(isExtreme) 
            { 
                txt += " It's the extreme card, so the pile is claimed!";
                txt += tools.getClaimResult(closestPile, isReversed)
            }

            list.push(txt);
            closestPile.copy(card);
            continue;
        }

        if(samePile)
        {
            let txt = "The <strong>" + myNum + "</strong> card is taken back into the hand."
            list.push(txt);
            continue;
        }

        const randPile = piles[Math.floor(Math.random() * piles.length)];
        const randPileNum = randPile.getNum();

        let txt = "The <strong>" + myNum + "</strong> card fits nowhere!";
        txt += " It claims the <strong>" + randPileNum + "</strong> pile.";
        txt += tools.getClaimResult(randPile);

        randPile.copy(card);
        list.push(txt);
    }
    
    if(noCardsToPlay) {
        o.addParagraph("Nothing is played, because all these cards are duplicates!");
    } else {
        o.addParagraph("They were handled like this: ");
        o.addParagraphList(list);  
    }

    o.addParagraph("At the end of the round, the piles look like this:");
    tools.printCardList(o, piles);
}

const e1 = new InteractiveExample({ id: "turn" });
e1.setButtonText("Give me an example turn!");
e1.setGenerationCallback(generate);

const o1 = e1.getOutputBuilder();

//
// for the interactive example with Reverse cards
//
function generateReverse()
{
    generate(o2, true)
}

const e2 = new InteractiveExample({ id: "turn-with-reverse" });
e2.setButtonText("Give me an example turn!");
e2.setGenerationCallback(generateReverse);

const o2 = e2.getOutputBuilder();
