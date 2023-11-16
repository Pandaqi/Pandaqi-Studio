import createCanvas from "js/pq_games/layout/canvas/createCanvas";
import InteractiveExample from "js/pq_rulebook/examples/interactiveExample"
import { ANIMALS, COLORS } from "../js_shared/dict"
import Bounds from "js/pq_games/tools/numbers/bounds";
import shuffle from "js/pq_games/tools/random/shuffle";
import createContext from "js/pq_games/layout/canvas/createContext";
import convertCanvasToImage from "js/pq_games/layout/canvas/convertCanvasToImage";
import fromArray from "js/pq_games/tools/random/fromArray";
import anyMatch from "js/pq_games/tools/collections/anyMatch";
import Point from "js/pq_games/tools/geometry/point";
import arraysAreDuplicates from "js/pq_games/tools/collections/arraysAreDuplicates";

const CONFIG =
{
    numAnimalTypes: new Bounds(4,6),
    possibleCardNumbers: new Bounds(1,5),
    chosenAnimals: [],
    matchSizeBounds: new Bounds(1,3),
    handSizeBounds: new Bounds(2,5),
    cardSize: new Point(480, 672),
    fontFamily: "Ciscopic",
    maxMovesToDisplay: 4,
}

interface MoveData
{
    move: Match,
    reason: string
}

class Card
{
    type: string
    number: number

    constructor()
    {
        this.type = fromArray(CONFIG.chosenAnimals);
        this.number = CONFIG.possibleCardNumbers.randomInteger();
    }

    async draw(small = false)
    {
        const size = CONFIG.cardSize.clone();
        const sizeUnit = Math.min(size.x, size.y);
        const ctx = createContext({ size: size });

        const colorMain = COLORS[ ANIMALS[this.type].color ];

        // background + stroke
        ctx.fillStyle = colorMain;
        ctx.fillRect(0, 0, size.x, size.y);

        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 20;
        ctx.strokeRect(0, 0, size.x, size.y);

        // numbers
        const fontSize = small ? 0.66*sizeUnit : 0.2*sizeUnit;
        ctx.textAlign = "center";
        ctx.font = fontSize + "px " + CONFIG.fontFamily;
        ctx.fillStyle = "#FFFFFF";

        if(small) {
            ctx.fillText(this.number.toString(), 0.5*size.x, 0.5*size.y + 0.33*fontSize);
        } else {
            const numberOffset = 0.1*sizeUnit;
            const positions = [
                new Point(numberOffset, size.y-numberOffset),
                new Point(size.x-numberOffset, numberOffset+0.66*fontSize)
            ]
    
            for(const pos of positions)
            {
                ctx.fillText(this.number.toString(), pos.x, pos.y);
            }
    
            // type name
            ctx.fillText(this.type, 0.5*size.x, 0.5*size.y);
        }

        const img = await convertCanvasToImage(ctx.canvas);
        img.classList.add("playful-example");
        return img;
    }

    toText()
    {
        return this.type + " (" + this.number + ")";
    }
}

class Match
{
    cards: Card[]

    constructor(cards = [])
    {
        this.cards = cards;
    }

    count() { return this.cards.length; }
    addCard(c:Card)
    {
        this.cards.push(c);
        this.sort();
    }

    generate(size:number)
    {
        const arr = [];
        for(let i = 0; i < size; i++)
        {
            arr.push(new Card());
        }
        this.cards = arr;
        this.sort();
        return this;
    }

    sort()
    {
        this.cards.sort((a,b) => {
            const name = a.type.localeCompare(b.type);
            if(name != 0) { return name; }
            return a.number - b.number;
        })
    }

    async draw(small = false)
    {
        const arr = [];
        for(const card of this.cards)
        {
            arr.push(card.draw(small));
        }

        return await Promise.all(arr);
    }

    toText() : string
    {
        const arr = [];
        for(const card of this.cards)
        {
            arr.push(card.toText());
        }
        return arr.join(", ");
    }

    getMajorities() : string[]
    {
        const types = this.getTypes();
        let highestNumber = -1;
        for(const type of types)
        {
            highestNumber = Math.max(highestNumber, this.countType(type));
        }

        const arr = [];
        for(const type of types)
        {
            if(this.countType(type) != highestNumber) { continue; }
            arr.push(type);
        }
        return arr;
    }

    getTotalNumber()
    {
        let sum = 0;
        for(const card of this.cards)
        {
            sum += card.number;
        }
        return sum;
    }

    countType(tp:string)
    {
        let sum = 0;
        for(const card of this.cards)
        {
            // bear is wildcard, so count it as ANY TYPE here
            if(card.type != tp && card.type != "bear") { continue; }
            sum++;
        }
        return sum;
    }

    getTypes()
    {
        const set : Set<string> = new Set();
        for(const card of this.cards)
        {
            set.add(card.type);
        }
        return Array.from(set);
    }

    getNumbersOfType(tp:string) : number[]
    {
        const arr = [];
        for(const card of this.cards)
        {
            if(card.type != tp) { continue; }
            arr.push(card.number);
        }
        return arr;
    }

