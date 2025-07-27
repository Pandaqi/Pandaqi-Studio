import Card from "../js_game/card";

const getIndexOfProp = (list:Card[], prop:string, val:any) =>
{
    for(let i = 0; i < list.length; i++)
    {
        if(list[i][prop] == val) { return i; }
    }
    return -1;
}

const getProps = (list:Card[], prop:string) =>
{
    const arr = new Set();
    for(const elem of list)
    {
        arr.add(elem[prop]);
    }
    return Array.from(arr);
}

const countProp = (list:Card[], prop:string, val:any, ex = []) => { return getWithProp(list, prop, val, ex).length; }
const getWithProp = (list:Card[], prop:string, val:any, ex = []) =>
{
    const arr = [];
    for(const elem of list)
    {
        if(ex.includes(elem)) { continue; }
        if(elem[prop] != val) { continue; }
        arr.push(elem);
    }
    return arr;
}

const getNextWithProp = (a:Card, b:Card[], prop:string, val:any) =>
{
    const numCards = b.length;
    const emperorDir = b[0].dir;
    let idx = b.indexOf(a);
    let counter = 0;
    const arr = [];
    while(counter < numCards)
    {
        idx = (idx + emperorDir + numCards) % numCards;
        if(b[idx][prop] == val) { arr.push(b[idx]); }
        counter++;
    }

    return arr;
}

const getPrevious = (a:Card, b:Card[]) =>
{
    const emperorDir = b[0].dir;
    const num = b.length;
    const idx = b.indexOf(a);
    let idxLeft = (idx + num - emperorDir) % num;
    return b[idxLeft];
}

const getNext = (a:Card, b:Card[]) =>
{
    const emperorDir = b[0].dir;
    const num = b.length;
    const idx = b.indexOf(a);
    let idxRight = (idx + num + emperorDir) % num;
    return b[idxRight];
}

const getNeighbors = (a:Card, b:Card[]) =>
{
    return [
        getPrevious(a,b), 
        getNext(a,b)
    ];
}

const getSequences = (list:Card[], prop:string = "type") =>
{
    // find a spot between two different cards
    const numElems = list.length;
    let startIdx = -1;
    for(let i = 0; i < list.length; i++)
    {
        let nextIdx = (i+1) % list.length;
        if(list[i][prop] == list[nextIdx][prop]) { continue; }
        startIdx = nextIdx;
        break;
    }

    // if no start index found, then there are no different cards, so the WHOLE thing is one sequence
    if(startIdx < 0) { return [list.slice()]; }

    // from there, just count sequences
    let counter = 0;
    const seqs = [];
    let curIdx = startIdx;
    let curSeq = [list[curIdx]];
    while(counter < numElems) {
        curIdx = (curIdx + 1) % numElems;
        counter++;

        let prevElem = curSeq[curSeq.length - 1];
        if(list[curIdx][prop] == prevElem[prop])
        {
            curSeq.push(list[curIdx]);
            continue;
        }

        seqs.push(curSeq);
        curSeq = [list[curIdx]];
    } 

    seqs.push(curSeq);
    seqs.sort((a,b) => { return b.length - a.length; }) // longest one first (desc)
    return seqs;
}

const getHighestFrequency = (list:Card[], prop:string, ex = []) =>
{
    const stats = getFrequencyStats(list, prop, ex);
    let max = -Infinity;
    for(const [key,data] of Object.entries(stats))
    {
        max = Math.max(max, data);
    }
    return max;
}

const getLowestFrequency = (list:Card[], prop:string, ex = []) =>
{
    const stats = getFrequencyStats(list, prop, ex);
    let min = Infinity;
    for(const [key,data] of Object.entries(stats))
    {
        min = Math.min(min, data);
    }
    return min;
}

const getFrequencyStats = (list:Card[], prop:string, ex = []) =>
{
    const options = getProps(list, prop);

    const stats : Record<any, number> = {};
    for(const option of Array.from(options))
    {
        // @ts-ignore
        stats[option] = countProp(list, prop, option, ex);
    }

    return stats;
}

const getFrequencyStatsSorted = (list:Card[], prop:string, ex = []) =>
{
    const stats = getFrequencyStats(list, prop, ex);
    const arr = [];
    for(const [key,data] of Object.entries(stats))
    {
        arr.push({ key: key, freq: data });
    }
    arr.sort((a,b) => { return b.freq - a.freq });
    return arr;
}

export {
    getIndexOfProp,
    getProps,
    countProp,
    getWithProp,

    getNextWithProp,

    getPrevious,
    getNext,
    getNeighbors,

    getSequences,

    getHighestFrequency,
    getLowestFrequency,

    getFrequencyStats,
    getFrequencyStatsSorted
}