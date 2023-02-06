
//import {processPageCallback} from "./document-magnifier.mjs";

const video = document.getElementById("video-input");
const canvas = document.getElementById("canvas-output");
const canvas_image = document.getElementById("cap-image");
const pros_image = document.getElementById("pros-image");
const snap = document.getElementById("snap");
let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
let MIN_CONTOURS_SCALE= 20; // Minimum original image ratio
let THRESHOLD= 128; // Monochrome threshold
let origIm=document.getElementById('oIm');
let ratio;
inputElement.addEventListener('change', (e) => {

    origIm.src = URL.createObjectURL(e.target.files[0]);
    imgElement.src = URL.createObjectURL(e.target.files[0]);

}, false);
imgElement.onload = function() {
    transform()
    /*  let src = cv.imread(imgElement);
     let dsize = new cv.Size(50, 100);
     cv.resize(src,src, dsize, 0, 0, cv.INTER_AREA);
     cv.imshow('imageSrc', src);
     src.delete();
       /*
     let src = cv.imread(imgElement);
     let dst = new cv.Mat();
     cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
 // You can try more different parameters
     cv.medianBlur(src, dst, 5);
     cv.adaptiveThreshold(src, dst, 200, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 3, 2);
     cv.imshow('canvasOutput', dst);
     src.delete();
     dst.delete();

      */
};
var Module = {
    // https://emscripten.org/docs/api_reference/module.html#Module.onRuntimeInitialized
    onRuntimeInitialized() {
        document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
    }
};

(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
        audio:false,
        video:true
        /*
                video: {
                    facingMode: {
                        exact: "environment"
                                }
                        }

        */
    });

    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let cap = new cv.VideoCapture(video);


    if (!stream) {
        src.delete();
        cap.delete();
        return;
    }

    video.srcObject = stream;
    video.play();

    var context = canvas_image.getContext('2d');
    snap.addEventListener("click",function (){
        context.drawImage(video,0,0,450,600);
        //callback();
        transform()
    });

    /*

        const FPS = 30;
        function processVideo() {
            let begin = Date.now();
            cap.read(src);

            // start processing.
            let gray = new cv.Mat();
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

            let thresh = new cv.Mat();
            cv.threshold(gray, thresh, 90, 255, cv.THRESH_OTSU);

            let hierarchy = new cv.Mat();
            let contours = new cv.MatVector();

            cv.findContours(
                thresh,
                contours,
                hierarchy,
                cv.RETR_CCOMP,
                cv.CHAIN_APPROX_SIMPLE
            );

            for (let i = 0; i < contours.size(); ++i) {
                let color = new cv.Scalar(255, 0, 0);
                cv.drawContours(src, contours, i, color, 1, cv.LINE_8, hierarchy, 100);
            }

            cv.imshow("canvas-output", src);

            // schedule the next one.
            let delay = 1000 / FPS - (Date.now() - begin);
            setTimeout(processVideo, delay);
        }

       setTimeout(processVideo, 0);

     */
})();


