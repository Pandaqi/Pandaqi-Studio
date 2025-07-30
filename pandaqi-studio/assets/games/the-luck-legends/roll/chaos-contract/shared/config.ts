import Point from "js/pq_games/tools/geometry/point"
import { ContractType } from "./dict"
import CVal from "js/pq_games/tools/generation/cval"

const CONFIG:any = 
{
    _settings:
    {
        sets:
        {
            type: SettingType.GROUP,

            base:
            {
                type: SettingType.CHECK,
                default: true,
                label: "Base Game"
            },

            lostSouls:
            {
                type: SettingType.CHECK,
                label: "Lost Souls",
                remark: "An expansion with more special contracts."
            },

            devilishNumbers:
            {
                type: SettingType.CHECK,
                label: "Devilish Numbers",
                remark: "An expansion with more wacky numbers and strong powers."
            },
        }
    },

    debug:
    {
        omitFile: false, // @DEBUGGING (should be false)
        singleDrawPerType: false, // @DEBUGGING (should be false)
        onlyGenerate: false, // @DEBUGGING (should be false)
    },

    configKey: "chaosContractConfig",
    fileName: "Chaos Contract",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",

    fonts:
    {
        heading: "celexa",
        body: "quixotte"
    },

    sets:
    {
        base: true,
        lostSouls: false,
        devilishNumbers: false,
    },

    // assets
    assetsBase: "/the-luck-legends/roll/chaos-contract/assets/",
    assets:
    {
        quixotte:
        {
            path: "fonts/Quixotte.woff2",
        },

        celexa:
        {
            path: "fonts/Celexa.woff2",
        },

        card_templates:
        {
            path: "card_templates.webp",
            frames: new Point(5,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(4,2)
        },
    },

    rulebook:
    {

    },

    generation:
    {
        contractsNumDefault: 32,
        contractsNumPerSet:
        {
            base: 32,
            lost: 20
        },
        
        contractTypesDefault: [ContractType.REGULAR],
        contractTypesPerSet:
        {
            base: [ContractType.REGULAR],
            lost: [ContractType.FORCED, ContractType.BATTLE]
        },

        // these are the regular dice/number cards, not contracts
        cardsNumDefault: 32,
        cardsNumPerSet:
        {
            base: 32,
            devilish: 28
        },

        cardsPossibleDefault: [1,2,3,4,5,6],
        cardsPossiblePerSet:
        {
            base: [1,2,3,4,5,6],
            devilish: [-1,0,1,2,3,4,5,6,7,8],
        },

        actionPercentageDefault: 0.35,
        actionPercentagePerSet:
        {
            base: 0.35,
            devilish: 0.75
        },

        wildcardPercentage: 0.225,
        duoNumberPercentage: 0.33,

        contractResultTypeDist:
        {
            "score": 0.4,
            "card": 0.6
        },

        contractRewardDist:
        {
            1: 0.65,
            2: 0.35,
        },

        contractPenaltyDist:
        {
            1: 0.8,
            2: 0.2,
        }
    },

    cards:
    {
        drawerConfig:
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

        bg:
        {
            textureAlpha: 1.0
        },

        wildcard:
        {
            bgColor: "#ff8c99",
            tintColor: "#ffffff"
        },

        outline:
        {
            darken: 45
        },

        numbers:
        {
            fontSize: new CVal(0.15, "sizeUnit"),
            offset: new CVal(new Point(0.075, 0.1), "sizeUnit")
        },

        mainNumber:
        {
            fontSize: new CVal(0.6, "sizeUnit"),
            pos: new CVal(new Point(0.5, 0.33), "size"),
            glowBlur: new CVal(0.05, "cards.mainNumber.fontSize")
        },

        action:
        {
            fontSize: new CVal(0.0735, "sizeUnit"),
            textColor: "#FFFFFF",
            textBoxPos: new CVal(new Point(0.5, 0.75), "size"),
            textBoxDims: new CVal(new Point(0.8, 0.25), "size"),
            textDims: new CVal(new Point(0.7, 0.33), "size"),
            textBoxBlur: new CVal(0.35, "cards.action.fontSize")
        },

        metadata:
        {
            fontSize: new CVal(0.05, "sizeUnit"),
            numberPos: new CVal(new Point(-0.3, 0), "sizeUnit") ,
            actionPos: new CVal(new Point(0.3, 0), "sizeUnit"),
            anchorPos1: new CVal(new Point(0.066, 0.5), "size"),
            anchorPos2: new CVal(new Point(0.94, 0.5), "size"), // x-pos here must be 1.0-anchorPos1.x
        },

        contract:
        {
            fontSize: new CVal(0.07, "sizeUnit"),
            textDims: new CVal(new Point(0.725, 0.33), "size"),

            sections:
            {
                posDo: new CVal(new Point(0.6, 0.225), "size"),
                posTest: new CVal(new Point(0.6, 0.575), "size"),
                posSpecial: new CVal(new Point(0.6, 0.8475), "size"),
            },

            rewards:
            {
                posReward: new CVal(new Point(0.065, 0.25), "size"),
                posPenalty: new CVal(new Point(0.065, 0.75), "size"),
                iconDims: new CVal(new Point(0.1), "sizeUnit")
            },

            stars:
            {
                size: new CVal(new Point(0.05), "sizeUnit"),
                pos: new CVal(new Point(0.2, 0.125), "size"),
                alpha: 0.66
            },

            turnoutIconPos: new CVal(new Point(0.2, 0.385), "size"), // x-pos of this must be equal to stars-x
            battleIconPos: new CVal(new Point(0.2, 0.615), "size"), // x-pos of this must be equal to stars-x
        }


    },
}


export default CONFIG