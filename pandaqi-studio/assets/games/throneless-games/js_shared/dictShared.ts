import Point from "js/pq_games/tools/geometry/point"

enum CardType
{
    VOTE,
    THRONE,
    SEAT
}

enum ActionType
{
    HANDLE,
    REVEAL,
    WON,
    TELL,
    HIRE
}

interface DarkAction
{
    text: string,
    type: ActionType
}

interface PackData
{
    frame: number,
    clarification?: string,
    backstory?: string,
    animal?: string,
    colorClass?: string,

    name?: 
    {
        text?: string,
        colorTop?: string,
        colorTopDark?: string,
        colorBottom?: string,
        colorBottomDark?: string,
        offset?: Point,
        shadowOffset?: Point
    },

    dark?: (string|DarkAction)[],

    bg?: 
    {
        multicolor?: boolean,
        color?: string,
        colorDark?: string,
        icon?: 
        {
            scale?: number,
            offset?: Point,
            alpha?: number
        }
    },

    sigil?: 
    {
        scale?: number,
        offset?: Point // offset is usually scaled by card size, and relative to card center
        shadowColor?: string,
        shadowBlur?: number,
    },

    action?: 
    {
        text?: string,
        type?: ActionType,
        color?: string,
        colorDark?: string,
        offset?: Point,
        maxWidth?: number,
        percentage?: number, // how many of the cards actually GET an action
    },

    slogan?: 
    {
        text?: string,
        color?: string,
        colorDark?: string,
        offset?: Point, // this offset is relative to the bottom of the card
        alpha?: number,
        maxWidth?: number
    },

    separator?: 
    {
        color?: string,
        colorDark?: string,
        lineWidth?: number,
        iconSize?: number,
        length?: number
    },

    corner?: 
    {
        offset?: Point,
        scale?: number
    },

    edges?: 
    {
        color?: string,
        colorDark?: string,
        lineWidth?: number,
        lineScale?: Point, // how much of the full size it should take up
        insetScale?: number // how much the line is moved towards the center of the card
    },

    outline?: 
    {
        color?: string,
        colorDark?: string,
        width?: number
    }
}

const PACK_DEFAULT:PackData = 
{
    frame: 0,
    name: 
    {
        text: "Default Prince",
        colorTop: "#FFFFFF",
        colorTopDark: "#FFFFFF",
        colorBottom: "#000000",
        colorBottomDark: "#000000",
        offset: new Point(0, 0.082),
        shadowOffset: new Point(0, 0.015)
    },

    dark: [],

    bg: 
    {
        multicolor: false,
        color: "#FFFFFF",
        colorDark: "#BBBBBB",
        icon: {
            scale: 1.425,
            offset: new Point(0, -0.33),
            alpha: 0.125
        }
    },

    sigil: 
    {
        scale: 1.35/2,
        offset: new Point(0, -0.33), // offset is usually scaled by card size, and relative to card center
        shadowColor: "#00000099",
        shadowBlur: 0.05, // ~sizeUnit
    },

    action: 
    {
        text: "Main action text",
        color: "#000000",
        colorDark: "#FFFFFF",
        offset: new Point(0, 0.175),
        maxWidth: 0.805,
        percentage: 1.0, // how many of the cards actually GET an action
    },

    slogan: 
    {
        text: "Slogan here",
        color: "#000000",
        colorDark: "#FFFFFF",
        offset: new Point(0, -0.055), // this offset is relative to the bottom of the card
        alpha: 1.0,
        maxWidth: 0.68
    },

    separator: 
    {
        color: "#000000",
        colorDark: "#FFFFFF",
        lineWidth: 0.0066,
        iconSize: 0.062,
        length: 0.275
    },

    corner: 
    {
        offset: new Point(0.1, 0.1),
        scale: 0.1
    },

    edges: 
    {
        color: "#000000",
        colorDark: "#FFFFFF",
        lineWidth: 0.0066,
        lineScale: new Point(0.75, 0.85), // how much of the full size it should take up
        insetScale: 0.05 // how much the line is moved towards the center of the card
    },

    outline:
    {
        color: "#111111",
        colorDark: "#000000",
        width: 0.02
    }
}

const PACK_COLORS = 
{
    yellow: 
    {
        name: 
        {
            colorTop: "#000000",
            colorBottom: "#BFA400"
        },
        
        bg: 
        {
            color: "#FDF232",
            colorDark: "#706200"
        },
    },

    orange: 
    {
        name: 
        {
            colorTop: "#FFD8CD",
            colorBottom: "#2C0A00"
        },

        bg: 
        {
            color: "#FF4816",
            colorDark: "#840C07",
        },

        separator: 
        {
            color: "#FFFFFF"
        }
    },

    grey: 
    {
        name: 
        {
            colorTop: "#1F1F1F",
            colorBottom: "#FFFFFF"
        },

        bg: 
        {
            color: "#CACACA",
            colorDark: "#484848"
        },
    },

    white: 
    {
        name: 
        {
            colorTop: "#1F1F1F",
            colorBottom: "#FF8CEB"
        },

        bg: 
        {
            color: "#FFFFFF",
            colorDark: "#605050"
        },
    },

    brown: 
    {
        name: 
        {
            colorTop: "#551B00",
            colorBottom: "#FC7B58"
        },

        bg: 
        {
            color: "#FFB775",
            colorDark: "#B0490A"
        },
    },

    pink: 
    {
        name: 
        {
            colorTop: "#FEBEFF",
            colorBottom: "#49003C"
        },

        bg: 
        {
            color: "#FF2D86",
            colorDark: "#8A0020"
        },

        separator: 
        {
            color: "#FFFFFF"
        }
    },

    red: 
    {
        name: 
        {
            colorTop: "#FFC1BE",
            colorBottom: "#2E0200"
        },

        bg: 
        {
            color: "#FF352A",
            colorDark: "#8C0A00"
        },

        separator: 
        {
            color: "#FFFFFF"
        }
    },

    purple: 
    {
        name: 
        {
            colorTop: "#F4E8FF",
            colorBottom: "#1B0035"
        },

        bg: 
        {
            color: "#AB50FF",
            colorDark: "#4400B2"
        },

        separator: 
        {
            color: "#FFFFFF"
        }
    },

    bluedark: 
    {
        name: 
        {
            colorTop: "#D7DDFF",
            colorBottom: "#000734"
        },

        bg: 
        {
            color: "#4E67FF",
            colorDark: "#0011C0"
        },

        separator: 
        {
            color: "#FFFFFF"
        }
    },

    bluelight: 
    {
        name: 
        {
            colorTop: "#004F53",
            colorBottom: "#00B9C3"
        },

        bg: 
        {
            color: "#55F5FD",
            colorDark: "#007076"
        },
    },

    green: 
    {
        name: 
        {
            colorTop: "#1B5100",
            colorBottom: "#41C000"
        },

        bg: 
        {
            color: "#77EC3B",
            colorDark: "#005301"
        },
    },

    multicolor: 
    {
        name:
        {
            colorTop: "#000000",
            colorBottom: "#FFFFFF"
        },

        bg: 
        {
            multicolor: true
        },
    }
}

export
{
    PACK_DEFAULT,
    PACK_COLORS,
    PackData,
    ActionType,
    DarkAction,
    CardType
}