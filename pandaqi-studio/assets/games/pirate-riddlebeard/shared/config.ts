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
            value: 4
        },

        premadeGame:
        {
            type: SettingType.CHECK,
            label: "Create PDF",
            value: false,
            remark: "Downloads a PDF with a board and hint cards for offline play."
        },
        
        map:
        {
            type: SettingType.GROUP,

            isColored:
            {
                type: SettingType.CHECK,
                label: "Colored",
                value: false,
                remark: "Creates a colored and bigger board."
            },
            
            allTerrains:
            {
                type: SettingType.CHECK,
                label: "More Terrains",
                value: false,
                remark: "Increases number of terrains to six."
            },

            includeStones:
            {
                type: SettingType.CHECK,
                label: "Stones",
                value: false,
                remark: "Adds stones to the map ( + hints about them)."
            },

            includeRoads:
            {
                type: SettingType.CHECK,
                label: "Roads",
                value: false,
                remark: "Adds roads to the map ( + hints about them)."
            },

            includeLandmarks:
            {
                type: SettingType.CHECK,
                label: "Landmarks",
                value: false,
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
                value: false,
                remark: "Players can receive multiple hints."
            },

            advancedHints:
            {
                type: SettingType.CHECK,
                label: "Advanced Hints",
                value: false,
                remark: "Adds many types of hints that are really hard to figure out."
            },

            liarsCouncil:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Liar's Council (Expansion)",
            },

            theLostRiddles:
            {
                type: SettingType.CHECK,
                value: false,
                label: "The Lost Riddles (Expansion)",
            },

            tinyTreasures:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Tiny Treasures (Expansion)",
            },

            gamblerOfMyWord:
            {
                type: SettingType.CHECK,
                value: false,
                label: "Gambler Of My Word (Expansion)",
            },
        }
    },

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