import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { studioDir } from "../config";
import { joinDocument, splitDocument, type Document } from "../lib/frontmatter";
import { replaceSection, sectionsOf, type Section } from "../lib/markdown";
import { guardEdit, type ReviewFile } from "../lib/guard";
import { marketingNotes, mechanicalFixes, type Finding, type Fix, type MarketingNote } from "../lib/text-rules";
import type { ProjectInfo, ProjectFile } from "./inspect";

export interface ReviewedFile
{
    info: ProjectFile;
    doc: Document;
    body: string;
    sections: Section[];
}

export interface EditOutcome
{
    id: string;
    applied: boolean;
    reasons: string[];
    warnings: string[];
}

export interface TextStageResult
{
    status: "pass" | "warn" | "fail" | "skipped";
    detail: string;
    fixes: Fix[];
    findings: Finding[];
    marketing: MarketingNote[];
    suggestions: string[];
    applied: EditOutcome[];
    rejected: EditOutcome[];
    packetPath: string | null;
    findingsPath: string | null;
}

const lineOffsetOf = (doc:Document) => doc.hasFrontmatter ? doc.frontmatter.split(doc.eol).length + 2 : 0;

export const runTextStage = (info:ProjectInfo, opts:{ dryRun:boolean, fixText:boolean, edits:string | null, outDir:string }) : TextStageResult =>
{
    const reviewDir = join(opts.outDir, "review");
    const reviewed:ReviewedFile[] = [];
    const fixes:Fix[] = [];
    const findings:Finding[] = [];
    const marketing:MarketingNote[] = [];

    const files = [...info.rulebookFiles, ...info.pageFiles];
    if(files.length === 0)
    {
        return {
            status: "skipped", detail: "no markdown to review", fixes: [], findings: [], marketing: [],
            suggestions: [], applied: [], rejected: [], packetPath: null, findingsPath: null,
        };
    }

    for(const file of files)
    {
        const text = readFileSync(file.abs, "utf8");
        const doc = splitDocument(text);
        const result = mechanicalFixes(doc.body, file.rel, file.scope, lineOffsetOf(doc));

        if(result.text !== doc.body && opts.fixText && !opts.dryRun)
        {
            writeFileSync(file.abs, joinDocument(doc, doc.frontmatter, result.text), "utf8");
        }
        doc.body = result.text;

        fixes.push(...result.fixes);
        findings.push(...result.findings);

        if(file.scope === "page")
        {
            marketing.push(...marketingNotes({ blurb: info.blurb, body: result.text }));
        }

        reviewed.push({ info: file, doc, body: result.text, sections: sectionsOf(result.text) });
    }

    // Two files can produce the same marketing note; keep one of each.
    const uniqueMarketing = Array.from(new Map(marketing.map(note => [`${note.code}:${note.message}`, note])).values());

    mkdirSync(reviewDir, { recursive: true });
    const packetPath = join(reviewDir, "packet.md");
    writeFileSync(packetPath, renderPacket(info, reviewed, findings, uniqueMarketing), "utf8");

    const findingsPath = join(reviewDir, "findings.md");
    writeFileSync(findingsPath, renderFindings(info, findings, uniqueMarketing), "utf8");

    writeFileSync(join(reviewDir, "edits.example.json"), JSON.stringify({
        edits: reviewed.slice(0, 1).map(file => ({
            id: `${file.info.rel}#${file.sections[0]?.id ?? "intro"}`,
            text: "<the full replacement, heading line included>",
            reason: "<what was wrong: a typo, an ambiguity, a redundancy>",
        })),
        designSuggestions: ["<a game-design idea worth considering; never applied automatically>"],
        marketingSuggestions: ["<a stronger hook or tighter sentence; apply by hand in _index.md>"],
    }, null, 2), "utf8");

    let applied:EditOutcome[] = [];
    let rejected:EditOutcome[] = [];
    const suggestions:string[] = [];
    if(opts.edits)
    {
        const path = resolve(existsSync(opts.edits) ? opts.edits : join(studioDir, opts.edits));
        if(!existsSync(path))
        {
            return {
                status: "fail", detail: `--edits file not found: ${path}`, fixes, findings, marketing: uniqueMarketing,
                suggestions, applied, rejected, packetPath, findingsPath,
            };
        }
        const data = JSON.parse(readFileSync(path, "utf8")) as ReviewFile;
        for(const suggestion of data.designSuggestions ?? []) { suggestions.push(`design: ${suggestion}`); }
        for(const suggestion of data.marketingSuggestions ?? []) { suggestions.push(`marketing: ${suggestion}`); }

        const outcome = applyEdits(reviewed, data, opts.dryRun);
        applied = outcome.applied;
        rejected = outcome.rejected;
    }

    const parts:string[] = [];
    parts.push(`${reviewed.length} file(s)`);
    parts.push(fixes.length > 0 ? `${fixes.length} safe fix(es)${opts.fixText && !opts.dryRun ? " applied" : " found (not written)"}` : "no safe fixes");
    parts.push(`${findings.length + uniqueMarketing.length} note(s) to read`);
    if(applied.length > 0) { parts.push(`${applied.length} review edit(s) applied`); }
    if(rejected.length > 0) { parts.push(`${rejected.length} edit(s) rejected by the meaning guard`); }

    return {
        status: rejected.length > 0 ? "warn" : "pass",
        detail: parts.join(", "),
        fixes, findings, marketing: uniqueMarketing, suggestions, applied, rejected,
        packetPath, findingsPath,
    };
};

