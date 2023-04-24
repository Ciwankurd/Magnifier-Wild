// Extracting content from pdfs as canvas renderings.
// Relying on the pdf.js library
//
// By Frode Eika Sandnes, March 2022 - Oslo Metropolitan University
//"use strict";

// Low-level canvas manipulation routines.
//
// By Frode Eika Sandnes, March 2022 - Oslo Metropolitan University

let zoomButtonsDiv = document.getElementById("zoomButtons")
// magic numbers
let bytesPerPixel = 4;

// apply function f to all pixels in canvas c, r accummulating results
let allPixels = (c,f,param) =>
{
    const ctx = c.getContext("2d");
    const imageData = ctx.getImageData(0,0,c.width,c.height);
    for (let i=0; i < imageData.data.length; i+=bytesPerPixel)
    {
        const d = imageData.data;
        const p = f(d[i], d[i+1], d[i+2], d[i+3],param);
        d[i] = p.r;
        d[i+1] = p.g;
        d[i+2] = p.b;
        d[i+3] = p.a;
    }
    ctx.putImageData(imageData,0,0);
}

// negative - invert pixel p in the canvas
let negative = (r,g,b,a) =>
{
    r = 255-r;
    g = 255-g;
    b = 255-b;
    return {r: r, g:g, b:b, a:a};
}

// for testing - setting pixel to red
let red = (r,g,b,a) =>
{
    r = 255;
    g = 0;
    b = 0;
    return {r: r, g:g, b:b, a:a};
}

// compressor function
let compressor = (c,lo,high) =>
{
    const strength = 3;   // 1 no change
    const invert = high - c;
    const scale = invert*strength;   // strenght
    const revert = 255 - scale;
    const clip = (revert < 0)? 0: revert;
    return clip.toFixed(0);
}
// Compresses and expands the dynamic range of the pixel from the min and max colour to black to white
let compressorDynamicRange = (r,g,b,a,p) =>
{
    r = compressor(r, p.foreground.r, p.background.r);
    g = compressor(g, p.foreground.g, p.background.g);
    b = compressor(b, p.foreground.b, p.background.b);
    return {r: r, g:g, b:b, a:a};
}


// samples the diagonal to find the two extreme colours used
// assume the globals min and max are initialized - only used once s
let sampleColour = (r,g,b,a,p) =>
{
    const minDist = p.minCol.r**2 + p.minCol.g**2 + p.minCol.b**2;
    const maxDist = p.maxCol.r**2 + p.maxCol.g**2 + p.maxCol.b**2;
    const dist = (r**2 + g**2 + b**2);
    if (dist < minDist)
    {
        p.minCol = {r:r, g:g, b:b};
    }
    if (dist > maxDist)
    {
        p.maxCol = {r:r, g:g, b:b};
    }
}
// samples the diagonal and colours near min and max
// assume the globals minColFreq and maxColFreq are initialized - only used once s
let countColour = (r,g,b,a,p) =>
{
    // find distance to min and max
    const distMin =  (p.minCol.r - r)**2
        +(p.minCol.g - g)**2
        +(p.minCol.b - b)**2;
    const distMax =  (p.maxCol.r - r)**2
        +(p.maxCol.g - g)**2
        +(p.maxCol.b - b)**2;
    if (distMin < distMax)
    {
        p.minColFreq++;
    }
    else
    {
        p.maxColFreq++;
    }
}

