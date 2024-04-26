import CONFIG_SHARED from "games/throneless-games/js_shared/configShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";

const CONFIG:Record<string,any> = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "smallseatConfig",
    fileName: "[Material] Smallseat (Throneless Games)",

    assetsBase: "/throneless-games/conquer/smallseat/assets/",
}

mergeObjects(CONFIG, CONFIG_SHARED);

export default CONFIG;