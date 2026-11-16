// Built once per site into /lib/vendor/pq-games.js and loaded before every page bundle.
// Page bundles import `lib/pq-games`, which is shimmed (see js/shims) to read this global instead,
// so the framework is no longer copied into all 84 generator bundles.
import * as pqGames from "../pq-games/index";

(globalThis as any).PQ_GAMES = pqGames;
