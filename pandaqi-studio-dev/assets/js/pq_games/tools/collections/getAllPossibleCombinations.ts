const getAllPossibleCombinations = (options:string[], spaceLeft:number) =>
{
    if(spaceLeft <= 0) { return [[]]; } // this is the point of return in this recursive chain
    if(options.length <= 0) { return null; } // we have space left, but no options? Invalid combo!

    options = options.slice();
    const option = options.pop();

    const results = [];
    for(let i = 0; i <= spaceLeft; i++)
    {
        const arr = [];
        for(let a = 0; a < i; a++)
        {
            arr.push(option);
        }

        const newSpaceLeft = spaceLeft - i;
        const remainder = getAllPossibleCombinations(options, newSpaceLeft);
        if(!remainder) { continue; }

        for(const elem of remainder)
        {
            let arrCopy = arr.slice();
            arrCopy.push(elem);
            results.push(arrCopy.flat());
        }
    }

    return results;
}

export default getAllPossibleCombinations;