import { EGGS_SHARED, TileDataDict } from "games/easter-eggventures/js_shared/dictShared";
import Bounds from "js/pq_games/tools/numbers/bounds";

enum TileType
{
    REGULAR = "regular",
    GOAL = "goal",
    SPECIAL = "special",
    POWER = "power",
    HANDICAP = "handicap"
}

const SPECIAL_EGGS:TileDataDict =
{
    // fixed numbers take up 8 of the special eggs (of max ~25)
    negative_small: { frame: 0, desc: "Always scores <b>-1 point</b>.", freq: 2 },
    negative_medium: { frame: 1, desc: "Always scores <b>-2 points</b>.", freq: 1 },
    negative_large: { frame: 2, desc: "Always scores <b>-4 points</b>.", freq: 1 }, 
    positive_small: { frame: 3, desc: "Always scores <b>1 point</b>.", freq: 2 },
    positive_medium: { frame: 4, desc: "Always scores <b>2 points</b>.", freq: 1 },
    positive_large: { frame: 5, desc: "Always scores <b>4 points</b>.", freq: 1 },

    // ~16 actions triggering when added to offer or messing with how bidding works
    insta_end: { frame: 6, desc: "The round <b>ends</b> after your turn.", freq: 1 },
    delayed_turn: { frame: 7, desc: "Take the remainder of your turn <b>after</b> all other players have gone.", freq: 1 },
    study_offer: { frame: 8, desc: "Look at all tiles in the current <b>offer</b>.", freq: 2 },
    study_bids: { frame: 9, desc: "Look at all <b>bids</b>.", freq: 2 },
    bonus_tiles: { frame: 10, desc: "<b>Draw 3</b> extra tiles into your hand.", freq: 1 },
    force_play: { frame: 11, desc: "Force everyone to play their offer or bid tiles <b>faceup</b> (your choice).", freq: 1 },
    spy: { frame: 12, desc: "Look at a player's secret <b>Goal Egg</b>.", freq: 1 },
    lazy_bunny: { frame: 13, desc: "You're <b>not</b> required to do anything (bid or offer) on your turn.", freq: 1 },
    replacement_egg: { frame: 14, desc: "<b>Replace</b> up to 3 tiles from the offer with tiles from your hand.", freq: 1 },
    
    fair_sharing: { frame: 15, desc: "End of round: instead of bidding, everyone just receives <b>1 random offer tile</b>.", freq: 1 },
    matching_money: { frame: 16, desc: "<b>Bid</b> tiles whose type also <b>appears in the offer</b> get +50.", freq: 1 },
    reverse_auction: { frame: 17, desc: "Reverse the auction. (<b>Lowest bid</b> wins, <b>highest bid</b> starts.)", freq: 2 },
    bunny_outcast: { frame: 18, desc: "Pick one player whose <b>bid</b> is <b>ignored</b>.", freq: 1 },

    // DISCARDED: "Swap your secret egg with someone else" => just too powerful, especially late in the game.
}

const POWERS:TileDataDict = 
{
    info_offer: { frame: 0, label: "Offer Study", desc: "Look at a facedown tile in the offer." },
    info_bid: { frame: 1, label: "Bid Study", desc: "Look at a player's bid tile." },
    swap_offer: { frame: 2, label: "Swap Offer", desc: "Swap 1 or 2 offer tiles with hand tiles." },
    swap_bid: { frame: 3, label: "Swap Bid", desc: "Swap your bid tile with one from another player." },
    collect_any: { frame: 4, label: "Collect Any", desc: "Collect 1 facedown offer tile; if so, don't bid." },
    flip_any: { frame: 5, label: "Flip Any", desc: "Flip any tile (faceup <-> facedown)." },
    large_hands: { frame: 6, label: "Large Hands", desc: "You permanently have 1 more tile than the others." },
    higher_bids: { frame: 7, label: "Higher Bids", desc: "You permanently get +10 to your bid card." },
}

const HANDICAPS:TileDataDict =
{
    always_follow: { frame: 8, label: "Always Follow", desc: "You must add the same egg to the offer as one already inside." },
    never_follow: { frame: 9, label: "Never Follow", desc: "You must add an egg to the offer that's not already inside." },
    bid_lower: { frame: 10, label: "Bid Lower", desc: "You must always bid lower than the highest offer card." },
    bid_higher: { frame: 11, label: "Bid Higher", desc: "You must always bid higher than the lowest offer card." },
    always_faceup: { frame: 12, label: "Always Faceup", desc: "You must always play at least 2 faceup tiles." },
    small_hands: { frame: 13, label: "Small Hands", desc: "You permanently have 1 fewer tile than the others." },
    lower_bids: { frame: 14, label: "Lower Bids", desc: "You permanently get -10 to your bid card." },
    public_egg: { frame: 15, label: "Public Egg", desc: "One of your secret Goal Eggs is permanently revealed." },
}

interface TileTypeData
{
    textureKey: string,
    backgroundKey: string,
    label: string,
    color?: string,
    backgroundRandom?: Bounds // selects one of its frames from the background spritesheet at random 
    rotationRandom?: Bounds // will rotate illustration to random value within bounds
}

const TYPE_DATA:Record<TileType, TileTypeData> = 
{
    [TileType.REGULAR]: { textureKey: "eggs", backgroundKey: "eggs_backgrounds", label: "Regular Egg", rotationRandom: new Bounds(-0.066*Math.PI, 0.066*Math.PI) },
    [TileType.SPECIAL]: { textureKey: "actions", backgroundKey: "misc", backgroundRandom: new Bounds(0,3), color: "#469990", label: "Special Egg" }, // color = teal
    [TileType.GOAL]: { textureKey: "eggs", backgroundKey: "eggs_backgrounds", label: "Goal Egg" },
    [TileType.POWER]: { textureKey: "powers", backgroundKey: "misc", backgroundRandom: new Bounds(0,3), color: "#DCBEFF", label: "Eggstra Power" }, // color = lavender 
    [TileType.HANDICAP]: { textureKey: "powers", backgroundKey: "misc", backgroundRandom: new Bounds(0,3), color: "#9A6324", label: "Handicegg" }, // color = brown
}

const MATERIAL = 
{
    [TileType.REGULAR]: EGGS_SHARED,
    [TileType.SPECIAL]: SPECIAL_EGGS,
    [TileType.GOAL]: EGGS_SHARED,
    [TileType.POWER]: POWERS,
    [TileType.HANDICAP]: HANDICAPS 
}

export 
{
    SPECIAL_EGGS,
    POWERS,
    HANDICAPS,
    TileType,
    TYPE_DATA,
    MATERIAL,
}
