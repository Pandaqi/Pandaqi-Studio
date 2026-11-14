import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { runStaticChecks } from "./static";

// R-14: a typo should not cost a build and a four-minute wait to discover. Every commit runs the source
// checks (SC-1..SC-8) for the projects it touches — 2 s for the whole tree, so shared code just runs all.
//
// Wired up as a git hook by `audit/githooks/pre-commit` (see `git config core.hooksPath` there).

const studioDir = join(import.meta.dir, "..", "..");

const stagedFiles = () : string[] =>
{
    try
    {
        const repoRoot = execFileSync("git", ["-C", studioDir, "rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
        const out = execFileSync("git", ["-C", repoRoot, "diff", "--cached", "--name-only", "--diff-filter=ACMR"], { encoding: "utf8" });
        return out.split("\n").map(l => l.trim()).filter(Boolean).map(l => l.split("\\").join("/"));
    }
    catch(e)
    {
        // no git, or an unborn branch: nothing to check
        return [];
    }
}

// A staged path maps onto the project whose pages could be affected by it. Anything that is not page or
// project content (the libraries, the layouts, the config) can affect every page, so it clears the scope.
const SHARED = /^(?:pandaqi-studio\/(?:config\.toml|themes\/pandaqi\/(?:layouts|static)\/|themes\/pandaqi\/assets\/lib\/|themes\/pandaqi\/assets\/js\/)|\.github\/|pandaqi-studio\/audit\/)/;

const projectOf = (path:string) : string | null =>
{
    if(SHARED.test(path)) { return null; }
    let match = path.match(/^pandaqi-studio\/content\/([^/]+)\//);
    if(match) { return match[1]; }
    match = path.match(/^pandaqi-studio\/themes\/pandaqi\/assets\/games\/([^/]+)\//);
    if(match) { return match[1]; }
    return null;
}

const files = stagedFiles();
const projects = new Set<string>();
let shared = files.length === 0;

for(const file of files)
{
    const project = projectOf(file);
    if(!project) { shared = shared || /pandaqi-studio\//.test(file); continue; }
    projects.add(project);
}

if(files.length === 0)
{
    console.log("[precommit] nothing staged; skipping the static checks.");
    process.exit(0);
}

const filters = shared ? [undefined] : Array.from(projects).sort();
const seen = new Set<string>();
let errors = 0;
let info = 0;

for(const filter of filters)
{
    const result = runStaticChecks({ filter, quiet: true });
    for(const finding of result.findings)
    {
        if(finding.severity === "error") { errors++; }
        // info is a standing to-do list, not a commit gate: printing ~70 lines on every commit would train
        // everyone to ignore the output
        if(finding.severity === "info") { info++; continue; }
        const key = `${finding.check}|${finding.file}|${finding.line}|${finding.message}`;
        if(seen.has(key)) { continue; }
        seen.add(key);
        const where = finding.file ? `${finding.file}:${finding.line}` : "(tree)";
        console.log(`[precommit] ${finding.check} ${finding.severity} ${where} — ${finding.message}`);
    }
}

const scope = shared ? "every project (shared code changed)" : filters.join(", ");
console.log(`[precommit] static checks: ${scope} — ${errors} error(s), ${info} info (see \`bun run static\`)`);

if(errors > 0)
{
    console.error("[precommit] fix the errors above, or commit with --no-verify to skip this check.");
    process.exit(1);
}
