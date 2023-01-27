const video = document.getElementById("video-input");
const canvas = document.getElementById("canvas-output");
const canvas_image = document.getElementById("cap-image");
const pros_image = document.getElementById("pros-image");
const snap = document.getElementById("snap");
let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
let MIN_CONTOURS_SCALE= 20; // Minimum original image ratio
let THRESHOLD= 110; // Monochrome threshold
let origIm=document.getElementById('oIm');
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
            let dsize = new cv.Size(550, 700);
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
             transformedIm.delete(); dst.delete(); p.delete(); m.delete(); result.delete();


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
        cv.cvtColor(im, im_gray, cv.COLOR_RGBA2GRAY,0);

        // Threshold
        let threshold_im = new cv.Mat();
        //cv.adaptiveThreshold(im_gray, threshold_im, 255, cv.THRESH_BINARY, 81, 3);
       cv.threshold(im_gray, threshold_im,THRESHOLD, 255, cv.THRESH_BINARY);


        // Contours
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(threshold_im, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
        hierarchy.delete();

        let pts = null;
        let maxCntArea = 0


        for (let i = 0; i <contours.size (); ++ i) {

            let cnt = contours.get (i);
            const cntArea = cv.contourArea (cnt)
            const maxRectScale = parseInt (cntArea / imRectArea * 100) // How big is it compared to the original image (%)

            if (maxRectScale>= MIN_CONTOURS_SCALE) {// Filter by ratio to original image

                if (cntArea> maxCntArea) {// Keep larger

                    let approx = new cv.Mat ();
                    const epsilon = 0.02 * cv.arcLength (cnt, true)
                    cv.approxPolyDP (cnt, approx, epsilon, true)

                    if (approx.size (). height === 4) {// Keep if it is a rectangle

                        maxCntArea = cntArea;
                        pts = approx // Coordinates of the rectangle to be cut out (4 points)
                       // cv.circle(pts.,(447,63), 63, (0,0,255), -1)
                        let color = new cv.Scalar(255, 0, 0)
                        //cv.drawContours(imgElement, contours, i, color, 5, cv.LINE_8)

                    }

                }

            }

        }

        contours.delete();
        im_gray.delete();
        threshold_im.delete();
        pts.convertTo(pts, cv.CV_32FC2);
        //console.log(pts)
        //cv.circle(img,(447,63), 63, (0,0,255), -1)

        //console.log(pts.Mat[0]);
        //console.log(pts.rows);

        return pts;

    }

    function getTransformedImage(im, fromPts) {

        // Grayscale
        let im_gray = new cv.Mat();
        cv.cvtColor(im, im_gray, cv.COLOR_RGBA2GRAY,0);

        // Threshold
        let threshold_im = new cv.Mat();
        cv.threshold(im_gray, threshold_im,THRESHOLD, 255, cv.THRESH_BINARY);



        let transformedIm = new cv.Mat();
        const rows = im.rows;
        console.log(rows)
        const cols = im.cols;
        console.log(cols)
        let dsize = new cv.Size(cols, rows);
        const toPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
            cols, 0, 0, 0, 0, rows, cols, rows
        ]);
        const M = cv.getPerspectiveTransform(fromPts, toPts); // Matrix of transformations
        cv.warpPerspective(im, transformedIm, M, dsize,cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());




        cv.cvtColor(transformedIm, transformedIm, cv.COLOR_RGBA2GRAY,0);
        cv.adaptiveThreshold(transformedIm, transformedIm, 248, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 77,7);
        //cv.threshold(transformedIm, transformedIm,THRESHOLD, 255, cv.THRESH_BINARY);

        fromPts.delete(); toPts.delete(); M.delete();
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
   console.log(max,min);
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
