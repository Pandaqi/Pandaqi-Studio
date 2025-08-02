import Point from "js/pq_games/tools/geometry/point"

interface PriceTagSpot
{
    pos: Point,
    flip?: boolean
}

//
// all possible types that can appear on tiles
//
interface TileTypeData
{
    frame: number,
    val: number, // this is their first number; all other numbers are higher and generated automatically
    freq?: number, // how many higher-numbered copies to make (otherwise goes to default in config)
    actions?: string[], // its action (always the same; left out if no action at all)
    label?: string, // the displayed name of this weird product
    set?: string,
    tags?: PriceTagSpot[], // possible spots to attach the price tag
    color: string, // background color, must be key from COLORS dict
}

export const TYPES:Record<string, TileTypeData> =
{
    //
    // base game
    //
    headphones: { frame: 0, val: 1, label: "Headgrowns", actions: ["If scored, I make all your items worth <b>$1 more</b>.", "If scored, I make all your items worth <b>$1 less</b>."], set: "base", tags: [{ pos: new Point(796, 446) }, { pos: new Point(276, 421), flip: true }], color: "green" }, // headphones with flowers growing out
    smartphone: { frame: 1, val: 2, label: "Swatphone", actions: ["From now on, ignore all <b>actions</b> on tiles", "From now on, only use tiles <b>with actions</b> (to offer or bid)."], set: "base", tags: [{ pos: new Point(86, 946) }, { pos: new Point(674, 164) }], color: "magenta" }, // a phone that's also a fly swatter
    lawn_mower: { frame: 2, val: 4, label: "Flown Mower", actions: ["From now on, you <b>can't</b> play a type that's <b>already present</b>.", "From now on, you <b>must</b> play a type that's <b>already present</b>."], set: "base", tags: [{ pos: new Point(788, 738) }, { pos: new Point(299, 684), flip: true }], color: "blue" }, // lawn mower that has wings and teeth
    laptop: { frame: 3, val: 7, label: "Laptopple", actions: ["Instantly perform an <b>auction</b>.", "<b>Nobody</b> can declare an auction in the <b>next 3 turns</b>."], set: "base", tags: [{ pos: new Point(434, 540) }, { pos: new Point(820, 867) }, { pos: new Point(453, 182), flip: true }], color: "purple" }, // multiple laptops with weird shapes stacked on top of each other, and the stack is askew, falling, toppling over
    walkietalkie: { frame: 4, val: 10, label: "Walkie-Barkie", actions: ["Whoever wins this auction only gets the tiles <b>after</b> this one.", "Whoever wins this auction also wins all the <b>bids</b> (except their own)."], set: "base", tags: [{ pos: new Point(242, 105) }, { pos: new Point(724, 791) }, { pos: new Point(430, 729), flip: true }], color: "orange" }, // walkie-talkie with a puppy's ears and tail
    camerat: { frame: 5, val: 15, label: "Camerat", set: "base", tags: [{ pos: new Point(426, 455) }, { pos: new Point(652, 761) }, { pos: new Point(277, 153), flip: true }], color: "brown" }, // a camera shaped like a rat
    dishsmasher: { frame: 6, val: 20, label: "Dishsmasher", set: "base", tags: [{ pos: new Point(658, 737) }, { pos: new Point(345, 481), flip: true }], color: "red" }, // a dishwasher with knives and saws attached everywhere
    refrigerator: { frame: 7, val: 30, label: "Refrigergator", actions: ["From now on, tiles must be played in <b>ascending order</b> based on <b>price tag</b>.", "From now on, tiles must be <b>lower</b> than the previous in the offer."], set: "base", tags: [{ pos: new Point(168, 827) }, { pos: new Point(800, 475) }, { pos: new Point(349, 189), flip: true }], color: "turquoise" }, // a green refrigerator, the front has alligator face, back has alligator tail
    wrist_watch: { frame: 8, val: 40, label: "Wrist Wash", actions: ["This auction, you <b>can't skip</b>.", "This auction, if you <b>skip</b>, you must pay <b>3 scored tiles</b> and add nothing to the offer."], set: "base", tags: [{ pos: new Point(526, 645) }, { pos: new Point(513, 223), flip: true }], color: "cyan" }, // a wrist watch with showerheads on all sides spewing water and making your arm wet
    washing_machine: { frame: 9, val: 50, label: "Cashing Machine", actions: ["This auction <b>can't</b> be inverted.", "This auction is <b>inverted</b>; this overrules everything else."], set: "base", tags: [{ pos: new Point(528, 305) }, { pos: new Point(588, 851) }, { pos: new Point(303, 427), flip: true }], color: "yellow" }, // a washing machine filled with coins and money exploding out of it

    //
    // odd inventions (these go into negative numbers)
    //
    hair_dryer: { frame: 10, val: -1, label: "Bear Dryer", actions: ["Everyone who added tiles with <b>negative prices</b> must now score those.", "This auction, only players who added tiles with <b>negative prices</b> may bid."], set: "oddInventions", tags: [{ pos: new Point(608, 555) }, { pos: new Point(280, 290), flip: true }, { pos: new Point(334, 764), flip: true }], color: "cyan" }, // a hair dryer blasting water off of a soaking wet bear
    aquarium: { frame: 11, val: -2, label: "Aquariumbrella", actions: ["Everyone may <b>add 1 card</b> to the offer <b>after</b> it's been won.", "Everyone may <b>discard 1 card</b> from the offer <b>after</b> it's been won."], set: "oddInventions", tags: [{ pos: new Point(588, 851) }, { pos: new Point(252, 360), flip: true }, { pos: new Point(544, 72), flip: true }], color: "blue" }, // an umbrella with an aquarium as its top cover
    smoke_alarm: { frame: 12, val: -4, label: "Smoak Alarm", actions: ["Instantly <b>steal 1 scored tile</b> from each player.", "Everyone instantly <b>steals 1 scored tile</b> from you."], set: "oddInventions", tags: [{ pos: new Point(588, 243) }, { pos: new Point(512, 868), flip: true }], color: "green" }, // an oak tree with a red beacon light on top
    printer: { frame: 13, val: -8, label: "Squinter", set: "oddInventions", tags: [{ pos: new Point(688, 235) }, { pos: new Point(560, 687) }, { pos: new Point(318, 408), flip: true }], color: "orange" }, // tiny printer machine held inside a giant hand, tiny stacks of paper surround the printer
    fan: { frame: 14, val: -12, label: "Ceiling Van", actions: ["From now on, each must play <b>2 tiles</b> to the offer per turn.", "This auction, you bid using <b>2 tiles</b> (summing their numbers)."], set: "oddInventions", tags: [{ pos: new Point(480, 363) }, { pos: new Point(712, 823) }, { pos: new Point(330, 784), flip: true }], color: "magenta" }, // a vintage van with a ceiling fan on top, helping it float to the ceiling like a helicopter
    calculator: { frame: 15, val: -20, label: "Calculater", actions: ["This auction is played <b>in clockwise turns</b>, with bids <b>faceup</b>.", "This auction, the player declaring the auction <b>can't participate</b>."], set: "oddInventions", tags: [{ pos: new Point(808, 703) }, { pos: new Point(290, 400), flip: true }, { pos: new Point(530, 758), flip: true }], color: "purple" }, // a calculator that is asleep and refuses to respond to your inputs (add this manually)
    thumb_drive: { frame: 16, val: -30, label: "Thumb Hive", actions: ["From now on, everyone must play their <b>highest</b> tile to the offer.", "From now on, everyone must play their <b>lowest</b> tile to the offer."], set: "oddInventions", tags: [{ pos: new Point(468, 925) }, { pos: new Point(322, 476), flip: true }], color: "yellow" }, // a bee hive filled with usb thumb drives

    //
    // double devices (these are positive and even higher than base game; above 64)
    //
    computer_mouse: { frame: 17, val: 65, label: "Computer Moose", actions: ["Any bids below the <b>lowest</b> offer tile are ignored.", "Any bids above the <b>highest</b> offer tile are ignored."], set: "doubleDevices", tags: [{ pos: new Point(506, 703) }, { pos: new Point(726, 183) }, { pos: new Point(294, 190), flip: true }], color: "brown" }, // a moose shaped like a computer mouse attached to a cable, sitting on a mouse mat
    television: { frame: 18, val: 67, label: "Telefishion", actions: ["I can <b>never</b> be added to the <b>offer</b>.", "I can <b>never</b> be used for <b>bidding</b>."], set: "doubleDevices", tags: [{ pos: new Point(766, 697) }, { pos: new Point(752, 399) }, { pos: new Point(260, 610), flip: true }], color: "cyan" }, // a television made of seaweed and fish, underwater
    clock: { frame: 19, val: 70, label: "Digital Sock", actions: ["Only <b>1 tile of my type</b> may be in the offer.", "I can <b>always be played</b> to the offer (disregard numeric order)."], set: "doubleDevices", tags: [{ pos: new Point(724, 193) }, { pos: new Point(432, 918), flip: true }], color: "red" }, // a cute pair of socks that have digital clocks woven into their fabric
    microwave: { frame: 20, val: 75, label: "Microwave", set: "doubleDevices", tags: [{ pos: new Point(458, 135) }, { pos: new Point(734, 859) }, { pos: new Point(412, 662), flip: true }], color: "turquoise" }, // an oven that contains a tiny ocean with very tiny waves
    lightbulb: { frame: 21, val: 82, label: "Nightbulb", actions: ["I can't be scored; if won, <b>discard</b> me.", "I can't be scored; if won, take me <b>into your hand<b>."], set: "doubleDevices", tags: [{ pos: new Point(616, 263) }, { pos: new Point(478, 831) }, { pos: new Point(426, 532), flip: true }], color: "yellow" }, // a black lightbulb with an evil face, that sucks all the light out of its surrounding lanterns
    remote_control: { frame: 22, val: 88, label: "Remote Controll", actions: ["From now on, tiles with <b>negative prices</b> are forbidden.", "From now on, tiles with <b>positive prices</b> are forbidden."], set: "doubleDevices", tags: [{ pos: new Point(600, 921) }, { pos: new Point(430, 618), flip: true }], color: "green" }, // a troll using a remote control to make another troll puppet dance
    gamepad: { frame: 23, val: 93, label: "Gamehat", actions: ["No cards with the same <b>price or color</b> may be played next to me.", "Only cards with the same <b>price or color</b> may be played next to me."], set: "doubleDevices", tags: [{ pos: new Point(734, 779) }, { pos: new Point(578, 215) }, { pos: new Point(342, 702), flip: true }], color: "purple" }, // a hat with screens and buttons attached on all sides, the screens show a platforming game
}

