import { isObject } from ".";

// Deep-copies the plain objects and arrays that configs and pickers are made of. Anything else (class
// instances such as Vector2/TextConfig, images, fonts) is shared by reference on purpose: a plain-object
// copy of it would lose its methods.
export const deepClone = <T>(value:T) : T =>
{
    if(value === null || typeof value !== "object") { return value; }
    if(Array.isArray(value)) { return value.map((entry) => deepClone(entry)) as unknown as T; }
    if(value instanceof Date) { return new Date(value.getTime()) as unknown as T; }

    const prototype = Object.getPrototypeOf(value);
    if(prototype !== Object.prototype && prototype !== null) { return value; }

    const copy:Record<string, any> = {};
    for(const [key, entry] of Object.entries(value as Record<string, any>)) { copy[key] = deepClone(entry); }
    return copy as T;
}

// `structuredClone` only exists from Safari 15.4 (and Firefox 94) onward, but every generator copies
// config data with it before picking anything. Without this fallback an older iPhone dies before the
// first card is drawn. Installed once when the library is imported (see pq-games/index.ts).
export const ensureStructuredClone = () =>
{
    const scope = globalThis as any;
    if(typeof scope.structuredClone == "function") { return; }
    scope.structuredClone = (value:any) => deepClone(value);
}

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