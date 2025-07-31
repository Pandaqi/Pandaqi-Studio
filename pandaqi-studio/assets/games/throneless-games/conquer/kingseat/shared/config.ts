import CONFIG_SHARED from "games/throneless-games/shared/configShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";

const CONFIG:Record<string,any> = 
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
            values: ["lionsyre", "slydefox", "woolfhall", "hornseeker", "brownbeards", "monarchrys", "crassclamps", "gulliballistas", "hardshellHero", "squlofish", "smugwing", "salsaSalamanda"],
            default: ["lionsyre", "hornseeker", "monarchrys", "gulliballistas"],
            label: "Princes"
        }
    },

    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "kingseatConfig",
    fileName: "Kingseat (Throneless Games)",

    assetsBase: "/throneless-games/conquer/kingseat/assets/",

    rulebook:
    {
        seatNaming: "Kingseat",
        leaderNaming: "King",
        endGameTrigger: "noVotes",

        swapPlacesAlsoSwapsCards: true,
    },
}

mergeObjects(CONFIG, CONFIG_SHARED);

export default CONFIG;