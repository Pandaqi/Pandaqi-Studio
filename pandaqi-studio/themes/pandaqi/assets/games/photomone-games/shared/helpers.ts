export const roundToMultiplesOf = (n: number, div: number) =>
{
    if(!div || div <= 0) { return n; }
    if(n == 0) {
        if(Math.random() <= 0.5) { return div; }
        else { return -div; }
    }
    if(n > 0) { return Math.ceil(n / div)*div; }
    if(n < 0) { return Math.floor(n / div)*div; }
}

export const roundToValueList = (n: number, list: any) =>
{
    let closestNum = null;
    let closestDist = Infinity;
    for(const val of list)
    {
        const dist = Math.abs(n - val);
        if(dist > closestDist) { continue; }

        closestDist = dist;
        closestNum = val;
    }
    return closestNum;
}