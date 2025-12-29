
import { SettingType, Vector2, MapperPreset } from "lib/pq-games"
import { boardPicker } from "../board/boardPicker"

export const CONFIG = 
{
    _game:
    {
        fileName: "Timely Transports"
    },

    // @NOTE: these are used by the GAME. They are completely overridden if generating the BOARD.
    _settings:
    {
        playerCount:
        {
            type: SettingType.NUMBER,
            min: 1,
            max: 8,
            value: 4
        },

        difficulty:
        {
            type: SettingType.ENUM,
            values: ["trainingWheels", "goodLuck", "fancyVehicles", "anotherUpgrade", "extraordinaryEvents", "crazyCargo"],
            value: "trainingWheels",
            label: "Scenario"
        },

        playerRank:
        {
            type: SettingType.ENUM,
            values: [0,1,2,3,4,5,6,7,8],
            value: 0,
            label: "Which Player Are You?",
            remark: "If used, each player must input a unique rank. (Order does not matter.) By knowing which player you are, the game can space out events and sound effects more fairly and evenly."
        },

        timeout:
        {
            type: SettingType.CHECK,
            values: [0,5,10],
            value: 0,
            label: "Add Timeouts (minutes between)",
            remark: "If some of your players find the game too stressful, include regular timeouts. This gives them some time to breathe and make new plans once in a while."
        }
    },

    _resources:
    {    
        base: "/timely-transports/assets/",
        files:
        {
            rowdies:
            {
                path: "fonts/Rowdies-Regular.woff2"
            },

            inbetween_space:
            {
                path: "inbetween_space.png"
            },

            rules_overview:
            {
                path: "rules_overview.webp"
            },

            city:
            {
                path: "city.png"
            },

            cities:
            {
                path: "cities.webp",
                frames: new Vector2(8,1)
            },

            airport:
            {
                path: "airport.png"
            },

            airplane_tile_sprite:
            {
                path: "airplane_tile_sprite.png"
            },

            seaprintfriendly:
            {
                path: "seaprintfriendly.png"
            },

            forest:
            {
                path: "forest.webp",
                frames: new Vector2(4,1)
            },

            forest_printfriendly:
            {
                path: "forest_printfriendly.webp",
                frames: new Vector2(4,1)
            },

            goods:
            {
                path: "goods.webp",
                frames: new Vector2(8,1)
            },

            searoutes:
            {
                path: "searoutes.png",
                frames: new Vector2(4,1)
            },

            searoutes_printfriendly:
            {
                path: "searoutes_printfriendly.png",
                frames: new Vector2(4,1)
            },

            landroutes:
            {
                path: "landroutes.png",
                frames: new Vector2(4,1)
            },

            railroutes:
            {
                path: "railroutes.png",
                frames: new Vector2(4,1)
            }
        },
    },

    _material:
    {
        board:
        {
            picker: boardPicker,
            mapper: MapperPreset.FULL_PAGE
        }
    }
}