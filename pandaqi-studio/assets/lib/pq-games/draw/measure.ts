/* Source sizes without touching the DOM: an <img>, a canvas, an ImageBitmap and a video all report
 * their size under a different property, and the drawer needs it only when an entity does not state
 * a width/height itself. */

export const getImageWidth = (image:any) : number =>
{
    if(!image) { return 0; }
    return image.naturalWidth || image.displayWidth || image.videoWidth || image.width || 0;
}

export const getImageHeight = (image:any) : number =>
{
    if(!image) { return 0; }
    return image.naturalHeight || image.displayHeight || image.videoHeight || image.height || 0;
}
