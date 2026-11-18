import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { parseCli, USAGE } from "./cli";
import { outputDir, pipelineDir } from "./config";
import { relPosix } from "./lib/files";
import { Reporter, writeReport, type ReportData } from "./report";
import { inspectProject, projectSummary, type ProjectInfo } from "./stages/inspect";
import { runTextStage, type TextStageResult } from "./stages/text";
import { runCodeStage, type CodeStageResult } from "./stages/code";
import { runAuditStage, type AuditStageResult } from "./stages/audit";
import { runMediaStage, type MediaStageResult } from "./stages/media";
import { runFinalizeStage, type FinalizeResult } from "./stages/finalize";

const line = (text = "") => console.log(text);

const run = async () : Promise<number> =>
{
    const options = parseCli(Bun.argv.slice(2));
    if(options.help) { console.log(USAGE); return 0; }
    if(!options.project) { console.log(USAGE); return 2; }

    const startedAt = Date.now();
    const reporter = new Reporter();
    const outDir = outputDir(options.project);
    mkdirSync(outDir, { recursive: true });

    line(`release ${options.project}${options.dryRun ? " (dry run — nothing will be written)" : ""}`);
    line();

    const info = inspectProject(options.project);
    if(info.problems.length > 0)
    {
        reporter.stage("inspect", "fail", info.problems.join("; "));
        writeReport(outDir, buildReport({ info, reporter, results: {}, options, outDir }));
        return 2;
    }
    reporter.stage("inspect", info.warnings.length > 0 ? "warn" : "pass", projectSummary(info));
    for(const warning of info.warnings) { reporter.warn(warning); }

    // Every stage is independent: a skipped one reports why, a crashing one becomes a failed stage,
    // and the run continues so the report still covers everything that could be checked.
    const stage = async <T,>(name:string, work:() => T | Promise<T>, show:(value:T) => void) : Promise<T | null> =>
    {
        if(options.skip.has(name))
        {
            reporter.stage(name, "skipped", `--skip ${name}`);
            return null;
        }
        try
        {
            const value = await work();
            show(value);
            return value;
        }
        catch(error:any)
        {
            reporter.stage(name, "fail", `the ${name} stage threw: ${error?.message ?? error}`);
            return null;
        }
    };

    const text = await stage("text", () => runTextStage(info, {
        dryRun: options.dryRun,
        fixText: options.fixText,
        edits: options.edits,
        outDir,
    }), result =>
    {
        reporter.stage("text", result.status, result.detail);
        outputTextIssues(reporter, result);
    });

    const code = await stage("code", () => runCodeStage(info, { format: options.format, dryRun: options.dryRun }), result =>
    {
        reporter.stage("code", result.status, result.detail);
        for(const outcome of [result.typecheck, result.lint, result.format])
        {
            if(outcome.output) { line(indent(outcome.output, "          ")); }
        }
    });

    const audit = await stage("audit", () => runAuditStage(info, {
        pdfFull: options.pdfFull,
        captureRulebook: options.captureRulebook,
    }), result =>
    {
        reporter.stage("audit", result.status, result.detail);
        for(const note of result.notes) { reporter.warn(note); }
        for(const entry of result.entries)
        {
            for(const failure of entry.failures) { reporter.info(`${entry.url} — ${failure}`); }
        }
    });

    const media = await stage("media", () => runMediaStage(info, audit, {
        dryRun: options.dryRun,
        minMedia: options.minMedia,
        forceMedia: options.forceMedia,
        replaceMedia: options.replaceMedia,
        captureRulebook: options.captureRulebook,
    }), result =>
    {
        reporter.stage("media", result.status, result.detail);
        for(const note of result.notes) { reporter.warn(note); }
    });

    const finalize = await stage("finalize", () => runFinalizeStage(info, {
        dryRun: options.dryRun,
        setDate: options.setDate,
        keepDraft: options.keepDraft,
        checkBuiltPage: audit !== null,
    }), result =>
    {
        reporter.stage("finalize", result.status, result.detail);
        for(const change of result.changes) { reporter.info(change); }
        for(const note of result.notes) { reporter.warn(note); }
    });

    const reportPath = writeReport(outDir, buildReport({ info, reporter, results: { text, code, audit, media, finalize }, options, outDir }));

    line();
    line(`report: ${reportPath}  (${((Date.now() - startedAt) / 1000).toFixed(1)} s)`);
    line(reporter.failed() ? "BLOCKED — see the report for what failed." : "READY.");
    return reporter.failed() ? 2 : 0;
};