// apply function f to diagonal pixels in canvas c starting and ending at offset
let readOnlyDiagonalPixels = (imageData,w,h,f,offset,params) =>
{
    offset = Math.round(offset); // prevent offset being a fraction
    const start = bytesPerPixel*(offset*w+offset);
    const end = Math.min(bytesPerPixel*((h-offset)*w),
        bytesPerPixel*((w-offset)*w));
    const step = bytesPerPixel*w+bytesPerPixel;
    for (let i=start; i < end; i+=step)
    {
        const d = imageData.data;
        const p = f(d[i], d[i+1], d[i+2], d[i+3],params);
    }
}
// sample a central third diagonal of the image to find the foreground and background pixels
let findForegroundBackgroundColours = (imageData,w,h) =>
{
    // initialise global varables
    const minCol = {r: 255, g: 255, b: 255};    // setting to the opposite end of the scale
    const maxCol = {r: 0, g: 0, b: 0};
    const params = {minCol: minCol, maxCol:maxCol, minColFreq: 0, maxColFreq: 0};
    readOnlyDiagonalPixels(imageData,w,h,sampleColour,w/2.5,params);
    readOnlyDiagonalPixels(imageData,w,h,countColour,w/2.5,params);
    let result;
    if (params.maxColFreq > params.minColFreq)
    {
        result = {
            background: params.maxCol,
            foreground: params.minCol
        };
    }
    else
    {
        result = {
            background: params.minCol,
            foreground: params.maxCol
        };
    }
    return result;
}

let isPixelSet = (r,g,b,p) =>
{
    const distBackground = Math.sqrt( (p.background.r - r)*(p.background.r - r)
        +(p.background.g - g)*(p.background.g - g)
        +(p.background.b - b)*(p.background.b - b));
    const distForeground = Math.sqrt( (p.foreground.r - r)*(p.foreground.r - r)
        +(p.foreground.g - g)*(p.foreground.g - g)
        +(p.foreground.b - b)*(p.foreground.b - b));

    return (distForeground < distBackground*1.3)  // magic number
}
// Get vertical projection of canvas
/*
let verticalProjection = (imageData, w, h, params) =>
{
    const result = [];
    const d = imageData.data;
    const end = w * bytesPerPixel;
    const step = bytesPerPixel;
    for (var y = 0; y < h; y++) {
        var lineSet = false;
        for (var x = 0; x < end; x += step) {
            var i = y * end + x;
            if (isPixelSet(d[i], d[i + 1], d[i + 2], params)) {
                lineSet = true;
                break;
            }
        }
        result.push(lineSet);
    }
    return result;
}
*/
// oppdateret verticalProjection
// Get vertical projection of canvas
function verticalProjection(imageData, w, h, params)
{
    let i;
    const result = [];
    const d = imageData.data;
    const end = w * bytesPerPixel;
    const step = bytesPerPixel;
    let threshold = w/10; // projection area must be wider than this number of pixels to trigger
    let scalingFactor = 4;  // strength of bias against left-most pixels
    for (let y = 0; y < h; y++)
    {
        let x;
// find max region covered by set pixels
        let projectionStarts = 0;
        let pixelFound = false;
        let projectionEnds = 0;
        for (x = 0; x < end; x += step)
        {
            i = y * end + x;
            if (isPixelSet(d[i], d[i + 1], d[i + 2], params))
            {
                projectionStarts = x;
                pixelFound = true;
                break;  // jump out and scan backwards
            }
        }

        if (pixelFound)   // only go backwards if set pixel is found
        {
            for (x = end-step; x > projectionStarts; x -= step)
            {
                i = y * end + x;
                if (isPixelSet(d[i], d[i + 1], d[i + 2], params))
                {
                    projectionEnds = x;
                    break;  // jump out and scan backwards
                }
            }
        }
        // converting from imageArray to pixel values
        projectionStarts /= step;
        projectionEnds /= step;
        // bias leftmost pixels by giving them more "weight" compared to pixels at the left.
        projectionStarts /= scalingFactor;
        //console.log(threshold, "diff", projectionEnds - projectionStarts);
        if (projectionEnds - projectionStarts > threshold)
        {
            result.push(true);
        }
        else
        {
            result.push(false);
        }

// Preivous version
        /*        var lineSet = false;
                for (var x = 0; x < end; x += step)
                    {
                    var i = y * end + x;
                    if (isPixelSet(d[i], d[i + 1], d[i + 2], params))
                        {
                        lineSet = true;
                        break;
                        }
                }
                result.push(lineSet);*/
    }
    return result;
}



