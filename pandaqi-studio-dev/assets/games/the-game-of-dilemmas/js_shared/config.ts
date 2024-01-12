import TextConfig, { TextWeight } from "js/pq_games/layout/text/textConfig"
import Point from "js/pq_games/tools/geometry/point"
import { TokenType } from "./dict"

const CONFIG = 
{
    debug:
    {
        omitFile: true, // @DEBUGGING (should be false)
        singleDrawPerType: true, // @DEBUGGING (should be false)
        onlyGenerate: true, // @DEBUGGING (should be false)
    },

    configKey: "theGameOfDilemmasConfig",
    fileName: "[Material] The Game of Dilemmas",

    // set through user config on page
    inkFriendly: false,
    itemSize: "regular",
    packs: {},

    includeCards: true,
    includeTokens: true,

    fonts:
    {
        heading: "sunny",
        body: "minya"
    },

    // assets
    assetsBase: "/the-game-of-dilemmas/assets/",
    assets:
    {
        sunny:
        {
            path: "fonts/SunnySpells-Regular.woff2"
        },

        minya:
        {
            path: "fonts/MinyaNouvelle-Regular.woff2"
        },

        minya_bold:
        {
            key: "minya",
            path: "fonts/MinyaNouvelle-ExtraBold.woff2",
            textConfig: new TextConfig({ weight: TextWeight.BOLD })
        },

        categories:
        {
            path: "categories.webp",
            frames: new Point(4,1),
        },

        token_types:
        {
            path: "token_types.webp",
            frames: new Point(4,1)
        }
    },

    // how generation/balancing happens
    generation:
    {
        tokenTypes: [TokenType.YES, TokenType.NO],
        numPerType: 2,
        maxNumPlayers: 6,
        tokenTypesVariant: [TokenType.SUPERYES, TokenType.SUPERNO],
        numPerTypeVariant: 1
    },

    // how to draw/layout cards (mostly visually)
    cards:
    {
        drawerConfig:
        {
            dimsElement: new Point(1, 1.4),
            dims: 
            { 
                small: new Point(5,5),
                regular: new Point(4,4),
                large: new Point(3,3)
            },
        }, 

        tokenConfig:
        {
            dimsElement: new Point(1,1),
            dims: 
            {
                small: new Point(8,8),
                regular: new Point(6,6),
                large: new Point(4,4)
            }
        },
        
        shared:
        {
           
        },

        category:
        {
            iconSize: 0.1, // ~sizeUnit
            iconOffset: 0.1, // ~sizeUnit
        },

        text:
        {
            fontSize: 0.06, // ~sizeUnit
            dims: new Point(0.8, 0.6), // ~size
            negativeCardPrefix: "... but "
        },

        token:
        {
            iconSize: 0.5, // ~sizeUnit
            fontSize: 0.5, // ~sizeUnit
        },

        outline:
        {
            size: 0.025, // relative to sizeUnit
            color: "#000000"
        },
    }
}

export default CONFIG