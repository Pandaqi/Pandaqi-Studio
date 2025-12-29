import { SettingType, TextConfig, TextWeight, TextStyle, Vector2, Bounds, CVal } from "lib/pq-games"
import { cardPicker } from "../game/cardPicker"

export const CONFIG = 
{
    _settings:
    {
        generatePlayingCards:
        {
            type: SettingType.CHECK,
            value: true,
            remark: "If turned off, you can use your own standard card deck to play the game."
        },

        generateContracts:
        {
            type: SettingType.CHECK,
            value: true,
            remark: "Required to play the game."
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

            fullFlood:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Full Flood"
            },

            straightShake:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Straight Shake"
            }
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
        fileName: "Noble Flood",
    },

    // assets
    _resources:
    {    
        base: "/chiptales/bet/noble-flood/assets/",
        files:
        {
            cardo:
            {
                path: "fonts/Cardo-Regular.woff2",
            },

            cardo_bold:
            {
                key: "cardo",
                path: "fonts/Cardo-Bold.woff2",
                textConfig: new TextConfig({ weight: TextWeight.BOLD })
            },

            cardo_italic:
            {
                key: "cardo",
                path: "fonts/Cardo-Italic.woff2",
                textConfig: new TextConfig({ style: TextStyle.ITALIC })
            },

            /*rechtman:
            {
                path: "fonts/RechtmanPlain.woff2",
            },*/

            romespalace:
            {
                path: "fonts/ROMESPALACE3.woff2",
            },

            suits:
            {
                path: "suits.webp",
                frames: new Vector2(4,1)
            },

            custom_illustrations:
            {
                path: "custom_illustrations.webp",
                frames: new Vector2(8,2)
            },

            card_templates:
            {
                path: "card_templates.webp",
                frames: new Vector2(3,1)
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(12,1)
            },
        },
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(3,4), // for SIMULATION it's probably better to do = new Bounds(3,6),
        startingRowSize: 3,
        boardCanvasSize: new Vector2(1440, 1000),
        numCardsPerPlayer: 3,
        surplusContractCardsMultiplier: 2,

        maxMapSize: new Vector2(5,5),
        drawContractProb: 0.8,

        lengthOfFlushes: 5,
        lengthOfRoyalFlush: 3,
        lengthOfStraights: 5,
        lengthOfHardStraights: 4,
        lengthOfAdjacentStraightFlushes: 3,

        validMoves:
        {
            ifAnySuitMatch: false,
            ifAllSuitsMatch: true,
            ifDistToNumberAtMost: 0,
            allowPickingWildcard: true,
        }
    },

    generation:
    {
        numSuits: 4,
        numbersUsedPerSuit: 10, //NUMBERS.length,
        defaultFrequencyContracts:
        {
            base: 1,
            straightShake: 1
        }
    },

    _material:
    {
        cards:
        {
            itemSize: new Vector2(750, 1050),
            picker: cardPicker,
            mapper: 
            {
                autoStroke: true,
                sizeElement: new Vector2(1, 1.4),
                size: { 
                    small: new Vector2(4,4),
                    regular: new Vector2(3,3),
                    large: new Vector2(2,2)
                },  
            },
        }
    },

    _drawing:
    {
        fonts:
        {
            heading: "romespalace",
            body: "cardo",
        },

        cards:
        {
            shared:
            {
                bannerDims: new CVal(new Vector2(0.475), "sizeUnit"),
                bannerFontSize: new CVal(0.065, "sizeUnit"),
            },

            suitNumber:
            {
                offsetFromEdge: new CVal(new Vector2(0.085, 0.0925), "sizeUnit"),
                fontSize: new CVal(0.125, "sizeUnit"),
                iconDims: new CVal(new Vector2(0.125), "sizeUnit"),

                iconDimsCenter: new CVal(new Vector2(0.25), "sizeUnit"),
                iconDimsCenterSingle: new CVal(new Vector2(0.66), "sizeUnit"),
                iconArrangeScalar: new CVal(new Vector2(0.185,0.275), "size"),

                iconShadow:
                {
                    enabled: false,
                    offset: new CVal(new Vector2(0, 0.025), "sizeUnit"),
                    color: "#00000099",
                    blur: new CVal(0.005, "sizeUnit")
                },
            },

            action:
            {
                textBoxPos: new CVal(new Vector2(0.5), "size"),
                textBoxDims: new CVal(new Vector2(0.8, 0.375), "size"),
                fontSize: new CVal(0.0745, "sizeUnit")
            },

            contract:
            {
                rectBlur: new CVal(0.01, "sizeUnit"),
                rectAlpha: 0.75,
                fontSize: new CVal(0.071, "sizeUnit"),
                textBoxPos: new CVal(new Vector2(0.5, 0.8), "size"),
                textBoxDims: new CVal(new Vector2(0.9, 0.3), "size"),
                textBoxPosAlt: new CVal(new Vector2(0.5, 0.66), "size"),
                textBoxDimsAlt: new CVal(new Vector2(0.9, 0.25), "size"),

                illustration:
                {
                    pos: new CVal(new Vector2(0.5, 0.38), "size"),
                    size: new CVal(new Vector2(0.875), "sizeUnit"),
                },

                rule:
                {
                    scaleFactor: 0.675,
                    textBoxPos: new CVal(new Vector2(0.5, 0.885), "size"),
                    textBoxDims: new CVal(new Vector2(0.875, 0.15), "size")
                },

                score:
                {
                    offset: new CVal(new Vector2(0.165, 0.18), "sizeUnit"),
                    fontSize: new CVal(0.125, "sizeUnit"),
                    textColor:
                    {
                        good: "#F4FFDB",
                        bad: "#FCBFBF"
                    }
                }
            },

            contractDraw:
            {
                itemSize: new Vector2(1024),
                itemSizeUnit: 1024,
                card: 
                {
                    itemSizeUnit: 750,
                    itemSize: new Vector2(750, 1050),
                    strokeWidth: new CVal(0.066, "cards.contractDraw.card.itemSizeUnit"),

                    suitPos: new CVal(new Vector2(0.5, 0.725), "cards.contractDraw.card.itemSize"),
                    suitDims: new CVal(new Vector2(0.45), "cards.contractDraw.card.itemSizeUnit"),

                    fontSize: new CVal(0.5, "cards.contractDraw.card.itemSizeUnit"),
                    numberPos: new CVal(new Vector2(0.5, 0.275), "cards.contractDraw.card.itemSize"),
                    numberDims: new CVal(new Vector2(0.5), "cards.contractDraw.card.itemSizeUnit"),

                    iconDims:
                    {
                        betweenCard: 0.45,
                        overSet: 0.7,
                    }
                },

                iconDims:
                {
                    union: new CVal(new Vector2(0.166), "cards.contractDraw.itemSize"),
                },

                shadow:
                {
                    enabled: true,
                    offset: new CVal(new Vector2(0, 0.025), "cards.contractDraw.itemSizeUnit"),
                    color: "#00000099",
                    blur: new CVal(0.005, "cards.contractDraw.itemSizeUnit")
                },
            }
        },
    }
}