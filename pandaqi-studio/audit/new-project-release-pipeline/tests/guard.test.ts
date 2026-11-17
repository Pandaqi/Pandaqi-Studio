import { describe, expect, test } from "bun:test";
import { guardEdit } from "../src/lib/guard";

const setup = "## Setup\n\nPlace any tile with the **add** action facup on the table. Give all players 4 tiles and 1 Pawn.";

describe("rulebook edits", () =>
{
    test("accepts a typo fix", () =>
    {
        const after = "## Setup\n\nPlace any tile with the **add** action faceup on the table. Give all players 4 tiles and 1 Pawn.";
        const verdict = guardEdit(setup, after, "rulebook");
        expect(verdict.reasons).toEqual([]);
        expect(verdict.ok).toBe(true);
    });

    test("accepts clarifying a pronoun without touching a number", () =>
    {
        const before = "## Actions\n\nWhen you visit it, execute its action. Draw 3 cards.";
        const after = "## Actions\n\nWhen you visit a tile, execute that tile's action. Draw 3 cards.";
        expect(guardEdit(before, after, "rulebook").ok).toBe(true);
    });

    test("refuses a changed number", () =>
    {
        const after = "## Setup\n\nPlace any tile with the **add** action faceup on the table. Give all players 5 tiles and 1 Pawn.";
        const verdict = guardEdit(setup, after, "rulebook");
        const numbers = verdict.reasons.find(reason => reason.includes("number"));
        expect(verdict.ok).toBe(false);
        expect(numbers).toBeDefined();
    });

    test("refuses a changed heading", () =>
    {
        const after = "## Preparation\n\nPlace any tile with the **add** action facup on the table. Give all players 4 tiles and 1 Pawn.";
        expect(guardEdit(setup, after, "rulebook").ok).toBe(false);
    });

    test("refuses a changed image or shortcode argument", () =>
    {
        const before = "## Setup\n\n{{< rules/rules-image src=\"setup.webp\" alt=\"Setup.\" >}}\n\nPlace the start tile.";
        const after = "## Setup\n\n{{< rules/rules-image src=\"setup-new.webp\" alt=\"Setup.\" >}}\n\nPlace the start tile.";
        const verdict = guardEdit(before, after, "rulebook");
        expect(verdict.ok).toBe(false);
        expect(verdict.reasons.some(reason => reason.includes("link/shortcode"))).toBe(true);
    });

    test("refuses a rewrite that drops most of the rule", () =>
    {
        const after = "## Setup\n\nEach player takes a pawn and puts it at the top. The rest is the deck.";
        expect(guardEdit(setup, after, "rulebook").ok).toBe(false);
    });

    test("refuses an empty replacement", () =>
    {
        expect(guardEdit(setup, "   ", "rulebook").ok).toBe(false);
    });
});

describe("page edits", () =>
{
    test("allows a stronger rewrite of marketing copy", () =>
    {
        const before = "## Background\n\nThis game was originally called Decision Trees: The Game. I was looking into decision trees and realized they look like boards you can move around on.";
        const after = "## Background\n\nIt started as a joke name: *Decision Trees: The Game*. Then I noticed a decision tree is a board you walk down, left or right, one choice at a time — and the game wrote itself.";
        const verdict = guardEdit(before, after, "page");
        expect(verdict.reasons).toEqual([]);
        expect(verdict.ok).toBe(true);
    });

    test("still refuses a changed fact on a page", () =>
    {
        const before = "## Background\n\nPlay with 2 to 6 players in about 30 minutes.";
        const after = "## Background\n\nPlay with 2 to 8 players in about 30 minutes.";
        expect(guardEdit(before, after, "page").ok).toBe(false);
    });
});