// Get horisontal projection of canvas imagedata
let horisontalProjection = (imageData, w, h, y0, y1, params) =>
{
    const result = [];
    const d = imageData.data;
    const end = w * bytesPerPixel;
    for (let x = 0; x < end; x += bytesPerPixel) {
        let lineSet = false;
        for (let y = y0; y < y1; y++) {
            const i = y * end + x;
            if (isPixelSet(d[i], d[i + 1], d[i + 2], params)) {
                lineSet = true;
                break;
            }
        }
        result.push(lineSet);
    }
    return result;
}

// routines for two-column analysis
// Get vertical projection of the midline
// scan at x
let midLineVerticalProjection = (imageData,w,h,x,params) =>
{
    const result = [];
    const d = imageData.data;
    const end = w*bytesPerPixel;
    for (let y=0; y < h; y++)
    {
        let lineSet = false;
        const i = y * end + x * bytesPerPixel;
        if (isPixelSet(d[i], d[i+1], d[i+2],params))
        {
            lineSet = true;
        }
        result.push(lineSet);
    }
    return result;
}

// Pixel based extraction of words from pixels in canvas.
// Relying on the canvas-pixels-manipulation.js library
//
// By Frode Eika Sandnes, April 2022 - Oslo Metropolitan University




// finds the start ane end of active regions in the projection
let findActiveRegionsInProjection = (projection,threshold) =>
{
    const regions = [];
    let prev = false;
    let start = 0;
    let end = 0;
    // Traverse projection and find bounds of lines
    for (let i = 0; i< projection.length; i++)
    {
        if (projection[i] && !prev)
        {
            start = i;
        }
        else if (!projection[i] && prev)
        {
            end = i;
            if (end-start > threshold)
            {
                regions.push({start:start, end:end});
            }
        }
        prev = projection[i];
    }
    // need to attach last part if active region goes to the bottom border of the document
    const lastScanlineIdx = projection.length-1;
    const lastScanlineValue = projection[lastScanlineIdx];
    if (lastScanlineValue)
    {
        regions.push({start:start, end:lastScanlineIdx});
    }
    return regions;
}

// detect the text lines using vertical projections
let findLines = (imageData,w,h,params) =>
{
    const threshold = 3;  // minimum pixels for a line
    const result = [];
    // get the regions
    const projection = verticalProjection(imageData,w,h,params);
    const regions = findActiveRegionsInProjection(projection,threshold);
    // put into suitable format
    for (let p of regions)
    {
        result.push({y0:p.start, y1:p.end});
    }
    return result;
}

// combine small segments into larger if spacing too small, small spacing between letters, larger spacing between words
let concatenateLettersToWords = (letters) =>
{
    // find all horizontal spacings
    const horizontalSpacings = letters.slice(1).map((v, i) => v.x0 - letters[i].x1);
    const maxHorizontalSpacing = Math.max(...horizontalSpacings);
    // set spacing threshold to half the maximum
    let threshold = maxHorizontalSpacing / 2;
    // just check that the threshold is within reasonable limits - if not set it to magic no of 3.
    if (threshold > 9 || threshold < 0)
    {
        threshold = 3;
    }

    const concatenated = [];
    let word = letters[0];
    for (let i=1; i<letters.length; i++)
    {
        const word2 = letters[i];
        if (word2.x0 - word.x1 < threshold)  // space too small
        {
            word.x1 = word2.x1; // combine the word
            // goto next
        }
        else
        {
            concatenated.push(word);
            word = word2;
        }
    }
    concatenated.push(word); // ensure the last word is added
    return concatenated;
}

// find words in line using horizontal projections
let findWordsForLine = (imageData,w,h,y0,y1,params) =>
{
    const result = [];
    const projection = horisontalProjection(imageData,w,h,y0,y1,params);
    const regions = findActiveRegionsInProjection(projection,0);
    for (let p of regions)
    {
        result.push({x0:p.start, x1:p.end, y0:y0, y1:y1});
    }
    // combine words with too small spacing
    return concatenateLettersToWords(result);
}

