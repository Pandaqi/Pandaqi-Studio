import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Finding, Fix } from "./lib/text-rules";

export type Status = "pass" | "warn" | "fail" | "skipped" | "unavailable";

export interface StageResult
{
    name: string;
    status: Status;
    detail: string;
}

const LABEL:Record<Status,string> = {
    pass: "ok  ",
    warn: "warn",
    fail: "FAIL",
    skipped: "skip",
    unavailable: "n/a ",
};

export class Reporter
{
    stages:StageResult[] = [];
    messages:string[] = [];

    stage(name:string, status:Status, detail:string)
    {
        this.stages.push({ name, status, detail });
        const label = LABEL[status];
        console.log(`[${label}] ${name} — ${detail}`);
    }

    warn(message:string)
    {
        this.messages.push(`warning: ${message}`);
        console.log(`        ! ${message}`);
    }

    info(message:string)
    {
        console.log(`        · ${message}`);
    }

    failed()
    {
        return this.stages.some(stage => stage.status === "fail");
    }
}

export interface ReportData
{
    project: string;
    projectPath: string;
    generatedAt: string;
    dryRun: boolean;
    stages: StageResult[];
    messages: string[];
    fixes: Fix[];
    findings: Finding[];
    suggestions: string[];
    marketing: { code:string, message:string }[];
    audit: { url:string, contract:string, status:string, failures:string[] }[];
    media: { file:string, bytes:number, width:number, height:number }[];
    finalize: string[];
    nextSteps: string[];
    paths: Record<string, string | null>;
}

const table = (rows:StageResult[]) =>
{
    const lines = ["| stage | status | detail |", "| --- | --- | --- |"];
    for(const row of rows)
    {
        lines.push(`| ${row.name} | ${row.status} | ${row.detail.replace(/\|/g, "\\|")} |`);
    }
    return lines.join("\n");
};

const list = (items:string[], empty = "none") => items.length > 0 ? items.map(item => `- ${item}`).join("\n") : `_${empty}_`;

export const renderReport = (data:ReportData) : string =>
{
    const blocking = data.stages.filter(stage => stage.status === "fail");
    const verdict = blocking.length === 0 ? "READY" : "NOT READY";

    const lines:string[] = [];
    lines.push(`# Release: ${data.project}`);
    lines.push("");
    lines.push(`Generated ${data.generatedAt}${data.dryRun ? " (dry run — nothing was written)" : ""}.`);
    lines.push("");
    lines.push(`## ${verdict}`);
    lines.push("");
    if(blocking.length > 0)
    {
        lines.push("Blocking:");
        lines.push(list(blocking.map(stage => `**${stage.name}**: ${stage.detail}`)));
    }
    else
    {
        lines.push("Every stage that could run passed. Warnings below are worth a look, not a blocker.");
    }
    lines.push("");
    lines.push(table(data.stages));
    lines.push("");

    lines.push("## Messages");
    lines.push(list(data.messages));
    lines.push("");

    lines.push(`## Text fixes applied (${data.fixes.length})`);
    if(data.fixes.length === 0) { lines.push("_none: no objective mistakes were found, or fixes were disabled_"); }
    else
    {
        lines.push("| file | line | what | before → after |");
        lines.push("| --- | --- | --- | --- |");
        for(const fix of data.fixes)
        {
            lines.push(`| ${fix.file} | ${fix.line} | ${fix.code} | \`${fix.before}\` → \`${fix.after}\` |`);
        }
    }
    lines.push("");

    const findings = data.findings;
    lines.push(`## Text review notes (${findings.length})`);
    if(findings.length === 0) { lines.push("_none_"); }
    else
    {
        lines.push("| severity | file:line | note | excerpt |");
        lines.push("| --- | --- | --- | --- |");
        for(const finding of findings)
        {
            lines.push(`| ${finding.severity} | ${finding.file}:${finding.line} | ${finding.code}: ${finding.message.replace(/\|/g, "\\|")} | ${(finding.excerpt ?? "").replace(/\|/g, "\\|").slice(0, 100)} |`);
        }
    }
    lines.push("");

    lines.push("## Marketing notes");
    lines.push(list(data.marketing.map(note => `${note.code}: ${note.message}`)));
    lines.push("");

    lines.push("## Suggestions (not executed)");
    lines.push(list(data.suggestions, "none yet — the agent pass fills this in"));
    lines.push("");

    lines.push("## Audit");
    if(data.audit.length === 0) { lines.push("_no pages were audited_"); }
    else
    {
        lines.push("| page | contract | status | failures |");
        lines.push("| --- | --- | --- | --- |");
        for(const entry of data.audit)
        {
            lines.push(`| ${entry.url} | ${entry.contract} | ${entry.status} | ${entry.failures.join("; ").replace(/\|/g, "\\|") || "-"} |`);
        }
    }
    lines.push("");

    lines.push("## Marketing media");
    if(data.media.length === 0) { lines.push("_nothing added_"); }
    else
    {
        lines.push("| file | size | dimensions |");
        lines.push("| --- | --- | --- |");
        for(const item of data.media)
        {
            lines.push(`| ${item.file} | ${(item.bytes / 1024).toFixed(1)} KB | ${item.width}×${item.height} |`);
        }
    }
    lines.push("");

    lines.push("## Final page");
    lines.push(list(data.finalize));
    lines.push("");

    lines.push("## Next steps");
    lines.push(list(data.nextSteps, "nothing left to do"));
    lines.push("");

    lines.push("## Files");
    for(const [name, path] of Object.entries(data.paths))
    {
        lines.push(`- ${name}: ${path ?? "(not produced)"}`);
    }
    lines.push("");

    return lines.join("\n");
};

export const writeReport = (outDir:string, data:ReportData) =>
{
    mkdirSync(outDir, { recursive: true });
    const markdown = renderReport(data);
    writeFileSync(join(outDir, "report.md"), markdown, "utf8");
    writeFileSync(join(outDir, "report.json"), JSON.stringify({ ...data, markdown: undefined }, null, 2), "utf8");
    return join(outDir, "report.md");
};
