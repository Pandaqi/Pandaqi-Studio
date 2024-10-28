import Point from "js/pq_games/tools/geometry/point"

enum CardType
{
    REGULAR = "regular",
    ACTION = "action",
    SINT = "sint",
}

enum ColorType
{
    PURPLE = "purple",
    BLUE = "blue",
    GREEN = "green",
    BROWN = "brown"
}

interface GeneralData
{
    frame?: number,
    desc?: string,
    freq?: number,
    light?: string, // a hex color
    dark?: string, // a hex color
    label?: string,
}

const MISC:Record<string, GeneralData> =
{
    [ColorType.PURPLE]: { frame: 0, dark: "#500063", light: "#F793FF", label: "Cirkel" },   
    [ColorType.BLUE]: { frame: 1, dark: "#004589", light: "#ABDEFF", label: "Vierkant" },   
    [ColorType.GREEN]: { frame: 2, dark: "#2b6c04", light: "#98E864", label: "Driehoek" },   
    [ColorType.BROWN]: { frame: 3, dark: "#764300", light: "#fAB44f", label: "Ster" },  
    mijter: { frame: 4 },
    sint: { frame: 5, dark: "#7b0003", light: "#ff8484" }, 
    surprise: { frame: 6 }, // sterretje
    bieden: { frame: 7 }, // geld/chip
}

const ACTIEPIETEN:Record<string, GeneralData> =
{
    stafpiet: { frame: 0, label: "Stafpiet", desc: "Jij wordt direct <b>de Sint</b>." },
    acteerpiet: { frame: 1, label: "Acteerpiet", desc: "Deze kaart is <b>elke kleur</b> en <b>elk getal</b> dat je wilt.", freq: 3 },
    hoofdpiet: { frame: 2, label: "Hoofdpiet", desc: "<b>Spoel vooruit</b> naar de volgende onthulling." },
    indipietje: { frame: 3, label: "Indipietje Jones", desc: "<b>Verwissel</b> één handkaart met één uit de Pakjeskamer.", freq: 3 },
    hardlooppiet: { frame: 4, label: "Hardlooppiet", desc: "<b>Scoor</b> nu meteen deze ronde.", freq: 2 },
    rekenpiet: { frame: 5, label: "Rekenpiet", desc: "Alleen combinaties qua <b>getal</b> tellen." },
    kleurpiet: { frame: 6, label: "Kleurpiet", desc: "Alleen combinaties qua <b>kleur</b> tellen." }, 
    omdenkpiet: { frame: 7, label: "Omdenkpiet", desc: "Elk bod is evenveel waard als het <b>aantal kaarten</b> (ipv totale waarde)." },
    crimepiet: { frame: 8, label: "Crimepiet", desc: "<b>Steel 2</b> willekeurige kaarten van andere spelers.", freq: 3 }, 
    brilpiet: { frame: 9, label: "Brilpiet", desc: "<b>Bekijk</b> de handkaarten van 2 andere spelers.", freq: 2 },
    pokerpiet: { frame: 10, label: "Poker(face)piet", desc: "De rest van de ronde mag <b>niemand hun handkaarten zien</b>." }, 
    achtbaanpiet: { frame: 11, label: "Achtbaanpiet", desc: "Deze ronde gaan beurten <b>tegen de klok in</b>." },
    competitief: { frame: 12, label: "Pietje Competitief", desc: "Deze ronde ga je <b>door met bieden</b> totdat ieders bod gelijk is." },
    profiteer: { frame: 13, label: "Pietje Profiteer", desc: "Als deze ronde <b>precies gelijk</b> eindigt, dan <b>win jij</b>." },

    // freq = 0 to prevent it being added in the ACTIEPIET expansion too
    pietje_precies: { frame: 14, label: "Pietje Precies", desc: "Bij het maken van je combinatie moet je <b>1 kaart wegstrepen</b>.", freq: 0 }, 
}

const CARD_TEMPLATES:Record<string, GeneralData> =
{
    bg: { frame: 0 },
    action_overlay: { frame: 1 },
}

const POSITION_INDICES:number[][] = [
    [],
    [4], // 1; sanity check
    [2,6], // 2
    [2,4,6], // 3
    [0,2,6,8], // 4
    [0,2,4,6,8], // 5
    [0,2,3,5,6,8], // 6
]

const ICON_POSITIONS:Point[] = [
    new Point(-1, -0.7), new Point(0, -0.85), new Point(1, -1), // top row
    new Point(-1, 0.15), new Point(0, 0), new Point(1, -0.15), // middle row
    new Point(-1, 1.0), new Point(0, 0.85), new Point(1, 0.7), // bottom row
]

export {
    CardType,
    ColorType,
    MISC,
    ACTIEPIETEN,
    CARD_TEMPLATES,
    POSITION_INDICES,
    ICON_POSITIONS,
};