// top-level function for finding the words on a page, first find lines, then words in each line
let findWords = (imageData,w,h,params) =>
{
    const allWords = [];
    const lines = findLines(imageData,w,h,params);
    for (let l of lines)
    {
        const words = findWordsForLine(imageData,w,h,l.y0, l.y1,params);
        allWords.push(...words);    // concatenate the arrays.
    }
    return allWords;
}

// for debugging - drawing red box around the words on the canvas
// analysing a specific region on the page
let analyseRegion = ({canvasContext:canvasContext,x:x,y:y,w:w,h:h,params:params}) =>
{
    // check if there is anything to analyse, if not, return empty array
    if (w===0 || h===0)
    {
        return [];
    }
    // access the region
    const imageData = canvasContext.getImageData(x,y,w,h);
    // extract the words in the region
    let allWords = findWords(imageData, w, h, params);
    // remove all undefined elements
    allWords = allWords.filter(x => x !== undefined);
    // add the global offsets
    for (let p of allWords)
    {
        p.x0 += x;
        p.x1 += x;
        p.y0 += y;
        p.y1 += y;
    }
    allWords = transferSpace(allWords);
    return allWords;
}

let paragraphMarker = {x0:0,x1:1,y0:0,y1:1};

// find paragraph marks and space in text and insert breaks in text to create space
let transferSpace = (allWords) =>
{
    let i;
// find the text margin by searching for the smalles x position for a word
    const margin = Math.min(...allWords.map(item => item.x0));
    const indent = Math.min(...allWords.map(item => item.y1 - item.y0));

    // find typical line-height - two passes
    // pass one - first fine all line heights
    const lineHeights = [];
    for (i = 0; i < allWords.length; i++)
    {
        const word = allWords[i];
        // if we still have a succeeding word
        if (i < allWords.length-1)
        {
            const nextWord = allWords[i+1];
            if (nextWord.x0 < word.x0)  // new line in text
            {
                const lineHeight = nextWord.y0 - word.y0;
                lineHeights.push(lineHeight);
            }
        }
    }
    // find the median height as representative - sort and pick middle.
    lineHeights.sort(function(a, b){return a - b});
    const typicalLineHeight = lineHeights[Math.floor(lineHeights.length/2)];

    const result = [];
    for (i = 0; i < allWords.length; i++)
    {
        const word = allWords[i];
        result.push(word);
        // if we still have a succeeding word
        if (i < allWords.length-1)
        {
            const nextWord = allWords[i+1];
            if (nextWord.x0 < word.x0)  // new line in text
            {
                const lineHeight = nextWord.y0 - word.y0;
                if (nextWord.x0 > margin+indent) // indented
                {
                    result.push(paragraphMarker); // insert a 1-pixel image as spacer
                }
                else if (lineHeight > typicalLineHeight + 3)
                {
                    result.push(paragraphMarker); // insert a 1-pixel image as spacer
                }
            }
        }
    }
    return result;
}

// Magic number
let minPortionTwoColumns = 5; // fraction
// based on the midpoint projection - detect the regions that are not two columns, the others are probably two columns
let detectSingleColumnRegions = (projection) =>
{
    const regions = [];
    const crossingMidline = [];    // temporary storing the boundaries
    // get midline projection
    const singleColumnRegions = findActiveRegionsInProjection(projection,0);
    // put into right format
    for (let r of singleColumnRegions)
    {
        crossingMidline.push({y0:r.start, y1:r.end});
    }
    // combine lines with too small spacing
    const threshold = projection.length/minPortionTwoColumns; // at least a fifth of the page must be clear.
    if (crossingMidline.length > 0)
    {
        let line = crossingMidline[0];
        for (let i=1; i<crossingMidline.length; i++)
        {
            const line2 = crossingMidline[i];
            if (line2.y0 - line.y1 < threshold)  // space too small
            {
                line.y1 = line2.y1; // combine the lines
                // goto next
            }
            else
            {
                regions.push(line);
                line = line2;
            }
        }
        regions.push(line); // ensure the last line is added
    }
    return regions;
}

