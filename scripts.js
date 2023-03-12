//"use strict";
const video = document.getElementById("video-input");
let original_Video = document.getElementById('Original-video-input');
let cap_video = document.getElementById("canvas-output");
const cap_image = document.getElementById("cap-image");
const pros_image = document.getElementById("pros-image");
const CanvasLab = document.getElementById("ImProcess");
const snap = document.getElementById("snap");
const labCanvas = document.getElementById("LabcanvasOutput");
const imtofrode = document.getElementById("canvasOutput");
let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
let MIN_CONTOURS_SCALE= 20; // Minimum original image ratio
let THRESHOLD= 128; // Monochrome threshold
let origIm=document.getElementById('oIm');
let Frode_projection=document.getElementById('Frode-projection');
let OpenCV_projection=document.getElementById('OpenCV-projection');
let Stronger_contrast=document.getElementById('contrast');
let Negative=document.getElementById('negative');
let imtof , max_width,lineAngle,linewidth,lineheight, max_height, ratio, modifyTall_v,modifyTall_h,Im_Ratio, min_width,min_height;

inputElement.addEventListener('change', (e) => {

    origIm.src = URL.createObjectURL(e.target.files[0]);
    imgElement.src = URL.createObjectURL(e.target.files[0]);

}, false);
imgElement.onload = function ImProcess() {
    result.innerHTML='';
    transform(origIm)
    //processPageCallback(imtofrode);
};
// check if opencv loaded
function openCvReady() {
    // https://emscripten.org/docs/api_reference/module.html#Module.onRuntimeInitialized
    cv['onRuntimeInitialized']=() => {
        document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
    }
}

(async () => {
    let front = false;
    let mode = "user"


   let devices = await navigator.mediaDevices.enumerateDevices();

    // Prefer camera resolution nearest to 1280x720.
    const constraints = {
        audio: false,
        video: {
           facingMode:  front? "user": "environment",
            //resizeMode: 'none',
            width: { ideal: 1920 },
           height: { ideal: 1080 },
            //focusMode: true,
            //zoom: 50 ,
            //aspectRatio: 16/9,
            //deviceId:  devices[2].deviceId
        }
        /*
             video: {
                 facingMode: {
                     exact: "environment"
                             }
                     }

     */
    };

    await navigator.mediaDevices.getUserMedia(constraints)
        .then( stream => {
            // Granted. Store deviceIds for next time
            //localStorage.camId = stream.getVideoTracks()[0].getSettings().deviceId;
            //await new Promise(resolve => setTimeout(resolve, 2000));
            //let videocopy = video.copy();
            let [track] = stream.getVideoTracks();
            let {width, height, aspectRatio} = track.getSettings();
           // console.log("Got stream with constraints:", constraints);
           // console.log(`Using video device: ${track.getSettings.deviceId}`);
            // Constraints are in landscape, while settings may be rotated (portrait)
/*
            if (width < height) {
                [width, height] = [height, width];
                aspectRatio = 1 / aspectRatio;
            }


            track.applyConstraints({
                resizeMode: 'crop-and-scale',
                width: {exact: width},
                height: {exact: height},
                //frameRate: {exact: 10},
                aspectRatio: 16/9,
            });
           // let x = (video.width -video.offsetWidth)/2+"px";
           // let y = (video.height -video.offsetHeight)/2+"px";
           //let ratio = video.offsetWidth/video.width;
           // console.log(x,y,ratio)
           //video.style.transform = 'translate (${x},${y}) scale(${ratio})'
            // original_Video.srcObject = stream;
  */
            video.srcObject = stream;
            //original_Video.play();
            video.play();

            let context = cap_image.getContext('2d');
            snap.addEventListener("click",function (){
                context.drawImage(video,0,0,width,height);
                transform(cap_image);
            });
        })
        .catch((err) => {
            // always check for errors at the end.
            console.error(`${err.name}: ${err.message}`);
            if (error.name === "ConstraintNotSatisfiedError") {
                console.error(
                    `The resolution ${constraints.video.width.exact}x${constraints.video.height.exact} px is not supported by your device.`
                );
            } else if (error.name === "PermissionDeniedError") {
                console.error(
                    "You need to grant this page permission to access your camera and microphone."
                );
            } else {
                console.error(`getUserMedia error: ${error.name}`, error);
            }
        });


    //video.width=720;
    //video.height=1280;



    /*
    let src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
    let dst = new cv.Mat(video.height, video.width, cv.CV_8UC1);
    let cap = new cv.VideoCapture(video);

    let imRectArea, contours, hierarchy,maxCntArea,cnt,cntArea,
        maxRectScale,vertices,rectangleColor, rect, point1,point2,M;

         const FPS = 30;
         let count = 0;
        function processVideo() {
            let begin = Date.now();
            try {

                if (!stream) {
                    // clean memory and stop
                    src.delete();
                    dst.delete();
                    cap.delete();
                    contours.delete(); hierarchy.delete(); vertices.delete();rectangleColor.delete();
                    cnt.delete(); rect.delete(); point1.delete(); point2.delete(); M.delete();
                    return;
                }

                // start processing.
                cap.read(src);

                // Image area
                imRectArea = src.cols * src.rows //

                // Grayscale
                cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);

                // Blur
                cv.medianBlur(dst, dst, 13);

                // Canny Edge detector
                cv.Canny(dst, dst, 30, 120, 3, false);

                // Threshold
                cv.threshold(dst, dst, THRESHOLD, 200, cv.THRESH_BINARY);

                M = cv.Mat.ones(5, 5, cv.CV_8U);
                cv.morphologyEx(dst, dst, cv.MORPH_GRADIENT, M);
                // Contours
                 contours = new cv.MatVector();
                 hierarchy = new cv.Mat();
                cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
                maxCntArea = 0
                count +=1;
                if(count % 3 != 0) {  // to increase camera speed
                    for (let i = 0; i < contours.size(); ++i) {

                        cnt = contours.get(i);
                        cntArea = cv.contourArea(cnt)

                        maxRectScale = parseInt(cntArea / imRectArea * 100)  // percentage Contour Area compare to Image Area
                        if (maxRectScale >= MIN_CONTOURS_SCALE) {   // Filter by ratio to original image
                            if (cntArea > maxCntArea) {
                                maxCntArea = cntArea;
                                rect = cv.boundingRect(cnt);
                                point1 = new cv.Point(rect.x, rect.y);
                                point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
                                cv.rectangle(src, point1, point2, [0, 255, 0, 255], 3);
                            }
                        }
                    }
                }
                cv.imshow("canvas-output", src);
                // schedule the next one.
                let delay = 1000/FPS - (Date.now() - begin);
                setTimeout(processVideo, delay);

            } catch (err) {
               // utils.printError(err);
                //location.reload();
                console.log(err)

            }

        }

       setTimeout(processVideo, 0);
*/
})();


