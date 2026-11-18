import { existsSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { frontmatter, walk } from "./manifest";

// SC-9: a project that links to Game Buddy must point at a template that build still carries.
// The link lives in the front matter (`gamebuddy:`) and the template ids live in another repo
// (pq-game-buddy), so neither Hugo nor the type checker can see a rename. This does.
//
//   bun run gamebuddy                  check the links against the built catalogue
//   bun run gamebuddy --strict         a missing catalogue is an error too (CI)
//   bun run gamebuddy --manifest <p>   read a specific templates.json
//
// The catalogue is `dist/templates.json`, written by `bun run build` in pq-game-buddy. Without
// it there is nothing to check against, which is a warning locally and a failure with --strict.

const auditDir = resolve(import.meta.dir, "..");
const studioDir = resolve(auditDir, "..");
const contentDir = join(studioDir, "content");
const defaultManifest = resolve(studioDir, "..", "..", "..", "Shared", "pq-game-buddy", "dist", "templates.json");

// `/game-buddy/template/<id>/` is the canonical link; the hash form still resolves in the app.
const LINK = /^\/game-buddy\/(?:template\/([a-z0-9-]+)\/|#\/template\/([a-z0-9-]+))$/;

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const manifestArg = args.indexOf("--manifest");
const manifestPath = manifestArg >= 0 ? resolve(args[manifestArg + 1] ?? "") : defaultManifest;

const lineOf = (text: string, index: number) : number => text.slice(0, index).split("\n").length;

const catalogueIds = () : Set<string> | null =>
{
    if(!existsSync(manifestPath)) { return null; }
    const data = JSON.parse(readFileSync(manifestPath, "utf8")) as { templates?: { id?: string }[] };
    const ids = new Set<string>();
    for(const item of data.templates ?? []) { if(item.id) { ids.add(item.id); } }
    return ids;
};

const ids = catalogueIds();
if(ids === null)
{
    const message = `no template catalogue at ${manifestPath}; run \`bun run build\` in pq-game-buddy first`;
    if(strict)
    {
        console.error(`[buddylinks] error: ${message}`);
        process.exit(1);
    }
    console.log(`[buddylinks] skipped: ${message}`);
    process.exit(0);
}

interface Finding
{
    severity: "error" | "warn";
    file: string;
    line: number;
    message: string;
}

const findings: Finding[] = [];
const used = new Set<string>();
let links = 0;

for(const file of walk(contentDir))
{
    if(!file.endsWith("_index.md")) { continue; }
    const text = readFileSync(file, "utf8");
    const fm = frontmatter(text);
    const match = fm.match(/^\s*gamebuddy:\s*["']?([^"'\s]+)["']?\s*$/m);
    if(!match) { continue; }

    links += 1;
    const rel = relative(studioDir, file).split("\\").join("/");
    const line = lineOf(text, (match.index as number) ?? 0);
    const value = match[1];
    const parsed = value.match(LINK);
    const id = parsed?.[1] ?? parsed?.[2] ?? "";

    if(!id)
    {
        findings.push({ severity: "error", file: rel, line, message: `"${value}" is not a template link (expected /game-buddy/template/<id>/)` });
        continue;
    }
    used.add(id);
    if(!ids.has(id))
    {
        findings.push({ severity: "error", file: rel, line, message: `template "${id}" is not in the catalogue` });
    }
}

// A template nobody links to is fine; this only reports so the two lists stay visible.
const unused = [...ids].filter((id) => !used.has(id)).length;

for(const finding of findings)
{
    console.log(`[buddylinks] ${finding.severity}: ${finding.file}:${finding.line} ${finding.message}`);
}

console.log(
    `[buddylinks] ${links} links · ${used.size} templates · ` +
    `${findings.length} problem${findings.length === 1 ? "" : "s"} · ${unused} catalogue templates unused`,
);

process.exit(findings.some((finding) => finding.severity === "error") ? 1 : 0);
