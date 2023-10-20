import Card, { EliminationData } from "../js_game/card";
import Bullet from "./bullet";
import { Type } from "./dict";
import { countProp, getNeighbors, getNext, getNextWithProp } from "./queries";
import ValidMove, { ValidReason } from "./validMove";

enum EvalType
{
    EXECUTE, // called when a card is evaluated, in order
    HIT, // called on a card when they're hit
    SHOT // called on attackers to check if they CAN hit something
}

const CHECK_ROTATION_MOVE = false;
const CHECK_REMOVAL_MOVE = true;

export default class PowerChecker
{
    getEmperorEliminationData(cards:Card[]) : EliminationData
    {      
        // store reference to emperor + their dir
        const emperorCard = cards[0];
        const emperorDir = emperorCard.dir;

        // we copy the cards here so we can freely remove stuff from `cards` while checking without messing up loop
        const cardsCopy = cards.slice(); 

        console.log("EMPEROR CARD");
        console.log(emperorCard);

        const numCards = cardsCopy.length;
        let counter = 0;
        let idx = 0;
        while(counter < numCards)
        {
            counter++;
            const card = cardsCopy[idx];
            idx = (idx + emperorDir + numCards) % numCards;

            const cardIsEliminated = !cards.includes(card);
            if(cardIsEliminated) { continue; }

            this.execute(card, cards);
            if(emperorCard.isEliminated()) { break; }  
        }

        return emperorCard.eliminationData;
    }

    cloneCards(cards:Card[]) : Card[]
    {
        const arr = [];
        for(const card of cards)
        {
            arr.push(card.clone());
        }
        return arr;
    }

    getValidMoves(cards:Card[], wasInDanger) : ValidMove[]
    {
        const moves = [];
        for(let i = 0; i < cards.length; i++)
        {
            const card = cards[i];
            if(card.person == "emperor") { continue; }

            let cardsCopy : Card[];

            // remove us, see what happens
            if(CHECK_REMOVAL_MOVE)
            {
                cardsCopy = this.cloneCards(cards);
                cardsCopy.splice(i, 1);
                if(this.getEmperorEliminationData(cardsCopy).eliminated != wasInDanger)
                { 
                    const move = new ValidMove(card, ValidReason.REMOVE);
                    moves.push(move);
                }
            }

            // rotate us, see what happens
            if(CHECK_ROTATION_MOVE)
            {
                cardsCopy = this.cloneCards(cards);
                cardsCopy[i].flip();
                if(this.getEmperorEliminationData(cardsCopy).eliminated != wasInDanger)
                {
                    const move = new ValidMove(card, ValidReason.ROTATE);
                    moves.push(move);
                }
            }
        }
        return moves;
    }

    execute(card:Card, cards:Card[])
    {
        this[card.person](card, cards, EvalType.EXECUTE);
        if(card.convertedShooter) { this.shoot(card, cards); }
    }

    cardCanBeHit(card:Card, cards:Card[])
    {
        return this[card.person](card, cards, EvalType.HIT);
    }

    bulletCanHitCard(shooter:Card, target:Card)
    {
        if(shooter.convertedShooter) { return true; }
        return this[shooter.person](shooter, target, EvalType.SHOT);
    }

    shoot(shooter:Card, cards:Card[])
    {
        console.log("SHOOTING WITH: " + shooter.person);

        if(shooter.data.cantShoot) { return; }

        const maxSteps = cards.length;
        const moveDir = shooter.dir;
        const startIndex = cards.indexOf(shooter);
        const bullet = new Bullet(shooter, startIndex, moveDir);
        const debugPath = [];
        while(bullet.isAlive())
        {
            bullet.step(cards);
            if(bullet.reachedMax(maxSteps)) { break; }

            const currentCard = bullet.getCurrentCard(cards);
            debugPath.push(currentCard);
            if(!currentCard) { continue; } // doesn't necessarily mean there's no card, just that it isn't influenced by bullet

            const isHit = this.cardCanBeHit(currentCard, cards) && this.bulletCanHitCard(shooter, currentCard);
            if(!isHit) { continue; }

            // res is false if the card wasn't actually eliminated
            // however, the bullet still dies because it hit something
            const res = this.eliminateCard(currentCard, cards, shooter);
            bullet.kill();
        }

        if(bullet.hitSomething) { debugPath.push("Hit Something"); }
        console.log(debugPath);
    }

    eliminateCard(a:Card, b:Card[], perpetrator:Card)
    {
        const res = a.eliminate(b, perpetrator);
        if(!res) { return false; }

        b.splice(b.indexOf(a), 1);
        return true;
    }

    // STARTER

    // > attacker
    

    monster(a,b,t)
    {
        if(t == EvalType.HIT) { return true; }
        if(t == EvalType.SHOT) { return true; }
        if(t == EvalType.EXECUTE) { this.shoot(a,b); }
    }

    cipactli(a,b,t)
    {
        if(t == EvalType.HIT) { return true; }
        if(t == EvalType.SHOT) { return b.type != Type.MONSTER; } // cannot hit attackers
        if(t == EvalType.EXECUTE) { this.shoot(a,b); }
    }

    // > bystander
    emperor(a,b,t)
    {
        if(t == EvalType.HIT) { return true; }

        const numAttackers = countProp(b, "type", Type.MONSTER);
        if(numAttackers > 0) { return; }
        const nbs = getNeighbors(a,b);
        nbs[0].makeShooter();
        nbs[1].makeShooter();
    }

    /* OLD POWER as a shooter
    emperor(a,b,t)
    {
        if(t == EvalType.HIT) { return true; }
        if(t == EvalType.SHOT) { return (b.type != Type.ATTACKER) || (b.person == "emperor"); } // can only hit non-attackers OR himself
        if(t == EvalType.EXECUTE) { this.shoot(a,b); }
    }*/

    priest(a,b,t)
    {
        return true;
    }

    dwarf(a,b,t)
    {
        return false;
    }

    trickster(a,b,t)
    {
        if(t == EvalType.HIT) { return true; }
        getNext(a,b).flip();
    }
    
    // > protector
    bodyguard(a,b,t)
    {
        if(t == EvalType.HIT) { return true; }
        const nextAttackers = getNextWithProp(a, b, "type", Type.MONSTER);
        if(nextAttackers.length > 0) 
        { 
            this.eliminateCard(nextAttackers[0], b, a); 
        }
    }

    // their "cantDie" is set through dictionary data
    superhero(a,b,t)
    {
        if(t == EvalType.HIT) { return true; }
    }

    shieldbearer(a,b,t)
    {
        if(t == EvalType.HIT) { return false; }
        getNext(a,b).setImmune(true);
    }


    // BEGINNER
    centzon(a,b,t)
    {
        if(t == EvalType.HIT) { return true; }
        if(t == EvalType.SHOT) { return a.dir != b.dir; } // can only hit stuff without back turned = facing them
        if(t == EvalType.EXECUTE) { this.shoot(a,b); }
    }



}