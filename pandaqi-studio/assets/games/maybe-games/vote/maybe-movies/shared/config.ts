import CONFIG_SHARED from "games/maybe-games/shared/configShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";

const CONFIG:Record<string,any> = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "maybeMoviesConfig",
    fileName: "[Material] Maybe Movies",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    sets:
    {
        base: true,
        breakingChanges: false,
        blockbusterBudgets: false
    },

    fonts:
    {
        heading: "rialto"
    },

    // assets
    assetsBase: "/maybe-games/vote/maybe-movies/assets/",
    assets:
    {
        rialto:
        {
            key: "rialto",
            path: "fonts/RialtoNF.woff2"
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(5,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,2)
        },
    },

    generation:
    {
        numVoteCards: 60,
        numChangeCards: 12,
        numMovieCards: 44,
        numBlockbusterCards: 16,
        costIconNumDist:
        {
            1: 0.6,
            2: 0.3,
            3: 0.1
        },

        costMaxDistBetweenFreqs: 3,
        profitModifier: new Bounds(0.66, 1.75),
        profitBounds: new Bounds(1,5),
        comboNumBounds:
        {
            yes: new Bounds(2,4),
            no: new Bounds(1,2)
        }
    },

    rulebook:
    {
        marketSize: 6,
        numStartingVotesPerPlayer: 10,
        minProposalSize: 1,
        numCardsToMoviesMade: 1, // should probably always be the same as minProposalSize right?
        useWildcardSetsRule: true,
        numIconsNeededForWildcard: 2,
    },
    
    cards:
    {
        shared:
        {
            dropShadowRadius: new CVal(0.02, "sizeUnit")
        },

        movie:
        {
            cost:
            {
                iconOffset: new CVal(new Point(0.0575), "sizeUnit"),
                iconDims: new CVal(new Point(0.2), "sizeUnit"),
                textBoxDims: new CVal(new Point(0.95, 0.4), "size"),
                fontSize: new CVal(0.07, "sizeUnit"),
                textColor: "#332211"
            },

            profit:
            {
                fontSize: new CVal(0.2, "sizeUnit"),
                textColor: "#143D00"
            },

            text:
            {
                fontSizeSub: new CVal(0.045, "sizeUnit"),
                fontSize: new CVal(0.1, "sizeUnit"),
                textPosSub: new CVal(new Point(0.5, 0.375), "size"),
                textPos: new CVal(new Point(0.5, 0.5), "size")
            }
        }
    },

    votes:
    {
        details:
        {
            fontSize: new CVal(0.4, "sizeUnit"),
            iconDims: new CVal(new Point(0.375), "sizeUnit"),
            textColors:
            {
                yes: "#143D00",
                no: "#540000",
                change: "#563300"
            },
            textPos: new CVal(new Point(0.325, 0.5), "size"), 
            iconPos: new CVal(new Point(0.675, 0.5), "size"),
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);

export default CONFIG;