
enum DominoType
{
    REGULAR = "regular",
    ROLE = "role",
    MISSION = "mission",
    EVENT = "event"
}

enum RoleType
{
    WARFARE = "warfare",
    MONEY = "money",
    INFRA = "infrastructure",
    HOUSING = "housing",
    GOODS = "goods"
}

enum TerrainType
{
    LAVA = "lava", // = red = warfare
    DESERT = "desert", // = yellow = money
    STONE = "stone", // = gray/white = infra
    PLAINS = "plains", // = blue = housing
    GRASS = "grass", // = green = goods
}

enum IconType
{
    GOOD,
    BAD
}

interface GeneralData
{
    frame?: number,
    label?: string, // mostly used for proper role names
    desc?: string,
    prob?: number, // how often it should occur in random drawing generation => higher = more
    value?: number, // how valuable it is, used for balancing mission requirements (and nothing else)
    mainIcon?: boolean, // if false, it must modify SOMETHING ELSE, otherwise the icon does nothing
    missionIcon?: boolean,
    type?: IconType,
    sets?: string[],
    num?: number,
    reportPhase?: string,
    power?: string,
    terrain?: TerrainType,
    sides?: boolean[],
    matches?: string[], // used to match mission flavor texts with suitable missions
}

const ICONS:Record<string, GeneralData> =
{
    empty: { frame: -1, prob: 4.5, sets: ["base", "proximity", "direction", "machine"] },
    [RoleType.WARFARE]: { frame: 0, prob: 0.66, desc: "Gives \"Brother of Warfare\" +1 Military.", mainIcon: true, missionIcon: true, sets: ["base", "proximity", "direction", "machine"] },
    [RoleType.MONEY]: { frame: 1, prob: 0.66, desc: "Gives \"Sister of Coin\" +1 Money.", mainIcon: true, missionIcon: true,sets: ["base", "proximity", "direction", "machine"] },
    [RoleType.INFRA]: { frame: 2, prob: 0.66, desc: "Gives \"Uncle of Infrastructure\" +1 Roads.", mainIcon: true, missionIcon: true,sets: ["base", "proximity", "direction", "machine"] },
    [RoleType.HOUSING]: { frame: 3, prob: 0.66, desc: "Gives \"Sibling of Space\" +1 Housing.", mainIcon: true, missionIcon: true,sets: ["base", "proximity", "direction", "machine"] },
    [RoleType.GOODS]: { frame: 4, prob: 0.66, desc: "Gives \"Aunt of Produce\" +1 Goods.", mainIcon: true, missionIcon: true, sets: ["base", "proximity", "direction", "machine"] },

    person: { frame: 5, prob: 4.0, desc: "Adds +1 to its Capital.", type: IconType.GOOD, sets: ["base", "proximity", "direction", "machine"] },
    wildcard: { frame: 6, prob: 0.5, desc: "Becomes a Role Icon of your type.", type: IconType.GOOD, mainIcon: true, sets: ["goblin", "machine"] },
    corrupter: { frame: 7, prob: 2.0, desc: "All attached people become Goblins.", type: IconType.BAD, mainIcon: true, sets: ["goblin"] },
    neutral: { frame: 8, desc: "Neutral Capital.", type: IconType.GOOD, mainIcon: true, sets: ["base", "machine"] },
    magician: { frame: 9, prob: 0.5, desc: "Doubles its Capital <b>if</b> all other adjacent terrains match.", type: IconType.GOOD, sets: ["base", "direction"] },
    knife: { frame: 10, desc: "Halves its Capital.", type: IconType.BAD, sets: ["base", "goblin"] },
    thief: { frame: 11, desc: "Undo all modifiers that came before me on the path.", type: IconType.BAD, sets: ["base", "direction"] },
    veto: { frame: 12, prob: 0.5, desc: "This path can't contain any icons shown on the shared map.", type: IconType.BAD, sets: ["direction"] }, 
    allin: { frame: 13, desc: "The strength from this path can't be shared over multiple players.", type: IconType.BAD, sets: ["machine"] },
    selfish: { frame: 14, desc: "The strength from this path can only be used by yourself.", type: IconType.BAD, sets: ["machine"] },
    hole: { frame: 15, desc: "All adjacent icons on the same path are to be ignored.", type: IconType.BAD, sets: ["base"] },
    calculator: { frame: 16, prob: 0.5, desc: "Adds the length of this path to its Capital.", type: IconType.GOOD, sets: ["direction"] },

    area_spell: { frame: 17, desc: "Adds +1 to an adjacent Capital.", type: IconType.GOOD, sets: ["proximity"] },
    people_pleaser: { frame: 18, desc: "Doubles any People in the same row/column.", type: IconType.GOOD, sets: ["proximity"] },
    bomb: { frame: 19, desc: "All adjacent icons are to be ignored.", type: IconType.BAD, sets: ["proximity"] },
    village: { frame: 20, desc: "I'm your Role Icon <b>if</b> all my neighbors are different.", type: IconType.GOOD, sets: ["proximity"] },
    sniper: { frame: 21, desc: "No Capital can be placed in the same row/column as me.", type: IconType.BAD, sets: ["proximity"] },
    aeronaut: { frame: 22, prob: 0.5, desc: "Scores +4 if within 3 tiles of a Capital.", sets: ["proximity"] },
    builder: { frame: 23, desc: "Restarts any adjacent path.", sets: ["proximity"] }

}

