import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import { DinoType, TerrainType } from "./dict"

const CONFIG:any = 
{
    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "dinolandConfig",
    fileName: "[Material] Dinoland",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    addText: false,

    fonts:
    {
        heading: "cutedino",
        body: "tinos"
    },

    sets:
    {
        pawns: true,
        base: true,
        expansion: false,
        impact: false,
        asteroid: false
    },

    // assets
    assetsBase: "/the-domino-diaries/place/dinoland/assets/",
    assets:
    {
        tinos_italic:
        {
            key: "tinos",
            path: "fonts/Tinos-Italic.woff2",
        },

        cutedino:
        {
            path: "fonts/CuteDino.woff2",
            loadIf: ["sets.expansion"]
        },

        dinosaurs:
        {
            path: "dinosaurs.webp",
            frames: new Point(6,1),
            loadIf: ["sets.base", "sets.expansion"]
        },

        terrains:
        {
            path: "terrains.webp",
            frames: new Point(6,1),
            loadIf: ["sets.base", "sets.expansion"]
        },

        // @NOTE: the BASE asteroid images (regular, egghatch, crosshair) are on the MISC spritesheet
        // To prevent me from having to load this entire image when I don't need 99% of it; this is just the sprites needed for the expansion
        asteroid_tiles:
        {
            path: "asteroid_tiles.webp",
            frames: new Point(4,4),
            loadIf: ["sets.asteroid"]
        },

        impact_tiles:
        {
            path: "impact_tiles.webp",
            frames: new Point(4,4),
            loadIf: ["sets.impact"]
        },

        pawns:
        {
            path: "pawns.webp",
            frames: new Point(6,1),
            loadIf: ["sets.pawns"]
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(6,1)
        },
    },

    rulebook:
    {

    },

    generation:
    {
        numUniquePawns: 6,
        numPawnsPerPlayer: 3,
        
        numAsteroidTilesBase: 15,
        fractionEggHatcher: 0.33,

        numAsteroidTiles: 20,
        
        numDominoes:
        {
            base: 40,
            expansion: 22
        },

        frequencies:
        {
            base:
            {
                fractionThatHasDinosaur: 0.55,
                terrain:
                {
                    [TerrainType.GRASS]: 0.3,
                    [TerrainType.STONE]: 0.25,
                    [TerrainType.WATER]: 0.3,
                    [TerrainType.LAVA]: 0.15
                },
                dinosaur:
                {
                    [DinoType.EGG]: 0.24,
                    [DinoType.TRI]: 0.33,
                    [DinoType.BRACHIO]: 0.1,
                    [DinoType.VELO]: 0.33
                }
            },

            expansion:
            {
                fractionThatHasDinosaur: 0.55,
                terrain:
                {
                    [TerrainType.GRASS]: 0.125,
                    [TerrainType.STONE]: 0.1,
                    [TerrainType.WATER]: 0.1,
                    [TerrainType.LAVA]: 0.1,
                    [TerrainType.DESERT]: 0.5,
                    [TerrainType.WILDCARD]: 0.075
                },
                dinosaur:
                {
                    [DinoType.EGG]: 0.175,
                    [DinoType.TRI]: 0.15,
                    [DinoType.VELO]: 0.15,
                    [DinoType.STEGO]: 0.4,
                    [DinoType.WILDCARD]: 0.125
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
                small: new Point(8,6),
                regular: new Point(6,4),
                large: new Point(5,3)
            },  
            autoStroke: true
        },

        bgColor: "#FFEFCF",
        bgColorAsteroid: "#405E93",
        bgColorImpact: "#732058",

        dino:
        {
            dims: new CVal(new Point(0.8), "sizeUnit"),
            dimsArrow: new CVal(new Point(0.66), "sizeUnit"),
            shadowColor: "#111111",
            shadowBlur: new CVal(0.02, "sizeUnit"),

            fontSize: new CVal(0.07, "sizeUnit")
        },

        setText:
        {
            size: new CVal(0.05, "sizeUnit")
        },

        impact:
        {
            dims: new CVal(new Point(0.8), "sizeUnit"),
            fontSize: new CVal(0.12, "sizeUnit")
        },

        asteroid:
        {
            dims: new CVal(new Point(0.8), "sizeUnit"),
            fontSize: new CVal(0.12, "sizeUnit")
        }
    },
}

export default CONFIG