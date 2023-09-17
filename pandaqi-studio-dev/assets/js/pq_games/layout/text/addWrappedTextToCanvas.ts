// @SOURCE: https://codepen.io/peterhry/pen/nbMaYg
// Modified to allow centering and other stuff
export default (context:CanvasRenderingContext2D|HTMLCanvasElement, text:string|number, params:Record<string,any> = {}) => 
{
    if(context instanceof HTMLCanvasElement) { context = context.getContext("2d"); }
    if(!isNaN(text as number)) { text = text.toString(); }

    text = text + "";

    let x = params.x || 0;
    let y = params.y || 0;
    const width = params.width || 512;
    const height = params.height || -1;
    const lineHeight = params.lineHeight || 20;
    const centerX = params.centerX;
    const centerY = params.centerY;

    if(centerX) { context.textAlign = "center"; }
    if(centerY) { context.textBaseline = "middle"; }

    var words = text.split(' '),
        line = '',
        i = 0,
        test = "",
        metrics;
    
    let plannedLines = [];

    for (i = 0; i < words.length; i++) {
        
        // check the next word
        // if it is too long _on its own_, keep shortening it until it fits
        test = words[i];
        metrics = context.measureText(test);
        while (metrics.width > width) {
            test = test.substring(0, test.length - 1);
            metrics = context.measureText(test);
        }

        // if split, insert the second part to be evaluated after us (next iteration of loop)
        const wordWasSplit = (words[i] != test);
        if (wordWasSplit) {
            words.splice(i + 1, 0,  words[i].substr(test.length))
            words[i] = test;
        }  

        // now test the current line + the next word
        test = line + words[i] + ' ';  
        metrics = context.measureText(test);

        // it's too long? save our current line (it's finished)
        // start the next one with this overflowing word
        const needNewLine = metrics.width > width && i > 0;
        if (needNewLine) {
            plannedLines.push({ x: x, y: y, text: line.trim() });
            line = words[i] + ' ';
            y += lineHeight;
            continue;
        }
        
        // otherwise, update the line to have that added word
        line = test;
    }

    // the last line hasn't been saved yet (as that only happens when a new line is triggered); do that now
    plannedLines.push({ x: x, y: y, text: line.trim() });

    // calculate how large it ends up being
    let lastLineMetrics = context.measureText(line);
    let blockDimensions = { 
        width: (plannedLines.length <= 1) ? lastLineMetrics.width : width, 
        height: plannedLines.length * lineHeight
    };

    let realLineHeight = lastLineMetrics.actualBoundingBoxAscent + lastLineMetrics.actualBoundingBoxDescent;
    let emptyVerticalSpace = 0.5*(height - blockDimensions.height);
    // if(height <= 0) { emptyVerticalSpace = -0.5*realLineHeight; } => doesn't work with baseLine=middle, and that's better

    // actually place all planned lines (with correct positioning)
    for(const line of plannedLines)
    {
        //if(centerX) { line.x += 0.5*block; }
        if(centerY) { line.y += emptyVerticalSpace; }
        context.fillText(line.text, line.x, line.y);
    }

    return plannedLines;
}