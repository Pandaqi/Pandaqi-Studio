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
            values: ["karateChicks", "pricklypettes", "sleepersippies", "chewyCarrots", "treeOfHainut", "curlysnouts", "tinybears", "purplepaws", "ottermother", "sealalater", "snufflesniff", "ponytailors"],
            default: ["karateChicks", "chewyCarrots", "curlysnouts", "purplepaws"],
            label: "Animals"
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
        fileName: "Smallseat",
    },

    assetsBase: "/throneless-games/conquer/smallseat/assets/",

    rulebook:
    {
        seatNaming: "Smallseat",
        leaderNaming: "Boss",
        endGameTrigger: "lastVotesExceptTeller",

        numVotesMeansDone: 1,
        tellerIsPerson: true,
        tellerGoesFirst: true,
        mustFollowTellerType: true,
        tellerTypeDisobeyProb: 0.25,
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);