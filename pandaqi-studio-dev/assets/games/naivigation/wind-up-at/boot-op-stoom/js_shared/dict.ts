enum CardType
{
    PAWN = "pawn",
    BORD = "bord",
    VAREN = "varen",
    STOOMBOOT = "stoomboot",
    PAKJE = "pakje",
    KALENDER = "kalender"
}

interface GeneralData
{
    frame?: number,
    desc?: string,
    label?: string,
    freq?: number,
    set?: string|string[],
    needPakjes?: boolean, // only true for tiles that ask for specific packages to be delivered
    cantWish?: boolean, // certain package cards are so unique they can't really be "wished for" by tiles, set to true then
}

// @TODO: optionally reduce base game map to 4x4, because this is a lot of empty tiles doing nothing => but that'd need an exception to say "if using the expansions, go to 5x5!" which I don't want
const MAP_TILES:Record<string, GeneralData> =
{
    water: { frame: 0, freq: 9, set: "base" },
    rots: { frame: 1, freq: 8, set: "base" },
    huis: { frame: 2, freq: 8, set: "base", needPakjes: true },
    huis_speciaal: { frame: 3, freq: 5, set: "prachtigePakjes", needPakjes: true },
    kasteel: { frame: 4, freq: 2, set: "pepernootPlekken", desc: "Je mag alleen een pakjeskaart in je hand nemen als de Stoomboot in de buurt van het kasteel is." },
    bakkerij: { frame: 5, freq: 2, set: "pepernootPlekken", desc: "Als je hierop staat, mogen spelers Pepernoten uit hun hand wisselen voor een ander pakje naar keuze." },
    haven: { frame: 6, freq: 4, set: "pepernootPlekken", desc: "Je kunt alleen winnen als je elke haven hebt bezocht." },
    amerigo: { frame: 7, freq: 2, set: "pepernootPlekken", desc: "Als je hier staat gaat elke vaarinstructie dubbel." },
    speelgoedwinkel: { frame: 8, freq: 2, set: "pepernootPlekken", desc: "" }, // @TODO: of "fabriek"?
}

const PAKJE_CARDS:Record<string, GeneralData> =
{
    square: { frame: 0, freq: 4, set: "base" },
    circle: { frame: 1, freq: 4, set: ["base", "prachtigePakjes"], desc: "<b>Verplaats de Stoomboot</b> naar een andere tegel." },
    triangle: { frame: 2, freq: 4, set: ["base", "prachtigePakjes"], desc: "<b>Verplaats 3 tegels</b> van het bord naar een andere plek." }, // @TODO: theme deze dingen rondom Sinterklaas, waarbij één of twee eten moeten zijn voor de speciale Bakkerij tegel?
    wildcard: { frame: 3, freq: 2, set: "prachtigePakjes", desc: "Dit is <b>elk pakje</b> dat je maar wilt!" },
    duo: { frame: 4, freq: 3, set: "prachtigePakjes", desc: "<b>Kies</b> welke van deze twee pakjes de kaart voorstelt.", cantWish: true },
    telefoon: { frame: 5, freq: 3, set: "prachtigePakjes", desc: "Je mag <b>communiceren</b>! (Totdat je de volgende kaart onthult.)" },
}

const VAAR_CARDS:Record<string, GeneralData> =
{
    vooruit: { frame: 0, freq: 6, set: "base", desc: "Vaar vooruit." },
    draai_links: { frame: 1, freq: 5, set: "base", desc: "Draai kwartslag naar links." },
    draai_rechts: { frame: 2, freq: 5, set: "base", desc: "Draai kwartslag naar rechts." },
    achteruit: { frame: 3, freq: 2, set: "base", desc: "Vaar achteruit." },

    vooruit_dubbel: { frame: 4, freq: 2, set: "prachtigePakjes", desc: "Vaar tweemaal vooruit." },
    draai_dubbel: { frame: 5, freq: 2, set: "prachtigePakjes", desc: "Draai een halve slag." }, // dit is gewoon "draai om" = 180 graden
    achteruit_dubbel: { frame: 6, freq: 2, set: "prachtigePakjes", desc: "Vaar tweemaal achteruit." },
    anker: { frame: 7, freq: 2, set: "prachtigePakjes", desc: "Negeer alle kaarten hierna (in de Stoomrij)." },
}

