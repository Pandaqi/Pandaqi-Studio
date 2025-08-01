import { CONFIG_SHARED } from "games/throneless-games/shared/configShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";

export const CONFIG:Record<string,any> = 
{
    _settings:
    {
        highLegibility:
        {
            type: SettingType.CHECK,
            label: "High Legibility",
            default: true,
            remark: "Picks a more neutral font for maximum legibility.",
        },

        generateThroneCards:
        {
            type: SettingType.CHECK,
            default: true,
            label: "Generate Thronecards",
        },

        generateSeatCards:
        {
            type: SettingType.CHECK,
            default: true,
            label: "Generate Seatcards",
        },

        set:
        {
            type: SettingType.ENUM,
            values: ["none", "starter", "medium", "advanced", "complete", "random"],
            default: "starter",
            remark: "Pick a predetermined set, or use none and pick your specific card packs below!"
        },

        packs:
        {
            type: SettingType.MULTI,
            values: ["solongNecks", "boardomThieves", "longswordFins", "atheneyes", "gallopeers", "candlesticks", "taredtula", "sonarAndSons", "sirensOfSeatongue", "cracktapus", "ravenletters", "twistertoots"],
            default: ["solongNecks", "atheneyes", "candlesticks", "sonarAndSons"],
            label: "Seekers"
        }
    },

    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "kaizerseatConfig",
    fileName: "Kaizerseat",

    assetsBase: "/throneless-games/conquer/kaizerseat/assets/",

    generateThroneCards: true,
    generateSeatCards: true,

    assets:
    {
        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(2,1)
        },

        action_types:
        {
            path: "action_types.webp",
            frames: new Point(5,1)
        }        
    },

    rulebook:
    {
        seatNaming: "Kaizerseat",
        leaderNaming: "Leader",
        endGameTrigger: "noVotes",

        decideDirectionBeforeRound: true,
        drawThroneCard: true,
    },

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
            pos: new CVal(new Point(0.5, 0.6), "size"),
            fontSize: new CVal(0.063, "sizeUnit"),
            textBoxDims: new CVal(new Point(0.8, 0.66), "size"),
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);