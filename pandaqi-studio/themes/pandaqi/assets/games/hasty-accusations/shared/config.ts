
import { suspectPicker } from "../game/suspectPicker"
import { cardPicker } from "../game/cardPicker"
import { SettingType, TextConfig, TextWeight, Vector2, Bounds } from "lib/pq-games"

export const CONFIG = 
{
    _settings:
    {
        includeCards:
        {
            type: SettingType.CHECK,
            value: true,
            label: "Include Cards",
            remark: "Generates the action cards with which you play."
        },

        includeCharacters:
        {
            type: SettingType.CHECK,
            value: true,
            label: "Include Characters",
            remark: "Generates material for all possible suspects."
        },

        cardSet:
        {
            type: SettingType.ENUM,
            label: "Set",
            values: ["base", "advanced", "expert"],
            value: "base"
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
        fileName: "Hasty Accusations",
    },

    // assets
    _resources:
    {    
        base: "/hasty-accusations/assets/",
        files:
        {
            canoe:
            {
                path: "fonts/DraggingCanoeRegular.woff2"
            },

            caslon:
            {
                path: "fonts/LibreCaslonText-Regular.woff2",
                cardsOnly: true
            },

            caslon_bold:
            {
                key: "caslon",
                path: "fonts/LibreCaslonText-Bold.woff2",
                textConfig: new TextConfig({
                    weight: TextWeight.BOLD
                }),
                cardsOnly: true
            },

            base:
            {
                path: "base.webp",
                frames: new Vector2(8,2),
                cardSet: true,
                cardsOnly: true
            },

            advanced:
            {
                path: "advanced.webp",
                frames: new Vector2(8,2),
                cardSet: true,
                cardsOnly: true
            },

            expert:
            {
                path: "expert.webp",
                frames: new Vector2(8,2),
                cardSet: true,
                cardsOnly: true
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(8,1)
            },

            suspects:
            {
                path: "suspects.webp",
                frames: new Vector2(11,1),
                //suspectsOnly: true
            },

            suspect_powers:
            {
                path: "suspect_powers.webp",
                frames: new Vector2(11,1),
                suspectsOnly: true
            },

            papers:
            {
                path: "papers.webp",
                cardsOnly: true
            },

            fingerprints:
            {
                path: "fingerprints.webp",
                suspectsOnly: true
            },
        },
    },

    // how generation/balancing happens
    generation:
    {
       numPlayingCardsInDeck: 56,
       defFreqBounds: new Bounds(2, 10),
       defFrequencyForSuspect: 3,

       murderQuotientTarget: new Bounds(0.2, 0.25), // ~deckSize
       protectQuotientTarget: new Bounds(0.125, 0.15), // ~deckSize
    },

    _material:
    {
        suspects:
        {
            picker: suspectPicker,
            mapper:
            {
                 // @NOTE: the WIDTH should be identical to the cards, as this ensures they line up when placed on the table
                // height is whatever fits without shrinking it further
                size: 
                { 
                    small: new Vector2(4,9),
                    regular: new Vector2(3,7),
                    large: new Vector2(2,5)
                },
                sizeElement: new Vector2(2, 1),
            }
        },

        cards:
        {
            picker: cardPicker,
            mapper:
            {
                size: 
                { 
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
            heading: "canoe",
            body: "caslon"
        },

        suspects:
        {
            power:
            {
                iconSize: 0.3, // ~sizeUnit
                extraEdgeOffset: 0.05, // ~sizeUnit (it already automatically makes sure we're out of the way of text, this is EXTRA)
            },

            illustration:
            {
                fontSize: 0.15, // ~sizeUnit
                textColorLighten: 75,
                scaleFactor: 0.9, // ~sizeUnit
                shadowRadius: 0.1, // ~sizeUnit
                paperClipScale: 0.375, // ~sizeUnit
            },

            bg:
            {
                alpha: 1.0,
            }
        },

        // how to draw/layout cards (mostly visually)
        cards:
        {            
            shared:
            {
                bgColor: "#210B00",
                shadowColor: "#00000077", // transparent black
            },

            photographs:
            {
                yPos: 0.325, // ~sizeY
                rectSize: new Vector2(0.735), // ~sizeUnit
                rectHeightTitle: 0.2, // ~rectSizeY
                padding: new Vector2(0.05), // ~rectSizeUnit
                maxRotation: new Bounds(0.025 * Math.PI, 0.04*Math.PI),
                numPerCard: new Bounds(2,4),

                shadowRadius: 0.02, // ~rectSize
                shadowOffset: 0.05, // ~rectSize

                requirementDims: 0.125, // ~rectSizeUnit
                requirementPadding: new Vector2(0.0225), // rectSizeUnit
                requirementPaddingBetween: 0.5, // ~requirementPadding
                requirementShadowRadius: 0.1, // ~reqsDims

                titleFontSize: 0.14, // ~rectSizeUnit
                titleColorLighten: 75,
                titleShadowRadius: 0.2, // ~fontSize
            },

            illustration:
            {
                scaleFactor: 1.0, // ~innerRectSize
                paperClipScale: 0.2, // ~sizeUnit
                paperClipOffset: new Vector2(0.2, 0.0925), // ~sizeUnit, X is from the center, Y is from the top
            },

            text:
            {
                yPos: 0.78,
                rectSize: new Vector2(0.8, 0.33), // ~size
                rectColor: "#FFEFE6",
                rectBlur: 0.065, // ~rectSizeUnit
                fontSize: 0.07, // ~sizeUnit
                hardShadowOffset: 0.015, // ~fontSize (a very slight shadow that "thickens" the text and makes it slightly more legible)
            },
            
            outline:
            {
                size: 0.03, // relative to sizeUnit
                color: "#000000"
            }
        }
    }
}