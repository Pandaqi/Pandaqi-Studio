import Point from "js/pq_games/tools/geometry/point";

export const CONFIG =
{
    _settings:
    {
        playerCount:
        {
            type: SettingType.NUMBER,
            min: 1,
            max: 6,
            default: 4
        },

        premadeGame:
        {
            type: SettingType.CHECK,
            label: "Create PDF",
            remark: "Downloads a PDF with a board and hint cards for offline play."
        },
        
        map:
        {
            type: SettingType.GROUP,

            isColored:
            {
                type: SettingType.CHECK,
                label: "Colored",
                remark: "Creates a colored and bigger board."
            },
            
            allTerrains:
            {
                type: SettingType.CHECK,
                label: "More Terrains",
                remark: "Increases number of terrains to six."
            },

            includeStones:
            {
                type: SettingType.CHECK,
                label: "Stones",
                remark: "Adds stones to the map ( + hints about them)."
            },

            includeRoads:
            {
                type: SettingType.CHECK,
                label: "Roads",
                remark: "Adds roads to the map ( + hints about them)."
            },

            includeLandmarks:
            {
                type: SettingType.CHECK,
                label: "Landmarks",
                remark: "Adds landmarks to the map ( + hints about them)."
            },
        },

        bonusRules:
        {
            type: SettingType.GROUP,

            multiHint:
            {
                type: SettingType.CHECK,
                label: "Multi Hints",
                remark: "Players can receive multiple hints."
            },

            advancedHints:
            {
                type: SettingType.CHECK,
                label: "Advanced Hints",
                remark: "Adds many types of hints that are really hard to figure out."
            },

            liarsCouncil:
            {
                type: SettingType.CHECK,
                label: "Liar's Council (Expansion)",
            },

            theLostRiddles:
            {
                type: SettingType.CHECK,
                label: "The Lost Riddles (Expansion)",
            },

            tinyTreasures:
            {
                type: SettingType.CHECK,
                label: "Tiny Treasures (Expansion)",
            },

            gamblerOfMyWord:
            {
                type: SettingType.CHECK,
                label: "Gambler Of My Word (Expansion)",
            },
        }
    },

    configKey: "pirateRiddlebeardConfig",
    size: new Point(297*3.8, 210*3.8),
    assetsBase: '/pirate-riddlebeard/assets/',
    assets:
    {
        elements:
        {
            path: "elements.png",
            frames: new Point(8,8),
        },
    
        icons:
        {
            path: "icons.png",
            frames: new Point(8,4),
        },

        hint_icons:
        {
            path: "hint_icons.png",
            frames: new Point(15,1),
        },
    
        hint_card:
        {
            path: "hint_card.png"
        }
    }
}