// opencv
 function transform (src) {
    const im = cv.imread(src);
    let pts = getContoursPoints(im);
    if(pts) {

        const transformedIm = getTransformedImage(im, pts);
        //let resizeIm = new cv.Mat();
        //let dsize = new cv.Size(550,800);
        //cv.resize(transformedIm,resizeIm, dsize, 0, 0, cv.INTER_AREA);

        //let rectIm = new cv.Rect(5,5,resizeIm.cols-10,resizeIm.rows-10);
        //let rectCropIm = new cv.Mat();
        //rectCropIm = resizeIm.roi(rectIm);

       // cv.imshow('canvasOutput', rectCropIm);
/*
        if( 1500 >transformedIm.cols > 1000 || 1500 >transformedIm.rows > 1000) {

            if (ratio <= 1) {
                let dsize = new cv.Size(transformedIm.cols * 0.94, transformedIm.rows * 0.67);
                cv.resize(transformedIm, transformedIm, dsize, 0, 0, cv.INTER_AREA);
            }

        }
        if(transformedIm.cols >= 1500 || transformedIm.rows >= 1500){
            let dsize = new cv.Size(transformedIm.cols *0.4, transformedIm.rows * 0.3);
            cv.resize(transformedIm, transformedIm, dsize, 0, 0, cv.INTER_AREA);
        }
*/
       // checkTextOrination(transformedIm);

        if(transformedIm.cols > 1000 || transformedIm.rows > 1000) {
            let dsize = new cv.Size(1200, 1500);
            cv.resize(transformedIm, transformedIm, dsize, 0, 0, cv.INTER_AREA);
        }

        // let point1 = new cv.Point(3,3);
       // let point2 = new cv.Point(transformedIm.cols-5,transformedIm.rows-5);
       // let contoursColor = new cv.Scalar(255, 0, 0);

       // cv.rectangle(transformedIm, point1, point2, contoursColor, 20, cv.LINE_AA, 0);

        //cv.imshow('LabcanvasOutput',transformedIm);
        //let rotateIm = new cv.Mat();

        // Crop Image
        let cropIm = new cv.Mat();
        let rect = new cv.Rect(10,10,transformedIm.cols-20,transformedIm.rows-20);
        cropIm = transformedIm.roi(rect);
        cv.imshow('canvasOutput', cropIm);


        let medinaAngle = findlinesAngel(cropIm)
        //medinaAngle +=90;

        if(medinaAngle){
            //medinaAngle +=90;
            //imtofrode.style.transform= 'rotate('+lineAngle+'deg)'


            //cv.imshow('LabcanvasOutput', cropIm);


            // Rotate Image
            let dsize = new cv.Size(cropIm.cols, cropIm.rows);
            let center = new cv.Point(cropIm.cols / 2, cropIm.rows / 2);
            let M = cv.getRotationMatrix2D(center, medinaAngle, 1);
            let s = new cv.Scalar(255, 255, 255, 255);
            cv.warpAffine(cropIm,cropIm, M, dsize,cv.INTER_LINEAR,cv.BORDER_CONSTANT,s);

        }
        cv.imshow('LabcanvasOutput', cropIm);
        cv.imshow('canvasOutput', cropIm);
        let blur_im = new cv.Mat();
        cv.medianBlur(cropIm, blur_im, 3);
        cv.imshow('canvasOutput', blur_im);
        if(Frode_projection.checked){
            processPageCallback(imtofrode);
        }
        if(OpenCV_projection.checked) {
            extractAllWords(cropIm)
        }

        transformedIm.delete(); cropIm.delete();

    } else {

        console.log('Failed...');

    }

    im.delete();

}

