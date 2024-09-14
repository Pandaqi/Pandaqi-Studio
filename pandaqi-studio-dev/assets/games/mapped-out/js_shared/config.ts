import Point from "js/pq_games/tools/geometry/point"
import { CardMovement, TileAction } from "./dict"
import CVal from "js/pq_games/tools/generation/cval"
import Bounds from "js/pq_games/tools/numbers/bounds"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "mappedOutConfig",
    fileName: "[Material] Mapped Out",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    pageSize: "a4",

    fonts:
    {
        heading: "vanillawhale",
        body: "sourceserif",
    },

    sets:
    {
        base: true,
        landsUnknown: false,
        unclearInstructions: false,
    },

    // assets
    assetsBase: "/mapped-out/assets/",
    assets:
    {
        sourceserif:
        {
            path: "fonts/SourceSerif418pt-Regular.woff2",
        },

        vanillawhale:
        {
            path: "fonts/VanillaWhale-Regular.woff2",
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(2,1)
        },

        tile_templates:
        {
            path: "tile_templates.webp",
            frames: new Point(2,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,4)
        },

        movements:
        {
            path: "movements.webp",
            frames: new Point(4,5)
        },

    },

    rulebook:
    {
        
    },

    generation:
    {
        movementCardNumBase: 60, 
        movementCardDistBase:
        {
            [CardMovement.LEFT]: 0.2,
            [CardMovement.RIGHT]: 0.2,
            [CardMovement.UP]: 0.2,
            [CardMovement.DOWN]: 0.2,
            [CardMovement.ANY]: 0.1,
            [CardMovement.NOTHING]: 0.1,
        },

        movementCardNumUnclear: 20, 
        movementCardDistUnclear:
        {
            [CardMovement.TELEPORT]: 0.25,
            [CardMovement.MATCH]: 0.45,
            [CardMovement.COPY]: 0.2,
            [CardMovement.INVERT]: 0.1,
        },

        mapTilesNumBase: 50,
        mapTilesDistBase:
        {
            regular: 1.0
        },

        mapTilesNumLands: 20,
        mapTilesDistLands:
        {
            island: 0.3,
            tunnel: 0.1,
            return: 0.05,
            remove: 0.05,
            swap: 0.1,
            score: 0.1,
            plugholes: 0.05,
            pawnmove: 0.05,
            superscore: 0.1,
            combo: 0.1
        },

        numFishDist:
        {
            1: 0.25,
            2: 0.5,
            3: 0.25
        },

        mapTileActionDist:
        {
            [TileAction.REVEAL]: 0.5,
            [TileAction.SWAP]: 0.35,
            [TileAction.STUDY]: 0.15,
        }
    },

    cards:
    {
        drawerConfig:
        {
            autoStroke: true,
            dimsElement: new Point(1, 1.4),
            dims: 
            { 
                small: new Point(4,4),
                regular: new Point(3,3),
                large: new Point(2,2)
            }, 
        },

        sonar:
        {
            templatePos: new CVal(new Point(0.5, 0.35), "size"),
            templateDims: new CVal(new Point(0.75), "sizeUnit"),
            pos: new CVal(new Point(0.5, 0.35), "size"), // equal or close to templatePos
            dims: new CVal(new Point(0.75), "sizeUnit"), // equal or close to templateDims
        },

        heading:
        {
            pos: new CVal(new Point(0.5, 0.66), "size"),
            fontSize: new CVal(0.15, "sizeUnit"),
        },

        icons:
        {
            offset: new CVal(new Point(0.4, 0), "sizeUnit"),
            dims: new CVal(new Point(0.1), "sizeUnit")
        },

        headingAction:
        {
            offset: new CVal(new Point(0, 0.1), "size"),
            fontSize: new CVal(0.08, "sizeUnit")
        },

        matchAction:
        {
            pos: new CVal(new Point(0.75, 0.4), "size"),
            dims: new CVal(new Point(0.25), "sizeUnit")
        },

        text:
        {
            fontSize: new CVal(0.07, "sizeUnit"),
            pos: new CVal(new Point(0.5, 0.75), "size"),
            dims: new CVal(new Point(0.8, 0.3), "size")
        }
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

        fishes:
        {
            angleSubdivisions: 8,
            dims: new CVal(new Point(0.2), "sizeUnit"),
            radiusBounds: new Bounds(0.4, 0.6),
        },

        actions:
        {
            fontSize: new CVal(0.1, "sizeUnit"),
            boxDims: new CVal(new Point(0.3), "sizeUnit"),
            iconDims: new CVal(new Point(0.15), "sizeUnit"),
            textStrokeWidth: new CVal(0.075, "tiles.actions.fontSize")
        },

        heading:
        {
            fontSize: new CVal(0.15, "sizeUnit"),
            offsetRegular: new CVal(new Point(0, 0.075), "sizeUnit"),
            offsetSpecial: new CVal(new Point(0, 0.3), "sizeUnit"),
        },

        text:
        {
            fontSize: new CVal(0.07, "sizeUnit"),
            pos: new CVal(new Point(0.5), "size"),
            dims: new CVal(new Point(0.8, 0.35), "size")
        }
    }
}

export default CONFIG