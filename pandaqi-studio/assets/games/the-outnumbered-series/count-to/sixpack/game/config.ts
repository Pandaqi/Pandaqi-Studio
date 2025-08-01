import Point from "js/pq_games/tools/geometry/point";
import { PACKS } from "./dict";
import { generateForRulebook } from "../rules/main";

export const CONFIG = 
{
    _settings:
    {
        randomizePacks:
        {
            type: SettingType.CHECK,
            label: "Randomize Packs",
            remark: "Ignores the settings below and just selects random packs."
        },

        packs:
        {
            type: SettingType.GROUP,

            blank:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                default: 3,
                label: "Blank",
                remark: "These are cards with no special ability. See the rules."
            },

            reverse:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                default: 2,
                label: "Reverse",
            },

            takeback:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                default: 1,
                label: "Takeback",
            },

            seethrough:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                default: 0,
                label: "Seethrough",
            },

            lateArrival:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                default: 0,
                label: "Late Arrival",
            },

            sheriff:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                default: 0,
                label: "Sheriff",
            },

            veto:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                default: 0,
                label: "Veto",
            },

            noSuperheroes:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                default: 0,
                label: "No Superheroes",
            },

            superNumbers:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                default: 0,
                label: "Super Numbers",
            },

            bitingHand:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                default: 0,
                label: "Biting Hand",
            },

            sticky:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                default: 0,
                label: "Sticky",
            },

            secondHand:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                default: 0,
                label: "Second Hand",
            },

            carousel:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                default: 0,
                label: "Carousel",
            },

            pileDriver:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                default: 0,
                label: "Pile Driver",
            },

            copycat:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                default: 0,
                label: "Copycat",
            },

            calculator:
            {
                type: SettingType.ENUM,
                values: [0,1,2,3,4,5,6],
                default: 0,
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

    debugWithoutPDF: false, // @DEBUGGING (should be false)
    
    itemSize: "regular",
    pageSize: "a4",
    inkFriendly: false,

    resLoader: null,
    gridMapper: null,
    pdfBuilder: null,
    progressBar: null,

    packs: {} as Record<string,number>,
    handsPerNumber: {} as Record<number,number>,

    numbers: { min: 1, max: 6 },
    numberList: [1,2,3,4,5,6],
    fileName: "[Sixpack] Material",
    numHandsPerPack: 2,

    assetsBase: "/the-outnumbered-series/count-to/sixpack/assets/",
    font: 
    {
        key: "londrina",
        url: "fonts/LondrinaSolid-Black.woff2",
        size: 0.795,
        smallSize: 0.1
    },

    cards: 
    {
        size: 
        { 
            small: new Point(5, 5),
            regular: new Point(4, 4),
            large: new Point(3, 3)
        },
        sizeElement: new Point(1, 1.55),
        sizeResult: new Point(),
        
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