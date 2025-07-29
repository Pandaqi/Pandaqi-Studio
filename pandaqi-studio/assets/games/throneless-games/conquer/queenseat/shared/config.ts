import CONFIG_SHARED from "games/throneless-games/shared/configShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";

const CONFIG:Record<string,any> = 
{
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

export default CONFIG;