function getContoursPoints (im) {
/*
    cv.cvtColor(im, im, cv.COLOR_RGBA2RGB, 0);
    let mask = new cv.Mat();
    let bgdModel = new cv.Mat();
    let fgdModel = new cv.Mat();
    let rect = new cv.Rect(100, 100, im.cols, im.rows);
    cv.grabCut(im, mask, rect, bgdModel, fgdModel, 1, cv.GC_INIT_WITH_RECT);
// draw foreground
    for (let i = 0; i < im.rows; i++) {
        for (let j = 0; j < im.cols; j++) {
            if (mask.ucharPtr(i, j)[0] == 0 || mask.ucharPtr(i, j)[0] == 2) {
                im.ucharPtr(i, j)[0] = 0;
                im.ucharPtr(i, j)[1] = 0;
                im.ucharPtr(i, j)[2] = 0;
            }
        }
    }
// draw grab rect
    let color = new cv.Scalar(0, 0, 0);
    let point1 = new cv.Point(rect.x, rect.y);
    let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
    cv.rectangle(im, point1, point2,color);
    cv.imshow('canvasOutput', im);
     mask.delete(); bgdModel.delete(); fgdModel.delete();
*/
   let maxCnt = findMaxCnt(im);

    let pts = new cv.Mat();
    let approx = new cv.Mat();
    let vertices = new cv.Mat();

    const epsilon = 0.02 * cv.arcLength(maxCnt, true) // maximum distance from contour to approximated contour
    cv.approxPolyDP(maxCnt, approx, epsilon, true);   //  Douglas-Peucker algorithm.function to approximate the shape

    if (approx.size().height === 4) {// Keep if it is a rectangle
        // antallKanter = approx.size().height;
        modifyTall_v = 0;
        modifyTall_h = 0;
        pts = approx // Coordinates of the rectangle to be cut out (4 points)

        //console.log(pts);
        //approx.convertTo(approx,cv.CV_32FC2);
        //console.log(approx.data32F);
        pts.convertTo(pts, cv.CV_32FC2);
        //  sort by y  coordinates to know which corner has been scanned first

        console.log(pts.data32F)
        //let sortPts= pts.sort((a,b)=>b-a);
        //console.log(sortPts.data32F);
        let sortPots = [];
        for (let i = 0; i < 8; i+=2) {
            sortPots.push({x:Math.round(pts.data32F[i]),y:Math.round(pts.data32F[i+1])})
        }
        //  sort by y  coordinates to know which corner has been scanned first
        sortPots.sort(function(a, b) {

            return  a.y - b.y;
        });

        console.log(sortPots)
        let recPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
            sortPots[0].x, sortPots[0].y,sortPots[1].x,sortPots[1].y,sortPots[2].x, sortPots[2].y,sortPots[3].x, sortPots[3].y
        ]);
        console.log(recPts.data32F)
        checkshape(sortPots)

        // cv.imshow('canvasOutput', threshold_im);
        // Modify corner coordinates
        console.log(pts.data32F)
        //frompoint=  modifyCorners(recPts);
        // console.log(frompoint.data32F)
        return modifyCorners(recPts);
    }


   // console.log(maxCntArea)
    if (approx.size().height !== 4) {
        let minRecrt = cv.minAreaRect(maxCnt)
        vertices = cv.RotatedRect.points(minRecrt);
        modifyTall_v =45;
        modifyTall_h =45;
        // let features = new cv.Mat();
        //cv.goodFeaturesToTrack(cany_im,features,4,0.05,400)
        //features.convertTo(features,cv.CV_32FC2);
        //console.log(features.data32F);
        let dst = new cv.Mat();
        let rectangleColor = new cv.Scalar(255, 0, 0);
        for (let i = 0; i < 4; i++) {
            cv.line(im, vertices[i], vertices[(i + 1) % 4], rectangleColor, 2, cv.LINE_AA, 0);
        }
        cv.imshow('pros-image', im);
        console.log(vertices)

        for (let i = 0; i < 4; i++) {
            vertices[(i + 1)% 4];
            vertices[i].x= Math.round(vertices[i].x);
            vertices[i].y= Math.round(vertices[i].y);

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
        checkshape(vertices);
        console.log(ratio)


         //frompoint=  modifyCorners(recPts);
        //console.log(frompoint)

        return modifyCorners(recPts);
    }
}

 function findMaxCnt(im){

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
    cv.threshold(im_gray, threshold_im, THRESHOLD, 255, cv.THRESH_BINARY);
    //cv.threshold(threshold_im, threshold_im,THRESHOLD, 255, cv.THRESH_BINARY);
    // cv.imshow('pros-image',cany_im);
    let M = cv.Mat.ones(5, 5, cv.CV_8U);
    // cv.morphologyEx(threshold_im, threshold_im, cv.MORPH_GRADIENT, M);
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
    let maxCntArea = 0
    let maxCnt = new cv.MatVector();
    for (let i = 0; i < contours.size(); ++i) {

        let cnt = contours.get(i);
        const cntArea = cv.contourArea(cnt)

        const maxRectScale = parseInt(cntArea / imRectArea * 100) // How big is it compared to the original image (%)
        console.log(maxRectScale)
        if (maxRectScale >= MIN_CONTOURS_SCALE) {// Filter by ratio to original image

            if (cntArea > maxCntArea) {
                maxCnt = cnt;
                maxCntArea = cntArea;


            }

        }

    }


    contours.delete();
    im_gray.delete();
    threshold_im.delete();
    hierarchy.delete();
    return maxCnt;

}

