
import { CVal, MapperPreset, SettingType, Vector2 } from "lib/pq-games";
import { RendererPixi } from "lib/pq-games";
import { boardPicker } from "../board/boardPicker";

export const CONFIG = 
{
    _game:
    {
        fileName: "Starry Skylines",
        renderer: new RendererPixi()
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
        base: "/starry-skylines/assets/",
        files: 
        {
            subrayada:
            {
                path: "fonts/MontserratSubrayada-Bold.woff2"
            },

            // the nine major planets for this game
            starry_planets:
            {
                path: "starry_planets.webp",
                frames: new Vector2(9,1),
            },

            // icon for starting position
            StartingPositionIcon:
            {
                path: "StartingPositionIcon.png",
                frames: new Vector2(3,1),
            },

            // all people icons (+ animal)
            PeopleIcon:
            {
                path: "PeopleIcon.png"
            },

            CriminalIcon:
            {
                path: "CriminalIcon.png"
            },

            EducatedIcon:
            {
                path: "EducatedIcon.png"
            },

            SickIcon:
            {
                path: "SickIcon.png"
            },

            AnimalIcon:
            {
                path: "AnimalIcon.png"
            },

            // all resource lines
            OxygenIcon:
            {
                path: "OxygenIcon.png"
            },

            WaterIcon:
            {
                path: "WaterIcon.png"
            },

            ElectricityIcon:
            {
                path: "ElectricityIcon.png"
            },

            // all terrain types
            RockIcon:
            {
                path: "RockIcon.png"
            },

            RiverIcon:
            {
                path: "RiverIcon.png"
            },

            GardenIcon:
            {
                path: "GardenIcon.png"
            },

            flower_icon:
            {
                path: "flower_icon.webp"
            },
        }
    },

    _settings:
    {
        playerCount:
        {
            type: SettingType.NUMBER,
            min: 1,
            max: 3,
            value: 3
        },

        planet:
        {
            type: SettingType.ENUM,
            values: ["learnth", "uronus", "marsh", "yumpiter", "meercury", "intervenus", "pluto", "naptune"],
            value: "learnth"
        },

        manualCombo:
        {
            values: ["", "nature", "leadership", "resources", "entertainment", "chaotic"],
            label: "Play Handpicked Combination?",
            value: ""
        }
    },

    // how generation/balancing happens
    generation:
    {
        gridWidth: 8,
        gridHeight: 8,
        maxPlayerCount: 3,
        maxPlanetSetSize: 3,
        numObstacles: 6,

        spriteScale: 0.9, // how much of a cell an icon fills
        terrainTypes: ["rock", "river", "garden"]
    },

    // how to draw stuff
    _drawing:
    {
        fonts:
        {
            heading: "subrayada"
        },

        horizontalMarks: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",

        bgColors: ["#AAFFAA", "#99DD99"],
        bgColorsInkfriendly: ["#FFFFFF", "#EEEEEE"],
        playerColors: ["#FF0000", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#000000", "#AA8800"],

        people:
        {
            color: "#FA7921",
            scale: 0.4 // of a cell's icon size
        },

        buildingColors:
        {
            river: "#6EB4FF",
            rock: "#D8D8D8",
            garden: "#63FF7D"
        },

        resourceColors:
        {
            water: "#2B60AD",
            oxygen: "#29C1B1",
            electricity: "#FFFF00"
        },

        resources:
        {
            lineWidth: new CVal(0.025, "sizeUnit")
        },

        grid:
        {
            fontSize: new CVal(0.025, "sizeUnit"),
            fontColor: "#000000",
            lineWidth: new CVal(0.003, "sizeUnit"),
            lineColor: 0x666666,
            lineColorGray: 0x999999,
            textMargin: new CVal(0.0125, "sizeUnit")
        },

        path:
        {
            fontSize: new CVal(0.1, "sizeUnit"),
            fontColor: "#000000",
            strokeColor: "#AAFFAA",
            strokeColorGray: "#AAAAAA",
            strokeWidth: new CVal(0.005, "sizeUnit")
        }
    }
}