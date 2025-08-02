import TextConfig, { TextStyle, TextWeight } from "js/pq_games/layout/text/textConfig"
import CVal from "js/pq_games/tools/generation/cval"
import Point from "js/pq_games/tools/geometry/point"
import Bounds from "js/pq_games/tools/numbers/bounds"
import { cardPicker } from "../game/cardPicker"

export const CONFIG:any = 
{
    _settings:
    {
        generateGenreCards:
        {
            type: SettingType.CHECK,
            value: true,
            remark: "If on, generates the cards for all selected genres below. If off, those settings do nothing."
        },

        shelves:
        {
            type: SettingType.CHECK,
            value: true,
            label: "Book Shelf Cards"
        },

        actions:
        {
            type: SettingType.CHECK,
            label: "Thrills Expansion",
            value: false,
        },

        packs:
        {
            type: SettingType.GROUP,

            red:
            {
                type: SettingType.ENUM,
                values: ["horror", "detective", "true_crime", "tragedy"],
                label: "Red",
                value: "horror",
            },

            green:
            {
                type: SettingType.ENUM,
                values: ["romance", "comedy", "adventure", "self_help"],
                label: "Green",
                value: "romance",
            },

            blue:
            {
                type: SettingType.ENUM,
                values: ["thriller", "action", "travel", "mythology"],
                label: "Blue",
                value: "thriller"
            },

            purple:
            {
                type: SettingType.ENUM,
                values: ["fantasy", "scifi", "poetry", "graphic_novel"],
                label: "Purple",
                value: "fantasy"
            },

            yellow:
            {
                type: SettingType.ENUM,
                values: ["biography", "science", "business", "cooking"],
                label: "Yellow",
                value: "biography"
            },

            black:
            {
                type: SettingType.ENUM,
                values: ["mystery", "crime", "drama", "picture_book"],
                label: "Black",
                value: "mystery"
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
        fileName: "Librarians",
    },

    addHelpNumbers: true,
    addActionExplanation: true,
    addGenreIcons: true,
    addActionIcon: true,

    // assets
    assetsBase: "/librarians/assets/",
    assets:
    {
        grenze:
        {
            path: "fonts/Grenze-Regular.woff2",
        },

        grenze_bold:
        {
            key: "grenze",
            path: "fonts/Grenze-Black.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        grenze_italic:
        {
            key: "grenze",
            path: "fonts/Grenze-Italic.woff2",
            textConfig: new TextConfig({ style: TextStyle.ITALIC })
        },

        fleur:
        {
            path: "fonts/FleurCornerCaps.woff2",
        },

        genres:
        {
            path: "genres.webp",
            frames: new Point(8,3)
        },

        actions:
        {
            path: "actions.webp",
            frames: new Point(8,3)
        },

        covers:
        {
            path: "covers.webp",
            frames: new Point(8,4)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
        },
    },

    _material:
    {
        cards:
        {
            picker: cardPicker,
            mapper: MapperPreset.CARD
        }
    },

    _drawing:
    {
        fonts:
        {
            heading: "grenze",
            body: "grenze",
            special: "fleur"
        },

        cards:
        {
            generation:
            {
                numCardsPerColor: 11,
                numBookShelfCards: 12,
                minFrequencyForSeries: 3,
                defAuthorActionCards: "Anonymous",
                defFrequencyActionCards: 1,
            },

            shared:
            {
                rectBlur: new CVal(0.03, "sizeUnit")
            },

            dropCap:
            {
                fontSize: new CVal(0.425, "sizeUnit"),
                offsetY: 0.21,
            },

            title:
            {
                fontSize: new CVal(0.095, "sizeUnit"), // @NOTE: also helpNumbers fontSize!
                offsetY: 0.485,
                size: new CVal(new Point(0.7, 0.2), "size"),
                helpNumbersAlpha: 0.45,
                helpNumbersColor: "#000000"
            },

            background:
            {
                size: new CVal(new Point(0.95), "size"),
                sizeOverlayRelative: new Point(0.88, 0.8675), // "usable" size of book relative to calculated size
                spineWidthRelative: 0.18, // width of the book spine relative to calculated size.x

                cover:
                {
                    frameBounds: new Bounds(3,31), // the range of frames in the "covers" image that contain random covers
                    alpha: 0.15,
                },

                overlay:
                {
                    frame: 2,
                    composite: "multiply",
                    alpha: 1.0
                }
            },

            genre:
            {
                compositeRect: "overlay",
                cornerOffset: new CVal(new Point(0.057), "sizeUnit"),
                sizeIcon: new CVal(new Point(0.078), "sizeUnit"),
                sizeRect: new CVal(new Point(0.33), "sizeUnit"),
                textColor: "#000000",
                textComposite: "overlay",
                fontSize: new CVal(0.075, "sizeUnit"),
                textOffsetY: new CVal(new Point(0.05), "sizeUnit")
            },

            bookShelf:
            {
                arrow:
                {
                    pos: new CVal(new Point(0.5, 0.33), "size"),
                    size: new CVal(new Point(0.4), "sizeUnit"),
                    sizeVertical: new CVal(new Point(0.175), "sizeUnit"),
                    sizeRect: new CVal(new Point(0.65, 0.3), "size"),
                },

                text:
                {
                    pos: new CVal(new Point(0.5, 0.66), "size"),
                    size: new CVal(new Point(0.75, 0.35), "size"),
                    color: "#000000",
                    fontSize: new CVal(0.075, "sizeUnit")
                }
            },

            metadata:
            {
                textColor: "#FFFFFF",
                strokeColor: "#00000066",
                textAlpha: 1.0,
                fontSize: new CVal(0.066, "sizeUnit"),
                edgeMargin: new CVal(0.1, "sizeUnit"),
                sizeIcon: new CVal(new Point(0.065), "sizeUnit"),
                compositeIcon: "luminosity",
            },

            action:
            {
                offsetY: 0.75,
                sizeY: 0.3,
                fontSize: new CVal(0.0585, "sizeUnit"),
                sizeIcon: new CVal(new Point(0.15), "sizeUnit"),
            }

        },
    }
}