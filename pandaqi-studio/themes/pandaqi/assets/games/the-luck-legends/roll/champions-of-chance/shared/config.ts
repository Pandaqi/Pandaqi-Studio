import { SettingType, TextConfig, TextStyle, TextWeight, Vector2, Bounds, MapperPreset, CVal } from "lib/pq-games"
import { cardPicker } from "../game/cardPicker"

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

            wackyNumbers:
            {
                type: SettingType.CHECK,
                label: "Wacky Numbers",
                value: false,
                remark: "Introduces cards with special actions."
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
        fileName: "Champions of Chance",
    },

    // assets
    _resources:
    {    
        base: "/the-luck-legends/roll/champions-of-chance/assets/",
        files:
        {
            nunito:
            {
                path: "fonts/NunitoSans10pt-Regular.woff2",
            },

            nunito_italic:
            {
                key: "nunito",
                path: "fonts/NunitoSans10pt-Italic.woff2",
                textConfig: new TextConfig({ style: TextStyle.ITALIC })
            },

            nunito_bold:
            {
                key: "nunito",
                path: "fonts/NunitoSans10pt-Black.woff2",
                textConfig: new TextConfig({ weight: TextWeight.BOLD })
            },

            luckiest:
            {
                path: "fonts/LuckiestGuy-Regular.woff2",
                loadIf: ["sets.expansion"]
            },

            card_templates:
            {
                path: "card_templates.webp",
                frames: new Vector2(4,1)
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(8,1)
            },
        },
    },

    rulebook:
    {
        numPlayerBounds: new Bounds(2,5),
        numCardsPerPlayer: 6,
        itemSize: new Vector2(750, 1050)
    },

    generation:
    {
        minNum: 1,
        maxNum: 6,
        numCardsPerNumber: 6,

        numIconsMin: 2,
        numIconsMax: 4,
        numIconsRandomness: new Bounds(-1.5, 1.5),
        numIconsPerNumber:
        {
            1: 2,
            2: 3,
            3: 4,
            4: 4,
            5: 3,
            6: 2
        },

        numCardsWacky: 18,
    },

    _material:
    {
        cards:
        {
            itemSize: new Vector2(750, 1050),
            picker: cardPicker,
            mapper: MapperPreset.CARD
        }
    },

    _drawing:
    {
        fonts:
        {
            heading: "luckiest",
            body: "nunito"
        },

        cards:
        {
            bg:
            {
                alpha: 0.15,
            },

            numbers:
            {
                offset: new CVal(new Vector2(0.1, 0.13), "sizeUnit"),
                fontSize: new CVal(0.225, "sizeUnit"),
                centerPos: new CVal(new Vector2(0.5), "size"),
                centerDims: new CVal(new Vector2(0.4), "sizeUnit"),
                writtenPos: new CVal(new Vector2(0.5, 0.68), "size"),
                writtenFontSize: new CVal(0.12, "sizeUnit"),
            },

            power:
            {
                fontSize: new CVal(0.05075, "sizeUnit"),
                textPos: new CVal(new Vector2(0.5, 0.815), "size"),
                textBoxDims: new CVal(new Vector2(0.475, 0.175), "size"),
                textColor: "#101010"
            },

            icons:
            {
                offset: new CVal(new Vector2(0.1, 0.195), "size"),
                size: new CVal(new Vector2(0.1), "sizeUnit")
            }
        },
    }
}