function getTransformedImage(im, fromPts) {

    let transformedIm = new cv.Mat();
    const rows = im.rows;
    const cols = im.cols;
    let dsize = new cv.Size(cols, rows);
    let toPts;
    // 0, 0, 0, rows, cols, 0, cols, rows
    // 0, 0, 0, min_height, min_width, 0, min_width, min_height
    //0, 0,cols, 0,0, rows,cols, rows
    //   0, 0, frompoint.data32F[2],frompoint.data32F[3], frompoint.data32F[4],frompoint.data32F[5], frompoint.data32F[6], frompoint.data32F[7]
   console.log(fromPts.data32F)
    if(ratio >= 1){
        toPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0, 0, 0, rows, cols, 0,cols, rows
        ]);
    }
    else {
        toPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
            cols, 0,cols, rows, 0, 0,0, rows
        ]);
    }


    console.log(toPts.data32F)
    const M = cv.getPerspectiveTransform(fromPts, toPts); // Matrix of transformations
    cv.warpPerspective(im, transformedIm, M, dsize,cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar(255,255,255,255));

    // Grayscale
    cv.cvtColor(transformedIm, transformedIm, cv.COLOR_RGBA2GRAY, 0);

   cv.adaptiveThreshold(transformedIm, transformedIm, 250, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 127, 7);
    // Blur
    let ksize = new cv.Size(3, 3);
    //cv.medianBlur(transformedIm, transformedIm, 3);
   // cv.GaussianBlur(transformedIm, transformedIm, ksize, 0, 0, cv.BORDER_DEFAULT);
    //cv.bilateralFilter(transformedIm, transformedIm, 9, 75, 75, cv.BORDER_DEFAULT);

    // Threshold
    cv.threshold(transformedIm, transformedIm,THRESHOLD, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);







    fromPts.delete();
    toPts.delete();
    M.delete();
    // dst.delete(); p.delete(); m.delete(); result.delete();

    return transformedIm;

}

