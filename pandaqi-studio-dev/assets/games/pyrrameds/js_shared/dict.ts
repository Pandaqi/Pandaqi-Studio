
enum CardType
{
    MEDICINE,
    PATIENT,
    SPECIAL
}

interface GeneralData
{
    frame?: number,
    set?: string,
    freq?: number,
    bgColor?: string,
    textColor?: string,
    desc?: string,
    type?: SpecialActionType,
    invertTexture?: boolean
}

const MEDICINE:Record<string,GeneralData> =
{
    red: { frame: 0, set: "base", bgColor: "#FCAFBF", textColor: "#3C000F" },
    blue: { frame: 1, set: "base", bgColor: "#AFAFFC", textColor: "#000F3C" },
    green: { frame: 2, set: "base", bgColor: "#AFFCBF", textColor: "#003C0F" },
    orange: { frame: 3, set: "base", bgColor: "#FCAF86", textColor: "#3C2913" },
    purple: { frame: 4, set: "intensiveCare", bgColor: "#FCAFFC", textColor: "#3C0F3C" },
    turquoise: { frame: 5, set: "intensiveCare", bgColor: "#AFFCFC", textColor: "#0F3C3C" },
    wildcard: { frame: 6, set: "intensiveCare", bgColor: "#CCCCCC", textColor: "#3C3C3C" },
    yellow: { frame: 7, set: "never", bgColor: "#FCFCAF", textColor: "#3C3C0F" }
}

const PATIENTS:Record<string,GeneralData> =
{
    patient_circle: { frame: 0, set: "never" },
    dog: { frame: 1, set: "base" },
    cat: { frame: 2, set: "base" },
    rabbit: { frame: 3, set: "base" },
    sheep: { frame: 4, set: "base" },
    bird: { frame: 5, set: "base" },
    guinea_pig: { frame: 6, set: "intensiveCare" },
    mouse: { frame: 7, set: "intensiveCare" },
}

const CARD_TEMPLATES:Record<string,GeneralData> =
{
    [CardType.MEDICINE]: { frame: 0, bgColor: "#CCCCCC" },
    [CardType.PATIENT]: { frame: 1, bgColor: "#FFFFFF" },
    [CardType.SPECIAL]: { frame: 2, bgColor: "#000000", invertTexture: true },
    bg_1: { frame: 3 },
    bg_2: { frame: 4 },
    bg_3: { frame: 5 }
}

enum SpecialActionType
{
    ONCE,
    ALWAYS
}

const SPECIAL_ACTIONS:Record<string,GeneralData> =
{
    remove: { desc: "<b>Remove</b> 1 card from the pyramid.", type: SpecialActionType.ONCE },
    add: { desc: "<b>Add</b> 1 card to the pyramid (ignoring all other rules).", type: SpecialActionType.ONCE },
    extend: { desc: "<b>Extend</b> a layer in the pyramid with 1 card beyond its limit.", type: SpecialActionType.ONCE },
    swap_hand: { desc: "<b>Swap</b> 1 card from the pyramid with 1 <b>from your hand</b>.", type: SpecialActionType.ONCE },
    see_hand: { desc: "<b>See</b> the entire hand of another player.", type: SpecialActionType.ONCE },
    replace_hand: { desc: "<b>Replace up to 3 hand cards</b> with ones from the deck.", type: SpecialActionType.ONCE },
    patient_easy: { desc: "Play a <b>patient card</b> while ignoring one of their <b>requirements</b>.", type: SpecialActionType.ONCE },

    path_teleport: { desc: "When checking for patient paths, this card allows <b>teleporting</b> to another teleport action card", freq: 3, type: SpecialActionType.ALWAYS },
    path_backtrack: { desc: "Paths are allowed to <b>backtrack once</b>.", type: SpecialActionType.ALWAYS },
    path_error: { desc: "Paths are allowed to include <b>1 wrong card</b>.", type: SpecialActionType.ALWAYS },
    swap_adjacent: { desc: "You may only <b>swap adjacent cards</b> in the pyramid.", type: SpecialActionType.ALWAYS },
    swap_no_reveal: { desc: "You <b>don't reveal</b> a matching card to swap 2 cards.", type: SpecialActionType.ALWAYS },
    patient_reward_extra: { desc: "On patient reward, cards other players show you must <b>match type</b> with the specific requirements (if possible).", type: SpecialActionType.ALWAYS } // @TODO: This one might be too difficult if I want to keep text short ...
}

export {
    CardType,
    MEDICINE,
    PATIENTS,
    CARD_TEMPLATES,
    SPECIAL_ACTIONS
}

