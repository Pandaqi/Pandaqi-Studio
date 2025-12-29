
interface GeneralData
{
    frame?: number,
    desc?: string,
    tint?: string,
    label?: string
}

export const SPECIAL_CARDS:Record<string,GeneralData> =
{
    invert: { frame: 0, desc: "<b>Inverts</b> the challenge. (Lowest <> Highest.)" },
    tiebreak: { frame: 1, desc: "If it's a <b>tie</b>, <i>you win</i> and <i>your opponent loses</i>." },
    steal: { frame: 2, desc: "<b>Steal</b> one card of choice from <i>the opponent's die</i>." },
    beggar: { frame: 3, desc: "If the <i>opponent</i> rolled a <i>1 or 6</i>, <b>you win</b>." },
    numberless: { frame: 4, desc: "<b>Nothing happens</b> after the battle, but this card is <i>discarded</i>." },
}

export const MISC:Record<string, GeneralData> =
{
    1: { frame: 0, label: "One", tint: "#ff0000" },
    2: { frame: 1, label: "Two", tint: "#d0b900" },
    3: { frame: 2, label: "Three", tint: "#3bd900" },
    4: { frame: 3, label: "Four", tint: "#00c5aa" },
    5: { frame: 4, label: "Five", tint: "#8eb4ff" },
    6: { frame: 5, label: "Six", tint: "#e073ff" },
    dice_icon: { frame: 6 },
    cup_icon: { frame: 7 },
}

export const TEMPLATES:Record<string, GeneralData> =
{
    bg_regular: { frame: 0 },
    tint_regular: { frame: 1 },
    bg_special: { frame: 2 },
    tint_special: { frame: 3 }
}