
interface PowerData
{
    desc?: string
}

type PowerSet = Record<string, PowerData>;
const POWERS:PowerSet = 
{
    skip: { desc: "??" },
}

interface CatData
{
    frame: number,
    color: string,
}

const CATS: Record<string, CatData> = 
{
    hearts: { frame: 0, color: "??" },
    spades: { frame: 1, color: "??" },
    diamonds: { frame: 2, color: "??" },
    clubs: { frame: 3, color: "??" },
    hourglasses: { frame: 4, color: "??" },
    cups: { frame: 5, color: "??" },
    stars: { frame: 6, color: "??" },
    cats: { frame: 7, color: "??" },
}

const MISC =
{
    bg_cat: { frame: 0 },
    bg_cat_outline: { frame: 1 },
}

export 
{
    PowerData,
    CATS,
    POWERS,
    MISC
}