// Renge avstand mellom to punkter

function getDistance(x1, y1, x2, y2){
    let x = x2 - x1;
    let y = y2 - y1;

    return Math.sqrt(x * x + y * y);
}

// sjekk om bildet er horizental eller virtikal

function checkshape(pts){

    let wt ,wb,hl,hr;

    // Alle points ordnet by Y coordinates when we scanned contours.
    wt = getDistance(pts[0].x, pts[0].y, pts[1].x, pts[1].y)


    if(pts[0].x < pts[1].x) {                   // check position to x for first and second point
        if (pts[2].x > pts[3].x ) {             // check position to x for third and point forth point
            hl = getDistance(pts[0].x, pts[0].y, pts[3].x, pts[3].y);
            hr = getDistance(pts[1].x, pts[1].y, pts[2].x, pts[2].y);
        }
        else {
            hl = getDistance(pts[0].x, pts[0].y, pts[2].x, pts[2].y);
            hr = getDistance(pts[1].x, pts[1].y, pts[3].x, pts[3].y);
        }
    }

    if(pts[0].y == pts[1].y){
        hl = getDistance(pts[0].x, pts[0].y, pts[3].x, pts[3].y);
        hr = getDistance(pts[1].x, pts[1].y, pts[2].x, pts[2].y);
    }


    else
        {
        if (pts[2].x < pts[3].x ) {
            hr = getDistance(pts[0].x, pts[0].y, pts[3].x, pts[3].y);
            hl = getDistance(pts[1].x, pts[1].y, pts[2].x, pts[2].y);
        }
        else {
            hr = getDistance(pts[0].x, pts[0].y, pts[2].x, pts[2].y);
            hl = getDistance(pts[1].x, pts[1].y, pts[3].x, pts[3].y);
        }

    }
    wb = getDistance(pts[2].x, pts[2].y, pts[3].x, pts[3].y)
    console.log(wt,wb,hl,hr)
    max_width = Math.max(wt,wb);
    max_height = Math.max(hl,hr);

    min_width = Math.min(wt,wb);
    min_height = Math.min(hl,hr);
    ratio = max_height/max_width;  // for  å sjekke retning til rectangle om den er horizental eller vertikal
   // Im_Ratio = max_height/im.cols;
    //console.log(ratio,Im_Ratio)
}
// find Text direction in contour
function checkTextOrination(im){
    let dst = new cv.Mat();
    let M = new cv.Mat();
    let ksize = new cv.Size(8, 8);
// You can try more different parameters
    M = cv.getStructuringElement(cv.MORPH_CROSS, ksize);
    cv.morphologyEx(im, dst, cv.MORPH_GRADIENT, M);
    cv.imshow('pros-image', dst);
    // Contours
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    let MaxCntArea= 1000;
    let MaxCnt = new cv.MatVector();

    for (let i = 0; i < contours.size(); ++i) {

        let cnt = contours.get(i);
        const cntArea = cv.contourArea(cnt)

            if (cntArea > MaxCntArea) {
                MaxCnt = cnt;
                MaxCntArea = cntArea;

            }

    }
    let rect = cv.boundingRect(MaxCnt);
    let contoursColor = new cv.Scalar(255, 255, 255);
    let rectangleColor = new cv.Scalar(255, 0, 0);
    cv.drawContours(dst, contours, 0, contoursColor, 1, 8, hierarchy, 100);
    let point1 = new cv.Point(rect.x, rect.y);
    let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
    cv.rectangle(dst, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);
    cv.imshow('pros-image', dst);
    linewidth = rect.width;
    lineheight = rect.height;
    console.log(linewidth,lineheight)
}
// find coordinates to every word in contour

