import CONFIG_SHARED from "games/throneless-games/js_shared/configShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";

const CONFIG:Record<string,any> = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "smallseatConfig",
    fileName: "[Material] Smallseat (Throneless Games)",

    assetsBase: "/throneless-games/conquer/smallseat/assets/",

    rulebook:
    {
        seatNaming: "Smallseat",
        leaderNaming: "Boss",
        endGameTrigger: "lastVotesExceptTeller",

        numVotesMeansDone: 1,
        tellerIsPerson: true,
        tellerGoesFirst: true,
        mustFollowTellerType: true, // @TODO: code this
        tellerTypeDisobeyProb: 0.25,
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);

export default CONFIG;