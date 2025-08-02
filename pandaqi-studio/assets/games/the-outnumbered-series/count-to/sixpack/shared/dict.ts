import Point from "js/pq_games/tools/geometry/point"

export interface PackData
{
    frame: number,
    mainNumber?: { strokeColor?:string, color?: string, offsetColor?:string, strokeWidth?:number },
    edgeNumber?: { strokeColor?:string, color?: string, offsetColor?:string, pos?: Point, strokeWidth?:number },
    outlineColor?: string
}

export const PACKS:Record<string,PackData> = 
{
    blank: 
    { 
        frame: 0, 
        mainNumber: {
            strokeColor: "#F3CE97",
            color: "#563400",
        },
        edgeNumber: {
            offsetColor: "#563400"
        }
    },

    reverse: 
    { 
        frame: 1,
        mainNumber: {
            strokeColor: "#FFB8B7",
            color: "#820805"
        },
        edgeNumber: {
            offsetColor: "#320100",
            pos: new Point(0.1225, 0.09)
        }
    },

    seethrough: 
    { 
        frame: 2,
        mainNumber: {
            strokeColor: "#D9EFF7",
            color: "#18627B"
        },
        edgeNumber: {
            offsetColor: "#04222C",
            pos: new Point(0.11, 0.1)
        }
    },

    takeback: 
    { 
        frame: 3,
        mainNumber: {
            strokeColor: "#F6FF92",
            color: "#4D8121"
        },
        edgeNumber: {
            offsetColor: "#1A3900",
            pos: new Point(0.125, 0.1)
        }
    },

    secondHand: 
    { 
        frame: 4,
        mainNumber: {
            strokeColor: "#FFE7CF",
            color: "#704018"
        },
        edgeNumber: {
            offsetColor: "#6C3100",
            pos: new Point(0.1425, 0.1)
        }
    },

    bitingHand: 
    { 
        frame: 5,
        mainNumber: {
            strokeColor: "#BBBBBB",
            color: "#000000"
        },
        edgeNumber: {
            offsetColor: "#494949",
            pos: new Point(0.115, 0.1)
        }
    },
    
    sheriff: 
    { 
        frame: 6,
        mainNumber: {
            strokeColor: "#F0C441",
            color: "#5D1B00"
        },
        edgeNumber: {
            offsetColor: "#E36938",
            pos: new Point(0.115, 0.1)
        }
    },

    sticky: 
    { 
        frame: 7,
        mainNumber: {
            strokeColor: "#E9C0FF",
            color: "#341744"
        },
        edgeNumber: {
            offsetColor: "#0E0016",
            pos: new Point(0.115, 0.1)
        }
    },

    noSuperheroes: 
    { 
        frame: 8,
        mainNumber: {
            strokeColor: "#FFC3DE",
            color: "#970045"
        },
        edgeNumber: {
            offsetColor: "#FF51A0",
            pos: new Point(0.105, 0.1)
        }
    },

    carousel: 
    { 
        frame: 9,
        mainNumber: {
            strokeColor: "#D4EAFF",
            color: "#0A2857"
        },
        edgeNumber: {
            offsetColor: "#396DC0",
            pos: new Point(0.1025, 0.1)
        }
    },

    superNumbers: 
    { 
        frame: 10,
        mainNumber: {
            strokeColor: "#E3E3E3",
            color: "#2F2F2F"
        },
        edgeNumber: {
            offsetColor: "#000000",
            pos: new Point(0.105, 0.1)
        }
    },

    pileDriver: 
    { 
        frame: 11,
        mainNumber: {
            strokeColor: "#D9FFE4",
            color: "#004013"
        },
        edgeNumber: {
            offsetColor: "#007121",
            pos: new Point(0.125, 0.1)
        }
    },

    copycat: 
    { 
        frame: 12,
        mainNumber: {
            strokeColor: "#FFFB68",
            color: "#504E00"
        },
        edgeNumber: {
            offsetColor: "#343200",
            pos: new Point(0.114, 0.095)
        }
    },

    lateArrival: 
    { 
        frame: 13,
        mainNumber: {
            strokeColor: "#AEFFF3",
            color: "#006D5C"
        },
        edgeNumber: {
            offsetColor: "#003A32",
            pos: new Point(0.1125, 0.1)
        }
    },

    calculator: 
    { 
        frame: 14,
        mainNumber: {
            strokeColor: "#D9E2FF",
            color: "#002699"
        },
        edgeNumber: {
            offsetColor: "#001451",
            pos: new Point(0.11, 0.1)
        }
    },

    veto: 
    { 
        frame: 15,
        mainNumber: {
            strokeColor: "#FFDBD1",
            color: "#671500"
        },
        edgeNumber: {
            offsetColor: "#3C0D00",
            pos: new Point(0.105, 0.1)
        }
    },
}