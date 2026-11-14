import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { freeMemoryMb, waitForMemory } from "./lib/govern";

export interface BuildOptions
{
    dest: string;
    log: string;
    project?: string;
    skip?: boolean;
    studioDir: string;
}

export interface BuildResult
{
    exitCode: number;
    durationMs: number;
    cached: boolean;
    log: string;
    stdout: string;
}

const walk = (dir:string, out:string[] = []) : string[] =>
{
    if(!existsSync(dir)) { return out; }
    for(const item of readdirSync(dir, { withFileTypes: true }))
    {
        const p = join(dir, item.name);
        if(item.isDirectory()) { walk(p, out); }
        else { out.push(p); }
    }
    return out;
}

// cheap, stable fingerprint of everything that can change the built output
export const hashInputs = (studioDir:string) : string =>
{
    const hasher = new Bun.CryptoHasher("sha1");
    const inputs = [
        join(studioDir, "content"),
        join(studioDir, "themes", "pandaqi", "assets"),
        join(studioDir, "themes", "pandaqi", "layouts"),
    ];
    const files: string[] = [];
    for(const dir of inputs) { walk(dir, files); }
    files.push(join(studioDir, "config.toml"));

    files.sort();
    for(const file of files)
    {
        if(!existsSync(file)) { continue; }
        const stat = statSync(file);
        hasher.update(file);
        hasher.update(String(stat.size));
        hasher.update(String(stat.mtimeMs));
    }
    return hasher.digest("hex");
}

export const writeSegment = (studioDir:string, project:string) : string =>
{
    const path = join(studioDir, "audit", "segment.toml");
    const body = `[segments.one]\n  [[segments.one.includes]]\n    path = '{/${project}/**,/${project}}'\n`;
    writeFileSync(path, body, "utf8");
    return path;
}

const hugoArgs = (dest:string, project?:string) : string[] =>
{
    const args = ["-d", dest, "--disableKinds", "taxonomy,term,rss,sitemap", "--logLevel", "warn"];
    // lean.toml leaves out static/blog + static/tutorials (separate subdomains, 98 % of the static tree)
    const configs = ["config.toml", "audit/lean.toml"];
    if(project) { configs.push("audit/segment.toml"); args.push("--renderSegments", "one"); }
    args.push("--config", configs.join(","));
    return args;
}

export const buildSite = async (opts:BuildOptions) : Promise<BuildResult> =>
{
    const start = Date.now();
    const dest = resolve(opts.dest);
    mkdirSync(dest, { recursive: true });
    mkdirSync(join(dest, ".."), { recursive: true });

    const stampPath = join(dest, ".audit-inputs");
    const hash = hashInputs(opts.studioDir);

    const canReuse = existsSync(join(dest, "index.html"))
        && existsSync(stampPath)
        && readFileSync(stampPath, "utf8").trim() === hash;

    if(opts.skip)
    {
        if(!existsSync(join(dest, "index.html")))
        {
            return {
                exitCode: 1, durationMs: 0, cached: false, log: opts.log,
                stdout: `--skip-build given but ${dest} contains no index.html`,
            };
        }
        return { exitCode: 0, durationMs: 0, cached: true, log: opts.log, stdout: "(build skipped)" };
    }

    if(canReuse)
    {
        return { exitCode: 0, durationMs: 0, cached: true, log: opts.log, stdout: "(inputs unchanged, reusing build)" };
    }

    if(opts.project) { writeSegment(opts.studioDir, opts.project); }

    // a build on a machine that is already full is how it ends up swapping for ten minutes
    if(!(await waitForMemory(1500, 120000)))
    {
        return {
            exitCode: 1, durationMs: 0, cached: false, log: opts.log,
            stdout: `memory guard: only ${freeMemoryMb()} MB free, refusing to start a build`,
        };
    }

    const proc = Bun.spawn(["hugo", ...hugoArgs(dest, opts.project)], {
        cwd: opts.studioDir,
        env: {
            ...process.env,
            HUGO_PARAMS_ENABLEGAMEJS: "true",
            HUGO_PARAMS_ENABLEBOARDJS: "true",
        },
        stdout: "pipe",
        stderr: "pipe",
    });

    const [stdoutRaw, stderrRaw] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
    ]);
    const exitCode = await proc.exited;

    const output = stdoutRaw + stderrRaw;
    mkdirSync(join(opts.log, ".."), { recursive: true });
    writeFileSync(opts.log, output, "utf8");

    if(exitCode === 0) { writeFileSync(stampPath, hash, "utf8"); }

    return {
        exitCode,
        durationMs: Date.now() - start,
        cached: false,
        log: opts.log,
        stdout: output,
    };
}

export const lastLines = (text:string, count:number) =>
{
    const lines = text.trimEnd().split(/\r?\n/);
    return lines.slice(Math.max(0, lines.length - count)).join("\n");
}

export const projectOf = (url:string) =>
{
    return basename(url.replace(/\/+$/, "")) || "site";
}