function findlinesAngel(im){
    let dst = new cv.Mat();
    let M = new cv.Mat();
    let ksize = new cv.Size(18, 2);
    M = cv.getStructuringElement(cv.MORPH_CROSS, ksize);
    cv.morphologyEx(im, dst, cv.MORPH_GRADIENT, M);
    //cv.imshow('pros-image', dst);
    // Contours
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    let minCntArea= 1200; // for å fjernet små brikker
    let imArea = (im.rows * im.cols)*0.1;
    let sortertAngle=[];
    let linesCntAngles=[];
    let  rectArr = [];
    let medianAngle;
    let rectangleColor = new cv.Scalar(255, 0, 0);
    let contoursColor = new cv.Scalar(0, 255,0);
    let rotatedRect;
    let vertices;
    for (let i = 0; i < contours.size(); ++i) {
        let cnt = contours.get(i);
        const cntArea = cv.contourArea(cnt)

        if (cntArea > minCntArea && cntArea < imArea) {
           // MaxCnt=cnt;
            //minCntArea=cntArea;
            // let rect= cv.boundingRect(cnt);
            //let point1 = new cv.Point(rect.x, rect.y);
            //let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
            //cv.rectangle(dst, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);

            rotatedRect = cv.minAreaRect(cnt);
            rectArr.push(rotatedRect);
            vertices = cv.RotatedRect.points(rotatedRect);
            cv.drawContours(dst, contours, 0, contoursColor, 1, 8, hierarchy, 100);
            // draw rotatedRect
            for (let i = 0; i < 4; i++) {
                cv.line(dst, vertices[i], vertices[(i + 1) % 4], rectangleColor, 2, cv.LINE_AA, 0);
            }
            cv.imshow('pros-image', dst);
            vertices.sort((a,b) => a.y-b.y);
            let dx = Math.abs(vertices[3].x - vertices[2].x);
            let dy =Math.abs(vertices[3].y - vertices[2].y);
            let rektangleAngle = Math.atan2(dy,dx);
            linesCntAngles.push(rektangleAngle)
           // sortertAngle.push(rotatedRect.angle)


        }

    }
/*
    sortertAngle.sort((a,b) => a-b)
    medianAngle = sortertAngle.at(sortertAngle.length/2);
    let index = linesCntAngles.indexOf(medianAngle);
    medianRect = rectArr.at(index)
    if (medianRect.size.width < medianRect.size.height) {
        dst.delete(); contours.delete(); linesCntAngles=[]; sortertAngle=[]; rectArr=[]; vertices=[];
        return (-medianAngle - 90)*0.5;
    }
    dst.delete(); contours.delete(); linesCntAngles=[]; sortertAngle=[]; rectArr=[]; vertices=[];
    return medianAngle*0.5;
*/
    linesCntAngles.sort((a,b) => a-b);
    medianAngle = linesCntAngles.at(linesCntAngles.length/2);

    return medianAngle >0 ? -medianAngle : medianAngle;
}
// Extract words based on morphology operator.

