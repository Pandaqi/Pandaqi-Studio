export default (h = 0, s = 0, l = 0, alpha = 1) =>
{
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n:number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        // convert to Hex and prefix "0" if needed
        return Math.round(255 * color).toString(16).padStart(2, '0');   
    };
    const alphaHex = Math.round(255*alpha).toString(16).padStart(2, '0');
    return `#${f(0)}${f(8)}${f(4)}${alphaHex}`;
}