import createCanvas from "js/pq_games/layout/canvas/createCanvas";
import Point from "js/pq_games/tools/geometry/point";
import fromArray from "js/pq_games/tools/random/fromArray";
import rangeInteger from "js/pq_games/tools/random/rangeInteger";
import InteractiveExample from "js/pq_rulebook/examples/interactiveExample"
import { CATEGORIES } from "../js_shared/dict"

const CONFIG =
{
    types: ["red", "blue", "green", "purple"],
    canvasSize: new Point(960, 540),
    cardSize: new Point(150, 200),
    paddingBetweenCards: 30,
    mainTypeSize: 0.25, // relative to card size
    typeSize: 0.185, // relative to card size
    paddingBetweenTypes: 0.1, // relative to type size
    includeActions: true,
    actionProb: 0.15,
}

type Stats = Record<string,number>

class Card
{
    mainType: string
    types: string[]
    actions: boolean[]

    constructor()
    {
        let numTypes = rangeInteger(1,4);
        const randType = fromArray(CONFIG.types);
        this.mainType = randType;

        this.types = [];
        this.actions = [];

        // otherwise fill randomly
        for(let i = 0; i < numTypes; i++)
        {
            this.types.push(fromArray(CONFIG.types));
            this.actions.push(CONFIG.includeActions && Math.random() <= CONFIG.actionProb);
        }
    }

    count() { return this.types.length; }
    countActions() : number
    {
        let numActions = 0;
        for(let i = 0; i < this.types.length; i++)
        {
            if(!this.actions[i]) { continue; }
            numActions++;
        }
        return numActions;
    }

    countTypes() : Stats
    {
        const stats : Stats = {}
        for(let i = 0; i < this.types.length; i++)
        {
            if(this.actions[i]) { continue; }
            const type = this.types[i];
            if(!(type in stats)) { stats[type] = 0; }
            stats[type]++;
        }
        return stats;
    }

    draw(ctx:CanvasRenderingContext2D, pos: Point, inverted = false)
    {
        const cardSizeUnit = Math.min(CONFIG.cardSize.x, CONFIG.cardSize.y);
        const invSign = inverted ? -1 : 1;

        // actual card frame
        let topLeft = pos.clone().add(CONFIG.cardSize.clone().scaleFactor(-0.5));
        ctx.fillStyle = CATEGORIES[this.mainType].colorBG;
        ctx.fillRect(topLeft.x, topLeft.y, CONFIG.cardSize.x, CONFIG.cardSize.y);

        // main type
        const mainTypePos = pos.clone();
        mainTypePos.y -= invSign*0.33*cardSizeUnit;
        const mainTypeSize = CONFIG.mainTypeSize*cardSizeUnit;
        ctx.fillStyle = CATEGORIES[this.mainType].color;
        ctx.fillRect(mainTypePos.x - 0.5*mainTypeSize, mainTypePos.y - 0.5*mainTypeSize, mainTypeSize, mainTypeSize);
    
        // individual types
        const typeSize = CONFIG.typeSize*cardSizeUnit;
        const padding = CONFIG.paddingBetweenTypes*typeSize;
        const offsetPerType = Point.RIGHT.clone().scaleFactor(typeSize + padding);
        const typeListPos = pos.clone();
        typeListPos.y += invSign*0.33*cardSizeUnit;
        const offset = offsetPerType.clone().scaleFactor(-0.5 * (this.count() - 1));

        typeListPos.add(offset);

        for(let i = 0; i < this.types.length; i++)
        {
            const type = this.types[i];
            ctx.fillStyle = CATEGORIES[type].color;
            ctx.fillRect(typeListPos.x - 0.5*typeSize, typeListPos.y - 0.5*typeSize, typeSize, typeSize);
            
            const isAction = this.actions[i];
            if(isAction)
            {
                const fontSize = (0.66*typeSize);
                ctx.font = fontSize + "px 'Comica Boom'";
                ctx.textAlign = "center";
                ctx.fillStyle = "#FFFFFF";
                ctx.fillText("A", typeListPos.x, typeListPos.y + 0.33*fontSize);
            }
            
            typeListPos.add(offsetPerType);
        }
    
    }
}

