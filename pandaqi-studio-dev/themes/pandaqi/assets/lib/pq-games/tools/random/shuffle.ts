export default <T>(array:T[], RNG = Math.random) : T[] =>
{
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(RNG() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}