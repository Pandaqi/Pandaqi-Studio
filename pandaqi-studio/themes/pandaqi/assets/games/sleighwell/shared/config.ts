
import { SettingType, Vector2 } from "lib/pq-games"
import { tilePicker } from "../game/tilePicker"

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

            reindeerWay:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Reindeer Way"
            },

            toughTrees:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Tough Trees"
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
        fileName: "Sleighwell",
    },

    // assets
    _resources:
    {    
        base: "/sleighwell/assets/",
        files:
        {
            grace:
            {
                path: "fonts/Good-Grace.woff2"
            },

            roboto:
            {
                path: "fonts/RobotoSlab-Regular.woff2"
            },

            misc:
            {
                path: "misc.webp",
                frames: new Vector2(8,1)
            },

            tiles:
            {
                path: "tiles.webp",
                frames: new Vector2(8,1),
            },
        },
    },

    // how generation/balancing happens
    generation:
    {
        maxComboSize: 3,

        baseGame:
        {
            numTiles: 50,
            numWildcardNumbers: 8,
            numSleighs: 2,
        },

        toughTrees:
        {
            numTiles: 8,
            numHouses: 4,
            numDoubleNumbers: 5,
            numSpecialActions: 9
        },

        reindeerWay:
        {
            numTiles: 8,
            numHouses: 3,
            numDoubleTypes: 7
        },
    },

    _material:
    {
        tiles:
        {
            itemSize: new Vector2(192), // for rulebook
            picker: tilePicker,
            mapper:
            {
                size: { 
                    small: new Vector2(5,6),
                    regular: new Vector2(4,5),
                    large: new Vector2(3,4)
                },
                sizeElement: new Vector2(1, 1),
            }
        }
    },

    _drawing:
    { 
        fonts:
        {
            heading: "grace",
            body: "roboto"
        },

        tiles:
        {
            shared:
            {
                defaultBGColor: "#FFFFFF",
                glowColor: "#FFFFFF",
                glowRadius: 0.0175, // ~sizeUnit
            },

            main:
            {
                iconSize: 0.66, // ~sizeUnit

                house:
                {
                    xPosLeft: 0.35, // ~sizeX
                    xPosRight: 0.75, // ~sizeX
                    iconSizeFactor: 0.8125, // ~original iconSize
                    iconSizePresent: 0.175, // ~sizeUnit
                    iconPresentEmptySpace: 0.075, // ~1.0 = total icon size

                    iconSizeStar: 0.15, // ~sizeUnit
                    yPosStar: 0.115, // ~sizeY
                }
            },

            numbers:
            {
                fontSize: 0.15, // ~sizeUnit
                fontSizeTiny: 0.066, // ~sizeUnit
                fontAlphaTiny: 0.75,
                offset: new Vector2(0.12, 0.12), // ~sizeUnit
                numberIconSizeFactor: 0.975, // ~fontSize; it looks better if images in corners (wildcard numbers) are slightly smaller
            
                stroke: "#000000",
                strokeWidth: 0.05, // ~fontSize
            },

            specialAction:
            {
                fontSize: 0.0775, // ~sizeUnit
                textDims: new Vector2(0.8, 0.8), // ~size
                textColor: "#111111", // should be on light present background (present_circle), so dark text
            },

            outline:
            {
                size: 0.025, // relative to sizeUnit
                color: "#000000"
            }
        },
    },

    _rulebook:
    {
        boardDims: new Vector2(4,4),
        minBoardDim: 2,
        minNumBoardTiles: 7,
        sleighMaxDistFromCenter: 0.75,
        tileSize: 192,
        highlightColor: "#FFAAAA",
        highlightStrokeColor: "#994444",
        lineWidth: 0.035, // ~tilesize,
        moveSleighProb: 0.5
    }
}