// Seeded randomness for material generation.
// `setSeed` replaces Math.random with a deterministic generator, so one generation run is reproducible
// from `_settings.defaults.seed` even where pickers still call Math.random() directly.
// New code should use rand()/pick(), which keep using the seeded stream.

let currentSeed = "";
let generator : () => number = Math.random;

const hashSeed = (seed:string = "") : number =>
{
    // @SOURCE: appendix B of MIGRATION.md
    let h = 1779033703 ^ seed.length;
    for(let i = 0; i < seed.length; i++)
    {
        h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    return h >>> 0;
}

export const createSeededRandom = (seed:string = "") : (() => number) =>
{
    let a = hashSeed(seed);
    return () : number =>
    {
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
}

export const setSeed = (seed:string = "") =>
{
    currentSeed = seed ?? "";
    generator = createSeededRandom(currentSeed);
    Math.random = generator;
}

export const getSeed = () : string => { return currentSeed; }

export const rand = () : number => { return generator(); }

export const pick = <T>(list:T[]) : T =>
{
    if(list.length <= 0) { return null; }
    return list[Math.floor(rand() * list.length)];
}
