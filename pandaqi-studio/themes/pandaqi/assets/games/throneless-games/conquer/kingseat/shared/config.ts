import { CONFIG_SHARED } from "games/throneless-games/shared/configShared";
import { cardPicker } from "../game/cardPicker";
import { SettingType, mergeObjects } from "lib/pq-games";

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
            values: ["lionsyre", "slydefox", "woolfhall", "hornseeker", "brownbeards", "monarchrys", "crassclamps", "gulliballistas", "hardshellHero", "squlofish", "smugwing", "salsaSalamanda"],
            value: ["lionsyre", "hornseeker", "monarchrys", "gulliballistas"],
            label: "Princes"
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
        fileName: "Kingseat",
    },

    _material:
    {
        cards:
        {
            picker: cardPicker
        }
    },

    _resources:
    {
        base: "/throneless-games/conquer/kingseat/assets/"
    },

    rulebook:
    {
        seatNaming: "Kingseat",
        leaderNaming: "King",
        endGameTrigger: "noVotes",

        swapPlacesAlsoSwapsCards: true,
    },
}

mergeObjects(CONFIG, CONFIG_SHARED);