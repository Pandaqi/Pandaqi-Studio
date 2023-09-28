export default (arr:any[]) : Record<string, number> =>
{
    const counts = arr.reduce((a, c) => {
        a[c] = (a[c] || 0) + 1;
        return a;
    }, {});
    return counts;
}