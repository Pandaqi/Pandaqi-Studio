import ResourceLoader from "js/pq_games/layout/resources/resourceLoader";
import MaterialVisualizer from "js/pq_games/tools/generation/materialVisualizer";
import Point from "js/pq_games/tools/geometry/point";
import InteractiveExample from "js/pq_rulebook/examples/interactiveExample";
import TilePicker from "../js_game/tilePicker";
import CONFIG from "../js_shared/config";
import Bounds from "js/pq_games/tools/numbers/bounds";
import shuffle from "js/pq_games/tools/random/shuffle";
import Tile from "../js_game/tile";
import fromArray from "js/pq_games/tools/random/fromArray";
import convertCanvasToImageMultiple from "js/pq_games/layout/canvas/convertCanvasToImageMultiple";

class Hand
{
    tiles:Tile[] = [];

    count() { return this.tiles.length; }
    fill(tiles:Tile[])
    {
        this.tiles = tiles;
        return this;
    }

    getTilesAbove(t:Tile)
    {
        const arr = [];
        const val = t.num;
        for(const tile of this.tiles)
        {
            const isAbove = tile.num > val;
            if(!isAbove) { continue; }
            arr.push(tile);
        }
        return arr;
    }

    getFirstTile() { return this.tiles[0]; }
    getLastTile() { return this.tiles[this.tiles.length - 1]; }
    getRandomTile() { return this.tiles[Math.floor(Math.random() * this.tiles.length)]; }
    addTile(t:Tile)
    {
        this.tiles.push(t);
        return this;
    }

    removeTile(t:Tile)
    {
        const idx = this.tiles.indexOf(t);
        if(idx >= 0) { this.tiles.splice(idx, 1); }
        return this;
    }

    getTilesSorted(invert = false)
    {
        const dir = invert ? -1 : 1;
        const list = this.tiles.slice().sort((a,b) => {
            return a.num * dir - b.num * dir;
        });
        return list;
    }

    getTilesSortedWithIndex(invert = false)
    {
        const list = [];
        const dir = invert ? -1 : 1;
        for(let i = 0; i < this.tiles.length; i++)
        {
            list.push({
                index: i,
                tile: this.tiles[i]
            });
        }
        list.sort((a,b) => {
            return a.tile.num * dir - b.tile.num * dir;
        })
        return list;
    }

    async drawNode(o)
    {
        const node = o.addFlexList(await this.draw());
        node.style.flexWrap = "wrap";
    }

    async draw()
    {
        const canvases = [];
        for(const tile of this.tiles)
        {
            canvases.push(await tile.drawForRules(visualizer));
        }
        const images = convertCanvasToImageMultiple(canvases);
        return images;
    }
}

async function generate()
{
    await resLoader.loadPlannedResources();

    // prepare all cards, offers, player hands
    const tiles : Tile[] = shuffle(picker.get().slice());
    const offer : Hand = new Hand().fill([tiles.pop()]);

    const numTiles = tiles.length;
    const numPlayers = new Bounds(3,4).randomInteger();
    const numCardsPerPlayer = Math.ceil(numTiles / numPlayers);
    const players : Hand[] = [];
    for(let i = 0; i < numPlayers; i++)
    {
        const p = new Hand().fill(tiles.splice(0, numCardsPerPlayer));
        players.push(p);
    }

    const MIN_OFFER_LENGTH_FOR_AUCTION = 3;
    const AUCTION_PROBABILITY = 0.33;
    const MAX_OFFER_SIZE = 8;

    o.addParagraph("The table looks like this.");
    await offer.drawNode(o);

    // actually play the meat of the round (adding to offer)
    let keepPlaying = true;
    let curPlayerIndex = 0;
    while(keepPlaying)
    {
        const curHand = players[curPlayerIndex];
        const validMoves = curHand.getTilesAbove(offer.getLastTile());

        const declareAuction = (validMoves.length <= 0) || (offer.count() >= MIN_OFFER_LENGTH_FOR_AUCTION && Math.random() <= AUCTION_PROBABILITY) || (offer.count() >= MAX_OFFER_SIZE);
        if(declareAuction) {
            o.addParagraph("Player " + (curPlayerIndex + 1) + " declares an <strong>auction</strong>!");
        } else {
            const randomMove = fromArray(validMoves);
            curHand.removeTile(randomMove);
            offer.addTile(randomMove);

            o.addParagraph("Player " + (curPlayerIndex + 1) + " <strong>adds</strong> a tile to the <strong>offer</strong>. It now looks like this.");
            await offer.drawNode(o);
        }

        curPlayerIndex = (curPlayerIndex + 1) % numPlayers;
        keepPlaying = !declareAuction;
    }

    // and then play an auction
    const bids = new Hand();
    const offerSorted = offer.getTilesSorted();
    let bidsOutOfRange = 0;
    for(let i = 0; i < numPlayers; i++)
    {
        const randomBid = players[i].getRandomTile();
        bids.addTile(randomBid);
        
        const val = randomBid.num;
        if(val < offerSorted[0].num || val > offerSorted[offerSorted.length-1].num)
        {
            bidsOutOfRange++;
        }
    }

    o.addParagraph("Below are all the <strong>bids</strong> by the players (in player order).");
    await bids.drawNode(o);

    const invertAuction = (bidsOutOfRange <= 0);
    if(invertAuction) {
        o.addParagraph("The auction <strong>inverts</strong>! (Because no player bid a number outside of the range of numbers in the offer.) So we handle the bids from <strong>lowest</strong> to <strong>highest</strong>.");
    } else {
        o.addParagraph("It's a regular auction (no inversion), so we handle the bids from <strong>highest</strong> to <strong>lowest</strong>.")
    }

    const SKIP_PROBABILITY = 0.45;

    const bidsSorted = bids.getTilesSortedWithIndex(!invertAuction); // we want DESCENDING, so we invert the inversion :p
    for(let i = 0; i < bidsSorted.length; i++)
    {
        const bidData = bidsSorted[i];
        const playerNumStr = (bidData.index + 1);
        const playerData = players[bidData.index];
        const hasHandCards = (playerData.count() > 0);
        const isFinalPlayer = (i >= (numPlayers - 1));
        
        const willSkip = Math.random() <= SKIP_PROBABILITY && hasHandCards && !isFinalPlayer;
        if(willSkip) {
            o.addParagraph("Player " + playerNumStr + " decides to <strong>skip</strong>. They add a tile to the offer and discard a scored tile.");

            const randTile = playerData.getRandomTile();
            offer.addTile(randTile);
            playerData.removeTile(randTile);
        } else {
            o.addParagraph("Player " + playerNumStr + " decides to <strong>accept</strong>. They score all the tiles in the offer, which looked as follows in the end.");
            await offer.drawNode(o);
            break;
        }
    }

    o.addParagraph("The worst bid becomes the start of next offer. Discard the other bids. Next round!");
}

const e = new InteractiveExample({ id: "turn" });
e.setButtonText("Give me an example turn!");
e.setGenerationCallback(generate);

const o = e.getOutputBuilder();

const resLoader = new ResourceLoader({ base: CONFIG.assetsBase });
resLoader.planLoadMultiple(CONFIG.assets);

CONFIG.resLoader = resLoader;
CONFIG.itemSize = new Point(CONFIG.rulebook.tileSize);
const visualizer = new MaterialVisualizer(CONFIG);

const picker = new TilePicker();
picker.generate();
