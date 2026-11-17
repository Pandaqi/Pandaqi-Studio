import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { assetsDir, cacheDir, studioDir } from "../config";
import { relPosix } from "../lib/files";
import { hasBunCommand, run } from "../lib/proc";
import type { Status } from "../report";
import type { ProjectInfo } from "./inspect";

// No dependencies: Bun ships the type checker (`bun check`), the formatter (`bun fmt`) and — from the
// release after 1.4.4 — a linter (`bun lint`, https://bun.com/docs/lint). The installed runtime decides
// what can run; `hasBunCommand` keeps this honest either way, so nothing is faked with a package.

export interface ToolOutcome
{
    status: Status;
    detail: string;
    output?: string;
}

export interface CodeStageResult
{
    status: Status;
    detail: string;
    files: string[];
    typecheck: ToolOutcome;
    lint: ToolOutcome;
    format: ToolOutcome;
}

const firstLines = (text:string, count:number) => text.split(/\r?\n/).filter(line => line.trim().length > 0).slice(0, count).join("\n");

// The project's tsconfig keeps `baseUrl`, which the checker Bun ships has removed. Rather than edit
// the shared config, the pipeline generates a scoped one with the same options and relative paths,
// so nothing about the studio's own configuration changes.
const writeCheckConfig = () =>
{
    mkdirSync(cacheDir, { recursive: true });
    const assetRoot = relPosix(cacheDir, assetsDir);
    const path = join(cacheDir, "tsconfig.check.json");
    writeFileSync(path, JSON.stringify({
        compilerOptions: {
            lib: ["DOM", "DOM.Iterable", "ES2023"],
            target: "ES2020",
            module: "esnext",
            moduleResolution: "bundler",
            paths: { "*": [`${assetRoot}/*`] },
            strict: false,
            noEmit: true,
            skipLibCheck: true,
            allowJs: false,
        },
        include: [
            `${assetRoot}/lib/**/*.ts`,
            `${assetRoot}/games/**/*.ts`,
            `${assetRoot}/*.ts`,
        ],
    }, null, 2), "utf8");
    return path;
};

const relativeFiles = (info:ProjectInfo) => info.codeFiles.map(file => relPosix(studioDir, file));

