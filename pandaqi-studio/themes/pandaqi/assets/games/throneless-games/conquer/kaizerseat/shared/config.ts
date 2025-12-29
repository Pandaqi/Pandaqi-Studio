import { CONFIG_SHARED } from "games/throneless-games/shared/configShared";
import { cardPicker } from "../game/cardPicker";
import { SettingType, Vector2, CVal, mergeObjects } from "lib/pq-games";

export const CONFIG:Record<string,any> = 
{
    _settings:
    {
        highLegibility:
        {
            type: SettingType.CHECK,
            label: "High Legibility",
            value: true,
            remark: "Picks a more neutral font for maximum legibility.",
        },

        generateThroneCards:
        {
            type: SettingType.CHECK,
            value: true,
            label: "Generate Thronecards",
        },

        generateSeatCards:
        {
            type: SettingType.CHECK,
            value: true,
            label: "Generate Seatcards",
        },

        set:
        {
            type: SettingType.ENUM,
            values: ["none", "starter", "medium", "advanced", "complete", "random"],
            value: "starter",
            remark: "Pick a predetermined set, or use none and pick your specific card packs below!"
        },

        packs:
        {
            type: SettingType.MULTI,
            values: ["solongNecks", "boardomThieves", "longswordFins", "atheneyes", "gallopeers", "candlesticks", "taredtula", "sonarAndSons", "sirensOfSeatongue", "cracktapus", "ravenletters", "twistertoots"],
            value: ["solongNecks", "atheneyes", "candlesticks", "sonarAndSons"],
            label: "Seekers"
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
        fileName: "Kaizerseat",
    },
    
    _resources:
    {    
        base: "/throneless-games/conquer/kaizerseat/assets/",
        files:
        {
            card_templates:
            {
                path: "card_templates.webp",
                frames: new Vector2(2,1)
            },

            action_types:
            {
                path: "action_types.webp",
                frames: new Vector2(5,1)
            }        
        },
    },

    rulebook:
    {
        seatNaming: "Kaizerseat",
        leaderNaming: "Leader",
        endGameTrigger: "noVotes",

        decideDirectionBeforeRound: true,
        drawThroneCard: true,
    },

     _material:
    {
        cards:
        {
            picker: cardPicker
        }
    },

    _drawing:
    {
        cards:
        {
            displayActionTypes: true,

            actionType:
            {
                fontSize: new CVal(0.075, "sizeUnit"),
                alpha: 0.8
            },

            specialText:
            {
                pos: new CVal(new Vector2(0.5, 0.6), "size"),
                fontSize: new CVal(0.063, "sizeUnit"),
                textBoxDims: new CVal(new Vector2(0.8, 0.66), "size"),
            }
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);