import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import { DinoType, TerrainType } from "./dict"
import { GridSizePreset } from "js/pq_games/tools/generation/materialGenerator"
import TextConfig, { TextStyle } from "js/pq_games/layout/text/textConfig"
import { dominoPicker } from "../game/dominoPicker"

export const CONFIG:any = 
{
    _settings:
    {
        addText:
        {
            type: SettingType.CHECK,
            label: "Add Text On Tiles",
            value: false,
            remark: "Adds the explanation of each dinosaur's action on the dinosaur itself."
        },

        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                value: true,
                label: "Base Game"
            },

            pawns:
            {
                type: SettingType.CHECK,
                value: true,
                label: "Pawns"
            },

            expansion:
            {
                type: SettingType.CHECK,
                label: "Expansion",
                value: false,
                remark: "A general expansion with more terrains and dinosaurs."
            },

            impact:
            {
                type: SettingType.CHECK,
                label: "Impact Tiles",
                value: false,
                remark: "Adds tiles that randomize how the asteroid impact works for your game."
            },

            asteroid:
            {
                type: SettingType.CHECK,
                label: "Special Asteroids",
                value: false,
                remark: "Adds special Asteroid Tiles for random events and actions."
            },
        }
    },

    _debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    _game:
    {
        fileName: "Dinoland",
    },

    // assets
    assetsBase: "/the-domino-diaries/place/dinoland/assets/",
    assets:
    {
        tinos:
        {
            path: "fonts/Tinos-Regular.woff2",
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

    _material:
    {
        dominoes:
        {
            picker: dominoPicker,
            mapper: MapperPreset.DOMINO
        }
    },

    _drawing:
    {
        fonts:
        {
            heading: "cutedino",
            body: "tinos"
        },

        dominoes:
        {
            bgColor: "#FFEFCF",
            bgColorAsteroid: "#405E93",
            bgColorImpact: "#732058",

            dino:
            {
                size: new CVal(new Point(0.8), "sizeUnit"),
                sizeArrow: new CVal(new Point(0.66), "sizeUnit"),
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
                size: new CVal(new Point(0.8), "sizeUnit"),
                fontSize: new CVal(0.12, "sizeUnit")
            },

            asteroid:
            {
                size: new CVal(new Point(0.8), "sizeUnit"),
                fontSize: new CVal(0.12, "sizeUnit")
            }
        },
    }
}