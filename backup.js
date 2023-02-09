
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
let max_width, max_height, ratio,antallKanter, modifyTall_v,modifyTall_h, frompoint,Im_Ratio, min_width,min_height;

inputElement.addEventListener('change', (e) => {

    origIm.src = URL.createObjectURL(e.target.files[0]);
    imgElement.src = URL.createObjectURL(e.target.files[0]);

}, false);
imgElement.onload = function() {
    frompoint = new cv.Mat();
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
    console.log(pts.data32F)
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

        // processPageCallback(transformedIm,1,1);

        transformedIm.delete(); dst.delete();


    } else {

        console.log('Failed...');

    }

    im.delete();

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
    cv.morphologyEx(threshold_im, threshold_im, cv.MORPH_GRADIENT, M);
    //let anchor = new cv.Point(-1, -1);
    //cv.dilate(threshold_im, threshold_im, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    //let k = cv.Mat.ones(3, 3, cv.CV_8U);
    //cv.erode(threshold_im, threshold_im, k, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    // let dsize = new cv.Size(400, 800);
    //cv.resize(threshold_im,threshold_im, dsize, 0, 0, cv.INTER_AREA);

    //cv.imshow('pros-image', threshold_im);

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

            if (cntArea > maxCntArea) {

                const epsilon = 0.02 * cv.arcLength(cnt, true)
                cv.approxPolyDP(cnt, approx, epsilon, true);
                maxCnt = cnt;
                maxCntArea = cntArea;

                //  console.log(approx.size().height)

                if (approx.size().height === 4) {// Keep if it is a rectangle
                    // antallKanter = approx.size().height;
                    modifyTall_v = 35;
                    modifyTall_h = 35;
                    maxCntArea = cntArea;
                    pts = approx // Coordinates of the rectangle to be cut out (4 points)
                    // cv.circle(pts.,(447,63), 63, (0,0,255), -1)
                    //let color = new cv.Scalar(255, 0, 0)
                    //cv.drawContours(imgElement, contours, i, color, 5, cv.LINE_8)

                }

            }

        }

    }


    if (approx.size().height !== 4) {
        let rotatedRect = cv.minAreaRect(maxCnt);
        vertices = cv.RotatedRect.points(rotatedRect);

        modifyTall_v = 55;
        modifyTall_h = 35;
        // let features = new cv.Mat();
        //cv.goodFeaturesToTrack(cany_im,features,4,0.05,400)
        //features.convertTo(features,cv.CV_32FC2);
        //console.log(features.data32F);
        let rectangleColor = new cv.Scalar(255, 0, 0);
        for (let i = 0; i < 4; i++) {
            cv.line(threshold_im, vertices[i], vertices[(i + 1) % 4], rectangleColor, 2, cv.LINE_AA, 0);
        }
        cv.imshow('pros-image', threshold_im);
        console.log(vertices)

        for (let i = 0; i < 4; i++) {
            vertices[i].x= parseInt(vertices[i].x);
            vertices[i].y= parseInt(vertices[i].y);
            vertices[(i + 1) % 4];
        }

        //  sort by y  coordinates to know which corner has been scanned first
        vertices.sort(function(a, b) {

            return  a.y - b.y;
        });

        console.log(vertices)



        let recPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
            vertices[0].x, vertices[0].y,vertices[1].x,vertices[1].y,vertices[2].x, vertices[2].y,vertices[3].x, vertices[3].y
        ]);


        console.log(recPts.data32F)
        checkshape(recPts);
        console.log(ratio)





        // frompoint=  modifyCorners(recPts);
        //console.log(frompoint)
        return modifyCorners(recPts);
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
    //  sort by y  coordinates to know which corner has been scanned first

    console.log(pts.data32F)

    //let sortPts= pts.sort((a,b)=>b-a);
    //console.log(sortPts.data32F);
    let sortPots = [];
    for (let i = 0; i < 8; i+=2) {
        sortPots.push({x:pts.data32F[i] ,y:pts.data32F[i+1]})
    }
    //  sort by y  coordinates to know which corner has been scanned first
    sortPots.sort(function(a, b) {

        return  a.y - b.y;
    });

    console.log(sortPots)
    let recPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
        sortPots[0].x, sortPots[0].y,sortPots[1].x,sortPots[1].y,sortPots[2].x, sortPots[2].y,sortPots[3].x, sortPots[3].y
    ]);
    checkshape(recPts)
    // cv.imshow('canvasOutput', threshold_im);

    contours.delete();
    im_gray.delete();
    threshold_im.delete();
    hierarchy.delete();

    // Modify corner coordinates
    console.log(pts.data32F)
    frompoint=  modifyCorners(recPts);
    console.log(frompoint)
    return frompoint;

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
    // 0, 0, 0, rows, cols, 0, cols, rows
    // 0, 0, 0, min_height, min_width, 0, min_width, min_height
    //   0, 0, frompoint.data32F[2],frompoint.data32F[3], frompoint.data32F[4],frompoint.data32F[5], frompoint.data32F[6], frompoint.data32F[7]
    console.log(frompoint)
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
    cv.adaptiveThreshold(transformedIm, transformedIm, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 77, 7);
    cv.threshold(transformedIm, transformedIm,THRESHOLD, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);


    fromPts.delete();
    toPts.delete();
    M.delete();
    // dst.delete(); p.delete(); m.delete(); result.delete();
    return transformedIm;

}

// Renge avstand mellom to punkter

function getDistance(x1, y1, x2, y2){
    let y = Math.abs(x2 - x1);
    let x = Math.abs(y2 - y1);

    return Math.sqrt(x * x + y * y);
}

// sjekk om bildet er horizental eller virtikal

function checkshape(pts){

    let wt ,wb,hl,hr;

    // Alle points ordnet by Y coordinates when we scanned contours.
    wt = getDistance(pts.data32F[0],pts.data32F[1],pts.data32F[2],pts.data32F[3])


    if(pts.data32F[0] < pts.data32F[2]) {                   // check position to x for first and second point
        if (pts.data32F[4] > pts.data32F[6] ) {             // check position to x for third and point forth point
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
    max_width = Math.max(wt,wb);
    max_height = Math.max(hl,hr);

    min_width = Math.min(wt,wb);
    min_height = Math.min(hl,hr);
    ratio = max_height/max_width;  // for  å sjekke retning til rectangle om den er horizental eller vertikal
    // Im_Ratio = max_height/im.cols;
    //console.log(ratio,Im_Ratio)
}

// Modify corner coordinates

function modifyCorners(pts){


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
    console.log(Im_Ratio,rect,pts.data32F)
    if(ratio <1) {
        pts.data32F[0] += modifyTall_h;
        pts.data32F[1] += modifyTall_h;
        pts.data32F[2] -= modifyTall_h;
        pts.data32F[3] += modifyTall_h;
        pts.data32F[4] += modifyTall_h;
        pts.data32F[5] -= modifyTall_h;
        pts.data32F[6] -= modifyTall_h;
        pts.data32F[7] -= modifyTall_h;
    }
    if(ratio > 1) {
        pts.data32F[0] += modifyTall_v;
        pts.data32F[1] += modifyTall_v;
        pts.data32F[2] += modifyTall_v;
        pts.data32F[3] -= modifyTall_v;
        pts.data32F[4] -= modifyTall_v;
        pts.data32F[5] += modifyTall_v;
        pts.data32F[6] -= modifyTall_v;
        pts.data32F[7] -= modifyTall_v;
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
    console.log(pts.data32F)
    return pts;
}
