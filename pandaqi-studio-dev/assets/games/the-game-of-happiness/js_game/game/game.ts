import { CARDS, CategoryData } from "games/the-game-of-happiness/js_shared/dict";
import CardPicker from "../cardPicker";
import shuffle from "js/pq_games/tools/random/shuffle";

enum GameState
{
    INTRO,
    RANK_SELF,
    RANK_OTHERS,
    RESULTS,
    OUTRO
}

export default class Game
{
    config: any;
    state: GameState;
    node: HTMLDivElement;
    heading: HTMLHeadingElement;
    content: HTMLDivElement;
    cards: CategoryData[];
    cardPicker: CardPicker;
    rankings: any[];
    score: number;
    round: number;
    totalRounds: number;
    numCardsPerRound: number;
    curDragElement: HTMLElement;

    constructor(cfg:any)
    {
        this.config = cfg;
    }

    start()
    {
        this.round = 0;
        this.score = 0;
        this.totalRounds = this.config.digital.totalRounds ?? 10;
        this.numCardsPerRound = this.config.digital.numCards ?? 5;

        this.cardPicker = new CardPicker();
        this.cardPicker.generate();

        this.createHTML();
        this.gotoState(GameState.INTRO);
    }

    createHTML()
    {
        const cont = document.createElement("div");
        cont.classList.add("game-wrapper");

        const node = document.createElement("div");
        cont.appendChild(node);
        this.node = node;
        node.classList.add("game-container");

        const heading = document.createElement("h1");
        node.appendChild(heading);
        this.heading = heading;

        const content = document.createElement("div");
        node.appendChild(content);
        this.content = content;

        const anchor = this.config.node ?? document.body;
        anchor.appendChild(cont);
    }

    gotoState(s:GameState)
    {
        this.state = s;

        if(this.state == GameState.INTRO)
        {
            this.heading.innerHTML = "Welcome!";

            const p1 = document.createElement("p");
            p1.innerHTML = "Give the phone to the <strong>start player</strong>.<br/><br/>On your turn, you are shown " + this.numCardsPerRound + " things. You must secretly <strong>rank these from 'this makes me most unhappy' to 'this makes me happiest'</strong>, top to bottom. When done, click 'Submit'."

            const p2 = document.createElement("p");
            p2.innerHTML = "Now hand the phone to the other players. Together, they <strong>also create one ranking</strong> in which they try to guess what you did.<br/><br/>When done, the two rankings are compared&mdash;<strong>the more matches you have, the more points you score</strong>!"

            const clickHandler = (ev) => { this.gotoState(GameState.RANK_SELF); } 
            const btn = this.createButton(clickHandler, "Start the Game!");

            this.setContent([p1,p2,btn]);
        }
        else if(this.state == GameState.RANK_SELF)
        {
            this.heading.innerHTML = "Rank this! (Player)"
            
            const clickHandler = (ev) => { 
                this.saveRanking();
                this.gotoState(GameState.RANK_OTHERS); 
            } 
            const btn = this.createButton(clickHandler, "Submit");

            this.pickRandomCards();
            this.clearRankings();
            const list = this.createCardsHTML();
            this.setContent([list,btn]);
        }
        else if(this.state == GameState.RANK_OTHERS)
        {
            this.heading.innerHTML = "Rank this! (Others)"

            const clickHandler = (ev) => { 
                this.saveRanking();
                this.gotoState(GameState.RESULTS); 
            } 
            const btn = this.createButton(clickHandler, "Submit");
            
            const list = this.createCardsHTML();
            this.setContent([list,btn]);
        }
        else if(this.state == GameState.RESULTS)
        {
            this.heading.innerHTML = "Results";

            const clickHandler = (ev) => {
                this.round++;

                const gameOver = (this.round >= this.totalRounds);
                if(gameOver) { this.gotoState(GameState.OUTRO); }
                else { this.gotoState(GameState.RANK_SELF); }
            } 
            const btn = this.createButton(clickHandler, "Next round!");
            const list = this.createCardsHTML(true, true);
            
            this.updateScore();
            const p1 = document.createElement("p");
            p1.innerHTML = "Your total score is now: <strong>" + this.score + " points</strong>.";

            const p2 = document.createElement("p");
            p2.innerHTML = "This was round <strong>" + (this.round+1) + " / " + this.totalRounds + "</strong>.";

            this.setContent([list,p1,p2,btn]);
        }
        else if(this.state == GameState.OUTRO)
        {
            this.heading.innerHTML = "Game Over!";

            const totalScore = (this.numCardsPerRound * 2) * this.totalRounds;
            const p1 = document.createElement("p");
            p1.innerHTML = "Congratulations! You scored <strong>" + this.score + " points</strong> out of a total <strong>" + totalScore + " points</strong>.";

            const p2 = document.createElement("p");
            p2.innerHTML = "Leave this page or play again.";

            const clickHandler = (ev) => { window.location.reload(); } 
            const btn = this.createButton(clickHandler, "Play Again");

            this.setContent([p1,p2,btn]);
        }
    }

