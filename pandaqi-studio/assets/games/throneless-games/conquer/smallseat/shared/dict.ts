import { PackData } from "games/throneless-games/shared/dictShared"

export const PACKS:Record<string, PackData> =
{
    karateChicks: 
    { 
        frame: 0,
        clarification: "If the Teller <em>is</em> the Boss, the entire Voting restrictions fall away. Nobody needs to follow any of the faceup types played, without penalty.",
        backstory: "These cute chickens deceive everyone and pull them to their cozy hen. Once inside, the victim realizes the yellow puffs have been training for years to become super soldiers. If they want to change the rules, they will forcefully do so.",
        animal: "Chick",
        colorClass: "Yellow",

        name: 
        {
            text: "Karate Chicks",
        },
        
        action: 
        {
            text: "Next round, the <b>Boss</b> plays a <b>faceup Vote</b> before the Teller. Everyone must Vote <em>that type</em> instead of the Teller's type."
        },

        slogan: 
        {
            text: "What came first, the kickin' or the egg?",
        },
    },

    pricklypettes: 
    { 
        frame: 1,
        backstory: "The Pricklypettes are cute orange balls that normally don't pose any danger. But if you try to attack them in any way, their quills jump out and prevent any shenanigans. This makes it hard to claim a throne---but very easy to keep one.",
        animal: "Hedgehog",
        colorClass: "Orange",

        name: 
        {
            text: "Pricklypettes",
        },
        
        action: 
        {
            text: "<b>Nobody</b> is allowed to <b>swap</b> places with you."
        },

        slogan: 
        {
            text: "Disturb the still, you get the quill.",
        },
    },

    sleepersippies: 
    { 
        frame: 2,
        clarification: "Agreemeent is reached verbally between all players who voted Sleepersippy that round. If they don't agree, but you can't play a Sleepersippy next round, ignore the rule.",
        backstory: "These creatures are asleep for almost the entire day. And night. They don't care who's the Boss---sounds like a hard job that makes you sleepy. If they can hang from a branch together and sleep, they're happy.",
        animal: "Koala",
        colorClass: "Grey",

        name: 
        {
            text: "Sleepersippies",
        },
        
        action: 
        {
            text: "If <b>all Sleepersippy voters</b> agree, the round instantly ends. If not, you <b>must play Sleepersippy</b> next round."
        },

        slogan: 
        {
            text: "Zzzzlogans are too much work.",
        },
    },

    chewyCarrots: 
    { 
        frame: 3,
        backstory: "These innocent little rabbits are almost invisible. Everyone forgets they're there, in the background, chewing their carrots---and listening. They are no fearsome warriors, but they gather information like the best spies.",
        animal: "Rabbit",
        colorClass: "White",

        name: 
        {
            text: "Chewy Carrots",
        },
        
        action: 
        {
            text: "Secretly <b>show</b> an animal to another player. They tell you <b>how many</b> of that type they have."
        },

        slogan: 
        {
            text: "I hear with my lengthy ears, something that starts with ...",
        },
    },

    treeOfHainut: 
    { 
        frame: 4,
        backstory: "This folk lives around the magical tree of Hainut. It's hard for them to influence the court, for they sleep all of Winter, and are too busy collecting nuts otherwise. But if they manage to make it to the voting, their rain of magical nuts might just drive away potential enemies.",
        animal: "Squirrel",
        colorClass: "Brown",
        clarification: "The action essentially let's you take back this card and discard a <em>different one</em>, pretending you played that one instead. No, you don't get the action of that second card.",

        name: 
        {
            text: "Tree of Hainut",
        },
        
        action: 
        {
            text: "<b>Swap</b> this card for another in your <b>Hand</b>."
        },

        slogan: 
        {
            text: "After a long day's work, I'd say we hibernut.",
        },
    },

    curlysnouts: 
    { 
        frame: 5,
        backstory: "These pigs like to feast, play, dance like there's no tomorrow. They're generous, kind and prone to gifting away all they have. Their unspoken law, however, is that they always desire something in return. Preferably tasty food.",
        animal: "Pig",
        colorClass: "Pink",

        name: 
        {
            text: "Curlysnouts",
        },
        
        action: 
        {
            text: "<b>Give away</b> up to 3 cards to other players. For each one, the Teller gives you <b>1 secret card</b> in return."
        },

        slogan: 
        {
            text: "Don't feast the least, catch the drifts of gifts.",
        },
    },

    tinybears: 
    { 
        frame: 6,
        backstory: "These red pandas are everywhere, hidden amongst the leaves overhead. They look sweet from the outside, but they control every tree. They rarely want to see themselves on the Smallseat, but they have their favorite animals, and you better comply with their wishes ...",
        animal: "Red Panda",
        colorClass: "Red",

        name: 
        {
            text: "Tiny Bears",
        },
        
        action: 
        {
            text: "<b>Name an Animal.</b> Every player who does <b>not</b> have it publicly gives you a card."
        },

        slogan: 
        {
            text: "The tiniest bears spread the greatest fears.",
        },
    },

    purplepaws: 
    { 
        frame: 7,
        backstory: "The Purplepaws are true predators, stalking their prey on the rooftops at night, chasing them relentlessly until they give up. The only way to get them off your tail, it was discovered, is to tell them your biggest secrets. They feed on information; this means they also breathe it out.",
        animal: "Red Panda",
        colorClass: "Purple",

        name: 
        {
            text: "Purplepaws",
        },
        
        action: 
        {
            text: "<b>Reveal 3 Hand cards.</b> Next round, everyone <b>must vote</b> the Animal they have the <b>most</b>."
        },

        slogan: 
        {
            text: "Meown secrets, Weown you.",
        },
    },

    ottermother: 
    { 
        frame: 8,
        backstory: "Legends claim the Ottermothers are insane. Their actions seem random, their thoughts incomprehensible, their movements like a mad dance. And yet, when the dust settles, they somehow eke out a victory and pretend they didn't know how.",
        animal: "Otter",
        colorClass: "BlueDark",

        name: 
        {
            text: "Ottermother",
        },
        
        action: 
        {
            text: "<b>Swap</b> places with the <b>Smallseat</b>. Instantly start the next round, where all Ottermother players must play a <b>random card</b>."
        },

        slogan: 
        {
            text: "Care for one anotter or the peace smotters.",
        },
    },

    sealalater: 
    { 
        frame: 9,
        backstory: "A bunch of thieves, that's what they'll proudly call themselves. They suddenly jump out of the water, slide past you, steal your valuables, then yell 'see ya later!'. Or something that sounds like it. But they can't get away with it forever: the Forest Police investigates votes closely and hopes to fix all the wrong ones.",
        animal: "Seal",
        colorClass: "BlueLight",

        name: 
        {
            text: "Sealalater",
        },
        
        action: 
        {
            text: "Add <b>any Hand card</b> to the <b>Teller</b> (secret). Then the Teller <b>flips</b> 3 cards (secret <> public)."
        },

        slogan: 
        {
            text: "Whatever you conseal, we steal. ARF!",
        },
    },

    snufflesniff: 
    { 
        frame: 10,
        backstory: "These dogs work for the Forest Police to sniff out any criminals or sneaky creatures wanting the Smallseat for themselves. If any trouble comes close, they will bark, and bite, and guard you. The issue is, of course, that this noise gives them away and makes it near impossible to execute any of their own secret plans.",
        animal: "Dog",
        colorClass: "Green",
        clarification: "Immune means that nobody can target you for actions, which includes swapping with you.",

        name: 
        {
            text: "Snufflesniff",
        },
        
        action: 
        {
            text: "<b>Reveal</b> your entire Hand. You are <b>immune</b>, for this round and the next."
        },

        slogan: 
        {
            text: "In trees and bushes we sniff; of dark deeds we get a whiff.",
        },
    },

    ponytailors: 
    { 
        frame: 11,
        backstory: "These beautiful and elegant creatures have introduced hair styles and leaf fashion to the woods. It has made the elections considerably more stylish, but also increased sneaky behavior. They are quick to dazzle you with a hairdo or slip a fake vote in their pockets, all while telling you how pretty your hazelnut dress is.",
        animal: "Pony",
        colorClass: "Multicolor",

        name: 
        {
            text: "Ponytailors",
        },
        
        action: 
        {
            text: "All <b>winning votes</b> of this round go to the <b>Boss</b> instead. A random one is <b>given to you</b>."
        },

        slogan: 
        {
            text: "To clash colors is to gallop dangerously.",
        },
    },
}

export const SETS =
{
    starter: ["pricklypettes", "chewyCarrots", "curlysnouts", "snufflesniff"],
    medium: ["karateChicks", "treeOfHainut", "sealalater", "ponytailors"],
    advanced: ["sleepersippies", "tinybears", "purplepaws", "ottermother"],
    complete: Object.keys(PACKS)
}