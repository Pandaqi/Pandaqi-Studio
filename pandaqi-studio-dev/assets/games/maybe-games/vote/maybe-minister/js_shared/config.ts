import CONFIG_SHARED from "games/maybe-games/js_shared/configShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";
import { DecreeType, LawType } from "./dict";

const CONFIG:Record<string,any> = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "maybeMinisterConfig",
    fileName: "[Material] Maybe Minister",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    sets:
    {
        base: true,
        abstain: false,
        somethingElse: false
    },

    fonts:
    {
        heading: "blackwood"
    },

    // assets
    assetsBase: "/maybe-games/vote/maybe-minister/assets/",
    assets:
    {
        blackwood:
        {
            key: "blackwood",
            path: "fonts/BlackwoodCastle.woff2"
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(6,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,2)
        },
    },

    generation:
    {
        numVoteCards: 48,
        numAbstainCards: 16,

        numResourceIconsBounds: new Bounds(1,3),
        maxDistBetweenIconFreqs: 3,
        numDecreeCardsPerType:
        {
            [DecreeType.LAW]: 25,
            [DecreeType.SUPPORT]: 15,
            [DecreeType.RESOURCE]: 25
        },

        // @NOTE: These distributions are allowed to sum to 1.0 or higher
        // If higher, it just adds more randomness/fuzziness to how the final cards end up 
        maxVoteStorageDistribution:
        {
            0: 0.05,
            1: 0.25,
            2: 0.3,
            3: 0.15,
            4: 0.05,
        },

        supportNumberDistribution:
        {
            good:
            {
                1: 0.2,
                2: 0.4,
                3: 0.3,
                4: 0.1
            },

            bad:
            {
                1: 0.5, 
                2: 0.35,
                3: 0.15
            }
        },

        lawTypeDistribution:
        {
            [LawType.SCORING]: 0.4,
            [LawType.VOTING]: 0.3,
            [LawType.CARDS]: 0.1,
            [LawType.RESOURCES]: 0.1,
            [LawType.MISC]: 0.1
        }
    },
    
    cards:
    {
        shared:
        {
            dropShadowRadius: new CVal(0.02, "sizeUnit")
        },
    },

    votes:
    {
        number:
        {
            pos: new CVal(new Point(0.5, 0.725), "size"),
            fontSize: new CVal(0.375, "sizeUnit"),
            color: "#000000",
            colorStroke: "#FFFFFF",
            strokeWidth: new CVal(0.025, "sizeUnit")
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);

export default CONFIG;