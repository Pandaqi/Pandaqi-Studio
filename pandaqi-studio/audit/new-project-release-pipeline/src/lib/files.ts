import { existsSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

export const walk = (dir:string, predicate:(file:string) => boolean) : string[] =>
{
    const out:string[] = [];
    if(!existsSync(dir)) { return out; }
    for(const item of readdirSync(dir, { withFileTypes: true }))
    {
        const path = join(dir, item.name);
        if(item.isDirectory()) { out.push(...walk(path, predicate)); }
        else if(predicate(path)) { out.push(path); }
    }
    return out;
};

// Forward slashes everywhere: these paths end up in reports, front matter and audit URLs, and a
// Windows backslash must never leak into any of them.
export const relPosix = (root:string, file:string) => relative(root, file).split("\\").join("/");
