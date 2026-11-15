import "../text/setup";

import { describe, expect, test } from "bun:test";
import { shapeRect } from "./helpers";
import { Color, DropShadowEffect, LayoutOperation, LayoutOperationBuilder, Path, RendererPandaqi, StrokeAlign, StrokeType, Vector2 } from "./lib";

// The chain-style constructor must produce exactly the same operation as the params constructor,
// and must only build when asked to.

describe("LayoutOperationBuilder", () =>
{
    test("an empty builder builds the same defaults as new LayoutOperation()", () =>
    {
        const op = new LayoutOperationBuilder().build();
        const reference = new LayoutOperation();

        expect(op.pos.x).toBe(reference.pos.x);
        expect(op.pos.y).toBe(reference.pos.y);
        expect(op.rot).toBe(reference.rot);
        expect(op.scale.x).toBe(reference.scale.x);
        expect(op.size.x).toBe(reference.size.x);
        expect(op.pivot.x).toBe(reference.pivot.x);
        expect(op.alpha).toBe(reference.alpha);
        expect(op.strokeWidth).toBe(reference.strokeWidth);
        expect(op.effects).toEqual(reference.effects);
    });

    test("the chain returns the builder itself", () =>
    {
        const builder = new LayoutOperationBuilder();
        expect(builder.pos(10, 20)).toBe(builder);
        expect(builder.rot(1)).toBe(builder);
        expect(builder.scale(2)).toBe(builder);
        expect(builder.pivot(0, 0)).toBe(builder);
        expect(builder.fill("#fff")).toBe(builder);
        expect(builder.stroke("#000")).toBe(builder);
        expect(builder.strokeWidth(2)).toBe(builder);
        expect(builder.strokeAlign(StrokeAlign.OUTSIDE)).toBe(builder);
        expect(builder.strokeType(StrokeType.DASHED)).toBe(builder);
        expect(builder.depth(2)).toBe(builder);
        expect(builder.alpha(0.5)).toBe(builder);
        expect(builder.composite("multiply")).toBe(builder);
        expect(builder.flipX()).toBe(builder);
        expect(builder.flipY()).toBe(builder);
        expect(builder.size(10, 20)).toBe(builder);
        expect(builder.sizeAuto()).toBe(builder);
        expect(builder.skew(0.1)).toBe(builder);
    });

    test("a full chain maps to the same fields as the params constructor", () =>
    {
        const fx = new DropShadowEffect({ blur: 3 });
        const shape = shapeRect(10, 10);
        const clip = new Path([new Vector2(0, 0), new Vector2(10, 0), new Vector2(10, 10)]);
        const mask:any = { resource: shape, operation: new LayoutOperation() };
        const renderer = new RendererPandaqi();
        const parent = new LayoutOperation();

        const chained = new LayoutOperationBuilder()
            .pos(100, 50)
            .rot(Math.PI / 4)
            .scale(2, 3)
            .skew(0.1, 0.2)
            .depth(4)
            .size(200, 100)
            .sizeAuto(true)
            .pivot(0, 1)
            .flipX(true)
            .flipY(false)
            .alpha(0.6)
            .composite("screen")
            .fill("#ff0000")
            .stroke("#000000")
            .strokeWidth(5)
            .strokeAlign(StrokeAlign.INSIDE)
            .strokeType(StrokeType.DASHED)
            .tint("#00ff00")
            .clip(clip)
            .clipRelative(true)
            .mask(mask)
            .resource(shape)
            .effects([fx])
            .frame(2)
            .parentOperation(parent)
            .renderer(renderer)
            .inline(true)
            .debug(true)
            .build();

        const params = new LayoutOperation({
            pos: new Vector2(100, 50),
            rot: Math.PI / 4,
            scale: new Vector2(2, 3),
            skew: new Vector2(0.1, 0.2),
            depth: 4,
            size: new Vector2(200, 100),
            sizeAuto: true,
            pivot: new Vector2(0, 1),
            flipX: true,
            flipY: false,
            alpha: 0.6,
            composite: "screen" as GlobalCompositeOperation,
            fill: "#ff0000",
            stroke: "#000000",
            strokeWidth: 5,
            strokeAlign: StrokeAlign.INSIDE,
            strokeType: StrokeType.DASHED,
            tint: "#00ff00",
            clip: clip,
            clipRelative: true,
            mask: mask,
            resource: shape,
            effects: [fx],
            frame: 2,
            parentOperation: parent,
            renderer: renderer,
            inline: true,
            debug: true,
        });

        expect(chained.pos.x).toBe(params.pos.x);
        expect(chained.pos.y).toBe(params.pos.y);
        expect(chained.rot).toBe(params.rot);
        expect(chained.scale.x).toBe(params.scale.x);
        expect(chained.scale.y).toBe(params.scale.y);
        expect(chained.skew.x).toBe(params.skew.x);
        expect(chained.skew.y).toBe(params.skew.y);
        expect(chained.depth).toBe(params.depth);
        expect(chained.size.x).toBe(params.size.x);
        expect(chained.size.y).toBe(params.size.y);
        expect(chained.sizeAuto).toBe(params.sizeAuto);
        expect(chained.pivot.x).toBe(params.pivot.x);
        expect(chained.pivot.y).toBe(params.pivot.y);
        expect(chained.flipX).toBe(params.flipX);
        expect(chained.flipY).toBe(params.flipY);
        expect(chained.alpha).toBe(params.alpha);
        expect(chained.composite).toBe(params.composite);
        expect(chained.fill.toCSS()).toBe(params.fill.toCSS());
        expect(chained.stroke.toCSS()).toBe(params.stroke.toCSS());
        expect(chained.strokeWidth).toBe(params.strokeWidth);
        expect(chained.strokeAlign).toBe(params.strokeAlign);
        expect(chained.strokeType).toBe(params.strokeType);
        expect(chained.tint.toHEXNumber()).toBe(params.tint.toHEXNumber());
        expect(chained.clip).toBe(params.clip);
        expect(chained.clipRelative).toBe(params.clipRelative);
        expect(chained.mask).toBe(params.mask);
        expect(chained.resource).toBe(params.resource);
        expect(chained.effects[0]).toBe(fx);
        expect(chained.frame).toBe(params.frame);
        expect(chained.parentOperation).toBe(params.parentOperation);
        expect(chained.renderer).toBe(params.renderer);
        expect(chained.inline).toBe(params.inline);
        expect(chained.debug).toBe(params.debug);
    });

    test("vectors and numbers have convenient overloads", () =>
    {
        const op = new LayoutOperationBuilder()
            .pos(new Vector2(1, 2))
            .scale(3)          // uniform
            .size(10, 20)
            .pivot(0.25)       // uniform
            .skew(0.5)         // uniform
            .build();

        expect(op.pos.x).toBe(1);
        expect(op.pos.y).toBe(2);
        expect(op.scale.x).toBe(3);
        expect(op.scale.y).toBe(3);
        expect(op.size.x).toBe(10);
        expect(op.size.y).toBe(20);
        expect(op.pivot.x).toBe(0.25);
        expect(op.pivot.y).toBe(0.25);
        expect(op.skew.x).toBe(0.5);
        expect(op.skew.y).toBe(0.5);
    });

    test("pivot presets work", () =>
    {
        expect(new LayoutOperationBuilder().pivotTopLeft().build().pivot.x).toBe(0);
        expect(new LayoutOperationBuilder().pivotBottomRight().build().pivot.y).toBe(1);
        expect(new LayoutOperationBuilder().pivotCenter().build().pivot.x).toBe(0.5);
    });

    test("outerStroke is a one-call shorthand", () =>
    {
        const op = new LayoutOperationBuilder().outerStroke("#000000", 4).build();
        expect(op.stroke.toCSS()).toBe(new Color("#000000").toCSS());
        expect(op.strokeWidth).toBe(4);
        expect(op.strokeAlign).toBe(StrokeAlign.OUTSIDE);
    });

    test("flip and inline take an explicit on/off value", () =>
    {
        const op = new LayoutOperationBuilder().flipX(false).flipY(true).inline(false).debug(false).build();
        expect(op.flipX).toBe(false);
        expect(op.flipY).toBe(true);
        expect(op.inline).toBe(false);
        expect(op.debug).toBe(false);
    });

    test("addEffect appends without mutating the caller's array", () =>
    {
        const a = new DropShadowEffect();
        const b = new DropShadowEffect();
        const source = [a];
        const builder = new LayoutOperationBuilder().effects(source).addEffect(b);

        expect(source).toEqual([a]);
        expect(builder.build().effects).toEqual([a, b]);
    });

    test("building twice creates independent operations", () =>
    {
        const builder = new LayoutOperationBuilder().pos(1, 2).fill("#ff0000");
        const first = builder.build();
        const second = builder.build();

        expect(first).not.toBe(second);
        expect(first.fill).not.toBe(second.fill);
        expect(first.pos).not.toBe(second.pos);
    });

    test("LayoutOperation.builder() is the static entry point", () =>
    {
        const builder = LayoutOperation.builder().pos(4, 5);
        expect(builder).toBeInstanceOf(LayoutOperationBuilder);
        expect(builder.build().pos.x).toBe(4);
    });

    test("the builder copies the initial params instead of mutating them", () =>
    {
        const params = { fill: "#ff0000" } as any;
        new LayoutOperationBuilder(params).stroke("#000000");
        expect(params.fill).toBe("#ff0000");
        expect(params.stroke).toBe(undefined);
    });
});
