export enum CardType
{
    PAWN = "pawn",
    BORD = "bord",
    VAREN = "varen",
    STOOMBOOT = "stoomboot",
    PAKJE = "pakje",
    KALENDER = "kalender"
}

export interface GeneralData
{
    frame?: number,
    desc?: string,
    label?: string,
    freq?: number,
    set?: string|string[],
    needPakjes?: boolean, // only true for tiles that ask for specific packages to be delivered
    cantWish?: boolean, // certain package cards are so unique they can't really be "wished for" by tiles, set to true then
    cantDuo?: boolean, // if set to true, it can't be randomly picked as an option for a duo card
}

export const MAP_TILES:Record<string, GeneralData> =
{
    water: { frame: 0, freq: 9, set: "base" },
    rots: { frame: 1, freq: 8, set: "base" },
    huis: { frame: 2, freq: 8, set: "base", needPakjes: true },
    huis_speciaal: { frame: 3, freq: 5, set: "prachtigePakjes", needPakjes: true },
    kasteel: { frame: 4, freq: 2, set: "pepernootPlekken", desc: "Je mag alleen een pakjeskaart in je hand nemen als de Stoomboot naast het kasteel is. (Horizontaal, verticaal of diagonaal.)", label: "Kasteel" },
    bakkerij: { frame: 5, freq: 2, set: "pepernootPlekken", desc: "Als je hierop staat, mogen spelers Pepernoten uit hun hand wisselen voor een ander pakje naar keuze.", label: "Bakkerij" },
    haven: { frame: 6, freq: 4, set: "pepernootPlekken", desc: "Je kunt alleen winnen als je elke haven hebt bezocht.", label: "Haven" },
    amerigo: { frame: 7, freq: 2, set: "pepernootPlekken", desc: "Als je hier staat gaat elke vaarinstructie dubbel.", label: "Amerigo" },
    speelgoedwinkel: { frame: 8, freq: 2, set: "pepernootPlekken", desc: "Als een speler 4 verschillende vaarkaarten kan inleveren, mag je de Stoomboot teleporteren naar elk ander vakje.", label: "Winkel" }, // of "fabriek"?
}

export const PAKJE_CARDS:Record<string, GeneralData> =
{
    square: { frame: 0, freq: 4, set: "base" },
    circle: { frame: 1, freq: 4, set: ["base", "prachtigePakjes"], desc: "<b>Verplaats de Stoomboot</b> naar een andere tegel." },
    pepernoot: { frame: 2, freq: 4, set: ["base", "prachtigePakjes"], desc: "<b>Verplaats 3 tegels</b> van het bord naar een andere plek." },
    wildcard: { frame: 3, freq: 4, set: "prachtigePakjes", desc: "Dit is <b>elk pakje</b> dat je maar wilt!", cantDuo: true },
    duo: { frame: 4, freq: 4, set: "prachtigePakjes", desc: "<b>Kies</b> welke van deze twee pakjes de kaart voorstelt.", cantWish: true, cantDuo: true },
    telefoon: { frame: 5, freq: 4, set: "prachtigePakjes", desc: "Je mag <b>communiceren</b>! (Totdat je de volgende kaart onthult.)" },
}

export const VAAR_CARDS:Record<string, GeneralData> =
{
    vooruit: { frame: 0, freq: 6, set: "base", desc: "Vaar vooruit." },
    draai_links: { frame: 1, freq: 5, set: "base", desc: "Draai een kwartslag naar links." },
    draai_rechts: { frame: 2, freq: 5, set: "base", desc: "Draai een kwartslag naar rechts." },
    achteruit: { frame: 3, freq: 2, set: "base", desc: "Vaar achteruit." },

    vooruit_dubbel: { frame: 4, freq: 2, set: "prachtigePakjes", desc: "Vaar tweemaal vooruit." },
    draai_dubbel: { frame: 5, freq: 2, set: "prachtigePakjes", desc: "Draai een halve slag." }, // dit is gewoon "draai om" = 180 graden
    achteruit_dubbel: { frame: 6, freq: 2, set: "prachtigePakjes", desc: "Vaar tweemaal achteruit." },
    anker: { frame: 7, freq: 2, set: "prachtigePakjes", desc: "Negeer alle kaarten hierna (in de Stoomrij)." },
}

