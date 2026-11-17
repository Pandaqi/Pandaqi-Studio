// Built once per site into /lib/vendor/pq-rulebook.js and loaded before every rulebook bundle.
// Page bundles import `lib/pq-rulebook`, which is shimmed (see js/shims) to read this global instead.
// Built from `global.ts`, not `index.ts`: every rulebook page links the stylesheet in <head>, so the
// bundle must not carry a second copy of it.
import * as pqRulebook from "../pq-rulebook/global";

(globalThis as any).PQ_RULEBOOK = pqRulebook;
