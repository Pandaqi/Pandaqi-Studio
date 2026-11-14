import { describe, expect, test } from "bun:test";
import { Vector2 } from "../../themes/pandaqi/assets/lib/pq-games/geometry/vector2";
import { LayoutOperation } from "../../themes/pandaqi/assets/lib/pq-games/layout/layoutOperation";
import { TextAlign, TextConfig } from "../../themes/pandaqi/assets/lib/pq-games/layout/text/textConfig";
import { getSetting } from "../../themes/pandaqi/assets/lib/pq-games/settings/configuration";
import { Configurator } from "../../themes/pandaqi/assets/lib/pq-games/settings/configurator";

// The three V1→V2 defaults the whole migration turns on. Without these, "the pivot is centred now" and
// "settings live at `_settings.<path>.value`" are memories, and a library change can silently undo them.
describe("V2 defaults", () =>
{
    test("pivot defaults to the centre", () =>
    {
        const op = new LayoutOperation({ pos: new Vector2(100, 100), size: new Vector2(50, 50) });
        expect(op.pivot.x).toBe(Vector2.CENTER.x);
        expect(op.pivot.y).toBe(Vector2.CENTER.y);
    });

    test("text alignment defaults to the middle", () =>
    {
        const text = new TextConfig({ text: "hello" } as any);
        expect(text.alignHorizontal).toBe(TextAlign.MIDDLE);
        expect(text.alignVertical).toBe(TextAlign.MIDDLE);
    });

    test("settings are read through _settings.<path>.value", () =>
    {
        const config:any = {
            _settings:
            {
                group: { type: "group", a: { type: "number", value: 5 }, b: { type: "checkbox", value: false } },
            },
        };

        expect(getSetting("group.a", config)).toBe(5);
        // `false` is a value; a missing setting is `undefined` and must stay distinguishable
        expect(getSetting("group.b", config)).toBe(false);
        expect(getSetting("group.missing", config)).toBe(undefined);
        expect(getSetting("nope.a", config)).toBe(undefined);
        expect(getSetting("group.a", {} as any)).toBe(undefined);
    });

    test("a configurator path cannot collide with Object.prototype", () =>
    {
        const configurator = new Configurator();
        expect(configurator.get("constructor")).toBe(undefined);
        configurator.set("__proto__", 1);
        expect(({} as any).__proto__).not.toBe(1);
        expect(configurator.get("__proto__")).toBe(1);
    });
});