const outputTextIssues = (reporter:Reporter, text:TextStageResult) =>
{
    const important = text.findings.filter(finding => finding.severity !== "info");
    for(const finding of important.slice(0, 10))
    {
        reporter.info(`${finding.file}:${finding.line} ${finding.code}: ${finding.message}`);
    }
    if(important.length > 10) { reporter.info(`…and ${important.length - 10} more in the report`); }

    for(const note of text.marketing) { reporter.info(`marketing ${note.code}: ${note.message}`); }

    if(text.applied.length > 0) { reporter.info(`${text.applied.length} review edit(s) applied`); }
    for(const outcome of text.rejected)
    {
        reporter.warn(`the meaning guard rejected "${outcome.id}": ${outcome.reasons.join("; ")}`);
    }
    if(text.packetPath) { reporter.info(`review packet: ${text.packetPath}`); }
};

const indent = (text:string, prefix:string) =>
    text.split(/\r?\n/).map(row => prefix + row).join("\n");

interface StageResults
{
    text: TextStageResult | null;
    code: CodeStageResult | null;
    audit: AuditStageResult | null;
    media: MediaStageResult | null;
    finalize: FinalizeResult | null;
}

const buildReport = (args:{
    info:ProjectInfo;
    reporter:Reporter;
    results:Partial<StageResults>;
    options:ReturnType<typeof parseCli>;
    outDir:string;
}) : ReportData =>
{
    const { info, reporter, options, outDir } = args;
    const { text = null, code = null, audit = null, media = null, finalize = null } = args.results;

    const nextSteps:string[] = [];
    const reviewDir = join(outDir, "review");

    if(text?.packetPath)
    {
        nextSteps.push(
            `Run the text review pass: read ${join(reviewDir, "packet.md")} with ` +
            `prompts/rulebook-review.md and prompts/marketing-review.md, write an edits JSON, then ` +
            `apply it with \`bun run release ${info.projectPath} --edits <file>\`.`,
        );
    }
    if(text && text.rejected.length > 0)
    {
        nextSteps.push(`${text.rejected.length} edit(s) were rejected by the meaning guard and were NOT written; check the reasons above.`);
    }
    if(code && code.format.status === "unavailable")
    {
        nextSteps.push("Formatting needs Bun 1.4.4 or newer: run `bun upgrade`, then re-run this command.");
    }
    if(info.rulebookFiles.length === 0)
    {
        nextSteps.push(
            `No rulebook was found: add content/${info.projectPath}/rules/_index.md (type: rules) if this game has rules. ` +
            `Until then the rulebook review and rulebook audit cannot run.`,
        );
    }
    if(!info.generatorEvidence)
    {
        nextSteps.push(
            `No material generator was found in assets/games/${info.projectPath}/. If this game prints material, ` +
            `add the generator (loadGame) so the generator audit and automatic marketing screenshots can run.`,
        );
    }
    if(media && media.added.length > 0)
    {
        nextSteps.push(`Look at the new gallery in public: open /${info.projectPath}/ and check the screenshots read well at that size.`);
    }
    if(finalize && finalize.notes.some(note => note.startsWith("ERROR:")))
    {
        nextSteps.push("Fix the finalize errors, then re-run the pipeline; a page is not released until they are gone.");
    }
    if(reporter.failed())
    {
        nextSteps.push("Fix the failing stage above, then re-run the same command.");
    }
    if(nextSteps.length === 0) { nextSteps.push("Nothing left to do automatically. Publish when you are happy."); }

    return {
        project: info.title,
        projectPath: info.projectPath,
        generatedAt: new Date().toISOString(),
        dryRun: options.dryRun,
        stages: reporter.stages,
        messages: reporter.messages,
        fixes: text?.fixes ?? [],
        findings: text?.findings ?? [],
        suggestions: text?.suggestions ?? [],
        marketing: text?.marketing ?? [],
        audit: (audit?.entries ?? []).map(entry => ({
            url: entry.url,
            contract: entry.contract,
            status: entry.status,
            failures: entry.failures,
        })),
        media: media?.files.map(file => ({
            file: relPosix(info.dir, file.dest),
            bytes: file.bytes,
            width: file.width,
            height: file.height,
        })) ?? [],
        finalize: [
            ...(finalize?.changes ?? []),
            ...(media?.added ?? []).map(added => `media: ${added}`),
            ...(media?.removed ?? []).map(removed => `media replaced: ${removed}`),
        ],
        nextSteps,
        paths: {
            report: join(outDir, "report.md"),
            reviewPacket: text?.packetPath ?? null,
            reviewNotes: text?.findingsPath ?? null,
            auditReport: audit?.reportPath ?? null,
            rendersFolder: audit?.rendersDir ?? null,
            prompts: join(pipelineDir, "prompts"),
        },
    };
};

run()
    .then(code => process.exit(code))
    .catch(error =>
    {
        console.error("internal error:", error);
        process.exit(3);
    });