class Squad
{
    cards: Card[]

    constructor(numCards:number)
    {
        this.cards = [];
        for(let i = 0; i < numCards; i++)
        {
            this.cards.push(new Card());
        }
    }

    count() { return this.cards.length; }
    countMainTypes() : Stats
    {
        const stats : Stats = {}
        for(const card of this.cards)
        {
            const type = card.mainType;
            if(!(type in stats)) { stats[type] = 0; }
            stats[type]++;
        }
        return stats;
    }

    countActions() : number
    {
        let num = 0;
        for(const card of this.cards)
        {
            num += card.countActions();
        }
        return num;
    }

    countTypes() : Stats
    {
        const stats : Stats = {};
        for(const card of this.cards)
        {
            const statsCard = card.countTypes();
            for(const [type,count] of Object.entries(statsCard))
            {
                if(!(type in stats)) { stats[type] = 0; }
                stats[type] += count;
            }
        }
        return stats;
    }

    getMainTypesUnique() : string[]
    {
        const mainTypes = this.countMainTypes();
        const mainTypesUnique : Set<string> = new Set();
        for(const type of Object.keys(mainTypes))
        {
            mainTypesUnique.add(type);
        }
        return Array.from(mainTypesUnique);
    }

    getCounteredTypes() : string[]
    {
        return this.getMainTypesUnique();
        /*const mainTypes = this.getMainTypesUnique();
        const counteredTypes : string[] = [];
        for(const type of mainTypes)
        {
            counteredTypes.push(CATEGORIES[type].counters);
        }

        return counteredTypes;*/
    }

    getFinalTypes(counteredTypes:string[]) : Stats
    {
        const stats : Stats = this.countTypes();
        for(const key of counteredTypes)
        {
            delete stats[key];
        }
        return stats;
    }

    countScore(counteredTypes:string[]) : number
    {
        const finalTypes = this.getFinalTypes(counteredTypes);
        let sum = 0;
        for(const [type, count] of Object.entries(finalTypes))
        {
            sum += count;
        }
        return sum;
    }

    getStatsAsString(stats:Stats) : string
    {
        let strings = [];
        let counter = 0;
        let maxCount = Object.keys(stats).length;
        for(const [type, count] of Object.entries(stats))
        {
            const firstElement = counter == 0;
            const lastElement = counter == (maxCount-1);
            let separator = lastElement ? " and " : ", "; 
            if(firstElement) { separator = ""; }
            strings.push(separator + count + " " + type);
            counter++;
        }
        return "<strong>" + strings.join("") + "</strong>";
    }

    getArrayAsString(array:string[])
    {
        let strings = [];
        let counter = 0;
        let maxCount = array.length;
        for(const elem of array)
        {
            const firstElement = counter == 0;
            const lastElement = counter == (maxCount-1);
            let separator = lastElement ? " and " : ", "; 
            if(firstElement) { separator = ""; }
            strings.push(separator + elem);
            counter++;
        }
        return "<strong>" + strings.join("") + "</strong>";
    }

    getTypesAsString() { return this.getStatsAsString(this.countTypes()); }
    getMainTypesAsString() { return this.getArrayAsString(this.getMainTypesUnique()); }
    getCountersAsString() { return this.getArrayAsString(this.getCounteredTypes()); }
    getFinalTypesAsString(counteredTypes:string[])
    {
        const finalTypes = this.getFinalTypes(counteredTypes);
        const results = [];
        for(const [type, count] of Object.entries(finalTypes))
        {
            results.push(count + " " + type)
        }

        const score = this.countScore(counteredTypes);
        let resultString = results.join(" + ");
        if(score <= 0) { resultString = "nothing"; }

        return "<strong>" + resultString + " = " + score + "</strong>"
    }

