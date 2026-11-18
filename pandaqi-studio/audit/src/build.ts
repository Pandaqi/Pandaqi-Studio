import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { freeMemoryMb, waitForMemory } from "./lib/govern";

export interface BuildOptions
{
    dest: string;
    log: string;
    project?: string;
    // extra content paths rendered with the segment, e.g. the collection page a nested game borrows
    // its fonts or banners from (without it, that game's asset URLs 404 in a filtered build)
    segmentIncludes?: string[];
    // content paths left out of the segment even though an include covers them, e.g. the games inside
    // a collection (their own releases build them). The CLI's single `--exclude` list feeds both this
    // and the manifest's filterExclude, so the build and the audit queue can never disagree.
    segmentExcludes?: string[];
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
    // Games and their library live in the project's own assets/ (not only under themes/), so a change
    // there must invalidate the cached build — otherwise a sweep silently tests yesterday's bundle.
    const inputs = [
        join(studioDir, "content"),
        join(studioDir, "assets"),
        join(studioDir, "themes"),
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

// A segment publishes only the pages it includes, together with those pages' own bundle resources.
// `extra` adds more pages to render alongside the project, which is how a nested game keeps access to
// the assets of the collection page above it. `exclude` takes paths back out again: Hugo's excludes
// take absolute precedence over includes, so a collection can build its own pages without the games
// inside it.
const segmentPattern = (project:string) => `path = '{/${project}/**,/${project}}'`;
const segmentMatchers = (projects:string[], kind:"includes"|"excludes") =>
    projects.map(project => `  [[segments.one.${kind}]]\n    ${segmentPattern(project)}\n`).join("");

export const writeSegment = (studioDir:string, project:string, extra:string[] = [], exclude:string[] = []) : string =>
{
    const path = join(studioDir, "audit", "segment.toml");
    const body = `[segments.one]\n`
        + segmentMatchers([project, ...extra], "includes")
        + segmentMatchers(exclude, "excludes");
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

    if(opts.project) { writeSegment(opts.studioDir, opts.project, opts.segmentIncludes ?? [], opts.segmentExcludes ?? []); }

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