const STOOM_CARDS:Record<string, GeneralData> =
{
    niks: { frame: 0, freq: 4, set: "base" },
    oog: { frame: 1, freq: 4, set: "base", desc: "Speel je kaart hier <b>open</b>." },
    pepernoot: { frame: 2, freq: 1, set: "prachtigePakjes", desc: "Hier mag alleen een <b>Pakje</b> worden gespeeld." },
    chocoladeletter: { frame: 3, freq: 1, set: "prachtigePakjes", desc: "Voer vaarkaarten hier <b>meteen</b> uit (zodra neergelegd)." },
    zak: { frame: 4, freq: 1, set: "prachtigePakjes", desc: "<b>Negeer</b> de kaart hier." },
    amerigo: { frame: 5, freq: 1, set: "prachtigePakjes", desc: "De kaart hier telt <b>dubbel</b>." },
    staf: { frame: 6, freq: 1, set: "prachtigePakjes", desc: "Voer vaarkaarten hier <b>omgekeerd</b> uit." },
    boek: { frame: 7, freq: 1, set: "prachtigePakjes", desc: "Vul <b>meteen</b> je hand aan tot 5 kaarten." },
}

const KALENDER_KAARTEN:Record<string, GeneralData> =
{
    niks: { frame: 0, label: "Rustige Avond", desc: "Niks bijzonders.", freq: 3 }, // slecht/goed
    intocht: { frame: 1, label: "Sinterklaasintocht", desc: "Voeg gratis twee Stoombootkaarten toe." }, // goed
    schoentje_zetten: { frame: 2, label: "Schoentje Zetten", desc: "Kies één speler. Diegene krijgt één kaart van alle andere spelers." }, // goed
    exploderende_pakjes: { frame: 3, label: "Exploderende Pakjes", desc: "Iedereen moet alle Pakjeskaarten wegdoen en nieuwe kaarten trekken van een andere soort." }, // slecht
    gezonken_boot: { frame: 4, label: "Gezonken Boot", desc: "Haal twee Stoombootkaarten weg." }, // slecht
    verdwaalde_piet: { frame: 5, label: "Verdwaalde Piet", desc: "Volgende ronde bepaal je <b>niet</b> zelf waar je jouw kaarten plaatst. Dat bepaalt de Sint voor jou." }, // slecht
    verkeerde_namen: { frame: 6, label: "Verkeerde Namen", desc: "Komende ronde moeten pakjes <b>later</b> in de rij komen als je ze wilt afleveren." }, // slecht/goed
    sneeuwstorm: { frame: 7, label: "Sneeuwstorm", desc: "Komende ronde werken speciale icoontjes in de Stoomrij <b>niet</b>." }, // slecht/goed
    journaal: { frame: 8, label: "Sinterklaasjournaal", desc: "Bekijk de komende 4 Kalenderkaarten." }, // goed
    gulzige_piet: { frame: 9, label: "Gulzige Piet", desc: "Iedereen met Pepernoten in de hand speelt volgende ronde <b>niet</b> mee." }, // slecht
    kapot_kompas: { frame: 10, label: "Kapot Kompas", desc: "Komende ronde mag je alleen <b>achteruit</b> en naar <b>links</b>." }, // slecht 
    boek_kwijt: { frame: 11, label: "Boek Kwijt", desc: "Komende ronde wil elk huis één extra pakje. (De soort daarvan mag alles zijn.)" } // slecht/goed
}

const MISC:Record<string, GeneralData> =
{

}

export {
    CardType,
    MISC,
    MAP_TILES,
    KALENDER_KAARTEN,
    PAKJE_CARDS,
    VAAR_CARDS,
    STOOM_CARDS,
    GeneralData
};