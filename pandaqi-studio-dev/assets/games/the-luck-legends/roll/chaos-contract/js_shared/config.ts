import Point from "js/pq_games/tools/geometry/point"
import { ContractType } from "./dict"
import CVal from "js/pq_games/tools/generation/cval"

const CONFIG:any = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "chaosContractConfig",
    fileName: "[Material] Chaos Contract",

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
        contractsNumDefault: 30,
        contractsNumPerSet:
        {
            base: 40,
            lost: 20
        },
        
        contractTypesDefault: [ContractType.REGULAR],
        contractTypesPerSet:
        {
            base: [ContractType.REGULAR],
            lost: [ContractType.FORCED, ContractType.BATTLE]
        },

        // these are the regular dice/number cards, not contracts
        cardsNumDefault: 40,
        cardsNumPerSet:
        {
            base: 40,
            devilish: 20
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

        wildCardPercentage: 0.15,
        duoNumberPercentage: 0.25,

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
            dimsElement: new Point(1, 1.4),
            dims: 
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
            darken: 66
        },

        numbers:
        {
            fontSize: new CVal(0.1, "sizeUnit"),
            offset: new CVal(new Point(0.1), "sizeUnit")
        },

        mainNumber:
        {
            fontSize: new CVal(0.25, "sizeUnit"),
            pos: new CVal(new Point(0.5, 0.33), "size"),
            glowBlur: new CVal(0.1, "cards.mainNumber.fontSize")
        },

        action:
        {
            fontSize: new CVal(0.08, "sizeUnit"),
            textColor: "#FFFFFF",
            textBoxPos: new CVal(new Point(0.5, 0.75), "size"),
            textBoxDims: new CVal(new Point(0.8, 0.25), "size"),
            textDims: new CVal(new Point(0.7, 0.2), "size"),
            textBoxBlur: new CVal(0.15, "cards.action.fontSize")
        },

        metadata:
        {
            fontSize: new CVal(0.06, "sizeUnit"),
            numberPos: new CVal(new Point(-0.33, 0), "sizeUnit") ,
            actionPos: new CVal(new Point(0.33, 0), "sizeUnit"),
            anchorPos1: new CVal(new Point(0.1, 0.5), "size"),
            anchorPos2: new CVal(new Point(0.9, 0.5), "size"), // x-pos here must be 1.0-anchorPos1.x
        },

        contract:
        {
            fontSize: new CVal(0.08, "sizeUnit"),
            textDims: new CVal(new Point(0.75, 0.33), "size"),

            sections:
            {
                posDo: new CVal(new Point(0.6, 0.33), "size"),
                posTest: new CVal(new Point(0.6, 0.55), "size"),
                posSpecial: new CVal(new Point(0.6, 0.75), "size"),
            },

            rewards:
            {
                posReward: new CVal(new Point(0.075, 0.33), "size"),
                posPenalty: new CVal(new Point(0.075, 0.66), "size"),
                iconDims: new CVal(new Point(0.1), "sizeUnit")
            },

            stars:
            {
                dims: new CVal(new Point(0.05), "sizeUnit"),
                pos: new CVal(new Point(0.25, 0.15), "size"),
                alpha: 0.75
            },

            turnoutIconPos: new CVal(new Point(0.25, 0.35), "size"), // x-pos of this must be equal to stars-x
            battleIconPos: new CVal(new Point(0.25, 0.65), "size"), // x-pos of this must be equal to stars-x
        }


    },
}

export default CONFIG