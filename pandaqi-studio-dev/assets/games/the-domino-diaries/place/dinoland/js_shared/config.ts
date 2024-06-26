import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"
import { DinoType, TerrainType } from "./dict"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "dinolandConfig",
    fileName: "[Material] Dinoland",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    fonts:
    {

    },

    sets:
    {
        pawns: true,
        base: true,
        expansion: false,
    },

    // assets
    assetsBase: "/the-domino-diaries/place/dinoland/assets/",
    assets:
    {
        tinos:
        {
            path: "fonts/Tinos-Regular.woff2",
        },

        tinos_bold:
        {
            key: "tinos",
            path: "fonts/Tinos-Bold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        tinos_italic:
        {
            key: "tinos",
            path: "fonts/Tinos-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        cutedino:
        {
            path: "fonts/CuteDino.woff2",
        },
    },

    rulebook:
    {

    },

    generation:
    {
        numUniquePawns: 6,
        numPawnsPerPlayer: 3,
        
        numDominoes:
        {
            base: 40,
            expansion: 16
        },

        frequencies:
        {
            base:
            {
                fractionThatHasDinosaur: 0.6,
                terrain:
                {
                    [TerrainType.GRASS]: 0.25,
                    [TerrainType.STONE]: 0.25,
                    [TerrainType.WATER]: 0.25,
                    [TerrainType.LAVA]: 0.25
                },
                dinosaur:
                {
                    [DinoType.EGG]: 0.25,
                    [DinoType.TRI]: 0.25,
                    [DinoType.BRACHIO]: 0.25,
                    [DinoType.VELO]: 0.25
                }
            },

            expansion:
            {
                fractionThatHasDinosaur: 0.4,
                terrain:
                {
                    [TerrainType.GRASS]: 0.15,
                    [TerrainType.STONE]: 0.1,
                    [TerrainType.WATER]: 0.15,
                    [TerrainType.DESERT]: 0.6
                },
                dinosaur:
                {
                    [DinoType.EGG]: 0.1,
                    [DinoType.TRI]: 0.15,
                    [DinoType.BRACHIO]: 0.15,
                    [DinoType.STEGO]: 0.6
                }
            }
        }
    },

    dominoes:
    {
        drawerConfig:
        {
            dimsElement: new Point(1, 2),
            dims: { 
                small: new Point(6,8),
                regular: new Point(4,6),
                large: new Point(3,5)
            },  
            autoStroke: true
        },
    },

    tiles:
    {
        drawerConfig:
        {
            dimsElement: new Point(1, 1),
            dims: { 
                small: new Point(5,6),
                regular: new Point(4,5),
                large: new Point(3,4)
            },  
            autoStroke: true
        }
    }
}

export default CONFIG