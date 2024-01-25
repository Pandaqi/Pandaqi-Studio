import CONFIG_NAIVIGATION_SHARED from "games/naivigation/js_shared/configShared"
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "naivigationSwervingSpaceshipsConfig",
    fileName: "[Material] Naivigation: Swerving Spaceships",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    includeVehicleCards: true,
    includeMapTiles: true,
    includeVehicleTiles: true,

    expansions:
    {
        shields: false,
        weapons: false,
        trade: false,
    },

    fonts:
    {
        special: "whatever"
    },

    // assets
    assetsBase: "/naivigation/visit/swerving-spaceships/assets/",
    assets:
    {
        /*
        misc:
        {
            path: "misc.webp",
            frames: new Point(4,1)
        },
        */
    },

    cards:
    {
        generation:
        {
            numSteerCards: 20
        }
    },

    tiles:
    {

    }
}

mergeObjects(CONFIG, CONFIG_NAIVIGATION_SHARED);

export default CONFIG