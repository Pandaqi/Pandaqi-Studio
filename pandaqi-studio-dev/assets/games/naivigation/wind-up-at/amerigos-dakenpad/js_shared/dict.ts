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
}

const KAARTEN:Record<string, GeneralData> =
{
    vooruit: { frame: 4, textureKey: "misc", set: "base", desc: "Ga vooruit." },
    achteruit: { frame: 5, textureKey: "misc", set: "base", desc: "Ga achteruit." },
    omdraaien: { frame: 6, textureKey: "misc", set: "base", desc: "Draai om." },
    sprong: { frame: 7, textureKey: "misc", set: "base", desc: "Spring over eerste vakje." },

    vooruit_dubbel: { frame: 8, textureKey: "paarden_sprongen", set: "paardenSprongen", desc: "Ga tweemaal vooruit." },
    achteruit_dubbel: { frame: 9, textureKey: "paarden_sprongen", set: "paardenSprongen", desc: "Ga tweemaal achteruit." },
    touw: { frame: 10, textureKey: "paarden_sprongen", set: "paardenSprongen", desc: "Alle kaarten na mij doen niks meer." },
    niks: { frame: 11, textureKey: "paarden_sprongen", set: "paardenSprongen", desc: "Vervang mij met een pakje uit je hand (na onthulling)." },
}

const ROUTEKAARTEN:Record<string,GeneralData> =
{
    niks: { desc: "Niks bijzonders." },
    huis: { desc: "Bezorg de aangegeven pakjes om het huis te scoren.", requiresGifts: true },
    puntdak: { frame: 0, textureKey: "gladdeDaken", set: "gladdeDaken", desc: "Amerigo <b>glijdt vooruit</b> naar het volgende vakje." }, // slecht/goed
    dief: { frame: 1, textureKey: "gladdeDaken", set: "gladdeDaken", desc: "Haal één gespeelde kaart voorgoed <b>uit het spel</b>." }, // slecht
    kasteel: { frame: 2, textureKey: "gladdeDaken", set: "gladdeDaken", desc: "Plaats Amerigo meteen op een <b>huiskaart</b>." }, // goed
    landkaart: { frame: 3, textureKey: "gladdeDaken", set: "gladdeDaken", desc: "Haal een kaart <b>uit</b> de route (zonder gevolgen)." }, // slecht
    verrekijker: { frame: 4, textureKey: "gladdeDaken", set: "gladdeDaken", desc: "Volgende ronde speelt iedereen met de kaarten <b>open</b>." }, // goed
    chocoladeletter: { frame: 5, textureKey: "gladdeDaken", set: "gladdeDaken", desc: "Volgende ronde <b>sorteer</b> je kaarten op <b>voornaam</b> (van spelers)." }, // slecht/goed
    pepernoot_dubbel: { frame: 6, textureKey: "gladdeDaken", set: "gladdeDaken", desc: "Volgende ronde speelt iedereen <b>twee</b> kaarten." }, // slecht/goed
    staf: { frame: 7, textureKey: "gladdeDaken", set: "gladdeDaken", desc: "<b>Vervang een huiskaart</b> met eentje niet in het spel." }, // slecht/goed
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