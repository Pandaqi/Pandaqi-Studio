
interface GeneralData
{
    frame?: number,
    desc?: string,
    label?: string,
    freq?: number
}

// Only symbols that actually have a special unique action are present here
// Most letters/numbers/glyphs are just themselves and nothing more.
export const SYMBOLS:Record<string, GeneralData> =
{
    ".": { frame: 0, label: "Period", desc: "I cut the cards into <i>smaller groups</i>. Tap the highest letter <i>within its group</i> to win.", freq: 3 },
    "?": { frame: 1, label: "Question Mark", desc: "I'm <i>any letter you need</i> to spell an existing word. Never tap me otherwise.", freq: 4 },
    "!": { frame: 2, label: "Exclamation Mark", desc: "If there are <i>more exclamation marks</i> than letters, tap me.", freq: 5 },

    "+": { frame: 3, label: "Plus Sign", desc: "I am the same letter as my <i>highest neighbor</i>, but <i>1 higher</i>.", freq: 2 },
    "-": { frame: 4, label: "Minus Sign", desc: "I am the same letter as my <i>highest neighbor</i>, but <i>1 lower</i>.", freq: 2 },
    " ": { frame: 5, label: "Space", desc: "<i>Ignore</i> me entirely.", freq: 3 },
    "&": { frame: 6, label: "Ampersand", desc: "I connect my neighbors: their <i>ranking</i> is equal to the <i>sum</i> of both their individual rankings.", freq: 2 },
    "*": { frame: 7, label: "Asterisk", desc: "If there are <i>more non-letters</i> than letters, tap me." },
    "@": { frame: 8, label: "Monkeytail", desc: "If next to the <i>highest card</i> (of the round), tap me instead." }, // FUN FACT: This is a joke. It's actually just called an At Sign in English. However, in Dutch, these are affectionately called an "Apestaartje", which translates to "Monkey's Tail".
    "~": { frame: 9, label: "Tilde", desc: "Tap <i>any</i> card (except me) to win the round." },
    "#": { frame: 10, label: "Pound Sign", desc: "Tap the <i>lowest ranking card</i> instead to win the round.", freq: 4 },
}