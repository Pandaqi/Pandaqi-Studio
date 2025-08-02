import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"
import { cardPicker } from "../game/cardPicker"

export const CONFIG:any = 
{
    _settings:
    {
        sets:
        {
            type: SettingType.GROUP,
            
            base:
            {
                type: SettingType.CHECK,
                value: true
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
        fileName: "Bidding Blocks",
    },

    _resources:
    {
        base: "/bidding-blocks/assets/",
        files:
        {
            josefin:
            {
                path: "fonts/JosefinSlab-Regular.woff2",
            },

            vadamecum:
            {
                path: "fonts/Vademecum-Regular.woff2",
            },

            card_templates:
            {
                path: "card_templates.webp",
                frames: new Point(4,1)
            },

            misc:
            {
                path: "misc.webp",
                frames: new Point(4,4)
            },
        }
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(3,5),
        numCardsPerPlayer: 8,
        
        bidNumWinsBounds: new Bounds(1,4),
        bidHandSizeBounds: new Bounds(3,8),

        simulTurnProb: 0.35,
        dontGiveUpProb: 0.875,
        minTurnsPerChallenge: 2,
        maxTurnsPerChallenge: 8,
    },

    generation:
    {
        numberBounds: new Bounds(1,10),
    },

    _material:
    {
        cards:
        {
            itemSize: new Point(375, 525),
            picker: cardPicker,
            mapper: 
            {
                autoStroke: true,
                sizeElement: new Point(1, 1.4),
                size: 
                { 
                    small: new Point(4,4),
                    regular: new Point(3,3),
                    large: new Point(2,2)
                }, 
            },
        }
    },

    _drawing:
    {     
        fonts:
        {
            heading: "vadamecum",
            body: "josefin",
        },

        cards:
        {
            main:
            {
                pos: new CVal(new Point(0.5), "size"),
                size: new CVal(new Point(0.92), "sizeUnit"),
            },

            fitsOnTop:
            {
                pos: new CVal(new Point(0.5, 0.115), "size"),
                size: new CVal(new Point(0.235), "sizeUnit")
            },

            numbers:
            {
                fontSize: new CVal(0.175, "sizeUnit"),
                offset: new CVal(new Point(0.1, 0.135), "sizeUnit"),
                doubleDigitsScaleDown: 0.775,
            },

            suitIcons:
            {
                offset: new CVal(new Point(0.27, 0.17), "sizeUnit"), // should fit perfectly in this background circles
                size: new CVal(new Point(0.0775), "sizeUnit")
            }
        },
    }
}