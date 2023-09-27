export default (dict:Record<string,any>, key:string, def:any = 0) =>
{
    if(key in dict) { return; }
    dict[key] = def;
}