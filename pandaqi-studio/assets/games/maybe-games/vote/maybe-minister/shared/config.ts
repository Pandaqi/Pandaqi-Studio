import CONFIG_SHARED from "games/maybe-games/shared/configShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";
import { DecreeType, LawType } from "./dict";

const CONFIG:Record<string,any> = 
{
    _settings:
    {
        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                default: true,
                label: "Base Set",
            },

            abstain:
            {
                type: SettingType.CHECK,
                label: "Abstain Attacks",
            },

            advanced:
            {
                type: SettingType.CHECK,
                label: "Advanced Politics",
            },
        }
    },

    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "maybeMinisterConfig",
    fileName: "Maybe Minister",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    includeWildcard: false,

    sets:
    {
        base: true,
        abstain: false,
        undecided: false,
        advanced: false
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
        numVoteCards: 50,
        numAbstainCards: 16,
        numAbstainLaws: 12,

        numAdvancedCardsLaw: 14,
        numAdvancedCardsRegular: 12,
        percentageBadVibesLaws: 0.3,

        numResourceIconsBounds: new Bounds(1,3),
        maxDistBetweenIconFreqs: 2,
        numDecreeCardsPerType:
        {
            [DecreeType.LAW]: 34,
            [DecreeType.SUPPORT]: 10, // @NOTE; needs to be at least 10 to ensure we have 6 starting cards (Support-1) => find cleaner solution to ensure this?
            [DecreeType.RESOURCE]: 38
        },

        // @NOTE: These distributions are allowed to sum to 1.0 or higher
        // If higher, it just adds more randomness/fuzziness to how the final cards end up 
        maxVoteStorageDistribution:
        {
            0: 0.15,
            1: 0.6,
            2: 0.25,
        },

        supportNumberDistribution:
        {
            good:
            {
                1: 0.8,
                2: 0.2,
            },

            bad:
            {
                1: 0.5, 
                2: 0.3,
                3: 0.2
            }
        },

        lawTypeDistribution:
        {
            [LawType.SCORING]: 0.7,
            [LawType.VOTING]: 0.125,
            [LawType.CARDS]: 0.125,
            [LawType.MISC]: 0.05
        }
    },

    rulebook:
    {
        numHandCards: 5,
        numStartingVotesPerPlayer: 2,
        minProposalSize: 2, // makes games quicker and reduces our material needs
        maxProposalSize: 5, // the same as hand size
        equalityWinsProposal: true,
        winningPointsTarget: 25,
    },
    
    cards:
    {
        shared:
        {
            dropShadowRadius: new CVal(0.02, "sizeUnit"),
        },

        laws:
        {
            fontSize: new CVal(0.085, "sizeUnit"),
            textColor: "#221100",
            pos: new CVal(new Point(0.5, 0.525), "size"),
            textBoxDims: new CVal(new Point(0.825, 0.7), "size"),
        },

        voteStorage:
        {
            offset: new CVal(new Point(0.2, 0), "size"),
            textColor: "#000000",
            fontSize: new CVal(0.095, "sizeUnit"),
            iconDims: new CVal(new Point(0.24), "sizeUnit"),
        },

        sides:
        {
            offset: new CVal(new Point(0, 0.35), "size"),
            textBoxDims: new CVal(new Point(0.83, 0.5), "size"),
            fontSize: new CVal(0.07, "sizeUnit"),
            iconDims: new CVal(new Point(0.2), "sizeUnit"),
            textColors:
            {
                good: "#002800",
                bad: "#280000",
                abstain: "#280028"
            }
        }
    },

    votes:
    {
        number:
        {
            pos: new CVal(new Point(0.5, 0.575), "size"),
            fontSize: new CVal(0.375, "sizeUnit"),
            colorStroke: "#FFFFFF",
            strokeWidth: new CVal(0.025, "sizeUnit"),
            textColors:
            {
                yes: "#124A00",
                no: "#4A1200",
                abstain: "#4A124A"
            }
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);

export default CONFIG;