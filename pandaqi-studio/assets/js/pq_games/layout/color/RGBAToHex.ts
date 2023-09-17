export default (r = 0, g = 0, b = 0, a = 1.0) =>
{
    a = Math.round(a * 255);
    let arr = [r.toString(16), g.toString(16), b.toString(16), a.toString(16)];
    arr = arr.map(string => string.length === 1 ? "0" + string : string);
    return "#" + arr.join("");
}