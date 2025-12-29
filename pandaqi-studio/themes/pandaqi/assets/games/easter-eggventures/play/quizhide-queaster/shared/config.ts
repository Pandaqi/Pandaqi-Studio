import { CONFIG_SHARED } from "games/easter-eggventures/shared/configShared";
import { tilePicker } from "../game/tilePicker";
import { cardPicker } from "../game/cardPicker";
import { eggPicker } from "../game/eggPicker";
import { SettingType, Vector2, Bounds, CVal, mergeObjects } from "lib/pq-games";

export const CONFIG:Record<string,any> =
{
    _settings:
    {
        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                label: "Base Game",
                value: true
            },

            cluesRooms:
            {
                type: SettingType.CHECK,
                label: "Clues & Rooms",
                remark: "Simply adds more clue cards and possible room tiles.",
                value: false
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
        fileName: "Quizhide Queaster",
    },

    // assets
    _resources:
    {    
        base: "/easter-eggventures/play/quizhide-queaster/assets/",
        files:
        {
            clue_cards:
            {
                path: "clue_cards.webp",
                frames: new Vector2(11,8),
            },

            rooms:
            {
                path: "rooms.webp",
                frames: new Vector2(8,6),
            },

            // @NOTE: some of these frames have been hijacked for misc sprites; had to do that because my broken laptop can't handle loading more individual asset files
            objects:
            {
                path: "objects.webp",
                frames: new Vector2(8,1),
            },
        },
    },

    generation:
    {
        clueCardBoundsBase: new Bounds(0, 43), // the range of frames to use for generating clue cards; so basically stores the usable frames of the spritesheet
        clueCardBoundsExpansion: new Bounds(44, 88-1),
        numScoreCards: 16,
        scoringRuleIterationRandomness: new Bounds(-2,3),
        scoringCardAvgScore: 2,
        maxValuePerEgg: 3,
        maxNumEggs: 5, 
        maxNumPlayers: 6,
        defaultFrequencies:
        {
            eggToken: 5,
            roomTile: 1,
            obstacleTile: 4 // there are 7 obstacles, 7 * 4 = 28 = ~25 = eggTokens
        }
    },

    _material:
    {
        tiles:
        {
            picker: tilePicker,
            mapper: 
            {
                autoStroke: true,
                sizeElement: new Vector2(1, 1),
                size: 
                { 
                    small: new Vector2(4,6),
                    regular: new Vector2(2,4),
                    large: new Vector2(1,2)
                },
            }
        },

        cards:
        {
            picker: cardPicker,
            mapper: 
            {
                autoStroke: true,
                sizeElement: new Vector2(1, 1.4),
                size: { 
                    small: new Vector2(5,5),
                    regular: new Vector2(4,4),
                    large: new Vector2(3,3)
                }, 
            }, 
        },

        eggs:
        {
            picker: eggPicker
        }
    },

    _drawing:
    {
        tiles:
        {
            objects:
            {
                size: new CVal(new Vector2(1.0), "sizeUnit")
            },

            rooms:
            {
                hidingSlotDims: new CVal(new Vector2(0.1825), "sizeUnit"),
                hidingSlotsFrame: 0
            }
        },

        cards:
        {
            score:
            {
                fontSize: new CVal(0.1, "sizeUnit")
            }
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);
delete CONFIG._resources.files.eggs_backgrounds;
delete CONFIG._resources.files.misc;