// The checker reports every error in the assets tree; only the ones in this project's own code
// block a release. The rest is counted and mentioned, because it is usually not this release's job.
const typeErrors = (output:string, info:ProjectInfo) =>
{
    const pattern = /(?:^|\s)([^\s(]+\.tsx?)\((\d+),(\d+)\): error (TS\d+): (.+)/g;
    const inside:string[] = [];
    let outside = 0;
    for(const match of output.matchAll(pattern))
    {
        const file = match[1].split("\\").join("/");
        const owned = file.startsWith(`assets/games/${info.projectPath}/`) || file.startsWith(`assets/games/${info.slug}/`);
        if(owned) { inside.push(`${file}:${match[2]}:${match[3]} ${match[4]} ${match[5]}`); }
        else { outside++; }
    }
    return { inside, outside };
};

const typecheck = async (info:ProjectInfo) : Promise<ToolOutcome> =>
{
    if(!(await hasBunCommand("check", studioDir)))
    {
        return { status: "unavailable", detail: "this Bun build has no `bun check`; upgrade Bun to type check" };
    }

    const result = await run("bun", ["check", "-p", writeCheckConfig()], { cwd: studioDir });
    const output = `${result.stdout}\n${result.stderr}`;
    const { inside, outside } = typeErrors(output, info);

    if(inside.length > 0)
    {
        return { status: "fail", detail: `${inside.length} type error(s) in this project`, output: inside.slice(0, 8).join("\n") };
    }
    if(result.code !== 0 && !/error TS/.test(output))
    {
        return { status: "fail", detail: "`bun check` failed to run", output: firstLines(output, 6) };
    }

    return {
        status: "pass",
        detail: outside > 0 ? `no errors in this project (${outside} pre-existing error(s) elsewhere)` : "no errors",
    };
};

const lint = async (info:ProjectInfo) : Promise<ToolOutcome> =>
{
    if(!(await hasBunCommand("lint", studioDir)))
    {
        return {
            status: "unavailable",
            detail: "this Bun build has no `bun lint` (it ships in the release after 1.4.4; `bun --help` lists only check and fmt) — run `bun upgrade` to use it, see bun.com/docs/lint",
        };
    }

    const result = await run("bun", ["lint", ...relativeFiles(info)], { cwd: studioDir });
    const lines = (result.stdout + "\n" + result.stderr).split(/\r?\n/);
    const errors = lines.filter(line => /^\s*error\s*:/.test(line));
    const warnings = lines.filter(line => /^\s*warn(?:ing)?\s*:/.test(line));

    // Warnings alone exit 0, so only a nonzero exit blocks a release.
    if(result.code !== 0)
    {
        return {
            status: "fail",
            detail: `${errors.length || "some"} lint error(s)`,
            output: [...errors, ...warnings].slice(0, 10).join("\n"),
        };
    }
    return { status: "pass", detail: warnings.length > 0 ? `${warnings.length} lint warning(s), no errors` : "clean" };
};

// A file that is new in git is the only kind the formatter writes. Reformatting a published
// project's existing code would bury a release in restyling nobody asked for.
const untracked = async (files:string[]) : Promise<Set<string>> =>
{
    const result = await run("git", ["ls-files", "-z", "--", ...files], { cwd: studioDir });
    if(result.code !== 0) { return new Set(); }
    const tracked = new Set(result.stdout.split("\0").filter(Boolean).map(file => file.split("\\").join("/")));
    return new Set(files.filter(file => !tracked.has(file)));
};

const format = async (info:ProjectInfo, allowWrite:boolean, dryRun:boolean) : Promise<ToolOutcome> =>
{
    if(!(await hasBunCommand("fmt", studioDir)))
    {
        return { status: "unavailable", detail: "this Bun build has no `bun fmt` (added in Bun 1.4.4); run `bun upgrade`" };
    }

    const files = relativeFiles(info);
    const check = await run("bun", ["fmt", "--check", ...files], { cwd: studioDir });
    if(check.code === 0) { return { status: "pass", detail: "already formatted" }; }

    const needing = (check.stdout + "\n" + check.stderr)
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => /\.(ts|tsx|js|jsx)$/.test(line));

    if(!allowWrite)
    {
        return { status: "warn", detail: `${needing.length || "some"} file(s) need formatting (\`--no-format\` was given)` };
    }

    const fresh = [...await untracked(needing.length > 0 ? needing : files)];
    const kept = needing.length - fresh.length;
    if(fresh.length === 0)
    {
        return {
            status: "warn",
            detail: `${kept || "some"} existing file(s) are not bun-fmt formatted; left untouched (a release only formats new code)`,
        };
    }

    if(dryRun)
    {
        return { status: "warn", detail: `${fresh.length} new file(s) need formatting (dry run, nothing written)` };
    }

    const written = await run("bun", ["fmt", "--tab-width", "4", "--print-width", "120", ...fresh], { cwd: studioDir });
    if(written.code !== 0)
    {
        return { status: "fail", detail: "`bun fmt` failed", output: firstLines(written.stderr || written.stdout, 6) };
    }
    return {
        status: "pass",
        detail: `formatted ${fresh.length} new file(s)` + (kept > 0 ? `, left ${kept} existing file(s) alone` : ""),
    };
};

export const runCodeStage = async (info:ProjectInfo, opts:{ format:boolean, dryRun:boolean }) : Promise<CodeStageResult> =>
{
    if(info.codeFiles.length === 0)
    {
        const skipped:ToolOutcome = { status: "skipped", detail: "no game code" };
        return {
            status: "skipped",
            detail: "this project has no game code under assets/games",
            files: [],
            typecheck: skipped,
            lint: skipped,
            format: skipped,
        };
    }

    const typecheckResult = await typecheck(info);
    const lintResult = await lint(info);
    const formatResult = await format(info, opts.format, opts.dryRun);

    const statuses = [typecheckResult.status, lintResult.status, formatResult.status];
    const status:Status = statuses.includes("fail") ? "fail" : statuses.includes("warn") ? "warn" : "pass";

    return {
        status,
        detail: [
            `typecheck ${typecheckResult.detail}`,
            `lint ${lintResult.detail}`,
            `format ${formatResult.detail}`,
        ].join(" · "),
        files: relativeFiles(info),
        typecheck: typecheckResult,
        lint: lintResult,
        format: formatResult,
    };
};
