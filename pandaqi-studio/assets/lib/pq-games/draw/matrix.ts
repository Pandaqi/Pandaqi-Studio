/* A 2D affine matrix as six numbers, matching the canvas transform order:
 *
 *     | a c e |
 *     | b d f |
 *     | 0 0 1 |
 *
 * This module is the entire geometric core of the realtime drawer: no imports, no state, every
 * function writes into a caller-provided `Matrix2D`. A game can import it on its own.
 */

export type Matrix2D = Float64Array;

export const MATRIX_LENGTH = 6;

export const createMatrix = () : Matrix2D =>
{
    const m = new Float64Array(MATRIX_LENGTH);
    m[0] = 1;
    m[3] = 1;
    return m;
}

export const setIdentity = (m:Matrix2D) : Matrix2D =>
{
    m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 1; m[4] = 0; m[5] = 0;
    return m;
}

export const copyMatrix = (out:Matrix2D, source:Matrix2D) : Matrix2D =>
{
    out[0] = source[0]; out[1] = source[1]; out[2] = source[2];
    out[3] = source[3]; out[4] = source[4]; out[5] = source[5];
    return out;
}

/* out = a * b (apply b first, then a), which is how a child transform composes with its parent. */
export const multiplyMatrix = (out:Matrix2D, a:Matrix2D, b:Matrix2D) : Matrix2D =>
{
    const a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3], a4 = a[4], a5 = a[5];
    const b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3], b4 = b[4], b5 = b[5];

    // `out` may alias `a` or `b`, so every source value is read before anything is written
    out[0] = a0 * b0 + a2 * b1;
    out[1] = a1 * b0 + a3 * b1;
    out[2] = a0 * b2 + a2 * b3;
    out[3] = a1 * b2 + a3 * b3;
    out[4] = a0 * b4 + a2 * b5 + a4;
    out[5] = a1 * b4 + a3 * b5 + a5;
    return out;
}

/* translate * rotate * scale * translate(-anchor), the local transform of one entity. */
export const setEntityMatrix = (
    out:Matrix2D,
    x:number, y:number,
    rotation:number,
    scaleX:number, scaleY:number,
    anchorX:number, anchorY:number,
    width:number, height:number,
) : Matrix2D =>
{
    const cos = rotation === 0 ? 1 : Math.cos(rotation);
    const sin = rotation === 0 ? 0 : Math.sin(rotation);

    // a rotation of zero is by far the common case; skipping sin/cos is measurable in a big scene
    out[0] = cos * scaleX;
    out[1] = sin * scaleX;
    out[2] = -sin * scaleY;
    out[3] = cos * scaleY;
    out[4] = x - (out[0] * anchorX * width + out[2] * anchorY * height);
    out[5] = y - (out[1] * anchorX * width + out[3] * anchorY * height);
    return out;
}

export const transformPoint = (out:{ x:number, y:number }, m:Matrix2D, x:number, y:number) =>
{
    out.x = m[0] * x + m[2] * y + m[4];
    out.y = m[1] * x + m[3] * y + m[5];
    return out;
}

/* The inverse is only needed for hit testing, which is a game concern, but it belongs with the math. */
export const invertMatrix = (out:Matrix2D, m:Matrix2D) : Matrix2D =>
{
    const det = m[0] * m[3] - m[1] * m[2];
    if(!det) { return setIdentity(out); }

    const inv = 1 / det;
    const a = m[3] * inv;
    const b = -m[1] * inv;
    const c = -m[2] * inv;
    const d = m[0] * inv;

    out[0] = a; out[1] = b; out[2] = c; out[3] = d;
    out[4] = -(a * m[4] + c * m[5]);
    out[5] = -(b * m[4] + d * m[5]);
    return out;
}

export const applyMatrixToContext = (ctx:CanvasRenderingContext2D, m:Matrix2D) =>
{
    ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
}
