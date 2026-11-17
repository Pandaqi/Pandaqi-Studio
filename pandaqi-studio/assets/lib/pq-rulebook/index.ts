// The self-contained entry: the whole public surface (the list itself lives in global.ts) plus the
// built-in stylesheet, for a page that only loads the library and links no CSS of its own.
export * from "./global";

import { setEmbeddedRulebookStyles } from "./theme/applyStyles";
import { INLINE_STYLES } from "./theme/style.generated";

setEmbeddedRulebookStyles(INLINE_STYLES);