const applyEdits = (reviewed:ReviewedFile[], data:ReviewFile, dryRun:boolean) =>
{
    const applied:EditOutcome[] = [];
    const rejected:EditOutcome[] = [];

    for(const edit of data.edits ?? [])
    {
        const outcome:EditOutcome = { id: edit.id, applied: false, reasons: [], warnings: [] };
        if(!edit.id.includes("#"))
        {
            outcome.reasons.push(`the id must look like "rules/_index.md#setup" (file and section)`);
            rejected.push(outcome);
            continue;
        }

        const [fileRel, sectionId] = edit.id.split("#");
        const file = reviewed.find(candidate => candidate.info.rel === fileRel);

        if(!file)
        {
            outcome.reasons.push(`no reviewed file called "${fileRel}"`);
            rejected.push(outcome);
            continue;
        }

        // re-read: an earlier edit in this run may already have rewritten the file
        const text = readFileSync(file.info.abs, "utf8");
        const doc = splitDocument(text);
        const section = sectionsOf(doc.body).find(candidate => candidate.id === sectionId);
        if(!section)
        {
            outcome.reasons.push(`"${fileRel}" has no section with id "${sectionId}"`);
            rejected.push(outcome);
            continue;
        }

        const verdict = guardEdit(section.text, edit.text, file.info.scope);
        outcome.reasons.push(...verdict.reasons);
        outcome.warnings.push(...verdict.warnings);

        if(!verdict.ok)
        {
            rejected.push(outcome);
            continue;
        }

        const body = replaceSection(doc.body, section, edit.text);
        if(!dryRun)
        {
            writeFileSync(file.info.abs, joinDocument(doc, doc.frontmatter, body), "utf8");
        }
        outcome.applied = true;
        applied.push(outcome);
    }

    return { applied, rejected };
};

const renderPacket = (info:ProjectInfo, reviewed:ReviewedFile[], findings:Finding[], marketing:MarketingNote[]) =>
{
    const lines:string[] = [];
    lines.push(`# Text review packet — ${info.title}`);
    lines.push("");
    lines.push(`Project: \`${info.projectPath}\` · ${reviewed.length} file(s) · generated review packet.`);
    lines.push("");
    lines.push("## How to use this");
    lines.push("");
    lines.push("1. Review with `prompts/rulebook-review.md` (rules) and `prompts/marketing-review.md` (page copy).");
    lines.push("2. Write answers to an edits JSON (see `edits.example.json` next to this file).");
    lines.push("3. Run `bun run release " + info.projectPath + " --edits <that file>` to apply them.");
    lines.push("");
    lines.push("An edit replaces **one whole section**, heading line included, and is checked by the meaning guard:");
    lines.push("numbers, links, shortcodes, images and headings must survive, and the wording must stay recognisably the same.");
    lines.push("Anything the guard rejects is reported instead of written. Design ideas never go in `edits` — they go in");
    lines.push("`designSuggestions`, because the rulebook may only change in wording, never in meaning.");
    lines.push("");

    if(findings.length > 0)
    {
        lines.push(`## Already spotted (${findings.length})`);
        lines.push("");
        for(const finding of findings) { lines.push(`- ${finding.file}:${finding.line} — ${finding.message}`); }
        lines.push("");
    }
    if(marketing.length > 0)
    {
        lines.push("## Marketing notes");
        lines.push("");
        for(const note of marketing) { lines.push(`- ${note.code}: ${note.message}`); }
        lines.push("");
    }

    for(const file of reviewed)
    {
        lines.push(`## ${file.info.rel} (${file.info.scope})`);
        lines.push("");
        for(const section of file.sections)
        {
            // an empty intro (or a heading with nothing under it) is not worth an edit slot; the
            // EMPTY_SECTION finding already points at the latter
            const content = section.text.trim();
            if(content.length === 0 || content === section.heading.trim()) { continue; }

            const heading = section.heading.length > 0 ? section.heading : "(intro)";
            lines.push(`### [${file.info.rel}#${section.id}] ${heading}`);
            lines.push("");
            lines.push("```md");
            lines.push(section.text.trimEnd());
            lines.push("```");
            lines.push("");
        }
    }

    return lines.join("\n");
};

const renderFindings = (info:ProjectInfo, findings:Finding[], marketing:MarketingNote[]) =>
{
    const lines:string[] = [];
    lines.push(`# Review notes — ${info.title}`);
    lines.push("");
    const bySeverity = (severity:string) => findings.filter(finding => finding.severity === severity);
    for(const severity of ["error", "warn", "info"])
    {
        const list = bySeverity(severity);
        lines.push(`## ${severity} (${list.length})`);
        lines.push("");
        if(list.length === 0) { lines.push("_none_"); lines.push(""); continue; }
        for(const finding of list)
        {
            lines.push(`- **${finding.code}** ${finding.file}:${finding.line} — ${finding.message}`);
            if(finding.excerpt) { lines.push(`  > ${finding.excerpt}`); }
        }
        lines.push("");
    }
    lines.push("## marketing");
    lines.push("");
    if(marketing.length === 0) { lines.push("_none_"); }
    for(const note of marketing) { lines.push(`- **${note.code}** — ${note.message}`); }
    lines.push("");
    return lines.join("\n");
};