    createButton(handler, txt:string)
    {
        const btn = document.createElement("button");
        btn.classList.add("game-button");
        btn.addEventListener("click", handler);
        btn.innerHTML = txt;
        return btn;
    }

    setContent(items:HTMLElement[])
    {
        this.content.innerHTML = "";
        for(const item of items)
        {
            this.content.appendChild(item);
        }
    }

    clearRankings() { this.rankings = []; }
    saveRanking()
    {
        const newRanking = [];
        const parent = this.node.getElementsByClassName("game-cards")[0];
        const children = Array.from(parent.children) as HTMLElement[];
        for(const child of children)
        {
            newRanking.push( parseInt(child.dataset.index) );
        }
        this.rankings.push(newRanking);

        console.log(this.rankings);
    }

    updateScore()
    {
        let sum = 0;
        const numCards = this.rankings[0].length;
        for(let i = 0; i < numCards; i++)
        {
            const matches = this.rankings[0][i] == this.rankings[1][i];
            if(matches) { sum++; }
        }

        const allCorrect = sum >= numCards;
        if(allCorrect) { sum *= 2; }

        this.score += sum;
    }

    pickRandomCards()
    {
        const allCards = shuffle(this.cardPicker.get());
        if(allCards.length < this.numCardsPerRound) { this.cardPicker.generate(); }
        let cards;

        const pickOnePerCategory = this.config.digital.pickOneCardPerCategory;
        if(pickOnePerCategory) {
            const allCategories = Object.keys(CARDS);
            cards = [];
            let counter = 0;
            while(cards.length < this.numCardsPerRound)
            {
                // if out of cards, regenerate and continue
                if(counter >= allCards.length) { this.cardPicker.generate(); counter = 0; }
                
                const card = allCards[counter];
                counter++;
                if(!allCategories.includes(card.category)) { continue; }

                allCategories.splice(allCategories.indexOf(card.category), 1);
                allCards.splice(counter, 1);
                cards.push(card);
            }
        } else {
            cards = allCards.slice(0, this.numCardsPerRound);
        }
        this.cards = cards;
    }

