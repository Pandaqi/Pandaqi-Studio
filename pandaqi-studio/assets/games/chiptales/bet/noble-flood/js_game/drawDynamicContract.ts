import createContext from "js/pq_games/layout/canvas/createContext";
import LayoutOperation from "js/pq_games/layout/layoutOperation";
import ResourceGroup from "js/pq_games/layout/resources/resourceGroup";
import ResourceImage from "js/pq_games/layout/resources/resourceImage";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import getPositionsCenteredAround from "js/pq_games/tools/geometry/paths/getPositionsCenteredAround";
import Point from "js/pq_games/tools/geometry/point";
import { MISC, NUMBERS_AS_STRINGS, SUITS } from "../js_shared/dict";
import Rectangle from "js/pq_games/tools/geometry/rectangle";
import ResourceShape from "js/pq_games/layout/resources/resourceShape";
import TextConfig from "js/pq_games/layout/text/textConfig";
import ResourceText from "js/pq_games/layout/resources/resourceText";
import ColorLike from "js/pq_games/layout/color/colorLike";
import DropShadowEffect from "js/pq_games/layout/effects/dropShadowEffect";

// These numbers are INDEXES of the dynamicDetails array (which is always sorted based on position in string, so from left to right)
interface DrawCard
{
    number?: number|number[], // a number of -1 means it must be the same within the group, if not set it means numbers can be ANY
    numberInvert?: boolean
    numberAbsolute?: boolean // use the actual number given, it is NOT an index into the dynamicDetails array
    suit?: number|number[], // a suit of -1 means it must be the same within the group, if not set it means suits can be ANY
    suitInvert?: boolean
}

class DrawGroup
{
    cards: DrawCard[] = []
    adjacent = false; // cards must be adjacent
    union = "or"; // options: "or", "and" => how the different groups are to be combined
    row = false; // cards must be in the same row
    undefinedLength = false; // if true, adds dots/fades at the edges to indicate any length will do
    numeric = false; // if true, adds little symbols between cards to indicate they need to be ascending numeric order
    discard = false; // if true, adds a symbol to indicate these cards are on top of the discard pile

    addCard(card:DrawCard, repeat = 1)
    {
        for(let i = 0; i < repeat; i++)
        {
            this.cards.push(card);
        }
        return this;
    }

    addCards(...cards:DrawCard[])
    {
        for(const card of cards) { this.addCard(card); }
        return this;
    }

    addCardsNumeric(repeat = 1, startCard:DrawCard = {}, endCard:DrawCard = {})
    {
        const fixedSuit = startCard.suit ?? endCard.suit;
        let fixedNum = startCard.number ?? endCard.number;
        if(Array.isArray(fixedNum)) { fixedNum = fixedNum[0]; } // mostly to make typescript happy

        let fixedNumDir = startCard.number != undefined ? 1 : -1;
        const numIsAbsolute = startCard.numberAbsolute ?? endCard.numberAbsolute;

        for(let i = 0; i < repeat; i++)
        {
            const card:DrawCard = {};
            if(fixedSuit != null) { card.suit = fixedSuit; }

            // these are dynamic numbers ( = indices into dynamicDetails array), so we can only copy the specific index set, not create a nice "series" like below
            if(fixedNum != null) 
            { 
                const copyStartingNumber = (fixedNum == startCard.number && i == 0);
                const copyEndingNumber = (fixedNum == endCard.number && i == (repeat-1));
                if(copyStartingNumber || copyEndingNumber)
                {
                    card.number = fixedNum; 
                }
                
            }

            // if we set absolute numbers, we can actually create a nice sequence with fixed numbers
            if(numIsAbsolute)
            {
                let cardNum = fixedNum + i;
                if(fixedNumDir == -1) { cardNum = fixedNum - (repeat - i - 1); }
                card.number = cardNum;
                card.numberAbsolute = true;
            }

            this.addCard(card);
        }

        this.numeric = true;
        return this;
    }

    setAdjacent(v:boolean) { this.adjacent = v; return this; }
    setUnion(u:string) { this.union = u; return this; }
    setRow(r:boolean) { this.row = r; return this; }
    setUndefinedLength(ul:boolean) { this.undefinedLength = ul; return this; }
    setDiscard(d:boolean) { this.discard = d; return this; }
}