const TERRAINS:Record<string, GeneralData> =
{
    [TerrainType.LAVA]: { frame: 0 },
    [TerrainType.DESERT]: { frame: 1 },
    [TerrainType.STONE]: { frame: 2 },
    [TerrainType.PLAINS]: { frame: 3 },
    [TerrainType.GRASS]: { frame: 4 }
}

const PATHS:Record<string,GeneralData> =
{
    deadend: { frame: 5, sides: [true, false, false, false] },
    straight: { frame: 6, sides: [true, false, true, false] },
    corner: { frame: 7, sides: [true, true, false, false] },
    tsplit: { frame: 8, sides: [true, true, true, false] },
    all: { frame: 9, sides: [true, true, true, true] },
}

const ROLES:Record<string, GeneralData> =
{
    [RoleType.WARFARE]: { frame: 0, label: "Brother of Warfare", num: 0, terrain: TerrainType.LAVA, power: "Once per round, you may <b>remove</b> a Domino from a previous round.", reportPhase: "You must decide who gets your strength right now." },
    [RoleType.MONEY]: { frame: 1, label: "Sister of Coin", num: 1, terrain: TerrainType.DESERT, power: "Each round, you draw 2 Missions and pick which one you want.", reportPhase: "If you didn't add to the shared map, you can't use your own strength." },
    [RoleType.INFRA]: { frame: 2, label: "Uncle of Infrastructure", num: 2, terrain: TerrainType.STONE, power: "Once per round, you may place a <b>mismatched</b> Domino (wrong paths/terrains).", reportPhase: "" },
    [RoleType.HOUSING]: { frame: 3, label: "Sibling of Space", num: 3, terrain: TerrainType.PLAINS, power: "Once per round, you may <b>rotate</b> or <b>move</b> a Domino.", reportPhase: "If you placed 0 dominoes this round, you score 0." },
    [RoleType.GOODS]: { frame: 4, label: "Aunt of Goods", num: 4, terrain: TerrainType.GRASS, power: "Once per round, you may <b>draw 2 dominoes</b> or none at all.", reportPhase: "If you mismatched terrains or paths, your score is halved." }
}

const MISSION_SCALARS:Record<string, GeneralData> =
{
    num_people: { frame: 0, desc: "# people", value: 1.0, sets: ["base", "proximity", "direction"] },
    missions_achieved: { frame: 1, desc: "# missions achieved", value: 0.5, sets: ["base", "proximity"] },
    missons_failed: { frame: 2, desc: "# missions failed", value: 0.33, sets: ["base", "proximity"] },
    longest_side: { frame: 3, desc: "longest map side", value: 1.0, sets: ["base", "goblin"] },
    longest_path: { frame: 4, desc: "longest path", value: 1.0, sets: ["base", "direction"] },
    neutral_icons: { frame: 5, desc: "Neutral strength", value: 2.0, sets: ["base", "machine"] },
    players_connected: { frame: 6, desc: "# players connected", value: 0.33, sets: ["machine"] }, // @TODO: explain it's about players connected on the shared map? Add extra little "explanations" to these things anyway?
    largest_province: { frame: 7, desc: "largest Province", value: 1.5, sets: ["base", "proximity"] },
    goblin_icons: { frame: 8, desc: "goblin power", value: 2.0, sets: ["goblin"] },
    open_ends: { frame: 9, desc: "# open-ended paths", value: 1.5, sets: ["goblin", "direction"] },
    num_capital_routes: { frame: 10, desc: "# paths between Capitals", value: 1.0, sets: ["machine"] },
    num_capitals: { frame: 11, desc: "# Capitals", value: 1.0, prob: 2, sets: ["base"] },
}

