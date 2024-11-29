import CONFIG_NAIVIGATION_SHARED from "games/naivigation/js_shared/configShared";
import mergeObjects from "js/pq_games/tools/collections/mergeObjects";
import Point from "js/pq_games/tools/geometry/point";
import autoLoadFontCSS from "js/pq_games/website/autoLoadFontCSS";

const CONFIG:any = 
{
    debug:
    {
        filterAssets: [], // @DEBUGGING (should be empty)
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "naivigationFrighteningFlightsConfig",
    fileName: "[Material] Naivigation: Frightening Flights",

    addTextOnTiles: false,
    sets:
    {
        vehicleTiles: true,
        vehicleCards: true,
        mapTiles: true,
        fuelFalling: false,
        repairsRacing: false,
        timezonesTomorrow: false,
        birdsBumps: false,
        passengersPlanes: false
    },

    fonts:
    {
        special: "whatever"
    },

    // assets
    assetsBase: "/naivigation/visit/frightening-flights/assets/",
    assets:
    {
        misc:
        {
            path: "misc.webp",
            frames: new Point(6,1)
        },

        map_tiles:
        {
            path: "map_tiles.webp",
            frames: new Point(8,2)
        },

        icons:
        {
            path: "icons.webp",
            frames: new Point(7,1)
        },

        terrains:
        {
            loadIf: ["sets.mapTiles"]
        }
    },

    cards:
    {

    },

    tiles:
    {
        
    }
}

mergeObjects(CONFIG, CONFIG_NAIVIGATION_SHARED, false);
autoLoadFontCSS(CONFIG);

export default CONFIG