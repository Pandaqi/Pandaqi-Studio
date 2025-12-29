import { CONFIG_SHARED } from "games/maybe-games/shared/configShared";
import { cardPicker } from "../game/cardPicker";
import { votePicker } from "../game/votePicker";
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

            identities:
            {
                type: SettingType.CHECK,
                label: "Secret Identities",
                value: false,
            },

            gadgets:
            {
                type: SettingType.CHECK,
                label: "Gadget Shopping",
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
        fileName: "Maybe Missions",
    },

    // assets
    _resources:
    {    
        base: "/maybe-games/vote/maybe-missions/assets/",
        files:
        {
            trebek:
            {
                key: "trebek",
                path: "fonts/StarTrebek.woff2",
            },

            card_templates:
            {
                path: "card_templates.webp",
                frames: new Vector2(7,1)
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(8,3)
            },
        },
    },

    generation:
    {
        numVoteCards: 60,
        numMissionCards: 40,
        numMasterCards: 20,
        numIdentityCardsEach: 18,
        numShopCards: 20,
        shopCardsMaxFrequencyDist: 3,
        shopCardsCostBounds: new Bounds(1,3),

        numResourcesPerSide: new Bounds(1,4),
        maxResourcesRedSide: 3,
        goodIconFlipProb: 0.1,
        badIconFlipProb: 0.1,
        maxDeviationBadIcons: 2,

        masterCardIconsRange: new Bounds(5, 19)
    },

    rulebook:
    {
        marketSize: 6,
        numStartingVotesPerPlayer: 10,
        equalityWinsMission: true
    },

    _material:
    {
        cards:
        {
            itemSize: new Vector2(375, 525),
            picker: cardPicker
        },

        votes:
        {
            itemSize: new Vector2(375, 525),
            picker: votePicker
        }
    },

    _drawing:
    {
        fonts:
        {
            heading: "trebek"
        },

        cards:
        {
            shared:
            {
                dropShadowRadius: new CVal(0.02, "sizeUnit"),
                textColor:
                {
                    green: "#002800",
                    red: "#280000",
                }
            },

            resources:
            {
                iconOffset: new CVal(new Vector2(0, 0.125), "size"),
                iconDims: new CVal(new Vector2(0.225), "sizeUnit"),
                iconCrossOffsetY: 0.25,
                iconDimsCrossFactor: 0.75,
            },

            randomText:
            {
                fontSize: new CVal(0.175, "sizeUnit"),
                color: "#000000",
                colorStroke: "#FFFFFF",
                strokeWidth: new CVal(0.01, "sizeUnit")
            },

            master:
            {
                iconPos: new CVal(new Vector2(0.5, 0.4), "size"),
                iconDims: new CVal(new Vector2(0.35), "sizeUnit"),
                rectPos: new CVal(new Vector2(0.5, 0.585), "size"),
                rectDims: new CVal(new Vector2(0.9, 0.295), "size"),
                rectBlur: new CVal(0.035, "sizeUnit"),

                fontSize: new CVal(0.0685, "sizeUnit"),
                textColor: "#000000"
            },

            identity:
            {
                rectPos: 
                {
                    good: new CVal(new Vector2(0.5, 0.366), "size"),
                    bad: new CVal(new Vector2(0.5, 0.725), "size")
                },
                rectDims: new CVal(new Vector2(0.9, 0.325), "size"),
                rectBlur: new CVal(0.035, "sizeUnit"),
                
                fontSize: new CVal(0.0733, "sizeUnit"),
                textColor: "#000000"
            },

            shop:
            {
                labelOffset: new CVal(new Vector2(0, 0.025), "size"),
                textOffset: new CVal(new Vector2(0, 0.28), "size"),
                fontSizeLabel: new CVal(0.04, "sizeUnit"),
                fontSize: new CVal(0.058, "sizeUnit"),
                strokeWidthLabel: new CVal(0.0025, "sizeUnit"),
                compositeLabel: "overlay",
                textBoxDims: new CVal(new Vector2(0.9, 0.5), "size"),
            }
        },

        votes:
        {
            number:
            {
                pos: new CVal(new Vector2(0.5, 0.725), "size"),
                fontSize: new CVal(0.375, "sizeUnit"),
                color: "#000000",
                colorStroke: "#FFFFFF",
                strokeWidth: new CVal(0.025, "sizeUnit")
            }
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);