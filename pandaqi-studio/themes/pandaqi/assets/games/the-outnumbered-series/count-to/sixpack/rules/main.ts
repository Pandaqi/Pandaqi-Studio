import { getMaterialDataForRulebook, shuffle } from "lib/pq-games";
import { InteractiveExampleSimulator, loadRulebook } from "lib/pq-rulebook";
import { CONFIG } from "../shared/config";
import { PACKS } from "../shared/dict";

const cardDrawConfig = 
{
    active: true,
    size: { width: 64, height: 96 },
    fontSize: 28,
    handFontSize: 14,
    fontFamily: "londrina",
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

const getRandomNum = () => { return 1 + Math.floor(Math.random()*6); }
const getRandomHands = () => { return Math.random() <= 0.33; };
const printCardList = (o, arr) =>
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
}

const getClaimResult = (card, isReversed = false) : string =>
{
    const hasHand = isReversed ? !card.hasHand() : card.hasHand()

    let txt = "The player gets the <strong>" + card.getNum() + "</strong> card in their hand!"
    if(!hasHand) { txt = "The pile has no hand, so this player gets nothing back."; }
    return " <em>(" + txt + ")</em>";
}

const isGameReversed = (piles) : boolean =>
{
    let numReverse = 0;
    for(const pile of piles)
    {
        if(pile.getType() != "reverse") { continue; }
        numReverse++;
    }

    return numReverse % 2 == 1
}

const getFirstCard = (cards, isReversed = false) : Card|null =>
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
}

const getClosestPile = (card, piles, isReversed = false) : Card|null =>
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
}

const hasPileWithSameNumber = (card, piles) =>
{
    for(const pile of piles)
    {
        if(card.getNum() == pile.getNum()) { return true; }
    }
    return false;
}

//
// For the default interactive example
//
export const generateForRulebook = async (sim:InteractiveExampleSimulator, includeReverse = false) =>
{
    await sim.loadMaterialCustom(getMaterialDataForRulebook(CONFIG));

    const e = sim.getExample();
    const o = sim.getOutputBuilder();
    const maxPlayers = includeReverse ? 4 : 5;
    const numPlayers = e.getNumPlayers(3,maxPlayers)
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
        typesCached.push(e.getRandomFromList(types, 1)[0] as string);
    }

    shuffle(typesCached)

    // determine piles on the table
    const piles : Card[] = [];
    for(let i = 0; i < numPiles; i++)
    {
        const card = new Card(getRandomNum(), getRandomHands(), typesCached.pop());
        piles.push(card);
    }

    o.addParagraph("These piles are on the table: ");
    printCardList(o, piles);

    // determine cards played
    const cardsPlayed : Card[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        const card = new Card(getRandomNum(), getRandomHands(), typesCached.pop());
        cardsPlayed.push(card);
    }

    o.addParagraph("These cards were played: ");
    printCardList(o, cardsPlayed);

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
        const isReversed = isGameReversed(piles);
        const card = getFirstCard(cardsWithoutDuplicates, isReversed) as Card;
        cardsWithoutDuplicates.splice(cardsWithoutDuplicates.indexOf(card), 1);

        const myNum = card.getNum();
        const closestPile = getClosestPile(card, piles, isReversed);
        const samePile = hasPileWithSameNumber(card, piles);

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
                txt += getClaimResult(closestPile, isReversed)
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
        txt += getClaimResult(randPile);

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
    printCardList(o, piles);
}

const CONFIG_RULEBOOK = 
{
    examples:
    {
        "turn":
        {
            buttonText: "Give me an example turn!",
            callback: generateForRulebook,
        },

        "turn-reverse":
        {
            buttonText: "Give me an example turn!",
            callback: (sim) => { generateForRulebook(sim, true) },
        },
    },

    icons:
    {
        packs:
        {
            config:
            {
                sheetURL: "card_types.webp",
                sheetWidth: 8,
                base: "/the-outnumbered-series/count-to/sixpack/assets/",
            },
            icons: PACKS
        },
    }
}

loadRulebook(CONFIG_RULEBOOK);