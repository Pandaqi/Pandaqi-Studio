
export interface TranslateParams
{
    dict:Record<string,any>,
    key:string, 
    params:Record<string,any>, 
    language:string, 
    delimitersReplace: { pre?: string, post?: string }
    delimitersTranslate: { pre?: string, post?: string }
}

// One compiled pattern per delimiter pair: this runs for every piece of text that gets drawn.
const TRANSLATE_REGEXES = new Map<string, RegExp>();
const getTranslateRegex = (pre:string, post:string) =>
{
    const id = `${pre}\u0000${post}`;
    let regex = TRANSLATE_REGEXES.get(id);
    if(!regex)
    {
        // replaceAll() throws on a non-global regex, so nested keys used to crash the whole generation
        regex = new RegExp(`${pre}(.+)${post}`, "g");
        TRANSLATE_REGEXES.set(id, regex);
    }
    return regex;
}

export const translate = (params:TranslateParams) =>
{
    const dict = params.language ? params.dict[params.language] : params.dict;
    const key = params.key ?? "";
    if(!key) { console.error(`Can't translate without a given key`, dict, params); return key; }
    if(!(key in dict)) { console.error(`No translation found for ${key} in dict.`, dict, params); return key; }

    let stringOutput : string = dict[key];
    const dlsr = params.delimitersReplace ?? {}
    const prefixReplace = dlsr.pre ?? "%";
    const suffixReplace = dlsr.post ?? "%";

    const dlst = params.delimitersTranslate ?? {};
    const prefixTranslate = dlst.pre ?? "`";
    const suffixTranslate = dlst.post ?? "`";

    // recursively translate stuff inside
    // `replace` with a global regex is identical to `replaceAll` and exists in every browser we support
    const regex = getTranslateRegex(prefixTranslate, suffixTranslate);
    stringOutput = stringOutput.replace(regex, (fullMatch, captureGroup1) => {
        const newParams = Object.assign({}, params);
        newParams.key = captureGroup1;
        return translate(newParams);
    });
    
    // just flat replace any dynamic replacements (split/join instead of replaceAll, which Safari only
    // has from 13.1 onward)
    for(const [key,data] of Object.entries(params))
    {
        stringOutput = stringOutput.split(`${prefixReplace}${key}${suffixReplace}`).join(String(data));
    }

    return stringOutput;
}