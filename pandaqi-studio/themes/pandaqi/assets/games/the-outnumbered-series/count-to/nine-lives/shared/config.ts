
import { SettingType, Vector2 } from "lib/pq-games"
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

        includeCatCards:
        {
            type: SettingType.CHECK,
            label: "Generate Cat Cards",
            value: true
        },

        limitedPowers:
        {
            type: SettingType.CHECK,
            label: "Limited Powers",
            value: true,
            remark: "Only includes a handful of unique powers, to make playing your first game even easier."
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
        fileName: "Nine Lives",
    },

    // assets
    _resources:
    {    
        base: "/the-outnumbered-series/count-to/nine-lives/assets/",
        files:
        {
            puss:
            {
                path: "fonts/puss.woff2"
            },

            catcafe:
            {
                path: "fonts/catcafe.woff2"
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(10,1)
            },

            cats:
            {
                path: "cats.webp",
                frames: new Vector2(8,1),
            },

            powers:
            {
                path: "powers.webp",
                frames: new Vector2(8,3),
            },
        },
    },

    // how generation/balancing happens
    generation:
    {
        numberCards:
        {
            num: 45, // a hard threshold for the number deck which we try to reach exactly
            includeAllCombosUntil: 3,
            maxCatsOnComboCard: 6,
            maxCatsOnRegularCard: 9,
            highComboFalloff: 2.5, // how quickly we reduce the number of cards for higher and higher numbers
        },

        lifeCards:
        {
            num: 5 * 9, // max 5 players, 9 per player
        }
    },

    _material:
    {
        cards:
        {
            itemSize: new Vector2(600, 840), // for rulebook
            picker: cardPicker,
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
            shared:
            {
                shadowOffset: new Vector2(0.0175, 0.0175),
                shadowColor: "#00000099"
            },

            bgCats:
            {
                patternExtraMargin: 0.2, // relative to card Y, extra margin at edge to make sure no empty space when rotated   
                patternNumIcons: 12, // again, Y-axis
                patternIconSize: 0.8, // relative to full space reserved for icon (1.0)

                patternAlpha: 0.125,
                patternRotation: -0.166*Math.PI, // = 30 degrees tilt
                patternAlphaInkFriendly: 0.033
            },

            bgHearts:
            {
                patternRotation: -0.166*Math.PI
            },

            cats:
            {
                positionOffset: 0.5,
                positions:
                [
                    [], // 0 icons
                    [Vector2.ZERO], // 1 icon
                    [new Vector2(-1, -1), new Vector2(1, 1)], // 2 icons
                    [new Vector2(-1, -1), Vector2.ZERO, new Vector2(1, 1)], // 3 icons
                    [new Vector2(-1, -1), new Vector2(1, -1), new Vector2(-1, 1), new Vector2(1, 1)], // 4 icons
                    [new Vector2(-1, -1), new Vector2(1, -1), Vector2.ZERO, new Vector2(-1, 1), new Vector2(1, 1)], // 5 icons
                    [new Vector2(-1, -1), new Vector2(1, -1), new Vector2(-1, 0), new Vector2(1, 0), new Vector2(-1, 1), new Vector2(1, 1)], // 6 icons
                    [new Vector2(-1, -1), new Vector2(1, -1), new Vector2(-1, 0), Vector2.ZERO, new Vector2(1, 0), new Vector2(-1, 1), new Vector2(1, 1)], // 7 icons
                    [new Vector2(-1, -1), new Vector2(0, -1), new Vector2(1, -1), new Vector2(-1, 0), new Vector2(1, 0), new Vector2(-1, 1), new Vector2(0, 1), new Vector2(1, 1)],
                    [new Vector2(-1, -1), new Vector2(0, -1), new Vector2(1, -1), new Vector2(-1, 0), Vector2.ZERO, new Vector2(1, 0), new Vector2(-1, 1), new Vector2(0, 1), new Vector2(1, 1)]
                ],
                iconSize: 0.25, // ~sizeUnit
                simplifiedIconSize: 0.08, // ~sizeUnit
                simplifiedIconOffset: new Vector2(0.05, 0.05), // ~sizeUnit
            },

            life:
            {
                bgColor: "#7C0600",
                heartPosY: 0.533, // ~sizeY
                heartSize: 1.4, // ~sizeUnit, should be above 1.0 by a good amount
                heartCornerSize: 0.175, // ~sizeUnit
                heartCornerOffset: 1.4, // ~half size of corner heart

                cardRectY: 0.08, // ~sizeY
                cardRectSize: new Vector2(0.315, 0.135), // ~sizeUnit
                cardRectBevel: 0.15, // ~rectSizeUnit
                cardRectStrokeWidth: 0.0075, // ~sizeUnit
                cardRectIconSize: 0.9, // ~rectY
                cardRectIconXSpacing: 0.675, // ~rectIconX (cards are portrait, so their actual width is smaller than the square frame, compensate for that)

                fontSize: 0.075, // ~sizeUnit
                textOffsetFromCenter: 0.175, // ~sizeY
                textStrokeWidth: 0.005, // ~sizeUnit
                lifeCardTextAlpha: 0.5,
                lifeCardFontSizeFactor: 0.85,
            },

            powers:
            {
                iconSize: 0.33, // ~sizeUnit
                textStrokeWidth: 0.01, // ~sizeUnit, only used for ONE power right now (that shows a NUMBER)
                glowAroundIcons:
                {
                    blur: 0.05, //~iconSize
                    color: "#FFFFFF"
                },
                shapeshift:
                {
                    iconSize: 0.775, // ~iconSize normal
                },
                numbershift:
                {
                    iconSize: 0.775, // ~iconSize normal
                }
            },

            outline:
            {
                size: 0.025, // relative to sizeUnit
                color: "#000000"
            }
        }
    }
}