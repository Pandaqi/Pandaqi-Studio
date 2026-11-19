/* The only side effects in pq-games, kept in one place.
 *
 * The `lib/pq-games` barrel imports this module, so anything that imports the barrel keeps the old
 * behaviour. Importing a part directly (`lib/pq-games/draw`, `lib/pq-games/geometry/vector2`, ...)
 * never touches it, which is what lets a bundler drop the rest of the library.
 */

import { ensureStructuredClone } from "./tools/collections/converters";

// Safari before 15.4 has no structuredClone, yet games and pickers copy config data with it. The
// vendor bundle imports the barrel before any page bundle runs, so the fallback is in place by the
// time a generator starts. See tools/collections/converters.ts.
ensureStructuredClone();

// Legacy global marker. `lib/vendor/pq-games-global.ts` installs the real namespace; this only makes
// sure the name exists for older page scripts that read it.
if(typeof window !== "undefined" && !(window as any).PQ_GAMES) { (window as any).PQ_GAMES = {}; }
