
import { SettingType, MapperPreset, Vector2 } from "lib/pq-games";
import { RendererPixi } from "lib/pq-games/renderers/pixi/rendererPixi";
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