export default (params = {}) : HTMLCanvasElement =>
{
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    Object.assign(canvas, params);
    return canvas;
}