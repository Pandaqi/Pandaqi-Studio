export const sleep = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms));

export const waitUntil = async (fn:() => Promise<boolean>, timeoutMs:number, intervalMs = 200) : Promise<boolean> =>
{
    const start = Date.now();
    while(Date.now() - start < timeoutMs)
    {
        try { if(await fn()) { return true; } } catch(e) { /* page may still be settling */ }
        await sleep(intervalMs);
    }
    return false;
}
