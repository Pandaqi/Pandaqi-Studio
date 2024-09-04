import Point from "js/pq_games/tools/geometry/point"
import { ContractType } from "./dict"

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
            frames: new Point(4,1)
        },

        misc:
        {
            path: "misc.webp",
            frames: new Point(8,1)
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
    },
}

export default CONFIG