// The "%neutral%" is replaced by something like "neutral strength" dynamically
const MISSION_REWARDS:Record<string, GeneralData> = 
{
    draw: { desc: "Draw 3 Dominoes from the deck, place 1 for free.", sets: ["base"] },
    draw_dynamic: { desc: "Draw as many dominoes from deck as your %neutral% (and place them).", sets: ["base"] },
    overlap: { desc: "Next round, you may <b>overlap</b> existing dominoes when placing new ones.", sets: ["base"] },
    rearrange: { desc: "Move up to 3 Dominoes in your map to a different place.", sets: ["base"] },
    rearrange_dynamic: { desc: "You may rearrange as many Dominoes (in your map) as your %neutral%", sets: ["base", "proximity"] },
    rotate: { desc: "Rotate 1 Domino in your map, ignoring placement rules.", sets: ["base"] },
    rotate_dynamic: { desc: "You may rotate as many dominoes as your %neutral%, ignoring placement rules.", sets: ["base", "direction"] },
    remove_corrupter: { desc: "Remove 1 Corrupter Capital from your map.", sets: ["goblin"] },
    remove_corrupter_dynamic: { desc: "Remove as many Corrupter Capitals as your %neutral%, from all maps.", sets: ["goblin"] },
    powerful: { desc: "Next round, you may execute your Role's power twice.", sets: ["base", "machine"] },
    triple_mission: { desc: "Next round, draw as many Missions as your %neutral% and pick which one you want.", sets: ["base"] },
    force_mission: { desc: "Next round, you may <b>swap</b> your Mission with another player (after receiving them).", sets: ["machine"] },
    ignore_placement: { desc: "Next round, you may ignore placement rules on your individual map.", sets: ["base", "direction"] },
    remove_failed: { desc: "Remove 1 failed Mission of yours.", sets: ["base", "proximity"] },
    extra_score: { desc: "Next round, add 5 points to your score (at all times).", sets: ["base"] },
    extra_score_dynamic: { desc: "Next round, add as many points to your score (at all times) as your %neutral%", sets: ["proximity"] },
}

const MISSION_PENALTIES:Record<string, GeneralData> =
{
    remove: { desc: "Remove 1 Domino from your map.", sets: ["base"] },
    remove_all: { desc: "All players remove 1 Domino from their map.", sets: ["base", "machine"] },
    remove_shared: { desc: "Remove 1 Domino from the shared map.", sets: ["base"] },
    remove_dynamic: { desc: "Remove as many Dominoes from your map as your %neutral%.", sets: ["base"] },
    remove_role: { desc: "Remove 1 Capital Icon from your map.", sets: ["base", "direction"] },
    remove_neutral: { desc: "Remove all Neutral Capitals from your map.", sets: ["base", "proximity"] },
    powerless: { desc: "Next round, you can't use your Role's power.", sets: ["base", "machine"] },
    strict_placement: { desc: "Next round, you must always match both <b>path</b> and <b>terrain</b>.", sets: ["base"] },
    direction_restriction: { desc: "Next round, you may only place paths with a <b>direction</b>.", sets: ["direction"] },
    proximity_remove: { desc: "Remove Dominoes from your map until no two icons of the same type are adjacent anymore.", sets: ["proximity"] },
    double_mission: { desc: "Next round, draw 2 Missions.", sets: ["machine"] },
    many_mission_dynamic: { desc: "Next round, draw as many missions as your %neutral%.", sets: ["machine"] },
    small_province: { desc: "Next round, only the area directly adjacent to your Starting Domino counts for your Province size.", sets: ["proximity"] },
    attack: { desc: "The goblins Attack.", sets: ["goblin"] }
}

