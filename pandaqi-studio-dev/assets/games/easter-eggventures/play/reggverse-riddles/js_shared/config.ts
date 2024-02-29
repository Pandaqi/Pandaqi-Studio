import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig";
import CVal from "js/pq_games/tools/generation/cval";
import Point from "js/pq_games/tools/geometry/point";
import Bounds from "js/pq_games/tools/numbers/bounds";

export default
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "reggverseRiddlesConfig",
    fileName: "[Material] Reggverse Riddles",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    sets:
    {
        base: true,
        actionTiles: false,
        secretObjectives: false
    },

    fonts:
    {
        heading: "gargle",
        body: "gargle"
    },

    // assets
    assetsBase: "/easter-eggventures/play/reggverse-riddles/assets/",
    assets:
    {
        gargle:
        {
            key: "gargle",
            path: "/easter-eggventures/assets/fonts/GargleRg-Regular.woff2",
            useAbsolutePath: true
        },

        gargle_bold:
        {
            key: "gargle",
            path: "/easter-eggventures/assets/fonts/GargleRg-Bold.woff2",
            useAbsolutePath: true,
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },
        
        eggs:
        {
            path: "eggs.webp",
            frames: new Point(8,1)
        },

        eggs_backgrounds:
        {
            path: "eggs_backgrounds.webp",
            frames: new Point(8,1)
        },

        pawns:
        {
            path: "pawns.webp",
            frames: new Point(8,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
        },

        special_eggs:
        {
            path: "special_eggs.webp",
            frames: new Point(8,1)
        },

        obstacles:
        {
            path: "obstacles.webp",
            frames: new Point(10,2)
        },
    },

    generation:
    {
        maxNumPlayers: 6,
        maxNumEggs: 6,
        numRuleTiles: 45,
        defaultFrequencies:
        {
            eggToken: 10,
            mapTile: 5,
            actionTile: 2,
            secretObjective: 1
        },
        movementInstructions:
        {
            gridDims: new Point(5, 3),
            numValid: new Bounds(1, 4)
        }
    },

    eggs:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1),
            dims: 
            { 
                small: new Point(8,12),
                regular: new Point(6,10),
                large: new Point(4,6)
            },
        },
    },
    
    tiles:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1),
            dims: 
            { 
                small: new Point(5,7),
                regular: new Point(3,5),
                large: new Point(2,3)
            },
        }, 

    }
}