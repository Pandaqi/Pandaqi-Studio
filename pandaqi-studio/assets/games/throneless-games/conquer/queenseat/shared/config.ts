import { CONFIG_SHARED } from "games/throneless-games/shared/configShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";

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
            values: ["stingersHive", "gallopingSun", "trunktrumpets", "featherdancer", "whistleyWine", "edibusEggsnatcher", "fearedFlame", "eyrieFeyle", "chatteredFins", "galaksea", "venomfruit", "colorcoats"],
            default: ["stingersHive", "featherdancer", "edibusEggsnatcher", "eyrieFeyle"],
            label: "Princesses"
        }
    },

    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "queenseatConfig",
    fileName: "Queenseat (Throneless Games)",

    assetsBase: "/throneless-games/conquer/queenseat/assets/",

    rulebook:
    {
        seatNaming: "Queenseat",
        leaderNaming: "Queen",
        endGameTrigger: "noVotes",

        tellerIsLeader: true,
        discardGoesToPlayer: true,
        cantVoteMajorityPublic: true,
        cantVoteMajorityNeighborsOnly: true, // only looks at neighbor public cards when deciding what you can't play

        leaderSwapHasRestrictions: true,
        winnersGiveAwayCards: true,
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);