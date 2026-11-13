import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import type { PageResult, ReportData } from "./types";

const esc = (s:string) => String(s ?? "").replace(/\|/g, "\\|");

const projectOf = (url:string) =>
{
    const parts = url.split("/").filter(Boolean);
    return parts.length > 0 ? parts[0] : "(root)";
}

const toRel = (outDir:string, file:string) =>
{
    const rel = relative(outDir, resolve(file));
    return rel.split("\\").join("/");
}

const failuresOf = (result:PageResult) =>
{
    const codes = Array.from(new Set(result.failures.map(f => f.code)));
    return codes.length > 0 ? codes.join(", ") : "";
}

const writeMarkdown = (path:string, data:ReportData, outDir:string) =>
{
    const lines:string[] = [];
    lines.push("# Audit report");
    lines.push("");
    lines.push(`- Generated: ${data.generatedAt}`);
    lines.push(`- Seed: \`${data.seed}\``);
    lines.push(`- Build: exit ${data.build.exitCode}, ${(data.build.durationMs / 1000).toFixed(1)} s${data.build.cached ? " (reused)" : ""}`);
    lines.push(`- Pages: ${data.summary.pages} — pass ${data.summary.pass}, fail ${data.summary.fail}, skip ${data.summary.skip}`);
    lines.push("");
    if(Object.keys(data.summary.failuresByCode).length > 0)
    {
        lines.push("## Failures by code");
        lines.push("");
        lines.push("| Code | Count |");
        lines.push("|---|---|");
        for(const [code, count] of Object.entries(data.summary.failuresByCode).sort((a, b) => b[1] - a[1]))
        {
            lines.push(`| ${esc(code)} | ${count} |`);
        }
        lines.push("");
    }

    lines.push("## Pages");
    lines.push("");
    lines.push("| Page | Contract | Status | Failures | Artifacts |");
    lines.push("|---|---|---|---|---|");
    for(const result of data.results)
    {
        const artifacts = result.artifacts.length > 0 ? `${result.artifacts.length}` : "";
        lines.push(`| ${esc(result.url)} | ${result.contract} | ${result.status} | ${esc(failuresOf(result))} | ${artifacts} |`);
    }
    lines.push("");

    if(data.needsManual.length > 0)
    {
        lines.push("## Needs manual pass");
        lines.push("");
        for(const item of data.needsManual) { lines.push(`- \`${item.url}\` — ${item.reason}`); }
        lines.push("");
    }

    const warnings = data.results.filter(r => r.warnings.length > 0);
    if(warnings.length > 0)
    {
        lines.push("## Warnings");
        lines.push("");
        for(const result of warnings)
        {
            for(const warning of result.warnings) { lines.push(`- \`${result.url}\`: ${warning}`); }
        }
        lines.push("");
    }

    lines.push("## Checklist (paste into ROADMAP.md)");
    lines.push("");
    for(const result of data.results)
    {
        const mark = result.status === "pass" ? "x" : " ";
        lines.push(`- [${mark}] ${result.url}`);
    }
    lines.push("");

    writeFileSync(path, lines.join("\n"), "utf8");
}

const writeContactSheet = (path:string, data:ReportData, outDir:string) =>
{
    const byProject = new Map<string, PageResult[]>();
    for(const result of data.results)
    {
        const project = projectOf(result.url);
        if(!byProject.has(project)) { byProject.set(project, []); }
        (byProject.get(project) as PageResult[]).push(result);
    }

    const sections:string[] = [];
    for(const [project, results] of Array.from(byProject.entries()).sort((a, b) => a[0].localeCompare(b[0])))
    {
        const cards:string[] = [];
        for(const result of results)
        {
            const images = result.artifacts
                .filter(file => file.toLowerCase().endsWith(".png"))
                .map(file => `<figure><img loading="lazy" src="${toRel(outDir, file)}"><figcaption>${file.split(/[\\/]/).pop()}</figcaption></figure>`)
                .join("\n");
            const failures = result.failures
                .map(f => `<li><code>${f.code}</code> ${f.message}</li>`)
                .join("");
            cards.push(`<article class="card ${result.status}">
  <h3>${result.url}</h3>
  <p class="meta">${result.contract} · ${result.status}${result.profiles ? ` · ${result.profiles.join(", ")}` : ""}</p>
  ${failures ? `<ul class="failures">${failures}</ul>` : ""}
  <div class="gallery">${images || "<p class=meta>no artifacts</p>"}</div>
</article>`);
        }
        sections.push(`<section><h2>${project}</h2>${cards.join("\n")}</section>`);
    }

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Audit contact sheet — ${data.generatedAt}</title>
<style>
  :root { color-scheme: light; }
  body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #f6f5f2; color: #1d1b19; }
  h1 { margin: 0 0 4px; }
  .summary { color: #555; margin-bottom: 24px; }
  section { margin-bottom: 32px; }
  h2 { border-bottom: 2px solid #ddd; padding-bottom: 4px; }
  .card { background: #fff; border-radius: 10px; padding: 16px; margin-bottom: 16px; border-left: 6px solid #2e7d32; }
  .card.fail { border-left-color: #c62828; }
  .card.skip { border-left-color: #9e9e9e; }
  .card h3 { margin: 0 0 4px; font-size: 1rem; font-family: ui-monospace, monospace; }
  .meta { color: #666; font-size: .85rem; margin: 0 0 8px; }
  .failures { color: #b71c1c; font-size: .85rem; margin: 0 0 12px; }
  .gallery { display: flex; flex-wrap: wrap; gap: 12px; }
  figure { margin: 0; }
  img { max-width: 320px; max-height: 320px; border: 1px solid #e0e0e0; background: #fafafa; display: block; }
  figcaption { font-size: .7rem; color: #888; }
</style>
</head>
<body>
<h1>Audit contact sheet</h1>
<p class="summary">${data.summary.pages} pages · ${data.summary.pass} pass · ${data.summary.fail} fail · ${data.summary.skip} skip ·
seed <code>${data.seed}</code> · build exit ${data.build.exitCode}</p>
${sections.join("\n")}
</body>
</html>`;

    writeFileSync(path, html, "utf8");
}

export const writeReports = (outDir:string, data:ReportData) =>
{
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "report.json"), JSON.stringify(data, null, 2), "utf8");
    writeMarkdown(join(outDir, "report.md"), data, outDir);
    writeContactSheet(join(outDir, "index.html"), data, outDir);
}

export const failureCounts = (results:PageResult[]) =>
{
    const counts:Record<string, number> = {};
    for(const result of results)
    {
        for(const failure of result.failures)
        {
            counts[failure.code] = (counts[failure.code] ?? 0) + 1;
        }
    }
    return counts;
}

export const copyBaseline = (from:string, toDir:string) =>
{
    if(!existsSync(from)) { return; }
    mkdirSync(toDir, { recursive: true });
    copyFileSync(from, join(toDir, from.split(/[\\/]/).pop() as string));
}
