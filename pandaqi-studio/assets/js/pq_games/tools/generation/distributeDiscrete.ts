export default (value:number, numParts:number, bucketMin = 1, bucketMax = Infinity) : number[] => 
{
    const dist = new Array(numParts).fill(bucketMin);
    value -= bucketMin*numParts;

    const maxPossibleSum = bucketMax * numParts;
    if(value > maxPossibleSum) { 
        console.error("Can't distribute " + value + " over " + numParts + " parts, with bucketMax set to " + bucketMax);
        return [];
    }

    let runningSum = 0;
    while(runningSum < value)
    {
        let invalidBucket = false;
        let bucketIndex = Math.floor(Math.random() * numParts);
        do
        {
            bucketIndex = (bucketIndex + 1) % numParts;
            invalidBucket = dist[bucketIndex] >= bucketMax;
        } while(invalidBucket)

        dist[bucketIndex] += 1;
        runningSum += 1;
    }

    return dist;

}