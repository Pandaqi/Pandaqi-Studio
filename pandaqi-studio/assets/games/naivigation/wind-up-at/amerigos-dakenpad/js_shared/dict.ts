enum CardType
{
    PAWN = "pawn",
    ROUTE = "route",
    VAREN = "varen",
    PAKJE = "pakje",
}

enum GiftType
{
    SQUARE = "square",
    CIRCLE = "circle",
    TRIANGLE = "triangle"
}

interface GeneralData
{
    frame?: number,
    desc?: string,
    textureKey?: string,
    set?: string,
    requiresGifts?: boolean,
    customScale?: number
}

const KAARTEN:Record<string, GeneralData> =
{
    vooruit: { frame: 4, textureKey: "misc", set: "base", desc: "Ga vooruit." },
    achteruit: { frame: 5, textureKey: "misc", set: "base", desc: "Ga achteruit." },
    omdraaien: { frame: 6, textureKey: "misc", set: "base", desc: "Draai om." },
    sprong: { frame: 7, textureKey: "misc", set: "base", desc: "Spring over het eerste vakje." },

    vooruit_dubbel: { frame: 0, textureKey: "paarden_sprongen", set: "paardenSprongen", desc: "Ga tweemaal vooruit." },
    achteruit_dubbel: { frame: 1, textureKey: "paarden_sprongen", set: "paardenSprongen", desc: "Ga tweemaal achteruit." },
    touw: { frame: 2, textureKey: "paarden_sprongen", set: "paardenSprongen", desc: "Alle Paardkaarten vóór mij doen niks.", customScale: 0.75 },
    niks: { frame: 3, textureKey: "paarden_sprongen", set: "paardenSprongen", desc: "Vervang mij met een andere handkaart.", customScale: 0.75 },
}

const ROUTEKAARTEN:Record<string,GeneralData> =
{
    niks: { desc: "Niks bijzonders.", textureKey: "none" },
    huis: { desc: "Bezorg de aangegeven pakjes om het huis te scoren.", textureKey: "misc", requiresGifts: true },
    puntdak: { frame: 0, textureKey: "gladde_daken", set: "gladdeDaken", desc: "Amerigo <b>glijdt vooruit</b> naar het volgende vakje." }, // slecht/goed
    dief: { frame: 1, textureKey: "gladde_daken", set: "gladdeDaken", desc: "Haal <b>twee</b> gespeelde kaarten voorgoed <b>uit het spel</b>." }, // slecht
    kasteel: { frame: 2, textureKey: "gladde_daken", set: "gladdeDaken", desc: "Plaats Amerigo meteen op de dichtstbijzijnde <b>huiskaart</b>." }, // goed
    landkaart: { frame: 3, textureKey: "gladde_daken", set: "gladdeDaken", desc: "<b>Verwijder</b> een <b>niet-huiskaart</b> uit de route." }, // slecht
    verrekijker: { frame: 4, textureKey: "gladde_daken", set: "gladdeDaken", desc: "Speel volgende ronde <b>om de beurt</b> (met klok mee), met <b>open kaarten</b>." }, // goed
    chocoladeletter: { frame: 5, textureKey: "gladde_daken", set: "gladdeDaken", desc: "Volgende ronde <b>sorteer</b> je kaarten op <b>voornaam</b> (van spelers)." }, // slecht/goed
    pepernoot_dubbel: { frame: 6, textureKey: "gladde_daken", set: "gladdeDaken", desc: "Volgende ronde speelt iedereen <b>tweemaal zoveel</b> kaarten (als normaal)." }, // slecht/goed
    staf: { frame: 7, textureKey: "gladde_daken", set: "gladdeDaken", desc: "<b>Vervang een huiskaart</b> met eentje niet in het spel." }, // slecht/goed
}

const MISC:Record<string, GeneralData> =
{
    home_0: { frame: 0 },
    home_1: { frame: 1 },
    home_2: { frame: 2 },
    home_3: { frame: 3 },
    pakje_square: { frame: 12 },
    pakje_circle: { frame: 13 },
    pakje_triangle: { frame: 14 }
}

const CARD_TEMPLATES:Record<string, GeneralData> =
{
    route_bg: { frame: 0 },
    route_overlay: { frame: 1 },
    varen_bg: { frame: 2 },
    varen_overlay: { frame: 3 },
    pakje_bg: { frame: 4 },
    pakje_overlay: { frame: 5 },
    pawn: { frame: 6 }
}

export {
    CardType,
    GiftType,
    MISC,
    CARD_TEMPLATES,
    KAARTEN,
    ROUTEKAARTEN,
};