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

    configKey: "kingseatConfig",
    fileName: "[Material] Kingseat (Throneless Games)",

    assetsBase: "/throneless-games/conquer/kingseat/assets/",

    rulebook:
    {
        seatNaming: "Kingseat",
        leaderNaming: "King",
        endGameTrigger: "noVotes",

        swapPlacesAlsoSwapsCards: true,
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);

export default CONFIG;