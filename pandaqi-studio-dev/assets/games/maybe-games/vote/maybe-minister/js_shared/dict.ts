
enum CardType
{
    VOTE = "vote",
    DECREE = "decree"
}

enum DecreeType
{
    LAW = "law",
    SUPPORT = "support",
    RESOURCE = "resource"
}

enum VoteType
{
    YES = "yes",
    NO = "no",
    ABSTAIN = "abstain"
}

type CardSubType = VoteType | DecreeType

interface SideDetails
{
    good: string[],
    bad: string[]
}

// @NOTE: these keys must match CardType_CardSubType enums exactly
const CARD_TEMPLATES =
{
    decree_law: { frame: 0 },
    decree_support: { frame: 1 },
    decree_resource: { frame: 2 },
    vote_yes: { frame: 3 },
    vote_no: { frame: 4 },
    vote_abstain: { frame: 5 }
}

const ICONS =
{
    // @TODO
}


enum LawType
{
    SCORING = "scoring", // changes which things score and how much
    VOTING = "voting", // changes how much vote you get, how you can use them, and the gameplay element of voting
    CARDS = "cards", // changes how cards work, how much you get, how much you may play, etcetera
    RESOURCES = "resources", // changes how resources can be used (outside of scoring), such as a shop mechanic
    MISC = "misc", // anything else
}

/*
The Laws are absolutely crucial to the game.
* They make specific things worth more or fewer points.
* They allow more control over getting votes, perhaps voting _multiple_ per turn, etcetera.
* They add more twists, mechanics, exceptions, etcetera to the core rules of the game.
* They allow using your _specific_ resources for actual different things. (You can already pay them to get more votes, which can become more/less of course. But you might also say something like "On your turn, you can pay 2 Gold to stay start player next round")
* "After revealing votes, in numeric order, ABSTAIN voters must decide if their vote was YES or NO."
*/
const LAWS = 
{

};


export 
{
    CardType,
    CardSubType,
    DecreeType,
    VoteType,
    CARD_TEMPLATES,
    ICONS,
    SideDetails,
    LawType,
    LAWS
};