// opencv
function transform() {

    const im = cv.imread(origIm);

     const pts = this.getContoursPoints(im);


    if(pts) {

        const transformedIm = this.getTransformedImage(im, pts);
        // imageBlackWhite(transformedIm)

        let dst = new cv.Mat();
        let dsize = new cv.Size(550, 800);
        cv.resize(transformedIm,transformedIm, dsize, 0, 0, cv.INTER_AREA);
        //cv.cvtColor(transformedIm, transformedIm, cv.COLOR_RGBA2GRAY, 0);
        //let p = cv.pyrDown(cv.pyrDown(transformedIm, dst, new cv.Size(0, 0), cv.BORDER_DEFAULT));
        // cv.medianBlur(transformedIm, transformedIm, 1);
        //cv.adaptiveThreshold(transformedIm,transformedIm, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 41, 5);
        //cv.medianBlur(transformedIm, transformedIm, 5);
        // cv.threshold(transformedIm, transformedIm, 170,250, cv.THRESH_BINARY_INV);
        //cv.pyrDown(im, im, new cv.Size(0,0), cv.BORDER_DEFAULT);
        //cv.Canny(transformedIm,transformedIm,50, 100, 3, false);
        // let low = new cv.Mat(transformedIm.rows, transformedIm.cols, transformedIm.type(), [0, 0, 0, 0]);
        //let high = new cv.Mat(transformedIm.rows, transformedIm.cols, transformedIm.type(), [155, 155, 255, 255]);

        //cv.inRange(transformedIm, low, high, transformedIm);
        //const addWeightedMat = new cv.Mat(transformedIm.rows, transformedIm.cols, transformedIm.type());
        //cv2.addWeighted( transformedIm, 0.7, transformedIm, 0.3, 0, 2,addWeightedMat)


        cv.imshow('canvasOutput', transformedIm);
        //cv.imshow('pros-image', transformedIm);
        //pdfDown(transformedIm)
        //const documentArrayBuffer = transformedIm.exportPDF();
        processPageCallback(transformedIm,1,1);
        transformedIm.delete(); dst.delete();


    } else {

        console.log('Failed...');

    }

    im.delete();

}
function  imageBlackWhite(im){
    let src = cv.imread(im);
    cv.imshow('pros-image', im);
    let dst = new cv.Mat();
    //let p = cv.pyrDown(cv.pyrDown(src, dst, new cv.Size(0, 0), cv.BORDER_DEFAULT));
    //let m = cv.medianBlur(src, dst, 51);
    //let result = 255 - cv.absdiff(m,p);
    //cv.adaptiveThreshold(src, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);


    src.delete(); dst.delete(); //p.delete(); m.delete(); result.delete();
}
function getContoursPoints (im) {
    // Image area
    const imRectArea = im.cols * im.rows //


    // Grayscale
    let im_gray = new cv.Mat();
    cv.cvtColor(im, im_gray, cv.COLOR_RGBA2GRAY, 0);


    let medianBlur_im = new cv.Mat();
    cv.medianBlur(im_gray, medianBlur_im, 13);

    let cany_im = new cv.Mat();

    cv.Canny(medianBlur_im, cany_im, 30, 120, 3, false);
    // Threshold
    let threshold_im = new cv.Mat();
    //cv.adaptiveThreshold(im_gray, threshold_im, 255, cv.THRESH_BINARY, 81, 3);
    cv.threshold(cany_im, threshold_im, THRESHOLD, 200, cv.THRESH_BINARY);
    //cv.threshold(threshold_im, threshold_im,THRESHOLD, 255, cv.THRESH_BINARY);
    let M = cv.Mat.ones(5, 5, cv.CV_8U);
// You can try more different parameters
    cv.morphologyEx(threshold_im, threshold_im, cv.MORPH_GRADIENT, M);
    //let anchor = new cv.Point(-1, -1);
// You can try more different parameters
    //cv.dilate(threshold_im, threshold_im, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    //let k = cv.Mat.ones(3, 3, cv.CV_8U);
    //cv.erode(threshold_im, threshold_im, k, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    // let dsize = new cv.Size(400, 800);
    //cv.resize(threshold_im,threshold_im, dsize, 0, 0, cv.INTER_AREA);
    cv.imshow('pros-image', threshold_im);

    // Contours
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(threshold_im, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    let pts = new cv.Mat();
    let maxCntArea = 0
    let maxCnt = new cv.MatVector();
    let approx = new cv.Mat();
    let vertices = new cv.Mat();
    for (let i = 0; i < contours.size(); ++i) {

        let cnt = contours.get(i);
        const cntArea = cv.contourArea(cnt)

        const maxRectScale = parseInt(cntArea / imRectArea * 100) // How big is it compared to the original image (%)
        console.log(maxRectScale)
        if (maxRectScale >= MIN_CONTOURS_SCALE) {// Filter by ratio to original image
            console.log(22)
            if (cntArea > maxCntArea) {// Keep larger


                const epsilon = 0.02 * cv.arcLength(cnt, true)
                cv.approxPolyDP(cnt, approx, epsilon, true);
                maxCnt = cnt;
                maxCntArea = cntArea;
                //console.log(approx.size().height)

                if (approx.size().height === 4) {// Keep if it is a rectangle
                    console.log(approx.size().height)
                    maxCntArea = cntArea;
                    pts = approx // Coordinates of the rectangle to be cut out (4 points)
                    // cv.circle(pts.,(447,63), 63, (0,0,255), -1)
                    //let color = new cv.Scalar(255, 0, 0)
                    //cv.drawContours(imgElement, contours, i, color, 5, cv.LINE_8)

                }
                /*
                else {
                    // maxCntArea = cntArea;
                    // pts = approx
                    // Convex hull
                    //pts= parseInt(cv.goodFeaturesToTrack(im_gray,4,0.05,50))
                    //console.log(pts);
                    /*
                    let hull = new cv.MatVector();

                        var item = new cv.Mat();
                        cv.convexHull(cnt, item, false, true);
                        hull.push_back(item);
                        item.delete();
                        pts= hull;



                    //let points = cv.BoxPoints(vertices);




                    }

                 */

                }

            }

        }
        /*
    let dst = cv.Mat.zeros(im.rows, im.cols, cv.CV_8UC3);
    let color = new cv.Scalar(255, 0, 0)
        cv.drawContours(dst,maxCnt,0 , color, 1, cv.LINE_8, hierarchy, 100)
    console.log(maxCnt.data)
    cv.imshow('canvasOutput',dst);
    */

        if (approx.size().height !== 4) {
            let rotatedRect = cv.minAreaRect(maxCnt);
            vertices = cv.RotatedRect.points(rotatedRect);

            // let features = new cv.Mat();
            //cv.goodFeaturesToTrack(cany_im,features,4,0.05,400)
            //features.convertTo(features,cv.CV_32FC2);
            //console.log(features.data32F);

            for (let i = 0; i < 4; i++) {
                vertices[(i + 1) % 4];
                vertices[i].x= parseInt(vertices[i].x) - 45;
                vertices[i].y= parseInt(vertices[i].y)  - 45;
            }


            let rectangleColor = new cv.Scalar(255, 0, 0);
            for (let i = 0; i < 4; i++) {
                cv.line(threshold_im, vertices[i], vertices[(i + 1) % 4], rectangleColor, 2, cv.LINE_AA, 0);
            }


            console.log(vertices)
            // cv.imshow('canvasOutput', threshold_im);

        return cv.matFromArray(4, 1, cv.CV_32FC2, [
            vertices[3].x, vertices[3].y, vertices[2].x,vertices[2].y,vertices[1].x, vertices[1].y, vertices[0].x, vertices[0].y
        ]);

        }


        //console.log(pts);
        //approx.convertTo(approx,cv.CV_32FC2);
        //console.log(approx.data32F);
        pts.convertTo(pts, cv.CV_32FC2);

        //console.log(pts)
        //cv.circle(img,(447,63), 63, (0,0,255), -1)
/*
    for (let i = 0; i < 8; i++) {
        pts.data32F[i]= approx.data32F[i] - 15;
    }
*/
    console.log(pts.data32F)
    let newpoint = [];
    for (let i = 0; i < pts.data32F.length; i++) {
        newpoint.push(pts.data32F[i]);
    }

    let ss = newpoint.sort((a,b)=>b-a)
    console.log(ss)
 //let sortPts= pts.sort((a,b)=>b-a);
 //console.log(sortPts.data32F);
    // Modify corner coordinates
    let wt ,wb,hl,hr;

     wt = getDistance(pts.data32F[0],pts.data32F[1],pts.data32F[2],pts.data32F[3])

    if(pts.data32F[0] < pts.data32F[3]) {
        if (pts.data32F[4] > pts.data32F[6] ) {
            hl = getDistance(pts.data32F[0], pts.data32F[1], pts.data32F[6], pts.data32F[7]);
            hr = getDistance(pts.data32F[2], pts.data32F[3], pts.data32F[4], pts.data32F[5]);
        }
        else {
            hl = getDistance(pts.data32F[0], pts.data32F[1], pts.data32F[4], pts.data32F[5]);
            hr = getDistance(pts.data32F[2], pts.data32F[3], pts.data32F[6], pts.data32F[7]);
        }
    }
    else
        {
            if (pts.data32F[4] < pts.data32F[6] ) {
            hr = getDistance(pts.data32F[0], pts.data32F[1], pts.data32F[6], pts.data32F[7]);
            hl = getDistance(pts.data32F[2], pts.data32F[3], pts.data32F[4], pts.data32F[5]);
        }
        else {
            hr = getDistance(pts.data32F[0], pts.data32F[1], pts.data32F[4], pts.data32F[5]);
            hl = getDistance(pts.data32F[2], pts.data32F[3], pts.data32F[6], pts.data32F[7]);
        }

        }
        wb = getDistance(pts.data32F[4],pts.data32F[5],pts.data32F[6],pts.data32F[7])
    console.log(wt,wb,hl,hr)
    let max_width = Math.max(wt,wb);
    let max_height = Math.max(hl,hr);
    ratio = max_height/max_width;  // for  å sjekke retning til rectangle om den er horizental eller vertikal
    console.log(ratio)

   let max_sum = pts.data32F[0]+pts.data32F[1];
   let min_sum = pts.data32F[0]+pts.data32F[1];
   let max_diff = pts.data32F[0]-pts.data32F[1];
   let min_diff = pts.data32F[0]-pts.data32F[1];
   let rect = [];
    for (let i = 0; i < pts.data32F.length; i+=2){
         let new_sum = pts.data32F[i]+pts.data32F[i+1];
         let new_diff = pts.data32F[i]-pts.data32F[i+1];
        if(new_sum >= max_sum){
            max_sum = new_sum;
            // Top left point
            rect[6] = pts.data32F[i]
            rect[7] = pts.data32F[i+1]
        }
        if(new_sum <= min_sum){
            min_sum = new_sum;
            // bottom right point
            rect[0] = pts.data32F[i]
            rect[1] = pts.data32F[i+1]
        }
        if(new_diff >= max_diff){
            max_diff = new_diff;
            // bottom left point
            if(ratio >= 1) {
                rect[4] = pts.data32F[i]
                rect[5] = pts.data32F[i + 1]
            }
            else{
                rect[2] = pts.data32F[i]
                rect[3] = pts.data32F[i+1]
                console.log('h bilde')
            }
        }
        if(new_diff <= min_diff){
            min_diff = new_diff;
            //Top right point
            if(ratio >= 1) {
                rect[2] = pts.data32F[i]
                rect[3] = pts.data32F[i + 1]
            }
            else{
                rect[4] = pts.data32F[i]
                rect[5] = pts.data32F[i+1]
                console.log('h bilde')
            }
        }
    }


    for (let i = 0; i < rect.length; i++){

        pts.data32F[i]=rect[i];
    }
    if(ratio <1) {
        pts.data32F[0] += 35;
        pts.data32F[1] += 35;
        pts.data32F[2] -= 35;
        pts.data32F[3] += 35;
        pts.data32F[4] += 35;
        pts.data32F[5] -= 35;
        pts.data32F[6] -= 35;
        pts.data32F[7] -= 35;
    }
    if(ratio > 1) {
        pts.data32F[0] += 20;
        pts.data32F[1] += 20;
        pts.data32F[2] += 20;
        pts.data32F[3] -= 20;
        pts.data32F[4] -= 20;
        pts.data32F[5] += 20;
        pts.data32F[6] -= 20;
        pts.data32F[7] -= 20;
    }
/*
    let a = pts.data32F[6]+pts.data32F[7];

    let b = newpoint[0]+newpoint[2];
    let c = newpoint[1]+newpoint[2];

    for (let i = 0; i < pts.rows/2; i++) {
            pts.data32F[i] += 10;pts.data32F[i + 1] += 10;
    }
    if(a<b){
        console.log('a<b')
        pts.data32F[4] += 30;
        pts.data32F[4 + 1] -= 30;
    }
    if (a == c){

        console.log('a ==c')
        pts.data32F[6] -= 30;
        pts.data32F[6 + 1] -= 30;
    }
*/

    // cv.imshow('canvasOutput', threshold_im);

    contours.delete();
    im_gray.delete();
    threshold_im.delete();
    hierarchy.delete();
    return pts;

}

function getDistance(x1, y1, x2, y2){
    let y = Math.abs(x2 - x1);
    let x = Math.abs(y2 - y1);

    return Math.sqrt(x * x + y * y);
}

    function getTransformedImage(im, fromPts) {

        // Grayscale
        let im_gray = new cv.Mat();
        cv.cvtColor(im, im_gray, cv.COLOR_RGBA2GRAY, 0);

        // Threshold
        let threshold_im = new cv.Mat();
        cv.threshold(im_gray, threshold_im, THRESHOLD, 255, cv.THRESH_BINARY);


        let transformedIm = new cv.Mat();
        const rows = im.rows;
        console.log(rows)
        const cols = im.cols;
        console.log(cols)
        let dsize = new cv.Size(cols, rows);
        let toPts;
        if(ratio >= 1){
            toPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
                0, 0, 0, rows, cols, 0, cols, rows
            ]);
        }
         else {
            toPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
                cols, 0,cols, rows, 0, 0,0, rows
            ]);
        }


        console.log(toPts.data32F)
        const M = cv.getPerspectiveTransform(fromPts, toPts); // Matrix of transformations
        cv.warpPerspective(im, transformedIm, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());


        cv.cvtColor(transformedIm, transformedIm, cv.COLOR_RGBA2GRAY, 0);
        cv.adaptiveThreshold(transformedIm, transformedIm, 248, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 77, 7);
        cv.threshold(transformedIm, transformedIm,THRESHOLD, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);

        fromPts.delete();
        toPts.delete();
        M.delete();
        // dst.delete(); p.delete(); m.delete(); result.delete();
        return transformedIm;

    }


    function callback() {
        let track1 = document.getElementById('tracke1Value');
        let trackbar1 = document.getElementById('trackbar1');
        track1.setAttribute('value', trackbar1.value);

        let track2 = document.getElementById('tracke2Value');
        let trackbar2 = document.getElementById('trackbar2');
        track2.setAttribute('value', trackbar2.value);
        let max = parseInt(trackbar1.value);
        let min = parseInt(trackbar2.value);
        console.log(max, min);
        let src = cv.imread(canvas_image);
        let dst = new cv.Mat();
        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0)

        // cv.medianBlur(src, dst, (5,5));
        //let M = cv.Mat.eye(3, 3, cv.CV_32FC1);
        //let anchor = new cv.Point(0, -1);
        //cv.filter2D(src, dst, cv.CV_8U, M, anchor, 0, cv.BORDER_DEFAULT);
        //cv.bilateralFilter(src, dst, 9, 75, 75, cv.BORDER_DEFAULT);
        // let ksize = new cv.Size(3, 3);
        // cv.GaussianBlur(src, dst, ksize, 0, 0, cv.BORDER_DEFAULT);


        // cv.adaptiveThreshold(src, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);

        cv.Canny(src, dst, min, max, 3, false);


        cv.imshow('pros-image', dst);
        im.delete();
        dst.delete();
    }


