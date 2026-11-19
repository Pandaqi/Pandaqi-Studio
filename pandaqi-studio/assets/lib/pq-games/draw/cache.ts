/* Canvas state cache for the realtime drawer.
 *
 * A game frame touches the same handful of context properties hundreds of times. Writing
 * `fillStyle` or `globalAlpha` on every entity forces the browser to re-validate its paint state, so
 * the drawer remembers what it last set and only writes a property when the value actually changes.
 *
 * The cache describes the state of ONE context. A drawer assumes it owns its context; if other code
 * paints on the same canvas between frames, call `drawer.invalidate()`.
 */

export interface DrawCache
{
    fill: any
    stroke: any
    lineWidth: number
    font: string
    textAlign: string
    textBaseline: string
    alpha: number
    composite: string
    filter: string
    shadowBlur: number
    shadowColor: string
    shadowOffsetX: number
    shadowOffsetY: number
    smoothing: boolean|null
}

export const createDrawCache = () : DrawCache =>
{
    return {
        fill: null, stroke: null, lineWidth: -1,
        font: "", textAlign: "", textBaseline: "",
        alpha: 1, composite: "source-over", filter: "none",
        shadowBlur: 0, shadowColor: "", shadowOffsetX: 0, shadowOffsetY: 0,
        smoothing: null,
    };
}

/* Forgets everything, so the next draw re-applies every property once. */
export const resetDrawCache = (cache:DrawCache) : DrawCache =>
{
    const fresh = createDrawCache();
    for(const key in fresh) { (cache as any)[key] = (fresh as any)[key]; }
    return cache;
}