const drawCardForContract = (vis:MaterialVisualizer, card:DrawCard, dynDetails:DynamicDetails) : ResourceImage =>
{
    const canvSize = vis.get("cards.contractDraw.card.itemSize"); // new Point(750, 1050);
    const ctx = createContext({ size: canvSize });
    const group = new ResourceGroup();
    const resMisc = vis.getResource("misc");

    // actually give card background + border
    const resRect = new ResourceShape( new Rectangle().fromTopLeft(new Point(), canvSize) );
    const opRect = new LayoutOperation({
        fill: "#FFFFFF",
        stroke: "#1C1C1C",
        strokeWidth: vis.get("cards.contractDraw.card.strokeWidth")
    })
    group.add(resRect, opRect);

    // if suit matters, draw it
    const drawSuit = card.suit != undefined;
    let suitColor = null;
    if(drawSuit)
    {
        let suits = Array.isArray(card.suit) ? card.suit : [card.suit];

        const anchor = vis.get("cards.contractDraw.card.suitPos");
        const size = vis.get("cards.contractDraw.card.suitDims").clone().scale(1.0 / suits.length);
        const positions = getPositionsCenteredAround({ pos: anchor, num: suits.length, size: size })
        
        for(let i = 0; i < suits.length; i++)
        {
            const suit = suits[i];
            const frame = suit == -1 ? MISC.suit_any_same.frame : SUITS[dynDetails[suit]].frame;
            const res = suit == -1 ? resMisc : vis.getResource("suits");
            
            if(suit != -1)
            {
                suitColor = SUITS[dynDetails[suit]].color;
            }

            const op = new LayoutOperation({
                pos: positions[i],
                size: size,
                frame: frame,
                pivot: Point.CENTER
            });
            group.add(res, op);

            if(card.suitInvert)
            {
                const opInvert = new LayoutOperation({
                    pos: positions[i],
                    size: size.clone().scale(1.25),
                    frame: MISC.invert_cross.frame,
                    alpha: 0.85,
                    pivot: Point.CENTER
                });
                group.add(resMisc, opInvert);
            }
        }
    }

    // if number matters, draw it
    const drawNumber = card.number != undefined;
    if(drawNumber)
    {
        let numbers = Array.isArray(card.number) ? card.number : [card.number];

        const maxNumberScaleFactor = 2.175;
        const scaleFactor = (1.0 / Math.min(numbers.length, maxNumberScaleFactor));

        const textConfig = new TextConfig({
            font: vis.get("fonts.heading"),
            size: vis.get("cards.contractDraw.card.fontSize") * scaleFactor
        }).alignCenter();

        const anchor = vis.get("cards.contractDraw.card.numberPos");
        const size = vis.get("cards.contractDraw.card.numberDims").clone().scale(scaleFactor);
        const positions = getPositionsCenteredAround({ pos: anchor, num: numbers.length, size: size })
        
        for(let i = 0; i < numbers.length; i++)
        {
            const number = numbers[i];
            const mustBeSame = (number == -1);

            const op = new LayoutOperation({
                pos: positions[i],
                size: size,
                pivot: Point.CENTER
            });

            let finalNumber = number;
            if(!card.numberAbsolute) 
            {
                finalNumber = dynDetails[number];
            }

            if(mustBeSame) {
                op.frame = MISC.number_any_same.frame;
                group.add(resMisc, op);
            } else {
                op.fill = new ColorLike(suitColor ?? "#000000");

                const str = NUMBERS_AS_STRINGS[finalNumber - 1];
                const resText = new ResourceText({ text: str, textConfig });
                group.add(resText, op);
            }

            if(card.numberInvert)
            {
                const opInvert = op.clone();
                opInvert.frame = MISC.invert_cross.frame;
                group.add(resMisc, opInvert);
            }
        }
    }

    group.toCanvas(ctx);
    return new ResourceImage(ctx.canvas);
}

type DrawDetails = DrawGroup[];
type DynamicDetails = any[];

