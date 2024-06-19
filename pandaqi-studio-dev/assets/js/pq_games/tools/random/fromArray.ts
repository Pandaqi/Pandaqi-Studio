export default <T>(arr:T[], RNG = Math.random) : T =>
{
    const l = arr.length;
    if(l <= 0) { console.error("Can't draw from empty array"); return null; }
    return arr[Math.floor(RNG() * l)];
}