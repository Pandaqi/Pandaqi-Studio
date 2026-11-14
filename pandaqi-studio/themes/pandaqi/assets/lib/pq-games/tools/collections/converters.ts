import { isObject } from ".";

export const booleanDictToArray = (dict:Record<string,boolean>) =>
{   
    const arr = [];
    for(const [key,val] of Object.entries(dict))
    {
        if(!val) { continue; }
        arr.push(key);
    }
    return arr;
}

// Frequency/probability maps are usually declared partially on purpose ("this type uses the default");
// reading such a map with `dict[key] ?? value` hides the intent, and `dict[key]` alone silently made a
// branch a no-op. This fills the gaps from a declared default without inventing entries.
export const mergeWithDefaults = <T>(dict:Partial<Record<string, T>>, defaults:Record<string, T>) : Record<string, T> =>
{
    const out:Record<string, T> = {};
    for(const key of Object.keys(defaults))
    {
        out[key] = dict[key] ?? defaults[key];
    }
    return out;
}

export const mergeObjects = (target, source, overwrite = true) => 
{
    if (!source) return target;
  
    if (isObject(target) && isObject(source)) 
    {
      for (const key in source) 
      {
        if (isObject(source[key])) 
        {
          if (!target[key]) Object.assign(target, { [key]: {} });
          mergeObjects(target[key], source[key], overwrite);
        } 
        else 
        {
          const keepValue = (target[key] != undefined) && !overwrite;
          if(!keepValue)
          {
            Object.assign(target, { [key]: source[key] });
          }
        }
      }
    }
  
    return target;
}