/* The data an entity carries into the realtime drawer.
 *
 * An entity is a plain object with optional slices, one slice per component (transform, sprite,
 * text, shape, effects, container). A component only reads its own slice, and only the components
 * you register are ever called, so an entity that is just a moving rectangle costs one transform and
 * one shape call.
 *
 * Everything here is a type: importing this file emits no JavaScript.
 */

export type DrawableImage = CanvasImageSource;

export interface TransformSlice
{
    /** Position of the entity's anchor, in parent (or canvas) pixels. */
    x?: number
    y?: number
    /** Radians, clockwise on screen (canvas convention). */
    rotation?: number
    scaleX?: number
    scaleY?: number
    /** Where inside the entity `x/y` lands: 0,0 = top-left (default), 0.5,0.5 = centre. */
    anchorX?: number
    anchorY?: number
    /** Logical size. For sprites, defaults to the source size. */
    width?: number
    height?: number
    visible?: boolean
}

export interface SpriteSlice
{
    image?: DrawableImage | null
    /** Frame index inside a grid spritesheet (framesX * framesY). */
    frame?: number
    framesX?: number
    framesY?: number
    /** Nearest-neighbour by default, matching the rest of pq-games. */
    smoothing?: boolean
}

export interface TextSlice
{
    text?: string
    font?: string
    textAlign?: CanvasTextAlign
    textBaseline?: CanvasTextBaseline
    /** Draw offset inside the entity; (0,0) keeps the canvas text position. */
    textX?: number
    textY?: number
}

export interface ShapeSlice
{
    /** Any constructed path. The drawer never builds one, so shapes cost no allocations. */
    shape?: Path2D | null
    fill?: string | CanvasGradient | CanvasPattern | null
    stroke?: string | null
    strokeWidth?: number
    strokeAlign?: "middle" | "inside" | "outside"
}

export interface EffectsSlice
{
    alpha?: number
    composite?: GlobalCompositeOperation
    /** Canvas filter list, e.g. "blur(4px) grayscale(1)". */
    filter?: string
    shadowBlur?: number
    shadowColor?: string
    shadowOffsetX?: number
    shadowOffsetY?: number
}

export interface ContainerSlice
{
    children?: Entity[] | null
    /** Clips the children (and this entity's own drawing) to a path. */
    clip?: Path2D | null
}

export interface Entity extends TransformSlice, SpriteSlice, TextSlice, ShapeSlice, EffectsSlice, ContainerSlice
{
    /** Only used by tooling and debug overlays; never read by the drawer itself. */
    name?: string
}

/* The layout of the realtime sprite batch, shared by the canvas and WebGPU drawers. */
export interface SpriteInstance
{
    a: number, b: number, c: number, d: number, e: number, f: number,
    width: number, height: number,
    u0: number, v0: number, u1: number, v1: number,
    r: number, g: number, b_: number, alpha: number,   // colour, premultiplied at upload time
    texture: DrawableImage,
}
