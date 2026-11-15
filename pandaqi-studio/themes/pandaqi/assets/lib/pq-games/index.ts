import { ensureStructuredClone } from "./tools/collections/converters";

// GEOMETRY
export * from "./geometry";

// LAYOUT
export * from "./layout";

// SETTINGS
export * from "./settings"

// TOOLS
export * from "./tools";

// RENDERERS
export * from "./renderers";

export * from "./game";
export * from "./generateMaterial";

// Safari before 15.4 has no structuredClone, yet games and pickers copy config data with it. The vendor
// bundle imports this module before any page bundle runs, so the fallback is in place by the time a
// generator starts. See tools/collections/converters.ts.
ensureStructuredClone();

// @ts-ignore
window.PQ_GAMES = {};