export default async (list:any[], method:string = "") =>
{
    const promises = [];
    for(const elem of list)
    {
        const callback = method ? elem[method] : elem;
        promises.push(callback());
    }
    const results = await Promise.all(promises);
    return results.flat();
}