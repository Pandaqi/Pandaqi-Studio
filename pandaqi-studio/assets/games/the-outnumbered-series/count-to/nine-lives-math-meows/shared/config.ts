import Point from "js/pq_games/tools/geometry/point"
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
    assetsBase: "/the-outnumbered-series/count-to/nine-lives-math-meows/assets/",
    assets:
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
            frames: new Point(8,1)
        },

        cats:
        {
            path: "cats.webp",
            frames: new Point(8,1),
        },

        suits:
        {
            path: "suits.webp",
            frames: new Point(8,1),
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
            itemSize: new Point(480, 672), // for rulebook
            picker: cardPicker,
            mapper: 
            {
                size: { 
                    small: new Point(4,4),
                    regular: new Point(3,3),
                    large: new Point(2,2)
                },
                sizeElement: new Point(1, 1.4),
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
            sharedStrokeWidth: 0.01, // relative to sizeUnit
            sharedShadowColor: "#00000055", // black but low opacity
            sharedShadowOffset: 0.025, // relative to sizeUnit

            bgCats:
            {
                patternExtraMargin: 0.2, // relative to card Y, extra margin at edge to make sure no empty space when rotated   
                patternNumIcons: 12, // again, Y-axis
                patternIconSize: 0.8, // relative to full space reserved for icon (1.0)
                patternRotation: -0.166*Math.PI, // = 30 degrees tilt
                patternAlpha: 0.175
            },

            suits:
            {
                iconSize: 0.175, // relative to sizeUnit
                offset: new Point(0.125, 0.125), // relative to sizeUnit
                bigSuitSize: 0.55, // relative to SizeUnit
                bigSuitAlpha: 0.55
            },

            numbers:
            {
                fontSize: 0.2, // relative to sizeUnit
                fontSizeBig: 1.165, // relative to sizeUnit => the big number in the center
                offsetFromEdge: 0.5, // relative to fontSize

                clarityLineBevel: 0.4, // ~lineSizeUnit => this is the line underneath 6 and 9 to differentiate
                clarityLineOffsetY: 0.36, // ~fontSize
                clarityLineSize: new Point(0.4, 0.0375), // ~fontSize
            },

            cat:
            {
                offset: new Point(0, -0.075),
                sizeFactor: 1.0, // relative to card X-axis ( = width)
                extraRectHeight: 0.0525,
                extraRectAlpha: 0.33,
                fontSize: 0.066, // relative to sizeUnit
                textOffset: 0.8, // relative to fontSize
                strokeWidthFactor: 0.5,

                rulesReminderScale: 0.8, // relative to full cat illustration scale
                rulesReminderCatAlpha: 0.45,
            },

            power:
            {
                yPos: 0.845, // relative to Y-axis, placement of box on card
                rectSize: new Point(0.9, 0.225), // simply relative to exact card dimensions
                rectCutSize: 0.15, // relative to rectSizeUnit
                fontSize: 0.066,
            },

            lives:
            {
                yPos: 0.665, // should be slightly lower than the power.yPos
                iconSize: 0.315, // 0.5, // relative to sizeUnit
                handIconSize: 0.15, // some fraction of iconSize
                fontSize: 0.2, //0.25,
                handIconFontSize: 0.12,
                handIconSideOffset: 0.125, // relative to sizeX
            },

            outline:
            {
                size: 0.025, // relative to sizeUnit
                color: "#000000"
            }
        }
    }
}