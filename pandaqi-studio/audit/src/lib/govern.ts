import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { freemem, totalmem } from "node:os";
import { execFileSync } from "node:child_process";

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

export interface StrayProcess
{
    pid: number;
    name: string;
    reason: string;
}

const listProcesses = () : { pid:number, name:string, command:string }[] =>
{
    if(process.platform !== "win32") { return []; }
    try
    {
        const script = "Get-CimInstance Win32_Process | Select-Object ProcessId,Name,CommandLine | ConvertTo-Json -Compress";
        const out = execFileSync("powershell", ["-NoProfile", "-Command", script], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
        const json = JSON.parse(out.trim() || "[]");
        const list = Array.isArray(json) ? json : [json];
        return list.map((p:any) => ({ pid: Number(p.ProcessId), name: String(p.Name ?? ""), command: String(p.CommandLine ?? "") }));
    }
    catch(e) { return []; }
}

// An audit that was killed (or whose shell was killed) leaves its Chrome behind, and a half-dead audit keeps
// the page it was testing in memory. Both then starve the next run, which is what made full sweeps fail with
// "memory guard: 405 MB free". Recognise them by something we control — the audit entry point and the Chrome
// profile directory this harness passes — never by a name pattern that could match anything else.
export const strayAuditProcesses = (markers:{ auditEntry:string, marker:string }) : StrayProcess[] =>
{
    const entry = markers.auditEntry.split("\\").join("/");
    const chromeMarker = `--audit-harness=${markers.marker}`;
    const out:StrayProcess[] = [];

    for(const proc of listProcesses())
    {
        if(proc.pid === process.pid) { continue; }
        const command = proc.command.split("\\").join("/");
        if(!command) { continue; }

        // only a bun/node process is the audit itself; a shell whose command line mentions the same path is
        // the wrapper we are running inside
        const isAudit = command.includes(entry) && /^(bun|node)/i.test(proc.name);
        const isOurChrome = /chrome/i.test(proc.name) && proc.command.includes(chromeMarker);
        if(!isAudit && !isOurChrome) { continue; }

        // never touch the process that is running this check: a wrapper shell's command line can contain the
        // same path, so the pid comparison is what keeps this safe
        out.push({ pid: proc.pid, name: proc.name, reason: isAudit ? "previous audit" : "its Chrome" });
    }
    return out;
}

export const killProcessTree = (pid:number) =>
{
    try
    {
        if(process.platform === "win32") { execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" }); }
        else { process.kill(pid, "SIGKILL"); }
        return true;
    }
    catch(e) { return false; }
};

export const cleanupStrayAudits = (markers:{ auditEntry:string, marker:string }) : StrayProcess[] =>
{
    const strays = strayAuditProcesses(markers);
    for(const stray of strays)
    {
        console.warn(`[govern] stopping leftover ${stray.reason} (pid ${stray.pid}, ${stray.name})`);
        killProcessTree(stray.pid);
    }
    return strays;
};

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
