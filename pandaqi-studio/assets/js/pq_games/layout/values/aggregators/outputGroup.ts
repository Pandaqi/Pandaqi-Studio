export default class OutputGroup
{
    constructor() {}

    cloneInto(obj:any, deep = false)
    {
        const props = this.getPropertyList();
        for(const prop of props)
        {
            let val = this[prop];
            const clonable = val.clone; 
            if(deep && clonable) { val = val.clone(); }
            obj[prop] = val;
        }
        return obj;
    }

    getPropertyList() : string[]
    {
        const arr = [];
        for (const prop in this) 
        {
            arr.push(prop);
        }
        return arr;
    }
}