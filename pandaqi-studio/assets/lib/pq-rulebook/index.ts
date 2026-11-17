// The self-contained entry: the whole public surface plus the built-in stylesheet, for a page that
// only loads the library and links nothing. The list of exports lives in `global.ts`.
export * from "./global";

import "./theme/embedded";
