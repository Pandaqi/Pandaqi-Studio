export default (dict:Record<string,any>, resourceKey = "misc", frameKey = "frame") =>
{
    const arr = [];
    for(const [key,data] of Object.entries(dict))
    {
        arr.push('<img id="' + resourceKey + '" frame="' + data[frameKey] + '">');
    }
    return arr;
}