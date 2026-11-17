import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runFinalizeStage } from "../src/stages/finalize";
import { inspectProject, type ProjectInfo } from "../src/stages/inspect";

const makeProject = (frontmatter:string) =>
{
    const root = mkdtempSync(join(tmpdir(), "pq-release-finalize-"));
    const dir = join(root, "game");
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "_index.md");
    writeFileSync(file, `---\n${frontmatter}\n---\n\n## Background\n\nText.\n`, "utf8");
    return { file, info: inspectProject("game", { contentDir: root }) };
};

const finalize = (info:ProjectInfo) =>
    runFinalizeStage(info, { dryRun: false, setDate: false, keepDraft: false, checkBuiltPage: false });

describe("finalize", () =>
{
    test("writes the missing date to a page that is otherwise complete", () =>
    {
        const { file, info } = makeProject('type: "project"\ntitle: "Game"\nblurb: "Play it."');
        const result = finalize(info);

        expect(result.status).not.toBe("fail");
        expect(result.changes.length).toBe(1);
        expect(readFileSync(file, "utf8")).toMatch(/^date: \d{4}-\d{2}-\d{2}$/m);
    });

    test("writes nothing to a page it is blocking", () =>
    {
        const { file, info } = makeProject('type: "project"\ntitle: "Game"');
        const before = readFileSync(file, "utf8");

        const result = finalize(info);

        expect(result.status).toBe("fail");
        expect(readFileSync(file, "utf8")).toBe(before);
        expect(result.notes.some(note => note.includes("nothing was written"))).toBe(true);
        expect(result.detail).toContain("held back");
    });
});
