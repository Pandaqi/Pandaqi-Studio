import { applyMatrixToContext } from "../matrix";
import type { DrawComponent } from "../canvasDrawer";

/* Places the entity: writes its world matrix onto the context.
 *
 * The drawer already computed the matrix (including the parent chain) before any component ran, so
 * this is one `setTransform` call and nothing else. It must run before any content component.
 */
export const transformComponent:DrawComponent = (state) =>
{
    applyMatrixToContext(state.ctx, state.matrix);
}
