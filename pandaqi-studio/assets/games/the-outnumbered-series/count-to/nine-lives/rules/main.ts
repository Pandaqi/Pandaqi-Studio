import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import shuffle from "js/pq_games/tools/random/shuffle";
import Card from "../game/card";
import { CONFIG } from "../shared/config";
import { POWERS } from "../shared/dict";

class Hand
{
    cards:Card[]

    clone() { return new Hand().fromCards(this.cards.slice()); }
    fromCards(c:Card[]) { this.cards = c; this.sort(); return this; }
    fromNum(num:number, allOptions:Card[])
    {
        const cards = [];
        for(let i = 0; i < num; i++)
        {
            cards.push(allOptions.pop());
        }
        return this.fromCards(cards);
    }

    add(c:Card) { this.cards.push(c); }
    remove(c:Card) { this.cards.splice(this.cards.indexOf(c), 1); }

    sort()
    {
        // sort by number of icons on the card (ascending)
        this.cards.sort((a,b) => {
            return a.cats.length - b.cats.length;
        })
    }

    count() { return this.cards.length; }
    cutoff(num:number) { this.cards = shuffle(this.cards.slice(0, num)); this.sort(); }

    getFirstCard() { return this.cards[0]; }

    isValid(move:Card)
    {
        const freqs = this.countCatFrequencies();
        for(const [cat,freq] of Object.entries(freqs))
        {
            if(move.cats.includes(cat) && freq > 9) { return false; }
        }
        return true;
    }

    isPerfectNine(move:Card)
    {
        const freqs = this.countCatFrequencies();
        for(const [cat,freq] of Object.entries(freqs))
        {
            if(!move.cats.includes(cat)) { continue; }
            if(freq != 9) { continue; }
            return true;
        }
        return false;
    }

    countCatFrequencies()
    {
        const dict : Record<string,number> = {};
        for(const card of this.cards)
        {
            for(const cat of card.cats)
            {
                if(!(cat in dict)) { dict[cat] = 0; }
                dict[cat]++;
            }
        }
        return dict;
    }

    async draw(vis:MaterialVisualizer)
    {
        const promises = [];
        for(const card of this.cards)
        {
            promises.push(card.drawForRules(vis));
        }
        const canvases = await Promise.all(promises);

        const imgs = await convertCanvasToImageMultiple(canvases);
        return imgs;
    }
}

const findPossibleMoves = (hand:Hand, table:Hand) : Hand =>
{
    const allMoves = hand.cards;
    const validMoves = [];
    for(const move of allMoves)
    {
        const tableClone = table.clone();
        tableClone.add(move);
        if(!tableClone.isValid(move)) { continue; }
        validMoves.push(move);
    }

    return new Hand().fromCards(validMoves);
}

const generate = async (sim:InteractiveExampleSimulator) =>
{
    CONFIG._settings.includeLifeCards.value = false;
    await sim.loadMaterialCustom(getMaterialDataForRulebook(CONFIG));

    const cardOptions : Card[] = shuffle(sim.getPicker("cards")()).slice() as Card[];
    console.log(cardOptions);

    const o = sim.getOutputBuilder();
    o.addParagraph("These cards are on the table.");
    const numTableCards = rangeInteger(3,5);
    const tableCards = new Hand().fromNum(numTableCards, cardOptions)
    o.addFlexList(await tableCards.draw(sim.getVisualizer()));

    o.addParagraph("These cards are in your hand");
    const numHandCards = rangeInteger(2,4);
    const handCards = new Hand().fromNum(numHandCards, cardOptions);
    o.addFlexList(await handCards.draw(sim.getVisualizer()));

    const possibleMoves = findPossibleMoves(handCards, tableCards);
    if(possibleMoves.count() <= 0) {
        o.addParagraph("You have <strong>no possible moves</strong>. All of these cards make a cat appear more than 9 times. You can give up and lose a life, or wager and hope to be able to play something then.");
    } else {
        o.addParagraph("These are <strong>all</strong> of your possible moves.");
        o.addFlexList(await possibleMoves.draw(sim.getVisualizer()));

        let bestMove = possibleMoves.getFirstCard();
        let perfectNine = false;
        for(const move of possibleMoves.cards)
        {
            const tableClone = tableCards.clone();
            tableClone.add(move);
            if(!tableClone.isPerfectNine(move)) { continue; }
            bestMove = move;
            perfectNine = true;
            break;
        }

        o.addParagraph("You decide to play <strong>option " + (possibleMoves.cards.indexOf(bestMove) + 1) + ".</strong>");

        if(perfectNine) {
            o.addParagraph("Congratulations! You made a cat appear exactly 9 times. You may stop taking turns for the rest of this round.");
        } else {
            o.addParagraph("Next player!");
        }
    }
}

const powersLimited = {};
const powersAll = {};
for(const [key,data] of Object.entries(POWERS))
{
    if(data.core) { powersLimited[key] = data; }
    else { powersAll[key] = data; }
}

CONFIG._rulebook =
{
    examples:
    {
        turn:
        {
            buttonText: "turn",
            callback: generate
        }
    },

    tables:
    {
        "powers-limited":
        {
            icons:
            {
                config:
                {
                    sheetURL: CONFIG.assets.powers.path,
                    sheetWidth: 8,
                    base: CONFIG.assetsBase,
                },
            },
            data: powersLimited
        },

        "powers-advanced":
        {
            icons:
            {
                config:
                {
                    sheetURL: CONFIG.assets.powers.path,
                    sheetWidth: 8,
                    base: CONFIG.assetsBase,
                },
            },
            data: powersAll
        },
    }
}

loadRulebook(CONFIG._rulebook);