/*

export class SortableContour {
    perimiterSize: number;
    areaSize: number;
    contour: any;

    constructor(fields: Partial<SortableContour>) {
        Object.assign(this, fields);
    }
}
*/

// hough funksjon
/*
function houghP(im){

    let src = cv.imread(im);
    let dst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC3);
    let lines = new cv.Mat();
    let color = new cv.Scalar(255, 0, 0);
    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    cv.Canny(src, src, 50, 200, 3);
// You can try more different parameters
    cv.HoughLinesP(src, lines, 1, Math.PI / 180, 2, 0, 0);
// draw lines
    for (let i = 0; i < lines.rows; ++i) {
        let startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
        let endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
        cv.line(dst, startPoint, endPoint, color);
    }
    //cv.imshow('canvasOutput', dst);
    src.delete(); dst.delete(); lines.delete();
}

function hough(){
    let im = cv.imread(origIm);

    let im_gray = new cv.Mat();
    cv.cvtColor(im, im_gray, cv.COLOR_RGBA2GRAY,0);





    let medianBlur_im = new cv.Mat();
    cv.medianBlur(im_gray, medianBlur_im, 13);

    let cany_im = new cv.Mat();

    cv.Canny(medianBlur_im, cany_im, 30, 120, 3, false);
    // Threshold
    let threshold_im = new cv.Mat();
    //cv.adaptiveThreshold(im_gray, threshold_im, 255, cv.THRESH_BINARY, 81, 3);
    cv.threshold(cany_im, threshold_im,THRESHOLD, 200, cv.THRESH_BINARY);
    //cv.threshold(threshold_im, threshold_im,THRESHOLD, 255, cv.THRESH_BINARY);
    let M = cv.Mat.ones(5, 5, cv.CV_8U);
// You can try more different parameters
    cv.morphologyEx(threshold_im, threshold_im, cv.MORPH_GRADIENT, M);

    let dst = cv.Mat.zeros(im.rows, im.cols, cv.CV_8UC3);
    let lines = new cv.Mat();
    cv.cvtColor(im, im, cv.COLOR_RGBA2GRAY, 0);
    cv.Canny(im, im, 50, 130, 3);
// You can try more different parameters
    cv.HoughLines(im, lines, 1, Math.PI / 180,
        60, 0, 0, 0, Math.PI);
// draw lines
    for (let i = 0; i < lines.rows; ++i) {
        let rho = lines.data32F[i * 2];
        let theta = lines.data32F[i * 2 + 1];
        let a = Math.cos(theta);
        let b = Math.sin(theta);
        let x0 = a * rho;
        let y0 = b * rho;
        let startPoint = {x: x0 - 1000 * b, y: y0 + 1000 * a};
        let endPoint = {x: x0 + 1000 * b, y: y0 - 1000 * a};
        cv.line(dst, startPoint, endPoint, [255, 0, 0, 255]);
    }
    //cv.imshow('canvasOutput', im);
    //cv.imshow('canvasOutput', dst);
    im.delete(); dst.delete(); lines.delete();
    return dst;
}


let srcMat, dstMat, color;

async function onOpenCvReady() {
    srcMat = await cv.imread(origIm);
    cv.cvtColor(srcMat, srcMat, cv.COLOR_RGBA2GRAY);
    dstMat = cv.Mat.zeros(srcMat.rows, srcMat.cols, cv.CV_8UC1);
    color = new cv.Scalar(255, 0, 0);

    let lines = new cv.Mat();
    cv.Canny(srcMat, dstMat, 50, 150, 3, false);
    cv.HoughLines(dstMat, lines, 1, Math.PI / 180, 150, 0, 0, 0, Math.PI);

    for (let i = 0; i < lines.rows; ++i) {
        let rho = lines.data32F[i * 2],
            theta = lines.data32F[i * 2 + 1];
        let a = Math.cos(theta), b = Math.sin(theta);
        let x0 = a * rho, y0 = b * rho;
        let pt1 = new cv.Point(x0 + 1000 * (-b), y0 + 1000 * (a));
        let pt2 = new cv.Point(x0 - 1000 * (-b), y0 - 1000 * (a));
        cv.line(srcMat, pt1, pt2, color, 1, cv.LINE_AA, 0);
    }

    let corners = [];
    for (let i = 0; i < lines.rows; ++i) {
        for (let j = i + 1; j < lines.rows; ++j) {
            let theta1 = lines.data32F[i * 2 + 1], theta2 = lines.data32F[j * 2 + 1];
            if (Math.abs(theta1 - theta2) < Math.PI / 6) {
                continue;
            }

            let rho1 = lines.data32F[i * 2], rho2 = lines.data32F[j * 2];
            let a1 = Math.cos(theta1), b1 = Math.sin(theta1),
                a2 = Math.cos(theta2), b2 = Math.sin(theta2);

            let x = (b2 * rho1 - b1 * rho2) / (a1 * b2 - a2 * b1);
            let y = (a1 * rho2 - a2 * rho1) / (a1 * b2 - a2 * b1);

            if (x >= 0 && x < srcMat.cols && y >= 0 && y < srcMat.rows) {
                corners.push({
                    x: x,
                    y: y
                });
            }
        }
    }

        for (let i = 0; i < corners.length; ++i) {
            cv.circle(srcMat, new cv.Point(corners[i].x, corners[i].y), 5, color, -1, cv.LINE_AA, 0);
        }

        cv.imshow('canvasOutput', srcMat);
        srcMat.delete();
        dstMat.delete();

}


function houghpp(){

    // Load the image
    let img = cv.imread(imgElement);

// Convert the image to grayscale
    let gray = img.cvtColor(cv.COLOR_BGR2GRAY);

// Apply Canny edge detection
    let edges = gray.canny(50, 150);

// Define HoughLinesP parameters
    let lines = edges.houghLinesP(1, Math.PI/180, 50, 20, 10);

// Draw the lines on the image
    for (let i = 0; i < lines.length; i++) {
        let startPoint = new cv.Point(lines[i].x1, lines[i].y1);
        let endPoint = new cv.Point(lines[i].x2, lines[i].y2);
        img.drawLine(startPoint, endPoint, new cv.Vec(0, 0, 255), 2);
    }

}
*/
function pdfDown(im){
    window.jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    doc.addImage(im,10,10);
    doc.save('ImgToPDF.pdf')
}