// the detection of single columns from midline may miss some bits and cut too much.
// we therefore trace the full vertical projection above and below until blank line.
let adjustSIngleColumnRegion = (regions,projection) =>
{
    for (const r of regions)
    {
        let i;
// trace backward
        for (i = r.y0; i >= 0; i--)
        {
            if (!projection[i])
            {
                r.y0 = i;
                break;
            }
        }
        // trace forward
        for (i = r.y1; i < projection.length; i++)
        {
            if (!projection[i])
            {
                r.y1 = i;
                break;
            }
        }
    }
    return regions;
}

// finds the most probable location for the two column divide
let findTwoColumnDivide = (imageData,w,h,params) =>
{
    let columnDivide = Math.round(w / 2);
    let globalMax = 0;
    const lower = Math.round(2*w/5);
    const upper = Math.round(3*w/5);
    // scan the inner third
    for (let x = lower; x < upper; x++)
    {
        const midlineProjection = midLineVerticalProjection(imageData,w,h,x,params);
        let count = 0;
        let max = 0;
        // count max  sequence of consecutive unset pixels
        for (const pixel of midlineProjection)
        {
            if (count > max)
            {
                max = count;
            }
            if (!pixel)
            {
                count++;
            }
            else
            {
                count = 0;
            }
        }
        // check if this is max
        if (max > globalMax)
        {
            globalMax = max;
            columnDivide = x;
        }
// can search for several columns using the same technique
    }
    return columnDivide;
}

// analyse a page to see which parts are divided across two columns and which parts span both columns
// outputs a list of subregions that subsequently can be analysed as single column.
// regions insered top-to-bottom and left-to-right.
let twoColumnAnalysis = (imageData,w,h,params) =>
{
    // array of detected regions
    const regions = [];
    // search for most probable center line
    const columnDivide = findTwoColumnDivide(imageData, w, h, params);
    //  performing vertical projection of the center line
    const midlineProjection = midLineVerticalProjection(imageData,w,h,columnDivide,params);
    // get full vertical Projection
    const vProjection = verticalProjection(imageData,w,h,params);

    // apply a filter to detect active two-column regions
    const rawSingleColumnRegions = detectSingleColumnRegions(midlineProjection);
    // since the midline may miss some parts above and below we adjust the limites with the full vertical projections
    const singleColumnRegions = adjustSIngleColumnRegion(rawSingleColumnRegions,vProjection);

    // go through the regions border - if there are two column make two regions
    let lastRegion = {y0: 0, y1: 0};
    for (const p of singleColumnRegions)
    {
        // assume that the last region was two columns since it was not single column, add these
        regions.push({y0:lastRegion.y1, y1: p.y0, x0:0, x1:columnDivide});
        regions.push({y0:lastRegion.y1, y1: p.y0, x0:columnDivide, x1:w});
        // add the single column region
        regions.push({y0: p.y0, y1: p.y1, x0:0, x1:w});
        // set up for next iteration
        lastRegion = p;
    }
    // add the last bit
    regions.push({y0: lastRegion.y1, y1: h, x0:0, x1:columnDivide});
    regions.push({y0: lastRegion.y1, y1: h, x0:columnDivide, x1:w});
    return regions;
}

let regionMarker = {x0:0,x1:2,y0:0,y1:2};

