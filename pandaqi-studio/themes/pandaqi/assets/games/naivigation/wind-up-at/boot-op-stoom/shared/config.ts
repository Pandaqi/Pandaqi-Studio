
import { SettingType, TextConfig, TextStyle, TextWeight, Vector2, MapperPreset, CVal } from "lib/pq-games";
import { cardPicker } from "../game/cardPicker";
import { tilePicker } from "../game/tilePicker";

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
                label: "Basisspel",
            },

            krappeKalender:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Uitbreiding: Krappe Kalender",
            },

            prachtigePakjes:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Uitbreiding: Prachtige Pakjes",
            },

            pepernootPlekken:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Uitbreiding: Pepernootplekken",
            },

            rebelsePietjes:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Uitbreiding: Rebelse Pietjes",
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
        fileName: "Boot op Stoom",
    },

    // assets
    _resources:
    {    
        base: "/naivigation/wind-up-at/boot-op-stoom/assets/",
        files:
        {
            crimson:
            {
                path: "fonts/CrimsonText-Regular.woff2",
            },

            crimson_italic:
            {
                key: "crimson",
                path: "fonts/CrimsonText-Italic.woff2",
                textConfig: new TextConfig({ style: TextStyle.ITALIC })
            },

            crimson_bold:
            {
                key: "crimson",
                path: "fonts/CrimsonText-Bold.woff2",
                textConfig: new TextConfig({ weight: TextWeight.BOLD })
            },

            crimson_bold_italic:
            {
                key: "crimson",
                path: "fonts/CrimsonText-BoldItalic.woff2",
                textConfig: new TextConfig({ style: TextStyle.ITALIC, weight: TextWeight.BOLD })
            },

            freebie:
            {
                path: "fonts/FreebieRegular.woff2",
            },

            card_templates:
            {
                path: "card_templates.webp",
                frames: new Vector2(9,1)
            },

            map_tiles:
            {
                path: "map_tiles.webp",
                frames: new Vector2(6,2)
            },

            pakje_cards:
            {
                path: "pakje_cards.webp",
                frames: new Vector2(6,1)
            },

            stoom_cards:
            {
                path: "stoom_cards.webp",
                frames: new Vector2(4,2)
            },

            vaar_cards:
            {
                path: "vaar_cards.webp",
                frames: new Vector2(4,2)
            },

            kalender_cards:
            {
                path: "kalender_cards.webp",
                frames: new Vector2(4,3),
                loadIf: ["sets.krappeKalender"]
            },
        },
    },

    generation:
    {
        pakjes:
        {
            defaultFrequency: 3,
            coveragePercentageOnTiles: 0.85,
        },

        varen:
        {
            defaultFrequency: 3
        },

        stoomboot:
        {
            defaultFrequency: 3
        },

        rebelsePietjes:
        {
            number: 2 // 2 per tile = 4 total
        },

        kalenderKaarten:
        {
            defaultFrequency: 1
        }
    },

    _material:
    {
        cards:
        {
            picker: cardPicker,
            mapper: MapperPreset.CARD
        },

        tiles:
        {
            picker: tilePicker,
            mapper: MapperPreset.TILE
        }
    },

    _drawing:
    {
        fonts:
        {
            heading: "freebie",
            body: "crimson",
        },

        cards:
        {
            shared:
            {
                icon:
                {
                    pos: new CVal(new Vector2(0.5, 0.3), "size"),
                    size: new CVal(new Vector2(0.7), "sizeUnit")
                },

                text:
                {
                    fontSize: new CVal(0.08, "sizeUnit"),
                    pos: new CVal(new Vector2(0.5, 0.825), "size"),
                    boxSize: new CVal(new Vector2(0.85, 0.275), "size")
                }
            },

            stoom:
            {
                iconPos: new CVal(new Vector2(0.135, 0.365), "size"),
                iconSize: new CVal(new Vector2(0.225), "sizeUnit"),
                composite: "source-over", // might be "luminosity" too?
            },

            kalender:
            {
                icon:
                {
                    pos: new CVal(new Vector2(0.5, 0.225), "size"),
                    size: new CVal(new Vector2(0.5), "sizeUnit")
                },

                label:
                {
                    fontSize: new CVal(0.085, "sizeUnit"),
                    pos: new CVal(new Vector2(0.5, 0.505), "size"),
                    boxSize: new CVal(new Vector2(0.75, 0.225), "size")
                },

                text:
                {
                    fontSize: new CVal(0.085, "sizeUnit"),
                    pos: new CVal(new Vector2(0.5, 0.7875), "size"),
                    boxSize: new CVal(new Vector2(0.85, 0.45), "size")
                }
            }
        },

        tiles:
        {
            giftsWanted:
            {
                pos: new CVal(new Vector2(0.5, 0.66), "size"),
                size: new CVal(new Vector2(0.285), "sizeUnit")
            }
        },
    }
}