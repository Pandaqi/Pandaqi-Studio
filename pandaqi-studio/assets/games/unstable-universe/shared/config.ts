
import { CVal, SettingType, MapperPreset, Vector2 } from "lib/pq-games";
import { RendererPixi } from "lib/pq-games";
import { boardPicker } from "../board/boardPicker";

export const CONFIG =
{
    _game:
    {
        fileName: "Unstable Universe",
        renderer: new RendererPixi()
    },

    _settings:
    {
        playerCount:
        {
            type: SettingType.NUMBER,
            min: 2,
            max: 9,
            value: 4
        },

        firstGame:
        {
            type: SettingType.CHECK,
            value: true,
            label: "First Game(s)?",
            remark: "Everyone gets the same Mission, to simplify learning and teaching the game."
        },

        expansions:
        {
            type: SettingType.GROUP,

            nastyNodes:
            {
                type: SettingType.CHECK,
                label: "Nasty Nodes",
                value: false
            },

            theElectricExpansion:
            {
                type: SettingType.CHECK,
                label: "The Electric Expansion",
                value: false
            },

            extremeExpeditions:
            {
                type: SettingType.CHECK,
                label: "Extreme Expeditions",
                value: false
            },

            sharpScissors:
            {
                type: SettingType.CHECK,
                label: "Sharp Scissors",
                value: false
            },
        }
    },

    // how generation/balancing happens
    generation:
    {
        baseGrid: new Vector2(10,7), // number of points across the width/height of the paper
        resolutionAspect: (210/297.0), // the paper's aspect ratio, keeps points square on the page
        extraResolutionPerPlayer: { 2: 0, 3: 0, 4: 0, 5: 1, 6: 1, 7: 2, 8: 2, 9: 3 },

        maxIterations: 60, // relaxing the point positions
        nodeSettingScaleDivisor: 15, // extra nodes on the board, divided by this, become the scale factor for node counts

        minPowerDotsBase: 1,
        maxPowerDotsBase: 2
    },

    // how to draw stuff
    _drawing:
    {
        fonts:
        {
            heading: "scifly"
        },

        nodes:
        {
            radius: 0.3 // ratio of a cell's size
        },

        naturalResources:
        {
            radiusRatio: 0.3, // of a node's radius
            alpha: 0.66
        },

        powerDotRadius: new CVal(12/1160, "sizeX"),
        lineWidth: new CVal(2/1160, "sizeX"),
        seedTextOffset: new CVal(32/1160, "sizeX"),
        fontSize: new CVal(24/1160, "sizeX")
    },

    _material:
    {
        board:
        {
            picker: () => boardPicker,
            mapper: MapperPreset.FULL_PAGE
        }
    },

    _resources:
    {    
        base: "/unstable-universe/assets/",
        files:
        {
            scifly:
            {
                path: "fonts/scifly.woff2"
            },

            fault_line:
            {
                path: "fault_line.png"
            },

            node_outlines:
            {
                path: "node_outlines.png",
                frames: new Vector2(10,1)
            },

            mission_nodes:
            {
                path: "mission_nodes.png",
                frames: new Vector2(10,1)
            },

            regular_nodes:
            {
                path: "regular_nodes.png",
                frames: new Vector2(10,4)
            },

            expedition_nodes:
            {
                path: "expedition_nodes.png",
                frames: new Vector2(8,1)
            },

            tiny_nodes:
            {
                path: "tiny_nodes.png",
                frames: new Vector2(5,1)
            },

            natural_resources:
            {
                path: "natural_resources.png",
                frames: new Vector2(5,1)
            },

            landmarks:
            {
                path: "landmarks.png",
                frames: new Vector2(5,1)
            },

            daynight_icons:
            {
                path: "daynight_icons.png",
                frames: new Vector2(2,1)
            }
        }
    }
}