function extractAllWords(im){

    let cany_im = new cv.Mat();

    cv.Canny(im, cany_im, 30, 120, 3, false);
    cv.imshow('pros-image',cany_im);
    // Threshold
    // let threshold_im = new cv.Mat();
    //cv.adaptiveThreshold(im_gray, threshold_im, 255, cv.THRESH_BINARY, 81, 3);
    //cv.threshold(cany_im, threshold_im, THRESHOLD, 255, cv.THRESH_BINARY);


    // Contours
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(im, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    let minCntArea= 60; // for å fjernet små brikker
    let imArea = (im.rows * im.cols)*0.1;
    let charHorizentalDistanse = [];
    let charVerticalDistanse = [];
    let charactersDimention =[]
    let sortertAngle=[];
    let linesCntAngles=[];
    let  rectArr = [];
    let medianAngle;
    let rectangleColor = new cv.Scalar(0, 255, 0);
    let contoursColor = new cv.Scalar(0, 255,0);
    let rotatedRect;
    let vertices;
    for (let i = 0; i < contours.size()*0.5; ++i) {
        let r = Math.floor(Math.random() * contours.size());  // Randomize choose sample of width in different places
        let cnt = contours.get(r);
        const cntArea = cv.contourArea(cnt)

        if (cntArea > minCntArea && cntArea < imArea) {
            // MaxCnt=cnt;
            //minCntArea=cntArea;
             let rect= cv.boundingRect(cnt);
            /*
             let point1 = new cv.Point(rect.x, rect.y);
            let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
            cv.rectangle(im, point1, point2, rectangleColor, 1, cv.LINE_AA, 0);
            */
            if(!charHorizentalDistanse.includes(rect.width)) {
                charHorizentalDistanse.push(rect.width);
            }
            if(!charVerticalDistanse.includes(rect.height)) {
                charVerticalDistanse.push(rect.height);
            }


            /*
            rotatedRect = cv.minAreaRect(cnt);
            rectArr.push(rotatedRect);
            vertices = cv.RotatedRect.points(rotatedRect);
            cv.drawContours(im, contours, 0, contoursColor, 1, 8, hierarchy, 100);
            // draw rotatedRect
            for (let i = 0; i < 4; i++) {
                cv.line(im, vertices[i], vertices[(i + 1) % 4], rectangleColor, 2, cv.LINE_AA, 0);
            }
             */

           // linesCntAngles.push(rotatedRect.angle)
           // sortertAngle.push(rotatedRect.angle)
           // console.log(rotatedRect.angle)

        }

    }
    cv.imshow('pros-image', im);

   // sortertAngle.sort((a,b) => a-b)
   // medianAngle = sortertAngle.at(sortertAngle.length/2);
   // let index = linesCntAngles.indexOf(medianAngle);
   // medianRect = rectArr.at(index)
    // distance between two characters
    /*
    rectArr.sort((a,b) => a.x - b.x)
    for (let i = 1; i < rectArr.length; ++i) {
       let avstand = (rectArr[i - 1].x+rectArr[i - 1].width) - rectArr[i].x
        horizentalDistanse.push(avstand);
    }

     */
    // NB: her kunne jeg finne tallet til det mest repeterende av bokstaverbreden, men det er tung prossess for optiamlisering.
    charHorizentalDistanse.sort((a,b) => a-b);
    let horizentalCharSnitt = charHorizentalDistanse.at(charHorizentalDistanse.length-1)/2;
    charVerticalDistanse.sort((a,b) => a-b);
    let verticalCharSnitt = charVerticalDistanse.at(charVerticalDistanse.length-1)/2;

    let dst = new cv.Mat();

    //cv.threshold(im,im,THRESHOLD, 255, cv.THRESH_BINARY_INV | cv.THRESH_OTSU);
    //let dst = new cv.Mat();


    let M = new cv.Mat();
    let ksize = new cv.Size(horizentalCharSnitt*0.247, verticalCharSnitt*0.2);
    M = cv.getStructuringElement(cv.MORPH_CROSS, ksize);
    cv.morphologyEx(im, dst, cv.MORPH_GRADIENT, M);

    cv.imshow('pros-image', dst);

    let MM = cv.Mat.ones(horizentalCharSnitt*0.36, verticalCharSnitt*0.3, cv.CV_8U);
    let hsize = new cv.Size(1.3, 1);
    MM = cv.getStructuringElement(cv.MORPH_CROSS, hsize);
    let anchor = new cv.Point(-1, -1);
    //let MM = cv.Mat.ones(5, 5, cv.CV_8U);
// You can try more different parameters
    //cv.dilate(dst, dst, MM, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue())

    cv.imshow('pros-image', dst);


    let conts = new cv.MatVector();
    let h= new cv.Mat();
    let min_Areal= horizentalCharSnitt*verticalCharSnitt*0.3;
    cv.findContours(dst, conts, h, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < conts.size(); ++i) {
        let cnt = conts.get(i);
        const cntArea = cv.contourArea(cnt)

        if (cntArea > min_Areal && cntArea < imArea) {
            // MaxCnt=cnt;
            //minCntArea=cntArea;
            let rect= cv.boundingRect(cnt);
            let point1 = new cv.Point(rect.x, rect.y);
            let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
            cv.rectangle(im, point1, point2, rectangleColor, 1, cv.LINE_AA, 0);
            rectArr.push(rect);


            /*
            rotatedRect = cv.minAreaRect(cnt);
            rectArr.push(rotatedRect);
            vertices = cv.RotatedRect.points(rotatedRect);
            cv.drawContours(im, contours, 0, contoursColor, 1, 8, hierarchy, 100);
            // draw rotatedRect
            for (let i = 0; i < 4; i++) {
                cv.line(im, vertices[i], vertices[(i + 1) % 4], rectangleColor, 2, cv.LINE_AA, 0);
            }

     */
            cv.imshow('pros-image', im);
            // linesCntAngles.push(rotatedRect.angle)
            // sortertAngle.push(rotatedRect.angle)
            // console.log(rotatedRect.angle)

        }

    }

// Calculate maximum rectangle height

   let max_height = rectArr.sort((a,b) => b.height - a.height).at(0).height;
    let first_y = rectArr.sort((a,b) =>a.y- b.y).at(0).y;
    let linje = 1
    let sort_by_lines = []
    for (let i=0;  i < rectArr.length; i++){
        if( rectArr.at(i).y >first_y+max_height){
            first_y = rectArr.at(i).y;
            linje++;
        }
        let obj = {"linje": linje,"x": rectArr.at(i).x,"y":rectArr.at(i).y,"w":rectArr.at(i).width,"h":rectArr.at(i).height};
        sort_by_lines.push(obj)
    }
    // sort Lines By line
    sort_by_lines.sort((a,b) => a.linje - b.linje)
    // sort by X in line
    sort_by_lines.sort((a,b) => {
       if(a.linje == b.linje) {
          return  a.x - b.x;
       }
    })

    console.log(sort_by_lines)
/*
     contours.delete(); hierarchy.delete(); charHorizentalDistanse=[]; charVerticalDistanse =[];
    charactersDimention=[];  rectArr=[]; medianAngle.delete(); rectangleColor.delete();
    contoursColor.delete(); rotatedRect.delete(); vertices.delete();
    conts.delete(); h.delete(); M.delete(); MM.delete(); dst.delete();
*/
    // Crop Image
    cropImage(sort_by_lines)
    /*
    for (let i=0; i< sort_by_lines.length; i++) {
        let cropIm = new cv.Mat();
        let rect = new cv.Rect(sort_by_lines.at(i).x,sort_by_lines.at(i).y,sort_by_lines.at(i).w,sort_by_lines.at(i).h);
        cropIm = transformedIm.roi(rect);
    }

     */

}

// crop image
function cropImage(wordCoordinates){
    const ctx = labCanvas.getContext("2d");

    for (var word of wordCoordinates)
    {
        const x = word.x;
        const y = word.y;
        const w = word.w;
        const h = word.h;

        // get the image of the current word
        const wordImage = ctx.getImageData(x,y,w,h);
        // create temporary canvas for word
        const wordCanvas = document.createElement("canvas");

        wordCanvas.setAttribute("name","clipWord")
        wordCanvas.width = w;   // set the canvas equal to the word dimensions.
        wordCanvas.height = h;

        // draw the word on the new canvas
        const wordCtx = wordCanvas.getContext("2d");
        wordCtx.putImageData(wordImage, 0, 0);
        // add the word to the assigned part of the page
        result.appendChild(wordCanvas)


    }
    const zoomInn = document.createElement("a");
    zoomInn.setAttribute("class","bi bi-zoom-in")
    zoomInn.setAttribute("id","zoom-inn-icon")
    zoomInn.setAttribute("type","button")
    result.appendChild(zoomInn)
    const zoomOut = document.createElement("a");
    zoomOut.setAttribute("class","bi bi-zoom-out")
    zoomOut.setAttribute("id","zoom-out-icon")
    zoomOut.setAttribute("type","button")
    result.appendChild(zoomOut)
    const zoomReset = document.createElement("a");
    zoomReset.setAttribute("class","bi bi-arrows-move")
    zoomReset.setAttribute("id","zoom-reset-icon")
    zoomReset.setAttribute("type","button")
    result.appendChild(zoomReset)

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


let zoom = 1;
result.addEventListener('click', function(event) {
    console.log(event.target.id)

   // let clipWord = document.getElementsByName("clipWord");
    if(event.target.id=='zoom-inn-icon'){
        zoom += 0.15;
        document.documentElement.style.setProperty('--scale-zoom',  zoom);
    }
    if(event.target.id=='zoom-out-icon'){
        zoom -= 0.15;
        document.documentElement.style.setProperty('--scale-zoom',  zoom);
    }
    if(event.target.id=='zoom-reset-icon'){
        zoom = 1;
        document.documentElement.style.setProperty('--scale-zoom',  zoom);
    }
});