// AI DID UNDERSTAND, BUT WASN'T GREAT:
// -> swatphone => phone that also (vacuum) cleans
// -> lapknob => laptop with knobs and levers absolutely everywhere
// -> (general) a tablet is simply too similar to a computer or smartphone
// speakers, air condition/heater, iron, microphone(?)

// AI DIDN'T UNDERSTAND: 
// -> crashing machine (washing machine) => a washing machine on wheels, side view, that crashed into a tree
// -> realligator => horizontal refrigerator, shaped and used like a canoe, with alligators taking bites out of it
// -> refrigerwaitor => a refrigerator dressed as a waiter, holding a plate full of glasses like a waiter
// -> quiztwatch => a wristwatch but all the numbers are replaced by question marks and random shapes
// -> wrist witch => a wrist watch with a pointy nose and wearing a witch's hat
// -> tire alarm => a fire alarm device holding a magnifying glass, which focuses on and enlarges a car tire
// -> smoak alarm => an oak tree sounding the alarm, surrounded by warning signals and sirens (TOO BUSY)
// -> electric drizzle => electric drills raining down on people holding umbrellas and electrocuting them


//
// background colors (separate dict because some are reused and repetition in data is meh)
//
interface ColorTypeData
{
    frame: number,
    main: string,
    light?: string,
    dark?: string
}

export const COLORS:Record<string, ColorTypeData> =
{
    red: { frame: 0, main: "#E61948", light: "#FFCDD9" },
    green: { frame: 1, main: "#3CB44B", light: "#CCFFD3" },
    yellow: { frame: 2, main: "#FFE119", light: "#FFF9D4" },
    blue: { frame: 3, main: "#4363D8", light: "#C5D8FF" },
    orange: { frame: 4, main: "#F58231", light: "#FFEADB" },
    cyan: { frame: 5, main: "#42D4F4", light: "#D5F7FF" },
    magenta: { frame: 6, main: "#F032E6", light: "#FFD5FD" },
    purple: { frame: 7, main: "#AD70F4", light: "#DCBEFF" },
    brown: { frame: 8, main: "#9A6324", light: "#F9DBB9" },
    turquoise: { frame: 9, main: "#469990", light: "#C9F3EE" },
    inkfriendly: { frame: -1, main: "#666666", light: "#EAEAEA" },

}

export const MISC =
{
    price_tag: { frame: 0 },
    spotlight: { frame: 1 },
    number_star: { frame: 2 },
    podium: { frame: 3 },
    audience: { frame: 4 },

}