export default (value, numParts, bucketMin = 1, bucketMax = Infinity) => 
{
    const dist = new Array(numParts).fill(bucketMin);
    value -= bucketMin*numParts;

    const maxPossibleSum = bucketMax * numParts;
    if(value > maxPossibleSum) { 
        return console.error("Can't distribute " + value + " over " + numParts + " parts, with bucketMax set to " + bucketMax);
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