export { DrawGroup, DrawCard }
export default (vis: MaterialVisualizer, drawDetails:DrawDetails, dynDetails:DynamicDetails) : ResourceImage =>
{
    const numGroups = drawDetails.length;
    const canvSize = vis.get("cards.contractDraw.itemSize");

    const unionDims = vis.get("cards.contractDraw.iconDims.union");
    const betweenCardIconDimsRaw = vis.get("cards.contractDraw.card.iconDims.betweenCard");
    const overSetIconDimsRaw = vis.get("cards.contractDraw.card.iconDims.overSet");

    const layoutDir = numGroups <= 2 ? "horizontal" : "vertical";
    const marginBetweenGroups = layoutDir == "horizontal" ? 0.5*unionDims.x : 0.25*unionDims.y;
    const groupDimsOuter = new Point(canvSize.x / numGroups);
    const groupDims = new Point((canvSize.x - (numGroups-1)*marginBetweenGroups) / numGroups);
    
    const positionsGlobal = getPositionsCenteredAround({ 
        pos: canvSize.clone().scale(0.5),
        num: numGroups,
        size: groupDimsOuter,
        dir: layoutDir == "horizontal" ? Point.RIGHT : Point.DOWN
    })

    const resMisc = vis.getResource("misc");

    let maxGroupSize = 0;
    let hasDiscardIcons = false;
    for(const group of drawDetails)
    {
        maxGroupSize = Math.max(group.cards.length, maxGroupSize);
        if(group.discard) { hasDiscardIcons = true; }
    }

    const cardOverlap = 0.35;
    const minGroupSize = 2.5; // any smaller than this (singles and pairs) and cards get WAY too large and sizing looks inconsistent
    const groupSizeWithOverlap = Math.max(maxGroupSize - (maxGroupSize-1)*cardOverlap, minGroupSize);

    let maxCardSizeInGroup = groupDims.x / groupSizeWithOverlap;
    let cardDims = new Point(maxCardSizeInGroup, maxCardSizeInGroup*1.4);
    if(layoutDir == "vertical") 
    {
        maxCardSizeInGroup = groupDims.y;
        cardDims = new Point(maxCardSizeInGroup / 1.4, maxCardSizeInGroup);
    }

    if(hasDiscardIcons) { cardDims.scale(0.85); } // we need extra space for that


    const ctx = createContext({ size: canvSize });
    const groupGlobal = new ResourceGroup();

    /*
    const debugRect = new ResourceShape( new Rectangle().fromTopLeft(new Point(), canvSize) );
    const debugOp = new LayoutOperation({
        stroke: "#FF0000",
        strokeWidth: 50
    });
    groupGlobal.add(debugRect, debugOp);
    */

    // this is per card, subtle shadowing on the previous card
    const shadowRectOffset = 0.04;
    const opShadowRect = new LayoutOperation({
        fill: "#000000",
        alpha: 0.35
    })

    // this is for the ENTIRE group
    const shadowEnabled = vis.get("cards.contractDraw.shadow.enabled");
    const shadowEffects = shadowEnabled ? [new DropShadowEffect({ 
        offset: vis.get("cards.contractDraw.shadow.offset"),
        color: vis.get("cards.contractDraw.shadow.color"),
        blurRadius: vis.get("cards.contractDraw.shadow.blur"),
    })] : [];


    for(let i = 0; i < numGroups; i++)
    {
        const drawGroup = drawDetails[i];
        const group = new ResourceGroup();

        // draw our details = the set of connected cards
        const cards = drawGroup.cards.slice();
        const numCards = cards.length;
        const positions = getPositionsCenteredAround({
            pos: new Point(),
            num: numCards,
            size: cardDims.clone().scale(new Point(1.0 - cardOverlap, 1))
        });

        const cardDimsUnit = Math.min(cardDims.x, cardDims.y);
        const betweenCardIconDims = new Point(betweenCardIconDimsRaw * cardDimsUnit);
        const overSetIconDims = new Point(overSetIconDimsRaw * cardDimsUnit);

        // if the set length is "undecided / whatever you want" (mostly for ROW contracts),
        // draw fades on the sides (BEHIND the cards looks much better)
        const drawLengthFades = drawGroup.undefinedLength;
        if(drawLengthFades)
        {
            const fadeDims = new Point(cardDims.y);
            const opFadeLeft = new LayoutOperation({
                pos: new Point(-0.5*groupDims.x + 0.225*fadeDims.x, 0),
                size: fadeDims,
                frame: MISC.undefined_length_1.frame,
                alpha: 0.66,
                flipX: true,
                pivot: Point.CENTER
            });
            group.add(resMisc, opFadeLeft);

            const opFadeRight = opFadeLeft.clone(true);
            opFadeRight.pos = opFadeRight.pos.clone().scaleX(-1);
            opFadeRight.flipX = false;
            group.add(resMisc, opFadeRight);
        }

        let secondLayerOperations = [];
        for(let i = 0; i < numCards; i++)
        {
            const pos = positions[i];
            const card = cards[i];

            // draw shadows on the card before us
            const notFirstCard = i > 0;
            if(notFirstCard)
            {
                const shadowRectPos = pos.clone().sub(new Point(shadowRectOffset*cardDims.x, 0));
                const resRect = new ResourceShape( new Rectangle({ center: shadowRectPos, extents: cardDims }));
                group.add(resRect, opShadowRect);
            }

            // draw the discard icon above each individual card (if needed)
            if(drawGroup.discard)
            {
                const opDiscard = new LayoutOperation({
                    pos: new Point(0, -0.6*cardDims.y),
                    size: new Point(cardDims.x),
                    frame: MISC.discard_pile.frame,
                    pivot: Point.CENTER
                });
                group.add(resMisc, opDiscard);
            }
            
            // draw the actual card
            const resCard = drawCardForContract(vis, card, dynDetails);
            const opCard = new LayoutOperation({
                pos: pos,
                size: cardDims,
                pivot: Point.CENTER
            });
            group.add(resCard, opCard);

            // draw any symbols in between (adjacency or numeric order)
            const notFinalCard = i < (numCards - 1);
            if(notFinalCard)
            {
                const betweenPosAdjacent = pos.clone().add(new Point(0.5*cardDims.x - cardOverlap*cardDims.x, 0));
                const betweenPosNumeric = betweenPosAdjacent.clone();
                const hasBoth = drawGroup.adjacent && drawGroup.numeric; 
                const offset = new Point(0, 0.2*cardDims.y);
                if(hasBoth)
                {
                    betweenPosAdjacent.sub(offset);
                    betweenPosNumeric.add(offset);
                }

                if(drawGroup.adjacent)
                {
                    const op = new LayoutOperation({
                        pos: betweenPosAdjacent,
                        size: betweenCardIconDims,
                        frame: MISC.adjacent.frame,
                        pivot: Point.CENTER
                    });
                    secondLayerOperations.push(op);
                }

                if(drawGroup.numeric)
                {
                    const op = new LayoutOperation({
                        pos: betweenPosNumeric,
                        size: betweenCardIconDims,
                        frame: MISC.numeric.frame,
                        pivot: Point.CENTER
                    });
                    secondLayerOperations.push(op);
                }
            }
        }

        // draw the delayed operations NOW, so they're on top of ALL CARDS
        for(const op of secondLayerOperations)
        {
            group.add(resMisc, op);
        }

        // draw the row indicator above the entire group
        const drawRowIcon = drawGroup.row;
        if(drawRowIcon)
        {
            const opRow = new LayoutOperation({
                pos: new Point(0, -0.5*cardDims.y),
                size: overSetIconDims,
                frame: MISC.same_row.frame,
                pivot: Point.CENTER
            });
            group.add(resMisc, opRow);
        }

        // add this entire group as child of main one
        const anchorPos = positionsGlobal[i]; 
        const opGroup = new LayoutOperation({
            pos: anchorPos,
            effects: shadowEffects
        });
        groupGlobal.add(group, opGroup);

        // union type between them (not on final one, of course)
        const drawUnion = i < (numGroups-1); 
        if(drawUnion)
        {
            const nextAnchorPos = positionsGlobal[i+1];
            const data = MISC["union_" + drawGroup.union]
            const unionOp = new LayoutOperation({
                pos: anchorPos.clone().add(nextAnchorPos).scale(0.5),
                size: unionDims,
                frame: data.frame,
                pivot: Point.CENTER,
                rot: layoutDir == "horizontal" ? 0 : 0.5*Math.PI
            })
            groupGlobal.add(resMisc, unionOp);
        }
    }

    groupGlobal.toCanvas(ctx);
    return new ResourceImage(ctx.canvas);
}
