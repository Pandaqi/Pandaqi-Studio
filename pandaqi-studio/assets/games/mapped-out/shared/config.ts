import Point from "js/pq_games/tools/geometry/point"
import { CardMovement, TileAction } from "./dict"
import CVal from "js/pq_games/tools/generation/cval"
import Bounds from "js/pq_games/tools/numbers/bounds"
import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"

import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator"

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
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

        sourceserif_italic:
        {
            key: "sourceserif",
            path: "fonts/SourceSerif418pt-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        sourceserif_italic_bold:
        {
            key: "sourceserif",
            path: "fonts/SourceSerif418pt-BlackItalic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC, weight: TextWeight.BOLD })
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
        movementCardNumBase: 40, 
        movementCardDistBase:
        {
            [CardMovement.LEFT]: 0.2,
            [CardMovement.RIGHT]: 0.2,
            [CardMovement.UP]: 0.2,
            [CardMovement.DOWN]: 0.2,
            [CardMovement.ANY]: 0.1,
            [CardMovement.NOTHING]: 0.1,
        },

        movementCardNumUnclear: 23, 
        movementCardDistUnclear:
        {
            [CardMovement.LEFT]: 0.1,
            [CardMovement.RIGHT]: 0.1,
            [CardMovement.UP]: 0.1,
            [CardMovement.DOWN]: 0.1,
            [CardMovement.ANY]: 0.2,
            [CardMovement.TELEPORT]: 0.1,
            [CardMovement.MATCH]: 0.1,
            [CardMovement.COPY]: 0.1,
            [CardMovement.INVERT]: 0.1,
        },

        mapTilesNumBase: 42,
        mapTilesDistBase:
        {
            regular: 1.0
        },

        mapTilesNumLands: 18,
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
            preset: GridSizePreset.CARD
        },

        sonar:
        {
            templatePos: new CVal(new Point(0.5, 0.35), "size"),
            templateDims: new CVal(new Point(0.725), "sizeUnit"),
            pos: new CVal(new Point(0.5, 0.35), "size"), // equal or close to templatePos
            size: new CVal(new Point(0.725), "sizeUnit"), // equal or close to templateDims
        },

        heading:
        {
            pos: new CVal(new Point(0.5, 0.695), "size"),
            fontSize: new CVal(0.1, "sizeUnit"),
        },

        icons:
        {
            offset: new CVal(new Point(0.08, 0), "sizeUnit"),
            size: new CVal(new Point(0.1), "sizeUnit")
        },

        headingAction:
        {
            offset: new CVal(new Point(0, 0.055), "size"),
            fontSize: new CVal(0.055, "sizeUnit")
        },

        matchAction:
        {
            pos: new CVal(new Point(0.755, 0.35), "size"),
            size: new CVal(new Point(0.165), "sizeUnit")
        },

        text:
        {
            fontSize: new CVal(0.065, "sizeUnit"),
            pos: new CVal(new Point(0.5, 0.83), "size"),
            size: new CVal(new Point(0.8, 0.3), "size")
        }
    },

    tiles:
    {
        drawerConfig:
        {
            preset: GridSizePreset.TILE
        }, 

        fishes:
        {
            angleSubdivisions: 8,
            size: new CVal(new Point(0.25), "sizeUnit"),
            sizeSpecial: new CVal(new Point(0.15), "sizeUnit"),
            radiusBounds: new Bounds(0.25, 0.35),
            radiusBoundsSpecial: new Bounds(0.325, 0.425)
        },

        actions:
        {
            fontSize: new CVal(0.07, "sizeUnit"),
            boxDims: new CVal(new Point(0.36), "sizeUnit"),
            iconDims: new CVal(new Point(0.135), "sizeUnit"),
            textStrokeWidth: new CVal(0.075, "tiles.actions.fontSize"),

            offset: new CVal(new Point(0.2), "sizeUnit"),
            offsetIcons: new CVal(new Point(0.11), "sizeUnit")
        },

        heading:
        {
            fontSize: new CVal(0.08, "sizeUnit"),
            offsetRegular: new CVal(new Point(0, 0.0475), "sizeUnit"),
            offsetSpecial: new CVal(new Point(0, 0.225), "sizeUnit"),
        },

        text:
        {
            fontSize: new CVal(0.055, "sizeUnit"),
            pos: new CVal(new Point(0.5), "size"),
            size: new CVal(new Point(0.45, 0.35), "size")
        }
    }
}


export default CONFIG