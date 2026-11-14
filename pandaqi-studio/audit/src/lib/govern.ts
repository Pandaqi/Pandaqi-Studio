import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { freemem, totalmem } from "node:os";

// These checks build a whole site and drive a real Chrome over ~170 pages. Run two of them at once,
// or leave a hugo server watching the tree, and they will eat every gigabyte and every CPU there is.
// Everything that builds or audits goes through this module first:
//   1. one process at a time (a lock file, released on exit and on ctrl-c),
//   2. never start a page while the machine is low on memory,
//   3. pause between pages so a finished page is actually collected before the next one starts.

const LOCK_FILE = ".audit.lock";
const MIN_FREE_MB = 1200;
const DEFAULT_PAUSE_MS = 500;

export const freeMemoryMb = () => Math.round(freemem() / (1024 * 1024));
export const totalMemoryMb = () => Math.round(totalmem() / (1024 * 1024));

const pidIsAlive = (pid:number) =>
{
    if(!Number.isFinite(pid) || pid <= 0 || pid === process.pid) { return false; }
    try { process.kill(pid, 0); return true; }
    catch(e) { return false; }
};

// Returns a release function. Throws instead of starting a second concurrent build/audit.
export const acquireLock = (rootDir:string, label:string) =>
{
    mkdirSync(rootDir, { recursive: true });
    const file = join(rootDir, LOCK_FILE);

    if(existsSync(file))
    {
        const [pidText, , ...rest] = readFileSync(file, "utf8").trim().split(/\s+/);
        const pid = Number(pidText);
        if(pidIsAlive(pid))
        {
            throw new Error(
                `another build/audit is already running (pid ${pid}, ${rest.join(" ") || "unknown"}).\n` +
                `Only one may run at a time. Wait for it to finish, or stop that process first ` +
                `(the lock file is ${file}).`,
            );
        }
        // stale: the process that wrote it is gone
    }

    writeFileSync(file, `${process.pid} ${Date.now()} ${label}`, "utf8");

    const release = () =>
    {
        try
        {
            if(!existsSync(file)) { return; }
            if(!readFileSync(file, "utf8").startsWith(String(process.pid))) { return; }
            rmSync(file, { force: true });
        }
        catch(e) { /* the lock is a convenience, never a reason to throw on exit */ }
    };

    process.on("exit", release);
    for(const signal of ["SIGINT", "SIGTERM", "SIGHUP"] as const)
    {
        try { process.on(signal as any, () => { release(); process.exit(130); }); } catch(e) {}
    }

    return release;
};

// Waits for memory to come back rather than pushing a machine that is already full.
// Returns false only if it stays low for `timeoutMs`, so the caller can skip the next page.
export const waitForMemory = async (minFreeMb = MIN_FREE_MB, timeoutMs = 120000) : Promise<boolean> =>
{
    if(freeMemoryMb() >= minFreeMb) { return true; }
    const start = Date.now();
    while(Date.now() - start < timeoutMs)
    {
        console.warn(`memory guard: ${freeMemoryMb()} MB free (want ${minFreeMb} MB); waiting …`);
        await new Promise(r => setTimeout(r, 3000));
        if(freeMemoryMb() >= minFreeMb) { return true; }
    }
    return false;
};

export const breathe = (ms = DEFAULT_PAUSE_MS) => new Promise(r => setTimeout(r, ms));