export const STOOM_CARDS:Record<string, GeneralData> =
{
    niks: { frame: 0, freq: 4, set: "base", desc: "Niks bijzonders.", label: "Niks" },
    oog: { frame: 1, freq: 4, set: "base", desc: "Speel je kaart hier <b>open</b>.", label: "Oog" },
    pepernoot: { frame: 2, freq: 1, set: "prachtigePakjes", desc: "Hier mag alleen een <b>Pakje</b> worden gespeeld.", label: "Pepernoot" },
    chocoladeletter: { frame: 3, freq: 1, set: "prachtigePakjes", desc: "Voer vaarkaarten hier <b>meteen</b> uit (zodra neergelegd).", label: "Letter" },
    zak: { frame: 4, freq: 1, set: "prachtigePakjes", desc: "<b>Negeer</b> de kaart hier.", label: "Zak" },
    amerigo: { frame: 5, freq: 1, set: "prachtigePakjes", desc: "De kaart hier telt <b>dubbel</b>.", label: "Amerigo" },
    staf: { frame: 6, freq: 1, set: "prachtigePakjes", desc: "Voer vaarkaarten hier <b>omgekeerd</b> uit.", label: "Staf" },
    boek: { frame: 7, freq: 1, set: "prachtigePakjes", desc: "Vul <b>meteen</b> je hand aan tot 5 kaarten.", label: "Boek" },
}

export const KALENDER_KAARTEN:Record<string, GeneralData> =
{
    niks: { frame: 0, label: "Rustige Avond", desc: "Niks bijzonders.", freq: 3 }, // slecht/goed
    intocht: { frame: 1, label: "Sinterklaasintocht", desc: "<b>Voeg</b> gratis 2 Stoombootkaarten <b>toe</b>." }, // goed
    schoentje_zetten: { frame: 2, label: "Schoentje Zetten", desc: "Kies één speler. Diegene krijgt 1 kaart van <b>alle andere spelers</b>." }, // goed
    exploderende_pakjes: { frame: 3, label: "Exploderende Pakjes", desc: "Iedereen moet alle <b>Pakjeskaarten afleggen</b> en nieuwe kaarten trekken van een <b>andere soort.</b>" }, // slecht
    gezonken_boot: { frame: 4, label: "Gezonken Boot", desc: "<b>Haal</b> 2 Stoombootkaarten <b>weg</b>." }, // slecht
    verdwaalde_piet: { frame: 5, label: "Verdwaalde Piet", desc: "Volgende ronde bepaal je <b>niet</b> zelf waar je jouw kaarten plaatst. Dat bepaalt de Sint voor jou." }, // slecht
    verkeerde_namen: { frame: 6, label: "Verkeerde Namen", desc: "Komende ronde moeten pakjes <b>later</b> in de rij komen als je ze wilt afleveren." }, // slecht/goed
    sneeuwstorm: { frame: 7, label: "Sneeuwstorm", desc: "Komende ronde werken speciale icoontjes in de Stoomrij <b>niet</b>." }, // slecht/goed
    journaal: { frame: 8, label: "Sinterklaasjournaal", desc: "<b>Bekijk</b> de komende 4 Kalenderkaarten." }, // goed
    gulzige_piet: { frame: 9, label: "Gulzige Piet", desc: "Iedereen met <b>Pepernoten</b> in de hand speelt volgende ronde <b>niet</b> mee." }, // slecht
    kapot_kompas: { frame: 10, label: "Kapot Kompas", desc: "Komende ronde mag je alleen <b>achteruit</b> en naar <b>links</b>." }, // slecht 
    boek_kwijt: { frame: 11, label: "Boek Kwijt", desc: "Komende ronde wil elk huis <b>1 extra pakje</b>. (De soort daarvan mag alles zijn.)" } // slecht/goed
}

export const CARD_TEMPLATES:Record<string, GeneralData> =
{
    stoomboot_bg: { frame: 0 },
    stoomboot_overlay: { frame: 1 },
    varen_bg: { frame: 2 },
    varen_overlay: { frame: 3 },
    pakje_bg: { frame: 4 },
    pakje_overlay: { frame: 5 },
    pawn: { frame: 6 },
    kalender_bg: { frame: 7 },
    kalender_overlay: { frame: 8 },
}