    getAllValidMoves(match:Match)
    {
        const numCards = this.count();
        const possibleCombos = Math.pow(2, numCards);
        const allCombos : MoveData[] = [];

        const forbiddenNumbers = this.getNumbersOfType("bear");

        for (var i = 0; i < possibleCombos; i++){
            const combo = new Match();

            for (var j = 0; j < numCards; j++) {
                if (!(i & Math.pow(2,j))) { continue; } // not part of this combination
                
                const card = this.cards[j];
                const sameNumberAsBear = card.type != "bear" && forbiddenNumbers.includes(card.number);
                if(sameNumberAsBear) { continue; }

                combo.addCard(card);
            }

            if(combo.count() <= 0) { continue; }

            const duplicateMove = this.isDuplicate(combo, allCombos);
            if(duplicateMove) { continue; }

            const matchData = this.compareMatchesForValidMove(combo, match);
            if(!matchData) { continue; }

            allCombos.push({ move: combo, reason: matchData });
        }
        return allCombos;
    }

    getRaw()
    {
        const arr = [];
        for(const card of this.cards)
        {
            arr.push(card.type + "/" + card.number);
        }
        return arr;
    }

    isDuplicate(combo:Match, allCombos:MoveData[])
    {
        const myData = combo.getRaw();

        for(const otherCombo of allCombos)
        {
            const otherData = otherCombo.move.getRaw();
            if(arraysAreDuplicates(myData, otherData)) { return true; }
        }
        return false;
    }

    compareMatchesForValidMove(combo:Match, match:Match)
    {
        // > same majority animal, higher number
        let majA = combo.getMajorities();
        let majB = match.getMajorities();
        const sameMajority = anyMatch(majA, majB);
        if(sameMajority)
        {
            const totalA = combo.getTotalNumber();
            const totalB = match.getTotalNumber();
            if(totalA > totalB) { return "same majority animal, higher total number"; }
        }

        // > different majority animal, but played more often
        if(!sameMajority)
        {
            const majCountA = combo.countType(majA[0]);
            const majCountB = match.countType(majB[0]);
            if(majCountA > majCountB) { return "different majority animal, more frequent than previous"; }
        }

        // > more bears always wins
        let bearsA = combo.countType("bear");
        let bearsB = match.countType("bear");
        if(bearsA > bearsB) { return "more bears"; }

        return null;
    }
}

async function generate()
{
    // > prepare animal types for this game (always include bear first!)
    const numAnimals = CONFIG.numAnimalTypes.randomInteger();
    const possibleAnimals = [];
    for(const [key,val] of Object.entries(ANIMALS))
    {
        if(val.expansion) { continue; }
        if(key == "bear") { continue; }
        possibleAnimals.push(key);
    }

    shuffle(possibleAnimals);
    possibleAnimals.unshift("bear");

    const chosenAnimals = possibleAnimals.slice(0, numAnimals);
    CONFIG.chosenAnimals = chosenAnimals

    // > current match
    o.addParagraph("The current match on the table looks like this.");
    const matchSize = CONFIG.matchSizeBounds.random();
    const match = new Match().generate(matchSize);
    
    let node = o.addFlexList(await match.draw());
    node.style.flexWrap = "wrap";

    // > cards in hand
    o.addParagraph("Your hand looks like this.");
    const handSize = CONFIG.handSizeBounds.random();
    const hand = new Match().generate(handSize);
    node = o.addFlexList(await hand.draw());
    node.style.flexWrap = "wrap";

    // > possible plays
    let validMoves = hand.getAllValidMoves(match);
    const noValidMoves = validMoves.length <= 0;
    if(noValidMoves) {
        o.addParagraph("You have no valid moves. You give away two cards to somebody else.");
    } else {
        let text = "Below are all your valid moves.";
        if(validMoves.length > CONFIG.maxMovesToDisplay) 
        {
            text = "Below are some of your valid moves. (Total #moves is " + validMoves.length + ")";
            validMoves = shuffle(validMoves).slice(0, CONFIG.maxMovesToDisplay);
        }

        o.addParagraph(text);

        /* @NOTE: This was the textual display, which was just messy and not as good as images
        const arr = [];
        for(const m of validMoves)
        {
            arr.push("<strong>" + m.move.toText() + "</strong> <em>(" + m.reason + ")</em>");
        }
        o.addParagraphList(arr);
        */

        const node = document.createElement("div");
        for(const m of validMoves)
        {
            const container = document.createElement("div");
            container.style.display = "flex";
            container.style.justifyContent = "space-between";
            container.style.alignItems = "center";
            container.style.marginBottom = "0.5em";
            container.style.flexWrap = "wrap";

            const moveContainer = document.createElement("div");
            moveContainer.style.display = "flex";
            moveContainer.style.gap = "0.5em";

            const cardImages = await m.move.draw(true);
            for(const img of cardImages)
            {
                moveContainer.appendChild(img);
                img.style.maxHeight = "8vw";
            }
            
            const reasonContainer = document.createElement("div");
            reasonContainer.innerHTML = "<em>(" + m.reason + ")</em>";

            container.appendChild(moveContainer);
            container.appendChild(reasonContainer);
            node.appendChild(container);
        }
        o.addNode(node);
    }
}

const e = new InteractiveExample({ id: "turn" });
e.setButtonText("Give me an example turn!");
e.setGenerationCallback(generate);

const o = e.getOutputBuilder();