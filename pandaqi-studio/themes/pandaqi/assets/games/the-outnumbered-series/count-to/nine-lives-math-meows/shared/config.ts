
import { CVal, SettingType, Vector2 } from "lib/pq-games"
import { cardPicker } from "../game/cardPicker"

export const CONFIG = 
{
    _settings:
    {
        includeLifeCards:
        {
            type: SettingType.CHECK,
            label: "Generate Life Cards",
            value: true
        },

        includeNumberCards:
        {
            type: SettingType.CHECK,
            label: "Generate Number Cards",
            value: true
        },
    },

    _debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    _game:
    {
        fileName: "Nine Lives: Math Meows",
    },

    // assets
    _resources:
    {    
        base: "/the-outnumbered-series/count-to/nine-lives-math-meows/assets/",
        files:
        {
            puss:
            {
                path: "/the-outnumbered-series/count-to/nine-lives/assets/fonts/puss.woff2",
                useAbsolutePath: true
            },

            catcafe:
            {
                path: "/the-outnumbered-series/count-to/nine-lives/assets/fonts/catcafe.woff2",
                useAbsolutePath: true
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(8,1)
            },

            cats:
            {
                path: "cats.webp",
                frames: new Vector2(8,1),
            },

            suits:
            {
                path: "suits.webp",
                frames: new Vector2(8,1),
            },
        },
    },

    // how generation/balancing happens
    generation:
    {
        numberCards:
        {
            highestCardIsRuleReminder: true
            // @NOTE: moved all that to SUITS object in dict, much easier
        },

        lifeCards:
        {
            numCats: 6,
            numLives: 9,
            handLimits: [6,5,5,5,4,4,4,3,3]
        }
    },

    _material:
    {
        cards:
        {
            itemSize: new Vector2(480, 672), // for rulebook
            picker: () => cardPicker,
            mapper: 
            {
                size: { 
                    small: new Vector2(4,4),
                    regular: new Vector2(3,3),
                    large: new Vector2(2,2)
                },
                sizeElement: new Vector2(1, 1.4),
            }
        }
    },

    _drawing:
    {
        fonts:
        {
            heading: "puss",
            body: "catcafe"
        },

        cards:
        { 
            sharedStrokeWidth: new CVal(0.01, "sizeUnit"),
            sharedShadowColor: "#00000055", // black but low opacity
            sharedShadowOffset: new CVal(0.025, "sizeUnit"),

            bgCats:
            {
                // 1.2 = the 1.0 the pattern always needs plus the 0.2 extra margin at the edge
                patternExtraMargin: new CVal(1.2, "sizeY"),
                patternNumIcons: 12, // again, Y-axis
                patternIconSize: 0.8, // relative to full space reserved for icon (1.0)
                patternRotation: -0.166*Math.PI, // = 30 degrees tilt
                patternAlpha: 0.175
            },

            suits:
            {
                iconSize: new CVal(0.175, "sizeUnit"),
                offset: new Vector2(0.125, 0.125), // relative to sizeUnit
                bigSuitSize: new CVal(0.55, "sizeUnit"),
                bigSuitAlpha: 0.55
            },

            numbers:
            {
                fontSize: new CVal(0.2, "sizeUnit"),
                fontSizeBig: new CVal(1.165, "sizeUnit"), // the big number in the center
                offsetFromEdge: 0.5, // relative to fontSize

                clarityLineBevel: 0.4, // ~lineSizeUnit => this is the line underneath 6 and 9 to differentiate
                clarityLineOffsetY: 0.36, // ~fontSize
                clarityLineSize: new Vector2(0.4, 0.0375), // ~fontSize
            },

            cat:
            {
                offset: new Vector2(0, -0.075),
                sizeFactor: 1.0, // relative to card X-axis ( = width)
                extraRectHeight: new CVal(0.0525, "sizeUnit"),
                extraRectAlpha: 0.33,
                fontSize: new CVal(0.066, "sizeUnit"),
                textOffset: 0.8, // relative to fontSize
                strokeWidthFactor: 0.5,

                rulesReminderScale: 0.8, // relative to full cat illustration scale
                rulesReminderCatAlpha: 0.45,
            },

            power:
            {
                yPos: new CVal(0.845, "sizeY"),
                rectSize: new CVal(new Vector2(0.9, 0.225), "size"),
                rectCutSize: 0.15, // relative to rectSizeUnit
                fontSize: new CVal(0.066, "sizeUnit"),
            },

            lives:
            {
                yPos: new CVal(0.665, "sizeY"), // should be slightly lower than the power.yPos
                iconSize: new CVal(0.315, "sizeUnit"),
                handIconSize: new CVal(0.15, "sizeUnit"),
                fontSize: new CVal(0.2, "sizeUnit"),
                handIconFontSize: new CVal(0.12, "sizeUnit"),
                handIconSideOffset: new CVal(0.125, "sizeX"),
            },

            outline:
            {
                size: 0.025, // relative to sizeUnit
                color: "#000000"
            }
        }
    }
}