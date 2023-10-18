import Card from "../js_game/card";

const getIndexOfProp = (list:Card[], prop:string, val:any) =>
{
    for(let i = 0; i < list.length; i++)
    {
        if(list[i][prop] == val) { return i; }
    }
    return -1;
}

const getNumbers = (list:Card[]) => { return getProps(list, "num") as number[]; }
const getTypes = (list:Card[]) => { return getProps(list, "type") as string[]; }
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

const countFood = (list:Card[], val:string, ex = []) => { return countProp(list, "food", val, ex); }
const getWithFood = (list:Card[], val:string, ex = []) => { return getWithProp(list, "food", val, ex); }

const countNumber = (list:Card[], num:number, ex = []) => { return countProp(list, "num", num, ex); }
const getWithNumber = (list:Card[], num:number, ex = []) => { return getWithProp(list, "num", num, ex); }

const countType = (list:Card[], tp:string, ex = []) => { return countProp(list, "type", tp, ex); }
const getWithType = (list:Card[], tp:string, ex = []) => { return getWithProp(list, "type", tp, ex); }

const countWithNumAbove = (list:Card[], num:number) => { return getWithNumAbove(list, num).length; }
const getWithNumAbove = (list:Card[], num:number) =>
{
    const arr = [];
    for(const elem of list)
    {
        if(elem.num <= num) { continue; }
        arr.push(elem);
    }
    return arr;
}

const countWithNumBelow = (list:Card[], num:number) => { return getWithNumBelow(list, num).length; }
const getWithNumBelow = (list:Card[], num:number) =>
{
    const arr = [];
    for(const elem of list)
    {
        if(elem.num >= num) { continue; }
        arr.push(elem);
    }
    return arr;
}

const countPoisoned = (list:Card[], target:boolean, ex = []) => { return getPoisoned(list, target, ex).length; }
const getPoisoned = (list:Card[], target: boolean, ex = []) =>
{
    const arr = [];
    for(const elem of list)
    {
        if(ex.includes(elem)) { continue; }
        if(elem.poisoned != target) { continue; }
        arr.push(elem);
    }
    return arr;
}

const getNeighbors = (a:Card, b:Card[]) =>
{
    const num = b.length;
    const idx = b.indexOf(a);
    let idxLeft = (idx + num - 1) % num;
    let idxRight = (idx + num + 1) % num;
    return [ b[idxLeft], b[idxRight] ];
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

    getNumbers,
    getTypes,
    getProps,

    countProp,
    getWithProp,

    countFood,
    getWithFood,
    countNumber,
    getWithNumber,
    countType,
    getWithType,

    countWithNumAbove,
    getWithNumAbove,
    countWithNumBelow,
    getWithNumBelow,

    countPoisoned,
    getPoisoned,
    getNeighbors,
    getSequences,

    getHighestFrequency,
    getLowestFrequency,

    getFrequencyStats,
    getFrequencyStatsSorted
}