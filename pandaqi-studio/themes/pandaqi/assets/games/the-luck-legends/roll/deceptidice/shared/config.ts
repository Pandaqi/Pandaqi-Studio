
import { SUITS } from "./dict"
import { cardPicker } from "../game/cardPicker"
import { SettingType, TextConfig, TextStyle, TextWeight, Vector2, Bounds, MapperPreset, CVal } from "lib/pq-games"

export const CONFIG = 
{
    _settings:
    {
        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                value: true,
                label: "Base Game"
            },

            wildCards:
            {
                type: SettingType.CHECK,
                label: "Wildcards",
                value: false,
                remark: "A tiny expansion that adds wildcards (that can be anything you want)."
            },

            powerCards:
            {
                type: SettingType.CHECK,
                label: "Power Cards",
                value: false,
                remark: "An expansion that adds special powers, for more bluffing and wild reveals."
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
        fileName: "Deceptidice",
    },

    // assets
    _resources:
    {    
        base: "/the-luck-legends/roll/deceptidice/assets/",
        files:
        {
            caslon:
            {
                path: "fonts/CaslonAntique-Regular.woff2",
                loadIf: ["sets.powerCards"]
            },

            caslon_italic:
            {
                key: "caslon",
                path: "fonts/CaslonAntique-Italic.woff2",
                textConfig: new TextConfig({ style: TextStyle.ITALIC }),
                loadIf: ["sets.powerCards"]
            },

            caslon_bold:
            {
                key: "caslon",
                path: "fonts/CaslonAntique-Bold.woff2",
                textConfig: new TextConfig({ weight: TextWeight.BOLD }),
                loadIf: ["sets.powerCards"]
            },

            brasspounder:
            {
                path: "fonts/Brasspounder.woff2", // @IMPROV: or use SC variant?
            },

            card_templates:
            {
                path: "card_templates.webp",
                frames: new Vector2(3,1)
            },

            bids:
            {
                path: "bids.webp",
                frames: new Vector2(4,3),
                loadIf: ["sets.powerCards"]
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(4,2)
            },
        },
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(2,5),
        numCardsPerPlayer: 9,
        itemSize: new Vector2(375, 525),

        numDicePerPlayer:
        {
            2: 4,
            3: 4,
            4: 3,
            5: 3,
            6: 3,
        },

        keepGuessingProb: 0.66,
        minTurnsBeforeChallenge: 2,
        maxTurnsBeforeChallenge: 10,

        cardsLeftForLoss: 3, // if you have this many cards left (or fewer), you lose the game
    },

    generation:
    {
        numSuits: Object.keys(SUITS).length,
        baseCardsPerSuit: new Bounds(1,6),
        baseCopiesPerSuit: 2,
        wildCardsNum: 7,
    },

    _material:
    {
        cards:
        {
            itemSize: new Vector2(375, 525), // for rulebook
            picker: () => cardPicker,
            mapper: MapperPreset.CARD
        }
    },

    _drawing:
    {
        fonts:
        {
            heading: "brasspounder",
            body: "caslon"
        },

        cards:
        {
            drawerConfig:
            {
                autoStroke: true,
                sizeElement: new Vector2(1, 1.4),
                size: 
                { 
                    small: new Vector2(4,4),
                    regular: new Vector2(3,3),
                    large: new Vector2(2,2)
                }, 
            },

            bg:
            {
                outlineAlpha: 0.4,
            },

            wildcard:
            {
                tint: "#787878",
                drawAllSuits: true,
            },

            numbers:
            {
                offset: new CVal(new Vector2(0.13, 0.14), "sizeUnit"),
                boxDims: new CVal(new Vector2(0.2), "sizeUnit"),
                suitDims: new CVal(new Vector2(0.15), "sizeUnit"),
                fontSize: new CVal(0.15, "sizeUnit")
            },

            mainNumber:
            {
                circleDims: new CVal(new Vector2(0.5), "sizeUnit"), // this is only the inner circle, not the numbers
                circleRadius: new CVal(0.341, "sizeUnit"), // this is the numbers
                fontSize: new CVal(0.275, "sizeUnit"),
                shadowOffset: new CVal(new Vector2(0, 0.033), "cards.mainNumber.fontSize")
            },

            bids:
            {
                bgColor: "#787878",
                tintColor: "#ffffff",

                headingOffset: new CVal(new Vector2(0.575, 0.1), "size"),
                fontSizeHeading: new CVal(0.1, "sizeUnit"),
                headingDims: new CVal(new Vector2(1.0, 0.1), "size"),
                iconPos: new CVal(new Vector2(0.5, 0.375), "size"),
                iconDims: new CVal(new Vector2(0.475), "sizeUnit"),
                fontSize: new CVal(0.0785, "sizeUnit"),
                textPos: new CVal(new Vector2(0.5, 0.7), "size"),
                textDims: new CVal(new Vector2(0.8, 0.4), "size")
            },

            overlay:
            {
                alpha: 0.2
            }
        },
    },
}