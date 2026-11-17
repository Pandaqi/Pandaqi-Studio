import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { inspectProject } from "../src/stages/inspect";

// content/
//   chiptales/_index.md                  collection page, a project of its own
//   chiptales/bet/noble-flood/_index.md  game inside a subfolder without a page
//   chiptales/bet/noble-flood/rules/_index.md
//   chiptales/bet/noble-flood/game.md
const makeContent = () =>
{
    const root = mkdtempSync(join(tmpdir(), "pq-release-inspect-"));
    const write = (rel:string, text:string) =>
    {
        const path = join(root, rel);
        mkdirSync(join(path, ".."), { recursive: true });
        writeFileSync(path, text, "utf8");
    };

    write("chiptales/_index.md", "---\ntype: \"project\"\ntitle: \"Chiptales\"\nblurb: \"Card games.\"\ndate: 2025-08-26\n---\n\nText.\n");
    write("chiptales/bet/noble-flood/_index.md", "---\ntype: \"project\"\ntitle: \"Noble Flood\"\nblurb: \"Cards.\"\ndate: 2025-05-26\nmedia: [assets/screenshots/a, assets/screenshots/b]\n---\n\n## Background\n\nText.\n");
    write("chiptales/bet/noble-flood/rules/_index.md", "---\ntype: \"rules\"\n---\n\n## Setup\n\nPlace the cards.\n");
    write("chiptales/bet/noble-flood/game.md", "---\ntype: \"game\"\n---");
    write("chiptales/bet/pietenpoker/_index.md", "---\ntype: \"project\"\ntitle: \"Pietenpoker\"\ndate: 2025-05-26\n---\n\nText.\n");
    return root;
};

describe("nested projects", () =>
{
    test("a collection page only owns its own files", () =>
    {
        const contentDir = makeContent();
        const info = inspectProject("chiptales", { contentDir });

        expect(info.pageFiles.map(file => file.rel)).toEqual(["_index.md"]);
        expect(info.rulebookFiles).toEqual([]);
        expect(info.childProjects).toEqual([
            "chiptales/bet/noble-flood",
            "chiptales/bet/pietenpoker",
        ]);
    });

    test("a game in a subfolder owns its page and its rulebook", () =>
    {
        const contentDir = makeContent();
        const info = inspectProject("chiptales/bet/noble-flood", { contentDir });

        expect(info.problems).toEqual([]);
        expect(info.title).toBe("Noble Flood");
        expect(info.url).toBe("/chiptales/bet/noble-flood/");
        expect(info.pageFiles.map(file => file.rel)).toEqual(["_index.md"]);
        expect(info.rulebookFiles.map(file => file.rel)).toEqual(["rules/_index.md"]);
        expect(info.existingImages).toBe(2);
        expect(info.childProjects).toEqual([]);
    });

    test("a game in a subfolder is found by its own path, not only by its slug", () =>
    {
        const contentDir = makeContent();
        const info = inspectProject("chiptales/bet/noble-flood", { contentDir });
        expect(info.dir.startsWith(contentDir)).toBe(true);
        expect(info.dir.endsWith(join("chiptales", "bet", "noble-flood"))).toBe(true);
    });

    test("a missing page is reported, not guessed at", () =>
    {
        const contentDir = makeContent();
        const info = inspectProject("chiptales/bet/missing", { contentDir });
        expect(info.problems).toEqual(["content/chiptales/bet/missing does not exist"]);
    });
});