    // @SOURCE (for Drag&Drop sortable list): https://stackoverflow.com/questions/10588607/tutorial-for-html5-dragdrop-sortable-list
    createCardsHTML(keepOrder = false, showResults = false)
    {
        const node = document.createElement("div");
        node.classList.add("game-cards");

        let cards;
        if(keepOrder) {
            cards = [];
            for(const index of this.rankings[0])
            {
                cards.push(this.cards[index]);
            }

        } else {
            cards = shuffle(this.cards.slice());
        }

        this.curDragElement = null;
        
        for(const cardData of cards)
        {
            const elem = document.createElement("div");
            elem.classList.add("game-card");

            const content = document.createElement("div");
            elem.appendChild(content);
            node.appendChild(elem);

            content.innerHTML = (cardData.desc ?? cardData.text) ?? "ERROR: Can't read entry.";

            const originalIndex = this.cards.indexOf(cardData);
            elem.dataset.index = originalIndex + "";

            if(showResults)
            {
                const otherRankElem = document.createElement("div");
                const selfRank = this.rankings[0].indexOf(originalIndex);
                const otherRank = this.rankings[1].indexOf(originalIndex);
                otherRankElem.innerHTML = "#" + (otherRank + 1);
                elem.appendChild(otherRankElem);

                const isCorrect = (selfRank == otherRank);
                if(isCorrect) { elem.classList.add("guess-correct"); }
                else { elem.classList.add("guess-wrong"); }

                elem.classList.add("with-result");
            }

            const makeDraggable = !keepOrder;
            if(makeDraggable)
            {
                // Dragging support on all non-touchscreen devices (mobile usually doesn't support this)
                elem.draggable = true;
                const dragOverHandler = (ev) => {
                    if (this.nodeIsBefore(this.curDragElement, elem)) {
                        elem.parentNode.insertBefore(this.curDragElement, elem);
                    } else {
                        elem.parentNode.insertBefore(this.curDragElement, elem.nextSibling);
                    }
                }
                elem.addEventListener("dragover", dragOverHandler);
    
                const dragStartHandler = (ev) => {
                    ev.dataTransfer.effectAllowed = "move";
                    ev.dataTransfer.setData("text/plain", null); // Thanks to bqlou for their comment.
                    this.curDragElement = elem;
                    elem.classList.add("dragged");
                }
                elem.addEventListener("dragstart", dragStartHandler);

                const dragEndHandler = (ev) => {
                    this.curDragElement = null;
                    elem.classList.remove("dragged");
                }
                elem.addEventListener("dragend", dragEndHandler);

                // Buttons for when dragging doens't work / isn't preferred
                const upBtn = document.createElement("button");
                upBtn.innerHTML = "&uarr;";
                upBtn.addEventListener("click", (ev) => {
                    this.moveNode(elem, node, -1)
                })
                elem.insertBefore(upBtn, content);

                const downBtn = document.createElement("button");
                downBtn.innerHTML = "&darr;"
                downBtn.addEventListener("click", (ev) => {
                    this.moveNode(elem, node, 1)
                })
                elem.appendChild(downBtn);

                // Dragging support for touchscreen devices
                elem.addEventListener("touchstart", (ev) => 
                { 
                    this.curDragElement = elem; 
                    elem.classList.add("dragged"); 
                });

                elem.addEventListener("touchend", (ev) => 
                { 
                    this.curDragElement = null; 
                    elem.classList.remove("dragged"); 
                });

                elem.addEventListener("touchmove", (ev) => 
                {
                    if(this.curDragElement != elem) { return; }

                    // find the card element we're moving over (if one exists)
                    const overElems = Array.from(document.elementsFromPoint(ev.touches[0].clientX, ev.touches[0].clientY)) as HTMLElement[];
                    let cardNode = null;
                    const children = Array.from(node.children) as HTMLElement[];
                    for(const elem of overElems)
                    {
                        if(!children.includes(elem)) { continue; }
                        cardNode = elem;
                        break;
                    }

                    if(!cardNode || cardNode == elem) { return; }

                    // properly flip the order
                    if (this.nodeIsBefore(this.curDragElement, cardNode)) {
                        elem.parentNode.insertBefore(this.curDragElement, cardNode);
                    } else {
                        elem.parentNode.insertBefore(this.curDragElement, cardNode.nextSibling);
                    }

                });

            }

        }

        return node;
    }

    moveNode(elem:HTMLElement, node:HTMLElement, dir:number)
    {
        const cardNodes = Array.from(node.children) as HTMLElement[];
        for(let i = 0; i < cardNodes.length; i++)
        {
            if(cardNodes[i] != elem) { continue; }

            const newIndex = (i + dir);
            if(newIndex < 0 || newIndex >= cardNodes.length) { break; } // cannot be moved further

            let pivotNode = cardNodes[newIndex];
            if(dir > 0) { pivotNode = pivotNode.nextSibling as HTMLElement; }
            node.insertBefore(elem, pivotNode);
        }
    }

    nodeIsBefore(el1:HTMLElement, el2:HTMLElement)
    {
        if (el2.parentNode === el1.parentNode) 
        {
            for (var cur = el1.previousSibling; cur && cur.nodeType !== 9; cur = cur.previousSibling) 
            {
                if (cur === el2) 
                {
                    return true;
                }
            }
        }
        return false;
    }

}