    draw(ctx:CanvasRenderingContext2D, pos:Point, inverted = false)
    {
        const offsetPerCard = Point.RIGHT.clone().scaleFactor(CONFIG.cardSize.x + CONFIG.paddingBetweenCards);
        const offset = offsetPerCard.clone().scaleFactor(-0.5 * (this.count() - 1));
        pos = pos.clone().add(offset);
        for(const card of this.cards)
        {
            card.draw(ctx, pos.clone(), inverted);
            pos.add(offsetPerCard);
        }
    }
}

async function generate()
{
    // create squads + cards
    const numCards = rangeInteger(1,3);
    const squads = [new Squad(numCards), new Squad(numCards)];
    const canv = createCanvas({ size: CONFIG.canvasSize, resize: true });
    const ctx = canv.getContext("2d");

    const positions = [
        new Point(0.5*canv.width, 0.25*canv.height),
        new Point(0.5*canv.width, 0.75*canv.height)
    ]

    // draw initial position
    for(let i = 0; i < squads.length; i++)
    {
        const pos = positions[i];
        const inverted = (i == 0);
        squads[i].draw(ctx, pos, inverted);
    }

    o.addParagraph("The squads from players A and B look like this.");
    o.addNode(canv);

    // actions
    if(CONFIG.includeActions)
    {
        const numActions = [squads[0].countActions(), squads[1].countActions()];
        const actionsPlayed = numActions[0] > 0 || numActions[1] > 0;
        const tie = numActions[0] == numActions[1];
        const diffString = "(" + numActions[0] + " vs " + numActions[1] + ")"
        if(!actionsPlayed) {
            o.addParagraph("Nobody played any <strong>actions</strong>.");
        } else if(tie) {
            o.addParagraph("Both players played equally many <strong>actions</strong> " + diffString + ", so nobody gets to take any action.");
        } else {
            const player1won = numActions[0] > numActions[1];
            const winner = player1won ? "A" : "B";
            o.addParagraph(winner + " played the most <strong>actions</strong> " + diffString + ". They pick one of them to execute.");
        }
    }

    // count their individual types
    o.addParagraph("Let's count their types.");
    const listTypes = [
        "A has " + squads[0].getTypesAsString(),
        "B has " + squads[1].getTypesAsString()
    ]
    o.addParagraphList(listTypes);

    // count main types and counters
    o.addParagraph("Now let's check their counters.");
    const listCounters = [
        "A has element(s) " + squads[0].getMainTypesAsString() + ", so all those types are worth nothing for B.",
        "B has element(s) " + squads[1].getMainTypesAsString() + ", so all those types are worth nothing for A."
    ]
    o.addParagraphList(listCounters);

    // display what's left
    o.addParagraph("After removing all countered types,");
    const listFinal = [
        "A is left with " + squads[0].getFinalTypesAsString(squads[1].getCounteredTypes()),
        "B is left with " + squads[1].getFinalTypesAsString(squads[0].getCounteredTypes())
    ]
    o.addParagraphList(listFinal);

    const scores = [
        squads[0].countScore(squads[1].getCounteredTypes()),
        squads[1].countScore(squads[0].getCounteredTypes())
    ]
    const player1won = scores[0] > scores[1];
    const tie = scores[0] == scores[1];
    const singleCardPlayed = squads[0].count() <= 1;
    let winner = player1won ? "A" : "B";

    o.addParagraph(winner + " won the battle! Both players trade squads, but " + winner + " keeps one card they don't trade.");
    if(tie) { o.addParagraph("(It's tied, so the defending player wins.)"); }
    if(singleCardPlayed) { o.addParagraph("(Yes, because only one card was played, this means the winner just gets the loser's card.)"); }

    o.addParagraph("Next player's turn!");
}

const e = new InteractiveExample({ id: "turn" });
e.setButtonText("Give me an example turn!");
e.setGenerationCallback(generate);

const o = e.getOutputBuilder();