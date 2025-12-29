import { CONFIG_SHARED } from "games/easter-eggventures/shared/configShared";
import { tilePicker } from "../game/tilePicker";
import { SettingType, Vector2, CVal, mergeObjects } from "lib/pq-games";

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

            special:
            {
                type: SettingType.CHECK,
                label: "Special Eggs",
                value: false
            },

            powers:
            {
                type: SettingType.CHECK,
                label: "Powers & Handiceggs",
                value: false
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
        fileName: "Bunny Bidding",
    },

    // assets
    _resources:
    {    
        base: "/easter-eggventures/play/bunny-bidding/assets/",
        files:
        {
            powers:
            {
                path: "powers.webp",
                frames: new Vector2(8,2),
                loadIf: ["sets.powers"],
            },
            
            actions:
            {
                path: "actions.webp",
                frames: new Vector2(10,2),
                loadIf: ["sets.special"],
            }
        },
    },

    generation:
    {
        specialEggInterval: 4, // on numbers 1-99, this means we get ~25 unique numbers for special eggs
        maxEggNumber: 99,
        numUniqueEggs: 6,
        defaultFrequencies:
        {
            regularEgg: 10,
            specialEgg: 1,
            goalEgg: 2
        }
    },

    _material:
    {
        tiles:
        {
            picker: tilePicker
        }
    },
    
    _drawing:
    {
        tiles:
        {
            eggNumber:
            {
                fontSize: new CVal(0.125, "sizeUnit"),
                edgeOffset: new CVal(new Vector2(0.1), "sizeUnit"),
                spriteDims: new CVal(new Vector2(0.35), "sizeUnit"),
                spriteOffset: new CVal(new Vector2(-0.01, 0.015), "size")
            },
        }
    }
}

mergeObjects(CONFIG, CONFIG_SHARED);