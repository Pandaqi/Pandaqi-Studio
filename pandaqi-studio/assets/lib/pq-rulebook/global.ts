// The library's public surface.
//
// This is the single list of what pq-rulebook exposes. `index.ts` adds the embedded stylesheet on top
// of it for builds that must be self-contained; the website's shared bundle builds from this file, so
// the ~37 KB CSS string never ends up in a page that already links it.

export * from "./rulebook";
export * from "./api";
export * from "./meta";
export * from "./sections";
export * from "./tables";
export * from "./toc";
export * from "./toolbar";
export * from "./examples";
export * from "./parser/parser";
export * from "./theme/applyStyles";
