import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { joinDocument, readField, readListField, removeField, setField, splitDocument } from "../lib/frontmatter";
import { builtPageExists } from "./audit";
import type { ProjectInfo } from "./inspect";

// "Visible and final" has a precise meaning on this site:
//   date <= today        (a future date hides the page from the production build)
//   no `draft: true`     (Hugo never publishes a draft)
//   the page says enough for a stranger to decide whether to play it
//   every `media` entry points at a file that actually exists
//   the page exists in the filtered build

export interface FinalizeResult
{
    status: "pass" | "warn" | "fail";
    detail: string;
    changes: string[];
    notes: string[];
}

const todayIso = () =>
{
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
};

const parseDate = (value:string | null) =>
{
    if(!value) { return null; }
    const match = value.match(/(\d{4})-(\d{2})-(\d{2})/);
    if(!match) { return null; }
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
};

const REQUIRED = ["type", "title", "blurb", "date"];
const RECOMMENDED = ["categories", "genres", "playtime", "playercount", "ages", "language", "multiplayermode", "difficulty"];

const mediaExists = (info:ProjectInfo, entry:string) =>
{
    if(/^https?:|youtube\.com|youtu\.be/i.test(entry)) { return true; }
    const clean = entry.replace(/^\/+/, "").replace(/\.(webp|jpe?g|png|mp4|webm)$/i, "");
    for(const extension of ["webp", "jpg", "jpeg", "png", "mp4", "webm"])
    {
        if(existsSync(join(info.dir, `${clean}.${extension}`))) { return true; }
    }
    return false;
};

export const runFinalizeStage = (
    info:ProjectInfo,
    opts:{ dryRun:boolean, setDate:boolean, keepDraft:boolean, checkBuiltPage:boolean },
) : FinalizeResult =>
{
    const changes:string[] = [];
    const notes:string[] = [];
    const errors:string[] = [];

    if(!existsSync(info.indexMd))
    {
        return { status: "fail", detail: "_index.md is missing", changes, notes };
    }

    const text = readFileSync(info.indexMd, "utf8");
    const doc = splitDocument(text);
    let lines = doc.frontmatter.split(doc.eol);
    const before = lines.join("\n");
    const today = todayIso();

    // --- date ------------------------------------------------------------------
    const date = readField(lines, "date");
    const parsed = parseDate(date);
    if(!date || !parsed)
    {
        lines = setField(lines, "date", today);
        changes.push(`set \`date\` to ${today} (it was missing, which leaves the page undated)`);
    }
    else if(opts.setDate)
    {
        if(date !== today)
        {
            lines = setField(lines, "date", today);
            changes.push(`set \`date\` to ${today}`);
        }
    }
    else if(parsed.getTime() > Date.now())
    {
        lines = setField(lines, "date", today);
        changes.push(`moved \`date\` from ${date} (in the future, so the production build would skip it) to ${today}`);
    }

    // --- draft -----------------------------------------------------------------
    const draft = (readField(lines, "draft") ?? "").toLowerCase() === "true";
    if(draft && !opts.keepDraft)
    {
        lines = removeField(lines, "draft");
        changes.push("removed `draft: true` so the page is published");
    }
    else if(draft)
    {
        errors.push("the page is still a draft (`draft: true`)");
    }

    // --- required / recommended fields ----------------------------------------
    for(const field of REQUIRED)
    {
        if(!readField(lines, field)) { errors.push(`\`${field}\` is missing`); }
    }
    for(const field of RECOMMENDED)
    {
        if(readField(lines, field) === null && readListField(lines, field).length === 0)
        {
            notes.push(`\`${field}\` is missing; the page will render without that fact/facet`);
        }
    }

    // --- media -----------------------------------------------------------------
    const media = readListField(lines, "media");
    for(const entry of media)
    {
        if(!mediaExists(info, entry))
        {
            errors.push(`media entry "${entry}" does not resolve to a file in content/${info.projectPath}/`);
        }
    }
    if(media.length === 0) { notes.push("the page has no media gallery yet"); }

    // --- artwork ---------------------------------------------------------------
    const hasHeader = ["webp", "jpg", "jpeg", "png"].some(extension => existsSync(join(info.assetsDir, `${info.slug}-header.${extension}`)));
    if(!hasHeader) { notes.push(`no ${info.slug}-header.(webp|png|jpg) in the page bundle; the banner falls back to theme artwork`); }

    // --- the page actually built ----------------------------------------------
    if(!opts.checkBuiltPage)
    {
        notes.push("the filtered build's page was not checked (the audit stage did not run)");
    }
    else if(!builtPageExists(info))
    {
        errors.push(`the filtered build has no page at /${info.projectPath}/ (audit-artifacts/site)`);
    }

    // A blocked page is left exactly as it is: half-applying a release to a page that is not ready
    // (the date got set, the draft did not) is harder to reason about than writing nothing at all.
    const blocked = errors.length > 0;
    const pending = lines.join("\n") !== before;
    if(pending && blocked)
    {
        notes.push(`nothing was written: ${errors.length} blocking error(s) below must be fixed first` +
            (changes.length > 0 ? ` (${changes.length} change(s) held back)` : ""));
    }
    else if(pending && !opts.dryRun)
    {
        writeFileSync(info.indexMd, joinDocument(doc, lines.join(doc.eol), doc.body), "utf8");
    }

    const noteCount = notes.length + errors.length;
    const changeText = opts.dryRun ? " planned" : blocked ? " held back" : " written";
    const detail = changes.length > 0
        ? `${changes.length} change(s)${changeText}` + (noteCount > 0 ? `, ${noteCount} note(s)` : "")
        : "already final" + (noteCount > 0 ? `, ${noteCount} note(s)` : "");
    const status = errors.length > 0 ? "fail" : notes.length > 0 ? "warn" : "pass";

    return { status, detail, changes, notes: [...notes, ...errors.map(error => `ERROR: ${error}`)] };
};