// overall routine for analysing entire page
let analysePage = async ({canvas:canvas,enhanceContrast:enhanceContrast,negateImage:negateImage}) =>
{
    const ctx = canvas.getContext("2d");
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // find foreground and background colours in globals
    let params = findForegroundBackgroundColours(imageData, canvas.width, canvas.height);
    if (enhanceContrast)
    {
        // expand the dynamic range on the view for more contrast
        allPixels(canvas,compressorDynamicRange,params);
    }
    if (negateImage)
    {
        allPixels(canvas,negative);
        // if the image is inverted we need to recalculate what is foreground and background.
        imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        params = findForegroundBackgroundColours(imageData,canvas.width,canvas.height);
    }

    const allWords = [];

    // first find potential regions
    const regions = twoColumnAnalysis(imageData, canvas.width, canvas.height, params);
    // traverse the regions and extract words from each region
    for (const region of regions)
    {
        const wordsInRegion = analyseRegion({
            canvasContext: ctx,
            x: region.x0,
            y: region.y0,
            w: region.x1 - region.x0,
            h: region.y1 - region.y0,
            params: params
        });
        allWords.push(...wordsInRegion);
        // add region marker if WordsInRegion has more than zero elements AND it is not the last region
        if (wordsInRegion.length > 0)
        {
            allWords.push(regionMarker);
        }
    }
    // remove last item if it is a region marker
    if (allWords.length > 0 && allWords[allWords.length-1] === regionMarker)
    {
        allWords.pop();
    }

    // for debugging - outlining the words in red
//    outlineWords(canvas, allWords);
//    document.body.appendChild(canvas);

    return {allWords:allWords,background:params.background};
}
// Main document magnifier  js code.
// Split pdf into images of words for responsive viewing in borwser
//
// By Frode Eika Sandnes, April 2022 - Oslo Metropolitan University


let result = document.getElementById('result');
// Bootstrapping: The following code is called on startup.

// callback function from pdf routines - called when file is loaded
let processPageCallback = async (canvas) =>
{
    // remember this page's dimension
   // pageDimensions.set(getRightPageId(pageNumber),{height:canvas.height,width: canvas.width});
    // adjust the preview page ratios if not porttrait - only support A4, US-letter is scaled to approximate
    // const preview = document.getElementById(getRightPageId(pageNumber));
    //if (canvas.width > canvas.height)
    //{
   //     preview.classList.add("landscape");  // default is landscape (most common) - set this when come across landscape page
    //}

    // progressIndicator.next();       // update the progress indicator
    const enhanceContrast = document.getElementById("contrast").checked;
    const negateImage = document.getElementById("negative").checked;

    let allWords;
    let background;
    ({allWords, background} = await analysePage({canvas:canvas, enhanceContrast:enhanceContrast, negateImage:negateImage}));

    addWords({canvas:canvas,allWords:allWords,background:background});
   // addPageOverview({canvas:canvas, pageNumber:pageNumber});
}
//document.getElementById("canvasOutput").addEventListener("load", loadBinaryFile() );

// for creating consistent element id's


// Add words from page to the "mix"
let addWords = ({canvas:canvas,allWords:allWords,background:background}) =>
{


    // this is called for every page, enough for the first page.
    document.body.style = "background:"+"rgb("+background.r+","+background.g+","+background.b+")";

    const ctx = canvas.getContext("2d");
    // traverese all the words and store the contents
    for (const word of allWords)
    {
        const x = word.x0;
        const y = word.y0;
        const w = word.x1 - word.x0;
        const h = word.y1 - word.y0;

            // get the image of the current word
            const wordImage = ctx.getImageData(x,y,w,h);
            // create temporary canvas for word
            const wordCanvas = document.createElement("canvas");
            //wordCanvas.nodeName='clipWord';
            wordCanvas.setAttribute("name","clipWord")
            wordCanvas.width = w;   // set the canvas equal to the word dimensions.
            wordCanvas.height = h;
            /// const id = pageNumber+"-"+allWords.indexOf(word);
            //  wordCanvas.setAttribute('id',id);
            // draw the word on the new canvas
            const wordCtx = wordCanvas.getContext("2d");
            wordCtx.putImageData(wordImage, 0, 0);
            // add the word to the assigned part of the page
            //document.body.appendChild(wordCanvas)
           result.appendChild(wordCanvas)
            // currentPageDiv.appendChild(wordCanvas);
            // add the info to the mapping structure for visualiztion
            // leftToRightMapping.set(id,{page:pageNumber,x:x+w/2,y:y+h/2});
            /// rightToLeftMapping.get(rightPageId).push({id:id,x:x+w/2,y:y+h/2});

    }
    addZoomButtons();

}