const MISSION_TEXTS:Record<string, GeneralData> =
{
    military: { desc: "An enemy stands at our borders, ready for war. We must defend the empire.", matches: [RoleType.WARFARE] },
    money: { desc: "A natural disaster has destroyed our factories and farms, which we must repair.", matches: [RoleType.MONEY] },
    infra: { desc: "You produced a new best-selling product and need to transport it quickly to all corners of the empire.", matches: [RoleType.INFRA] },
    housing: { desc: "A large group of immigrants has arrived in our lands. Ensure their basic needs are met.", matches: [RoleType.HOUSING] },
    goods: { desc: "A foreign entity wants to trade with us, willing to pay handsomely for goods they can't produce themselves.", matches: [RoleType.GOODS] },

    military_money: { desc: "An agreement with other countries dictates we spend 5% of our capital and civilians on our army.", matches: [RoleType.WARFARE, RoleType.MONEY] },
    military_infra: { desc: "To properly defend against threats of goblins, we must build tanks and have good roads leading to our border.", matches: [RoleType.WARFARE, RoleType.INFRA] },
    military_housing: { desc: "Many soldiers have warned us that our homes lack bunkers in case the enemy attacks from the air. We must remedy this!", matches: [RoleType.WARFARE, RoleType.HOUSING] },
    military_goods: { desc: "Our army is pitiful, entirely without weapons and ammunition! Solve this at once.", matches: [RoleType.WARFARE, RoleType.GOODS] },

    money_infra: { desc: "To attract the most tourists this summer, we are looking to build a new airport and spend on advertising.", matches: [RoleType.MONEY, RoleType.INFRA] },
    money_housing: { desc: "Our family is ashamed of you! Our houses are so bad that we need to repair them all and PAY our civilians to live in them!", matches: [RoleType.MONEY, RoleType.HOUSING] },
    money_goods: { desc: "We need a new chain of stores to sell modern technology. We'll first need to invest a lot of money in researching that technology though!", matches: [RoleType.MONEY, RoleType.GOODS] },

    infra_housing: { desc: "Our empire's designated court artist has devised a ludicrous plan to build a railway station inside a skyscraper.", matches: [RoleType.INFRA, RoleType.HOUSING] },
    infra_goods: { desc: "To connect our largest capitals, we need to build an advanced bridge made out of material only one factory can produce.", matches: [RoleType.INFRA, RoleType.GOODS] },

    housing_goods: { desc: "We're producing so many products that we lack the space to store them all! We must quickly build storages.", matches: [RoleType.HOUSING, RoleType.GOODS] },

    military_money_infra: { desc: "Our advisors insist on executing a large training operation to make sure the army is prepared for future wars.", matches: [RoleType.WARFARE, RoleType.MONEY, RoleType.INFRA] },
    money_infra_housing: { desc: "All our cities are full! We need to quickly invest in an entirely new city and road network, or risk people sleeping in the dirt.", matches: [RoleType.MONEY, RoleType.INFRA, RoleType.HOUSING] },
    infra_housing_goods: { desc: "Due to growing demand for our delicious food offerings, we must build storages and a tram line inside our capital.", matches: [RoleType.INFRA, RoleType.HOUSING, RoleType.GOODS] },
    military_infra_goods: { desc: "We discovered a new island! Obviously, we need to immediately conquer it, place an airport, and sell our stuff to the natives.", matches: [RoleType.WARFARE, RoleType.INFRA, RoleType.GOODS] },
    money_housing_goods: { desc: "To solve our housing crisis, we decide to pour money into inventing foldable homes you can buy in a box.", matches: [RoleType.MONEY, RoleType.HOUSING, RoleType.GOODS] },
    military_money_housing: { desc: "We are looking to attack our treacherous neighbor, but don't want to harm any civilians. Pay them to leave to safer homes.", matches: [RoleType.WARFARE, RoleType.MONEY, RoleType.HOUSING] },
}

const EVENTS:Record<string, GeneralData> = 
{
    disaster: { label: "A Terrible Storm", desc: "A storm has ravaged our empire last night! In Role order, each player removes 1 Domino from the shared map." }
}

const MISC =
{
    shush: { frame: 0 },
    mission_reward: { frame: 1 },
    mission_penalty: { frame: 2 }
}

export
{
    MISC,
    ICONS,
    TERRAINS,
    ROLES,
    PATHS,
    EVENTS,
    MISSION_SCALARS,
    MISSION_REWARDS,
    MISSION_PENALTIES,
    MISSION_TEXTS,
    DominoType,
    RoleType,
    TerrainType,
    IconType,
    GeneralData,
}