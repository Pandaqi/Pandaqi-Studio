import InteractiveExampleSimulator from "js/pq_rulebook/examples/interactiveExampleSimulator";
import CardThroneless from "../cardThroneless";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import Point from "js/pq_games/tools/geometry/point";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import fromArray from "js/pq_games/tools/random/fromArray";
import shuffle from "js/pq_games/tools/random/shuffle";

export default class Player
{
    name: string = "John Doe";
    cards: CardThroneless[] = [];
    flipped: boolean[] = []; // true means it's a PUBLIC card (facing away, not at you)
    teller = false

    constructor(name:string) 
    {
        this.name = name;
    }

    addCard(c:CardThroneless, flipped = false) 
    { 
        this.cards.push(c); 
        this.flipped.push(flipped);
    }

    addCards(c:CardThroneless[], flipped = false)
    {
        for(const card of c) { this.addCard(card, flipped); }
    }

    removeCards(c:CardThroneless[])
    {
        for(const card of c) { this.removeCard(card); }
    }

    removeCard(c:CardThroneless)
    {
        this.removeCardByIndex(this.cards.indexOf(c));
    }

    removeCardByIndex(idx:number)
    {
        if(idx < 0) { return; }
        this.cards.splice(idx, 1);
        this.flipped.splice(idx, 1);
    }

    // @NOTE: this retains order (card at idx 2 = card played by player idx 2), while removing cards
    nullifyCards(cards:CardThroneless[])
    {
        for(const card of cards)
        {
            this.cards[this.cards.indexOf(card)] = null;
        }
    }

    getCardTypes()
    {
        const arr = [];
        for(const card of this.getValidCards())
        {
            arr.push(card.type);
        }
        return arr;
    }

    getCardsWithFlipped(flipped = false) : CardThroneless[]
    {
        const arr = [];
        for(let i = 0; i < this.count(); i++)
        {
            if(this.flipped[i] != flipped) { continue; }
            arr.push(this.cards[i]);
        }
        return arr;
    }

    getValidVote(sim:InteractiveExampleSimulator, typesAllowed:string[], CONFIG:Record<string,any>, remove = false, allowDisobey = false)
    {
        let validVotes = this.getCardsWithFlipped(false); 
        if(CONFIG.rulebook.tellerIsPerson && this.teller) { validVotes = this.cards.slice(); }

        let numVotesMeansDone = CONFIG.rulebook.numVotesMeansDone ?? 0;
        if(validVotes.length <= numVotesMeansDone) { return null; }

        const disobeysRestrictions = allowDisobey && Math.random() <= CONFIG.rulebook.tellerTypeDisobeyProb;
        const typeRestrictionsApply = typesAllowed.length > 0 && !disobeysRestrictions;
        if(typeRestrictionsApply)
        {
            const arr = [];
            for(const vote of validVotes)
            {
                if(typesAllowed.includes(vote.type)) { continue; }
                arr.push(vote);
            }

            if(arr.length > 0) { 
                validVotes = arr; 
                sim.stats.couldObeyVoteRestrictions++;
            } else { 
                sim.stats.couldNotObeyVoteRestrictions++; 
            }
        }

        if(disobeysRestrictions)
        {
            sim.stats.disobeyedVoteRestrictions++;
        }

        const randVote = fromArray(validVotes);
        if(remove) { this.removeCard(randVote); }
        return randVote;
    }

    swapCardsWith(p:Player, num: number)
    {
        if(this.count() < num || p.count() < num) { return; }

        const myCards = this.getRandomCards(num, true);
        const theirCards = p.getRandomCards(num, true);
        this.addCards(theirCards);
        p.addCards(myCards);
    }

    empty() { this.removeCards(this.cards); }
    count() { return this.cards.length; }
    hasCards() { return this.count() > 0; }
    getFirstCard() { return this.getCardAtIndex(0); }
    getLastCard() { return this.getCardAtIndex(this.cards.length-1); }
    getCardAtIndex(idx:number) 
    {
        if(idx < 0 || idx >= this.count()) { return null; }
        return this.cards[idx];
    }

    getRandomCards(num:number, remove = false) : CardThroneless[]
    {
        const options = shuffle(this.cards.slice());
        const arr = [];
        for(let i = 0; i < num; i++)
        {
            arr.push(options.pop());
        }
        
        if(remove) { this.removeCards(arr); }
        return arr;
    }

    getName() { return this.name; }
    setName(n:string) { this.name = n; }

    hasAnyOfTypes(types:string[])
    {
        for(const c of this.getValidCards())
        {
            if(types.includes(c.type)) { return true; }
        }
        return false;
    }

    getCardsOfType(tp:string, remove = false)
    {
        const arr = [];
        for(const c of this.getValidCards())
        {
            if(c.type != tp) { continue; }
            arr.push(c);
        }

        if(remove) { this.removeCards(arr); }
        return arr;
    }

    getValidCards() 
    {
        const arr = [];
        for(const card of this.cards)
        {
            if(card == null || !card) { continue; }
            arr.push(card);
        }
        return arr;
    }

    getUniqueTypes()
    {
        const arr : string[] = [];
        for(const card of this.getValidCards())
        {
            const cardType = card.type;
            if(arr.includes(cardType)) { continue; }
            arr.push(cardType);
        }
        return arr;
    }

    async draw(sim:InteractiveExampleSimulator, params:Record<string,any> = {}) : Promise<ResourceGroup>
    {
        const group = new ResourceGroup();

        if(params.cardToShow) 
        {
            const cardCanvas = new ResourceImage( await params.cardToShow.draw(sim.getVisualizer()) );
            const cardOp = new LayoutOperation({
                pos: params.pos,
                size: params.size,
                pivot: Point.CENTER,
            });
            group.add(cardCanvas, cardOp);
        }

        const resText = new ResourceText({ text: this.name, textConfig: params.textConfig });
        const opText = new LayoutOperation({
            pos: params.pos.clone().add(new Point(0, 0.6*params.size.y)),
            size: new Point(params.size.x*5, params.size.y),
            fill: "#000000",
            pivot: Point.CENTER
        })
        group.add(resText, opText);

        if(params.drawSeat)
        {
            const pos = opText.pos.clone().add(new Point(0.65*params.size.x, 0));
            const size = new Point(0.45*params.size.x);
            const res = sim.getVisualizer().getResource("kingseat_icon");
            const op = new LayoutOperation({
                pos: pos,
                size: size,
                pivot: Point.CENTER
            });
            group.add(res, op);
        }

        return group;
    }
}