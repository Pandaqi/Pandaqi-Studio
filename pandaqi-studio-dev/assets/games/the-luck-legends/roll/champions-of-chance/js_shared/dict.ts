
interface GeneralData
{
    frame?: number,
    desc?: string,
}

const SPECIAL_CARDS:Record<string,GeneralData> =
{
    invert: { frame: 0, desc: "Inverts the challenge. (Lowest <-> Highest.)" },
    tiebreak: { frame: 1, desc: "If it's a tie, you win and the other player loses." },
    steal: { frame: 2, desc: "Steal one card of choice from the opponent's die." },
    beggar: { frame: 3, desc: "If the other player rolled a 1 or 6, you win." },
    numberless: { frame: 4, desc: "Nothing happens after the battle, but this card is discarded." },
}

const MISC:Record<string, GeneralData> =
{

}

export 
{
    MISC,
    SPECIAL_CARDS
}