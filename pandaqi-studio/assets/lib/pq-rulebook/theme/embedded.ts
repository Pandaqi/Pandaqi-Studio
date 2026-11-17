// Registers the generated copy of the built-in stylesheet, so a bundle that carries the library on its
// own (and whose pages link nothing) still comes out styled.
//
// The website deliberately does not use it: every rulebook page links the stylesheet in <head> for the
// first paint, so the shared bundle is built from `global.ts` instead and the CSS is never sent twice.

import { setEmbeddedRulebookStyles } from "./applyStyles";
import { INLINE_STYLES } from "./style.generated";

setEmbeddedRulebookStyles(INLINE_STYLES);
