import Point from "js/pq_games/tools/geometry/point";
import { PACKS } from "./dict";
import { generateForRulebook } from "../rules/main";
import { cardPicker } from "../game/cardPicker";

export const CONFIG = 
{
    _game:
    {
        fileName: "Sixpack",
    },

    _debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    _settings:
    {
        randomizePacks:
        {
            type: SettingType.CHECK,
            label: "Randomize Packs",
            value: false,
            remark: "Ignores the settings below and just selects random packs."
        },

        packs:
        {
            type: SettingType.GROUP,

            blank:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                value: 3,
                label: "Blank",
                remark: "These are cards with no special ability. See the rules."
            },

            reverse:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                value: 2,
                label: "Reverse",
            },

            takeback:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                value: 1,
                label: "Takeback",
            },

            seethrough:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                value: 0,
                label: "Seethrough",
            },

            lateArrival:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                value: 0,
                label: "Late Arrival",
            },

            sheriff:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                value: 0,
                label: "Sheriff",
            },

            veto:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                value: 0,
                label: "Veto",
            },

            noSuperheroes:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                value: 0,
                label: "No Superheroes",
            },

            superNumbers:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                value: 0,
                label: "Super Numbers",
            },

            bitingHand:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                value: 0,
                label: "Biting Hand",
            },

            sticky:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                value: 0,
                label: "Sticky",
            },

            secondHand:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                value: 0,
                label: "Second Hand",
            },

            carousel:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                value: 0,
                label: "Carousel",
            },

            pileDriver:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                value: 0,
                label: "Pile Driver",
            },

            copycat:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                value: 0,
                label: "Copycat",
            },

            calculator:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                value: 0,
                label: "Calculator",
            },
        }
    },

    _rulebook:
    {
        examples:
        {
            "turn":
            {
                buttonText: "Give me an example turn!",
                callback: generateForRulebook,
            },

            "turn-reverse":
            {
                buttonText: "Give me an example turn!",
                callback: (sim) => { generateForRulebook(sim, true) },
            },
        },

        icons:
        {
            packs:
            {
                config:
                {
                    sheetURL: "card_types.webp",
                    sheetWidth: 8,
                    base: "/the-outnumbered-series/count-to/sixpack/assets/",
                },
                icons: PACKS
            },
        }
    },

    numbers: { min: 1, max: 6 },
    numberList: [1,2,3,4,5,6],
    numHandsPerPack: 2,

    assetsBase: "/the-outnumbered-series/count-to/sixpack/assets/",
    assets:
    {
        londrina:
        {
            path: "fonts/LondrinaSolid-Black.woff2"
        },

        card_backgrounds:
        {
            path: "card_backgrounds.webp", 
            frames: new Point(8,2)
        },

        card_types:
        {
            path: "card_types.webp", 
            frames: new Point(8,2)
        },

        hand_icon:
        {
            path: "hand_icon.webp"
        }
    },

    _material:
    {
        cards: 
        {
            picker: cardPicker,
            mapper:
            {
                size: 
                { 
                    small: new Point(5, 5),
                    regular: new Point(4, 4),
                    large: new Point(3, 3)
                },
                sizeElement: new Point(1, 1.55),            
            }
        }
    },

    _drawing:
    {
        fonts: 
        {
            body: "londrina",
            heading: "londrina",
            size: 0.795,
            smallSize: 0.1
        },

        cards: 
        {
            bgScale: 0.975,
            mainNumber: 
            {
                bgOffset: 0.032,
                color: "#111111",
                offsetColor: "#88847E",
                strokeColor: "#FEFEFE",
                strokeWidth: 0.01
            },

            edgeNumber: 
            {
                pos: new Point(0.1, 0.1),
                bgOffset: 0.015,
                strokeWidth: 0.005,
                offsetColor: ""
            },

            hand: 
            {
                composite: "luminosity",
                pos: new Point(0.5, 0.135),
                size: 0.4
            },

            type: 
            {
                composite: "luminosity",
                pos: new Point(0.5, 0.835),
                size: 0.33
            },
            
            outlineColor: "#111111",
            outlineWidth: 0.05,

        }
    }
}