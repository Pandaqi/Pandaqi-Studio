import { describe, expect, test } from "bun:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { suppressKnownFalsePositives, type AuditEntry } from "../src/stages/audit";

const makeSite = (hiddenTitle:string | null) =>
{
    const root = join(tmpdir(), `pq-release-test-${Math.random().toString(36).slice(2)}`);
    mkdirSync(join(root, "game", "rules"), { recursive: true });
    if(hiddenTitle)
    {
        writeFileSync(join(root, "game", "rules", "index.html"),
            `<article id="rulebook-content"><h1 style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)">${hiddenTitle}</h1></article>`,
            "utf8");
    }
    return root;
};

const failure = (message:string) => `RB_SECTION_MISSING: ${message}`;

describe("suppressKnownFalsePositives", () =>
{
    test("drops the screen-reader-only page title, and only that", () =>
    {
        const root = makeSite("Mountain Miners — Rulebook");
        const entries:AuditEntry[] = [{
            url: "/game/rules/",
            contract: "rulebook",
            status: "fail",
            failures: [failure("heading \"mountain miners — rulebook\" is not present in any .rulebook-section-header")],
        }];

        expect(suppressKnownFalsePositives(entries, root)).toBe(1);
        expect(entries[0].failures).toEqual([]);
        expect(entries[0].status).toBe("pass");
    });

    test("keeps a genuinely missing section", () =>
    {
        const root = makeSite("Mountain Miners — Rulebook");
        const entries:AuditEntry[] = [{
            url: "/game/rules/",
            contract: "rulebook",
            status: "fail",
            failures: [
                failure("heading \"mountain miners — rulebook\" is not present in any .rulebook-section-header"),
                failure("heading \"setup\" is not present in any .rulebook-section-header"),
            ],
        }];

        expect(suppressKnownFalsePositives(entries, root)).toBe(1);
        expect(entries[0].failures).toEqual([failure("heading \"setup\" is not present in any .rulebook-section-header")]);
        expect(entries[0].status).toBe("fail");
    });

    test("does nothing when the page has no hidden title", () =>
    {
        const root = makeSite(null);
        const entries:AuditEntry[] = [{
            url: "/game/rules/",
            contract: "rulebook",
            status: "fail",
            failures: [failure("heading \"setup\" is not present in any .rulebook-section-header")],
        }];
        expect(suppressKnownFalsePositives(entries, root)).toBe(0);
        expect(entries[0].failures.length).toBe(1);
    });

    test("does not suppress anything else, even on the right page", () =>
    {
        const root = makeSite("Mountain Miners — Rulebook");
        const entries:AuditEntry[] = [{
            url: "/game/rules/",
            contract: "rulebook",
            status: "fail",
            failures: ["RB_NO_TOOLBAR: the bundle never ran", "PAGE_ERROR: TypeError: x is not a function"],
        }];
        expect(suppressKnownFalsePositives(entries, root)).toBe(0);
        expect(entries[0].failures.length).toBe(2);
    });
});
