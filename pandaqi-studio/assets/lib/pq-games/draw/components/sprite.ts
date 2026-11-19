import { getImageHeight, getImageWidth } from "../measure";
import type { DrawComponent } from "../canvasDrawer";

/* Draws `entity.image`, with spritesheet support.
 *
 * The source rectangle comes from `frame` + `framesX/framesY`; the destination is the entity's own
 * box (0,0 to width,height in local space), so the transform component does the placing. Nothing is
 * cut out or copied: a frame is just a source rectangle, which is what makes thousands of sprites
 * cost one `drawImage` each.
 */
export const spriteComponent:DrawComponent = (state, entity) =>
{
    const image = entity.image;
    if(!image) { return; }

    const ctx = state.ctx;
    const cache = state.cache;

    const smoothing = entity.smoothing === true;
    if(cache.smoothing !== smoothing)
    {
        ctx.imageSmoothingEnabled = smoothing;
        cache.smoothing = smoothing;
    }

    const framesX = entity.framesX ?? 1;
    const framesY = entity.framesY ?? 1;
    const frameWidth = getImageWidth(image) / framesX;
    const frameHeight = getImageHeight(image) / framesY;
    if(frameWidth <= 0 || frameHeight <= 0) { return; }

    const width = entity.width ?? frameWidth;
    const height = entity.height ?? frameHeight;
    if(width <= 0 || height <= 0) { return; }

    let sx = 0;
    let sy = 0;
    const frame = entity.frame ?? 0;
    if(frame > 0)
    {
        sx = (frame % framesX) * frameWidth;
        sy = Math.floor(frame / framesX) * frameHeight;
    }

    ctx.drawImage(image, sx, sy, frameWidth, frameHeight, 0, 0, width, height);
}
