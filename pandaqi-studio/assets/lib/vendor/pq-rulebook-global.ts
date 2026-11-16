// Built once per site into /lib/vendor/pq-rulebook.js and loaded before every rulebook bundle.
// Page bundles import `lib/pq-rulebook`, which is shimmed (see js/shims) to read this global instead.
import * as pqRulebook from "../pq-rulebook";

(globalThis as any).PQ_RULEBOOK = pqRulebook;
