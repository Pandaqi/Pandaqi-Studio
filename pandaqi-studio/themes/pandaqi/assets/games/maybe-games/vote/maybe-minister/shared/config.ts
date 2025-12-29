import { CONFIG_SHARED } from "games/maybe-games/shared/configShared";
import { DecreeType, LawType } from "./dict";
import { votePicker } from "../game/votePicker";
import { cardPicker } from "../game/cardPicker";
import { SettingType, Vector2, Bounds, CVal, mergeObjects } from "lib/pq-games";

export const CONFIG:Record<string,any> = 
{
    _settings:
    {
        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                value: true,
                label: "Base Set",
            },

            abstain:
            {
                type: SettingType.CHECK,
                label: "Abstain Attacks",
                value: false,
            },

            advanced:
            {
                type: SettingType.CHECK,
                label: "Advanced Politics",
                value: false,
            },
        }
    },

    _debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    _game:
    {
        fileName: "Maybe Minister",
    },

    // assets
    _resources:
    {    
        base: "/maybe-games/vote/maybe-minister/assets/",
        files:
        {
            blackwood:
            {
                key: "blackwood",
                path: "fonts/BlackwoodCastle.woff2"
            },

            card_templates:
            {
                path: "card_templates.webp",
                frames: new Vector2(6,1)
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(8,2)
            },
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

    _material:
    {
        cards:
        {
            itemSize: new Vector2(375, 525),
            picker: () => cardPicker
        },

        votes:
        {
            itemSize: new Vector2(375, 525),
            picker: () => votePicker
        }
    },

    _drawing:
    {
        fonts:
        {
            heading: "blackwood"
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
                pos: new CVal(new Vector2(0.5, 0.525), "size"),
                textBoxDims: new CVal(new Vector2(0.825, 0.7), "size"),
            },

            voteStorage:
            {
                offset: new CVal(new Vector2(0.2, 0), "size"),
                textColor: "#000000",
                fontSize: new CVal(0.095, "sizeUnit"),
                iconDims: new CVal(new Vector2(0.24), "sizeUnit"),
            },

            sides:
            {
                offset: new CVal(new Vector2(0, 0.35), "size"),
                textBoxDims: new CVal(new Vector2(0.83, 0.5), "size"),
                fontSize: new CVal(0.07, "sizeUnit"),
                iconDims: new CVal(new Vector2(0.2), "sizeUnit"),
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
                pos: new CVal(new Vector2(0.5, 0.575), "size"),
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
    },
}

mergeObjects(CONFIG, CONFIG_SHARED);