"use strict";

const video = document.getElementById("video-input");
//let original_Video = document.getElementById('Original-video-input');
//let cap_video = document.getElementById("canvas-output");
const cap_image = document.getElementById("cap-image");
const pros_image = document.getElementById("pros-image");
//const CanvasLab = document.getElementById("ImProcess");
const snap = document.getElementById("snap");
//const labCanvas = document.getElementById("LabcanvasOutput");
const imtofrode = document.getElementById("canvasOutput");
let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
let contour_scale = 20; // Minimum original image ratio
let THRESHOLD = 128; // Monochrome threshold
let origIm = document.getElementById('oIm');
let Frode_projection = document.getElementById('Frode-projection');
let OpenCV_projection = document.getElementById('OpenCV-projection');
// let Stronger_contrast=document.getElementById('contrast');
// let Negative=document.getElementById('negative');
// let docum=document.getElementById('doc');
let FocusMode = document.getElementById('tavle');
let text_detection = document.getElementById('OCR');
let userDeveloperMode = document.getElementById('flexSwitchCheckChecked')
let developerMode = document.getElementById('DeveloperMode')
let imtof, max_width, lineAngle, linewidth, lineheight, max_height, ratio, modifyTall_v, tesseractImg,
    modifyTall_h, Im_Ratio, min_width, min_height, webCamIm = false, succsessUploadSystem;
inputElement.addEventListener('change', async (e) => {
    origIm.src = URL.createObjectURL(e.target.files[0]);            // bildet som skal behandles
    imgElement.src = URL.createObjectURL(e.target.files[0]);        // bildet som skal vises til brukeren
});

origIm.onload = function ImProcess() {
    transform(origIm).then(r => console.log(r))
};

// Switch between USER / Developer Mode,  "Default UserMode"
async function userDevlopModee() {
    developerMode.hidden = !userDeveloperMode.checked;
}

// check if opencv loaded
async function openCvReady() {
    // https://emscripten.org/docs/api_reference/module.html#Module.onRuntimeInitializ
    cv['onRuntimeInitialized'] = () => {
        // document.getElementById('status').innerHTML = 'System is ready.';
        document.getElementById('iconLoad').hidden = "hidden"
        document.getElementById('status').hidden = true;
        succsessUploadSystem = document.getElementById('checkUpload')
        new bootstrap.Toast(succsessUploadSystem).show();
        // Hide notification div
        setTimeout(() => {  succsessUploadSystem.hidden = true; }, 1000);
    }
}
// display and hidde menu
function showHideMenu() {
    let x = document.getElementById("myLinks");
    if (x.style.display === "block") {
        x.style.display = "none";
    } else {
        x.style.display = "block";
    }
}

// Check which bottom selected and save its ID local storge
let radioBtns = document.getElementsByName('projection')

async function lagreRadioBtn(id) {
    //let myAlert = document.getElementById('errorMsg');
    //let bsAlert = new bootstrap.Toast(myAlert);
    //bsAlert.toast.show()
    localStorage.setItem('checkedBtn', id)
}
// Get ID from local storage
async function setCheckedBtn() {
    let userBtn = localStorage.getItem('checkedBtn')
    let velgtBtn = document.getElementById(userBtn);
    velgtBtn.checked = true;
}
// On Page loaded open Camera and get user preferences from local Storge
(async () => {
    // let devices = await navigator.mediaDevices.enumerateDevices();
    const constraints = {
        audio: false,
        video: {
            facingMode: "environment",
            //resizeMode: 'none',
            //width: {ideal: 1280},
            //height: {ideal: 720},
            //advanced: [{ width: 1920, height: 1280 },{zoom: 1}, { aspectRatio: 1.333 }],
            //advanced: [{ width: 1280, height: 720 },{zoom: 1}, { aspectRatio: 1.333 }],
            //focusMode: true,
            zoom: 1.5,
            //tilt: true,
            //frameRate: 40,
            //pan: true,
            //scale: true,
            //aspectRatio: 16 / 9,
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

    // check if browser support som camera properties
    const supports = navigator.mediaDevices.getSupportedConstraints();
    if (supports.pan && supports.tilt && supports.zoom) {
        console.log("Browser supports camera ")
    }
    await navigator.mediaDevices.getUserMedia({video:true,audio:false})
        .then(stream => {
            // Granted. Store deviceIds for next time
            //localStorage.camId = stream.getVideoTracks()[0].getSettings().deviceId;
            //await new Promise(resolve => setTimeout(resolve, 2000));
            //let videocopy = video.copy();
            //let [track] = stream.getVideoTracks();
            //let {width, height, aspectRatio} = track.getSettings();
            // console.log("Got stream with constraints:", constraints);
            // console.log(`Using video device: ${track.getSettings.deviceId}`);
            // Constraints are in landscape, while settings may be rotated (portrait)
            //if (width < height) {
              //  [width, height] = [height, width];
               // aspectRatio = 1 / aspectRatio;
            //}


            // let x = (video.width -video.offsetWidth)/2+"px";
            //let y = (video.height -video.offsetHeight)/2+"px";
            //let ratio = video.offsetWidth/video.width;
            //console.log(x,y,ratio)
            //video.style.width = width;
            //video.style.height = height;
            //video.style.transform = `translate(${x},${y}) scale(${ratio})`;
            // cap_image.style.transform = `scale(${ratio})`;
            // original_Video.srcObject = stream;
            video.srcObject = stream;
            //original_Video.play();
            video.onloadedmetadata = () => {
                video.play();
            };

            // create canvas element to draw image from camera inn
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');
            // Capture image from video and draw image in canvas.
            snap.addEventListener("click", function () {
                // check screen orientation
                switch (screen.orientation.type) {
                    case "landscape-primary":
                        canvas.width = 1280;
                        canvas.height = 720;
                        break;
                    case "portrait-primary":
                        canvas.width = 720;
                        canvas.height = 1280;
                        break;
                    default:
                        console.log("The orientation API isn't supported in this browser :(");
                        canvas.width = 1280;
                        canvas.height = 720;
                }
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                let dataUrl = canvas.toDataURL('image/jpeg');
                webCamIm = true; // variable will be used to check if image source from web camera
                origIm.src = dataUrl;   // when it loaded transfer() calls see origIm.onload that image will go inn process
                imgElement.src = dataUrl;      // to show image to user
                cap_image.width = 300;
                cap_image.height = 400;
                // show capture image under Web camera canvas
                cap_image.getContext('2d').drawImage(video, 0, 0, cap_image.width, cap_image.height);
                //transform(cap_image);
                /*
                let cap = new cv.VideoCapture(video);
                video.height = video.videoHeight;
                video.width = video.videoWidth;
                console.log(height, width);

                let src = new cv.Mat(height, width, cv.CV_8UC4);
                cap.read(src);
                cv.imshow('original_cap-image',src);

                 */
                // transform(cap_image);
            });
        })
        .catch((err) => {
            // always check for errors at the end.
            console.error(`${err.name}: ${err.message}`);
            if (error.name === "ConstraintNotSatisfiedError") {
                console.error(
                    `The resolution ${constraints.video.width.exact} x ${constraints.video.height.exact} px is not supported by your device.`
                );
            } else if (error.name === "PermissionDeniedError") {
                console.error(
                    "You need to grant this page permission to access your camera and microphone."
                );
            } else {
                console.error(`getUserMedia error: ${error.name}`, error);
            }
        });

// Here an extra code to for video processing to find out auto-detection of max-contour in the video
    // it has been commented because it effects performance of project and cost a lot of memory
    //video.width=720;
    //video.height=1280;

    // here is video processing and auto-detection of max contour in video

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
                        if (maxRectScale >= contour_scale) {   // Filter by ratio to original image
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
    //textRecognition ()
    await userDevlopModee()     // Switch between USER / Developer Mode,  "Default UserMode"
    await setCheckedBtn()       // Get Last time user preferences from local storge
})();


// Use Tesseract OCR to detect text in image and words coordinates
function textRecognition(im) {
    //Tesseract.loadLanguage('eng');
    //esseract.initialize('eng');
    Tesseract.recognize(im)
        .then((output) => {
            console.log(output.data.words);
            if (output.data.words.length > 0) {
                cropImage(output.data.words)
                result.append(output.data.text)
            }
        });
}

// Her we will transfer target element in image (Max-contour in image) to new image then will apply projection
async function transform(src) {
    // empty div if new image uploaded
    result.innerHTML = '';
    zoomButtonsDiv.innerHTML = '';
    let im = cv.imread(src);
    // Resize image dimensions if it's too big
    // when Tavle chooses av user subtraction
    // F.ground and B.ground use too much of memory therefor resize vi before
    if ((im.cols >= 1280 || im.rows >= 1280) && FocusMode.checked) {
        resizing(im, 1280);
    }
    if ((im.cols >= 1500 || im.rows >= 1500)) {
        let half_Size = im.cols >= im.rows ? im.cols * 0.6 : im.rows * 0.55;
        resizing(im, half_Size);
    }
    let pts;
    if (text_detection.checked) {
        //const outBase64 =  cv.imencode('.jpg', im).toString('base64');
        //const output = 'data:image/jpeg;base64,' + outBase64;
        //let imgData = new ImageData( new Uint8ClampedArray( im.data ), im.cols, im.rows );
        //let tempCanvas = document.getElementById("tempCanvas");
        //let tempCanvasCtx = tempCanvas.getContext('2d')
        //tempCanvasCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        //tempCanvas.width = imgData.width;
        //tempCanvas.height = imgData.height;
        //tempCanvasCtx.putImageData(imgData,0,0)
        //let blob = cv.blobFromImage(im)
        //cv.imshow('tempCanvas',im)
        //let b64image = tempCanvas.toDataURL('image/jpeg')
        //let output = 'data:image/jpeg;base64,' + blob;
        //console.log(b64image)
        //

        //let imgData = new ImageData( new Uint8ClampedArray( im.data ), im.cols, im.rows );
        //console.log(imgData)
        //let blob = new Blob([imgData],{type: 'image/png'})
        //const tensor = tf.tensor(imgData.data, [imgData.width, imgData.height, -1])
        //let output = 'data:image/jpeg;base64,' + imgData;
        //let tempImg = document.createElement('img')
        //tempImg.setAttribute('type','Image/.png')
        //tempImg.src = imgData;
        //tempCanvasCtx.putImageData(imgData,0,0)
        tesseractImg = document.createElement('canvas')
        cv.imshow(tesseractImg, im)
        let b64im = tesseractImg.toDataURL('image/jpeg')
        textRecognition(b64im)
    } else {
        pts = findContoursVertices(im);                // for å få vertices (conners) points
    }
    if (pts) {

        const transformedIm = transformImage(im, pts);     // transformere funnet contour til ny bildet (canvas)
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
        // Crop Image and resizing
        let cropIm;
        if (transformedIm.cols > 1280 || transformedIm.rows > 1280) {
            //resizing(transformedIm,920);
            let rect = new cv.Rect(30, 30, transformedIm.cols - 45, transformedIm.rows - 45);
            cropIm = transformedIm.roi(rect);
        } else {
            let rect = new cv.Rect(20, 15, transformedIm.cols - 25, transformedIm.rows - 25);
            cropIm = transformedIm.roi(rect);
        }
        cv.imshow('canvasOutput', cropIm);
        // let point1 = new cv.Point(3,3);
        // let point2 = new cv.Point(transformedIm.cols-5,transformedIm.rows-5);
        // let contoursColor = new cv.Scalar(255, 0, 0);

        // cv.rectangle(transformedIm, point1, point2, contoursColor, 20, cv.LINE_AA, 0);

        //cv.imshow('LabcanvasOutput',transformedIm);
        //let rotateIm = new cv.Mat();

        // Blur
        let blur_im = new cv.Mat();
        cv.medianBlur(cropIm, blur_im, 3);
        let medinaAngle = findlinesAngel(blur_im)  // to find out line angle
        //medinaAngle +=90;

        if (medinaAngle) {
            //medinaAngle +=90;
            //imtofrode.style.transform= 'rotate('+lineAngle+'deg)'
            //cv.imshow('LabcanvasOutput', cropIm);


            // Rotate Image
            imRotation(cropIm, medinaAngle);

        }
        cv.imshow('LabcanvasOutput', cropIm);
        cv.imshow('canvasOutput', cropIm);

        //cv.imshow('canvasOutput', blur_im);
        if (Frode_projection.checked) {
           await processPageCallback(imtofrode);             // Call Frode Projection
        }
        if (OpenCV_projection.checked) {
            extractAllWords(cropIm, blur_im)             // Call Opencv projection
        }
        webCamIm = false;
        transformedIm.delete();
        cropIm.delete();
        blur_im.delete();      // Free Memory

    } else {
        result.toast.show('Har ikke funnet contours!')
        console.log('Har ikke funnet contours');

    }

    //im.delete();

}

// --------------- Rotation ------------------
function imRotation(im, angle) {
    // Calc. new image dimension
    //let w = Math.abs(im.cols * Math.cos(angle)) + Math.abs(im.rows * Math.sin(angle));
    //let h = Math.abs(im.rows * Math.cos(angle)) + Math.abs(im.cols * Math.sin(angle));
    let dsize = new cv.Size(im.cols, im.rows);
    let center = new cv.Point(im.cols / 2, im.rows / 2);
    let M = cv.getRotationMatrix2D(center, angle, 1);
    let s = new cv.Scalar(255, 255, 255, 255);
    cv.warpAffine(im, im, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, s);
    M.delete();
}

// -------------- Resizing Image -------------
function resizing(im, max_size) {
    let width = im.cols, height = im.rows;
    if (width > height) {
        if (width > max_size) {
            height *= (max_size / width);           // Ratio
            width = max_size;
        }
    } else {
        if (height > max_size) {
            width *= (max_size / height);
            height = max_size;
        }
    }

    let dsize = new cv.Size(width, height);
    cv.resize(im, im, dsize, 0, 0, cv.INTER_AREA);          // opencv Resizing
}

// -------------- Get vertices of founded rectangle (contour) ------------
function findContoursVertices(im) {
    // Subtraction foreground og background in Selected zone (Center)
    if (FocusMode.checked) {
        let rect = new cv.Rect(100, 100, im.cols * 0.85, im.rows * 0.8);   // Dimension of Selected Zone
        //rect = new cv.Rect(50,50, im.cols*0.95, im.rows*0.8);

        cv.cvtColor(im, im, cv.COLOR_RGBA2RGB, 0);      // Gray Scale
        let mask = new cv.Mat();
        let bgdModel = new cv.Mat();
        let fgdModel = new cv.Mat();
        //Function GrapCut in Opencv to subtract Find out foreground and background
        cv.grabCut(im, mask, rect, bgdModel, fgdModel, 1, cv.GC_INIT_WITH_RECT);
        // draw foreground
        for (let i = 0; i < im.rows; i++) {
            for (let j = 0; j < im.cols; j++) {
                if (mask.ucharPtr(i, j)[0] === 0 || mask.ucharPtr(i, j)[0] === 2) {
                    im.ucharPtr(i, j)[0] = 0;
                    im.ucharPtr(i, j)[1] = 0;
                    im.ucharPtr(i, j)[2] = 0;
                }
            }
        }
        // draw grab rect
        /*
        let color = new cv.Scalar(255, 255, 255);
        let point1 = new cv.Point(rect.x, rect.y);
        let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
        cv.rectangle(im, point1, point2, color);

         */
        cv.imshow('pros-image', im);
        mask.delete();
        bgdModel.delete();
        fgdModel.delete();
    }

    let maxCnt = findMaxCnt(im);                 // find Max-contour in image (Target Contour)

    let pts = new cv.Mat();
    let approx = new cv.Mat();
    let vertices = new cv.Mat();

    const epsilon = 0.02 * cv.arcLength(maxCnt, true) // maximum distance from contour to approximated contour
    cv.approxPolyDP(maxCnt, approx, epsilon, true);   //  Douglas-Peucker algorithm function to approximate the shape

    if (approx.size().height === 4) {// Keep if it is a rectangle
        // antallKanter = approx.size().height;
        modifyTall_v = 0;
        modifyTall_h = 0;
        pts = approx // Coordinates of the rectangle to be cut out (4 points)

        //console.log(pts);
        //approx.convertTo(approx,cv.CV_32FC2);
        //console.log(approx.data32F);
        pts.convertTo(pts, cv.CV_32FC2);        // Convert Type
        //  sort by y  coordinates to know which corner has been scanned first

        console.log(pts.data32F)
        //let sortPts= pts.sort((a,b)=>b-a);
        //console.log(sortPts.data32F);
        // Set 'Pts' in new array 'sortPots' with X,Y coordinates to be easy for sorting By 'Y'
        let sortPots = [];
        for (let i = 0; i < 8; i += 2) {
            sortPots.push({x: Math.round(pts.data32F[i]), y: Math.round(pts.data32F[i + 1])})
        }
        //  sort by y  coordinates to know which corner has been scanned first
        sortPots.sort(function (a, b) {
            return a.y - b.y;
        });

        console.log(sortPots)
        // Reset Sorted array in new object in form matrix 4 X 1
        let recPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
            sortPots[0].x, sortPots[0].y, sortPots[1].x, sortPots[1].y,
            sortPots[2].x, sortPots[2].y, sortPots[3].x, sortPots[3].y
        ]);
        console.log(recPts.data32F)
        checkshape(sortPots)           // To check Weather the Max-Contour is horizontal or vertical (Ratio >= 1 or < 1)

        // cv.imshow('canvasOutput', threshold_im);
        // Modify corner coordinates
        console.log(pts.data32F)
        //frompoint=  modifyCorners(recPts);
        // console.log(frompoint.data32F)
        //ratio =1;  // default
        return modifyCorners(recPts);         // Sort Contour Vertices To Find Which vertices L.Top, R.Top,L.Bottom,R.B
    }


    // console.log(maxCntArea)

    // if Number of Vertices more than 4 then we Bounded Minimum rectangle and take vertices of rectangle.
    if (approx.size().height !== 4) {
        let minRecrt = cv.minAreaRect(maxCnt)       // OpenCV Function Minimum Bounding Rectangle
        vertices = cv.RotatedRect.points(minRecrt);
        modifyTall_v = 25;                           // Numbers To Modify selected Vertices to approximation of contour
        modifyTall_h = 25;
        // let features = new cv.Mat();
        //cv.goodFeaturesToTrack(cany_im,features,4,0.05,400)
        //features.convertTo(features,cv.CV_32FC2);
        //console.log(features.data32F);
        //let dst = new cv.Mat();
        let rectangleColor = new cv.Scalar(255, 0, 0);
        // Draw Minimum Bounding Rectangle
        for (let i = 0; i < 4; i++) {
            cv.line(im, vertices[i], vertices[(i + 1) % 4], rectangleColor, 2, cv.LINE_AA, 0);
        }
        cv.imshow('pros-image', im);
        console.log(vertices)
        // Rounding of number
        for (let i = 0; i < 4; i++) {
            vertices[(i + 1) % 4];
            vertices[i].x = Math.round(vertices[i].x);
            vertices[i].y = Math.round(vertices[i].y);

        }

        //  sort by y  coordinates to know which corner has been scanned first
        vertices.sort(function (a, b) {

            return a.y - b.y;
        });

        console.log(vertices)

        // Rest in ny object av type data32F2 which is Matrix 4 X 1
        let recPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
            vertices[0].x, vertices[0].y, vertices[1].x, vertices[1].y, vertices[2].x, vertices[2].y, vertices[3].x, vertices[3].y
        ]);


        console.log(recPts.data32F)
        checkshape(vertices);
        console.log(ratio)
        //ratio =1;  // default

        //frompoint=  modifyCorners(recPts);
        //console.log(frompoint)

        return modifyCorners(recPts);
    }
}

// --------------- Find Max-Contour in Image -------------
function findMaxCnt(im) {
    // Image area
    const imRectArea = im.cols * im.rows //


    // Grayscale
    let im_gray = new cv.Mat();
    cv.cvtColor(im, im_gray, cv.COLOR_RGBA2GRAY, 0);

    // Blur
    let medianBlur_im = new cv.Mat();
    cv.medianBlur(im_gray, medianBlur_im, 13);

    // Canny Edge Detection
    let cany_im = new cv.Mat();
    cv.Canny(medianBlur_im, cany_im, 60, 120, 3, false);

    // Threshold
    let threshold_im = new cv.Mat();
    //cv.adaptiveThreshold(im_gray, threshold_im, 255, cv.THRESH_BINARY, 81, 3);
    cv.threshold(im_gray, threshold_im, THRESHOLD, 255, cv.THRESH_BINARY);
    //cv.threshold(threshold_im, threshold_im,THRESHOLD, 255, cv.THRESH_BINARY);
    cv.imshow('pros-image', threshold_im);
    let M = cv.Mat.ones(3, 3, cv.CV_8U);
    // cv.morphologyEx(threshold_im, threshold_im, cv.MORPH_GRADIENT, M);   // Morph. Diff. between Opening and Closing
    let anchor = new cv.Point(-1, -1);
    // Morphological operator (Dilation of Edge Contour if case it not Connected Clearly)
    cv.dilate(cany_im, cany_im, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    cv.imshow('pros-image', cany_im);
    //let k = cv.Mat.ones(3, 3, cv.CV_8U);
    //cv.erode(threshold_im, threshold_im, k, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    // let dsize = new cv.Size(400, 800);
    //cv.resize(threshold_im,threshold_im, dsize, 0, 0, cv.INTER_AREA);

    //cv.imshow('pros-image', threshold_im);

    // Contours
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();      // To Save Relation between Contours (Children/Parents) To Know More Click link
    // https://docs.opencv.org/3.4/da/d0a/tutorial_js_contours_hierarchy.html
    cv.findContours(cany_im, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE); // Take only parents Contours

    let maxCntArea = 0;
    let maxCnt = new cv.MatVector();
    for (let i = 0; i < contours.size(); ++i) {

        let cnt = contours.get(i);
        let cntArea = cv.contourArea(cnt)

        let maxRectScale = parseInt(cntArea / imRectArea * 100) // How big is it compared to the original image (%)
        console.log(maxRectScale)
        if (maxRectScale >= contour_scale) {       // Choose only Contours which is make '20%' and over of Image Size

            if (cntArea > maxCntArea) {
                maxCnt = cnt;
                maxCntArea = cntArea;
            }

        }

    }
    // in Case Couldn't find out max-Contour we us 'cv.RETR_CCOMP' To Take (children and parents)
    if (!maxCnt.size()) {
        cv.findContours(threshold_im, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
        for (let i = 0; i < contours.size(); ++i) {

            let cnt = contours.get(i);
            const cntArea = cv.contourArea(cnt)

            const maxRectScale = parseInt(cntArea / imRectArea * 100) // How big is it compared to the original image (%)
            console.log(maxRectScale)
            if (maxRectScale >= contour_scale) {// Filter by ratio to original image

                if (cntArea > maxCntArea) {
                    maxCnt = cnt;
                    maxCntArea = cntArea;
                }

            }

        }
        let errorNotFoundContour = document.getElementById('errorMsg')
        new bootstrap.Toast(errorNotFoundContour).show()    // Notification To inform User that method couldn't find Max contour
    }
    contours.delete();
    im_gray.delete();
    cany_im.delete();
    medianBlur_im.delete();
    // threshold_im.delete();
    hierarchy.delete();
    return maxCnt;

}

function transformImage(im, fromPts) {

    let transformedIm = new cv.Mat();
    const rows = im.rows;
    const cols = im.cols;
    let toPts, M;
    let dsize = new cv.Size(cols, rows);
    // 0, 0, 0, rows, cols, 0, cols, rows   (v)
    // cols, 0,cols, rows, 0, 0,0, rows     (h)
    // 0, 0, 0, min_height, min_width, 0, min_width, min_height
    //0, 0,cols, 0,0, rows,cols, rows
    //cols, 0, 0, 0,cols, rows,0, rows
    // cols, 0,0,0, cols, rows, 0, cols
    //   0, 0, frompoint.data32F[2],frompoint.data32F[3], frompoint.data32F[4],frompoint.data32F[5], frompoint.data32F[6], frompoint.data32F[7]
    console.log(fromPts.data32F)

    if (ratio < 1) {
        if (cols > rows) {
            toPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
                0, 0, cols, 0, 0, rows, cols, rows
            ]);
            M = cv.getPerspectiveTransform(fromPts, toPts); // Matrix of transformations
            cv.warpPerspective(im, transformedIm, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar(255, 255, 255, 255));
            cv.rotate(transformedIm, transformedIm, cv.ROTATE_90_CLOCKWISE)
            //imRotation(transformedIm,-90)
            cv.imshow('pros-image', transformedIm);
            // check line orientation
            checkLineOrientation(transformedIm);
            if (ratio >= 1) {
                modifyCorners(fromPts)
            }
        } else {

            toPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
                0, rows, 0, 0, cols, rows, cols, 0
            ]);
            M = cv.getPerspectiveTransform(fromPts, toPts); // Matrix of transformations
            cv.warpPerspective(im, transformedIm, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar(255, 255, 255, 255));
            cv.imshow('pros-image', transformedIm);
            cv.rotate(transformedIm, transformedIm, cv.ROTATE_90_CLOCKWISE)
            //imRotation(transformedIm,-90)
            cv.imshow('pros-image', transformedIm);
            // check line orientation
            checkLineOrientation(transformedIm);
            if (ratio >= 1) {
                modifyCorners(fromPts)
            }
        }


    }
    if (ratio >= 1) {
        toPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0, 0, 0, rows, cols, 0, cols, rows
        ]);


        console.log(toPts.data32F)
        M = cv.getPerspectiveTransform(fromPts, toPts); // Matrix of transformations
        cv.warpPerspective(im, transformedIm, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar(255, 255, 255, 255));
    }

    // Grayscale
    cv.cvtColor(transformedIm, transformedIm, cv.COLOR_RGBA2GRAY, 0);
    if (webCamIm) {
        cv.adaptiveThreshold(transformedIm, transformedIm, 250, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 13, 7);
    } else {
        cv.adaptiveThreshold(transformedIm, transformedIm, 250, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 25, 7);
    }
    cv.imshow('pros-image', transformedIm);

    // Threshold
    cv.threshold(transformedIm, transformedIm, THRESHOLD, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
    // Blur
    let ksize = new cv.Size(3, 3);
    //cv.medianBlur(transformedIm, transformedIm, 3);
    if (webCamIm) {
        cv.GaussianBlur(transformedIm, transformedIm, ksize, 0, 0, cv.BORDER_DEFAULT);
    }
    //cv.cvtColor(transformedIm,transformedIm, cv.COLOR_RGBA2RGB, 0);
    //cv.bilateralFilter(transformedIm, transformedIm, 9, 75, 50, cv.BORDER_DEFAULT);

    cv.imshow('pros-image', transformedIm);
    fromPts.delete();
    toPts.delete();
    M.delete();
    im.delete();
    // dst.delete(); p.delete(); m.delete(); result.delete();

    return transformedIm;

}

// Renge avstand mellom to punkter

function getDistance(x1, y1, x2, y2) {
    let x = x2 - x1;
    let y = y2 - y1;

    return Math.sqrt(x * x + y * y);
}


// check if the Max-contour which founded in image is vertical or horizontal

function checkshape(pts) {

    let wt, wb, hl, hr;

    // Alle points sorted by Y coordinates when we scanned contours.
    wt = getDistance(pts[0].x, pts[0].y, pts[1].x, pts[1].y)


    if (pts[0].x < pts[1].x) {                   // check position to x for first and second point
        if (pts[2].x > pts[3].x) {             // check position to x for third and point forth point
            hl = getDistance(pts[0].x, pts[0].y, pts[3].x, pts[3].y);
            hr = getDistance(pts[1].x, pts[1].y, pts[2].x, pts[2].y);
        } else {
            hl = getDistance(pts[0].x, pts[0].y, pts[2].x, pts[2].y);
            hr = getDistance(pts[1].x, pts[1].y, pts[3].x, pts[3].y);
        }
    } else {
        if (pts[2].x < pts[3].x) {
            hr = getDistance(pts[0].x, pts[0].y, pts[3].x, pts[3].y);
            hl = getDistance(pts[1].x, pts[1].y, pts[2].x, pts[2].y);
        } else {
            hr = getDistance(pts[0].x, pts[0].y, pts[2].x, pts[2].y);
            hl = getDistance(pts[1].x, pts[1].y, pts[3].x, pts[3].y);
        }

    }
    wb = getDistance(pts[2].x, pts[2].y, pts[3].x, pts[3].y)
    console.log(wt, wb, hl, hr)
    max_width = Math.max(wt, wb);
    max_height = Math.max(hl, hr);

    min_width = Math.min(wt, wb);        // Find Max Width
    min_height = Math.min(hl, hr);       // Find Max Height
    ratio = max_height / max_width;       // if 'Ratio' >= 1 Max-Contour is Vertical else it Horizontal if Not
    // Im_Ratio = max_height/im.cols;
    //console.log(ratio,Im_Ratio)
}

// -------------------- Check Line Orientation --------------------

// Find Text direction in contour to double-check whether the text in the same direction of contour direction
function checkLineOrientation(im) {
    //Gray Scale
    let new_im = new cv.Mat();
    cv.cvtColor(im, new_im, cv.COLOR_RGBA2GRAY, 0);
    cv.imshow('pros-image', new_im);
    //Blur
    // cv.medianBlur(new_im, new_im, 5);
    cv.imshow('pros-image', new_im);
    // canny edge detector
    cv.Canny(new_im, new_im, 30, 100, 3, false);

    //threshold
    //cv.threshold(new_im,new_im, THRESHOLD, 255, cv.THRESH_BINARY);
    cv.imshow('pros-image', new_im);
    let M;
    let ksize = new cv.Size(25, 20);
    M = cv.getStructuringElement(cv.MORPH_CROSS, ksize);
    cv.morphologyEx(new_im, new_im, cv.MORPH_GRADIENT, M);
    cv.imshow('pros-image', new_im);
    // Contours
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    //cv.findContours(new_im, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    cv.findContours(new_im, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    let MaxCntArea = im.cols * im.rows;
    let min_area = im.cols * im.rows * 0.001;
    let sannsynlighet_feil_ratio = 0, sannsynlighet_riktig_ratio = 0;
    for (let i = contours.size() / 2; i < contours.size() * 0.8; ++i) {
        let cnt = contours.get(i);
        const cntArea = cv.contourArea(cnt)

        if (min_area < cntArea && cntArea < MaxCntArea) {
            let rect = cv.boundingRect(cnt);
            let contoursColor = new cv.Scalar(255, 255, 255);
            let rectangleColor = new cv.Scalar(255, 0, 0);
            cv.drawContours(new_im, contours, 0, contoursColor, 1, 8, hierarchy, 100);
            let point1 = new cv.Point(rect.x, rect.y);
            let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
            cv.rectangle(new_im, point1, point2, rectangleColor, 2, cv.LINE_AA, 0);
            cv.imshow('pros-image', new_im);
            linewidth = rect.width;
            lineheight = rect.height;
            console.log(linewidth, lineheight)
            ratio = lineheight / linewidth;
            if (ratio >= 1) {
                sannsynlighet_feil_ratio++;
            } else {
                sannsynlighet_riktig_ratio++;
            }

        }

    }
    // Check if selected Ratio is right or fail
    sannsynlighet_riktig_ratio > sannsynlighet_feil_ratio ? ratio = -1 : ratio = 1;
    contours.delete();
    new_im.delete();

}

// --------------- Find Median Angle of Lines in Text -------------
function findlinesAngel(im) {
    let dst = new cv.Mat();
    let M;
    let ksize = new cv.Size(25, 1);
    M = cv.getStructuringElement(cv.MORPH_CROSS, ksize);
    cv.morphologyEx(im, dst, cv.MORPH_GRADIENT, M);
    //cv.imshow('pros-image', dst);
    // Contours
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    let minCntArea = 3000; // for å fjernet små brikker
    let imArea = (im.rows * im.cols) * 0.1;
    let sortertAngle = [];
    // let linesCntAngles;
    let rectArr = [];
    let medianAngle;
    let rectangleColor = new cv.Scalar(255, 0, 0);
    let contoursColor = new cv.Scalar(0, 255, 0);
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
            vertices.sort((a, b) => a.y - b.y);
            // let dx = vertices[3].x - vertices[2].x;
            //let dy = vertices[3].y - vertices[2].y;
            //let rektangleAngle = Math.atan2(dy,dx);
            //linesCntAngles.push(rektangleAngle)
            if (rotatedRect.size.width > rotatedRect.size.height) {
                // if line direction slightly skewed Up or straight For More info. see link
                // https://theailearner.com/tag/angle-of-rotation-by-cv2-minarearect/
                // https://namkeenman.wordpress.com/2015/12/18/open-cv-determine-angle-of-rotatedrect-minarearect/
                sortertAngle.push(rotatedRect.angle)
            } else {
                let angle = 180 - (-rotatedRect.angle + 90)          // if line direction slightly skewed down
                sortertAngle.push(angle)
            }


        }

    }
    sortertAngle.sort((a, b) => a - b)
    medianAngle = sortertAngle.at(sortertAngle.length / 2);
    dst.delete();
    contours.delete(); // linesCntAngles=[]; sortertAngle=[]; rectArr=[]; vertices=[];
    return medianAngle;

    //linesCntAngles.sort((a,b) => a-b);
    //medianAngle = linesCntAngles.at(linesCntAngles.length/2);
    //contours.delete(); dst.delete();
    //return medianAngle >0 ? medianAngle : medianAngle;
    //return medianAngle;
}


// --------------- Extract words based on morphology operator ----------
function extractAllWords(im, blured_im) {
    // pre Test to find out median width and height of characters in context

    //cv.imshow('pros-image',cany_im);
    // Threshold
    // let threshold_im = new cv.Mat();
    //cv.adaptiveThreshold(im_gray, threshold_im, 255, cv.THRESH_BINARY, 81, 3);
    //cv.threshold(cany_im, threshold_im, THRESHOLD, 255, cv.THRESH_BINARY);


    // Contours
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(blured_im, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    let minCntArea = 20; // for å fjernet små brikker
    let imArea = (im.rows * im.cols) * 0.08;
    let charHorizentalDistanse = [];
    let charVerticalDistanse = [];
    //let charactersDimention =[]
    //let sortertAngle=[];
    //let linesCntAngles=[];
    let rectArr = [];
    //let medianAngle;
    //let rectangleColor = new cv.Scalar(0, 255, 0);
    //let contoursColor = new cv.Scalar(0, 255,0);
    //let rotatedRect;
    //let vertices;
    for (let i = 0; i < contours.size() * 0.25; ++i) {
        let r = Math.floor(Math.random() * contours.size());  // Randomize choose sample of width in different places
        let cnt = contours.get(r);
        const cntArea = cv.contourArea(cnt)

        if (cntArea > minCntArea && cntArea < imArea) {
            // MaxCnt=cnt;
            //minCntArea=cntArea;
            let rect = cv.boundingRect(cnt)
            /*
             let point1 = new cv.Point(rect.x, rect.y);
            let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
            cv.rectangle(im, point1, point2, rectangleColor, 1, cv.LINE_AA, 0);
            */
            if (!charHorizentalDistanse.includes(rect.width)) {
                charHorizentalDistanse.push(rect.width);
            }
            if (!charVerticalDistanse.includes(rect.height)) {
                charVerticalDistanse.push(rect.height);
            }


            /*
                        rotatedRect = cv.minAreaRect(cnt);
                        //rectArr.push(rotatedRect);
                        vertices = cv.RotatedRect.points(rotatedRect);
                        //cv.drawContours(im, contours, 0, contoursColor, 1, 8, hierarchy, 100);
                        // draw rotatedRect
                        for (let i = 0; i < 4; i++) {
                            cv.line(im, vertices[i], vertices[(i + 1) % 4], rectangleColor, 2, cv.LINE_AA, 0);
                        }
                        cv.imshow('pros-image', im);

                       // linesCntAngles.push(rotatedRect.angle)
                       // sortertAngle.push(rotatedRect.angle)
                       // console.log(rotatedRect.angle)
            */
        }

    }


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
    contours.delete();
    // NB: here we could select most high frequency of chars,but it will take long time and effect the performance.
    // Sort char based on width and height then select median of width and height
    charHorizentalDistanse.sort((a, b) => a - b);
    let horizentalCharSnitt = charHorizentalDistanse.at(charHorizentalDistanse.length / 2);
    charVerticalDistanse.sort((a, b) => a - b);
    let verticalCharSnitt = charVerticalDistanse.at(charVerticalDistanse.length / 2);

    let dst = new cv.Mat();

    //cv.threshold(im,im,THRESHOLD, 255, cv.THRESH_BINARY_INV | cv.THRESH_OTSU);
    //let dst = new cv.Mat();

    // Apply Morph. to select lines in Context.
    let M;
    let ksize = new cv.Size(horizentalCharSnitt * 2, verticalCharSnitt * 0.2);
    M = cv.getStructuringElement(cv.MORPH_RECT, ksize);
    cv.morphologyEx(blured_im, dst, cv.MORPH_GRADIENT, M);

    cv.imshow('pros-image', dst);

    //let MM = cv.Mat.ones(horizentalCharSnitt*0.36, verticalCharSnitt*0.3, cv.CV_8U);
    //let hsize = new cv.Size(1.3, 1);
    //MM = cv.getStructuringElement(cv.MORPH_CROSS, hsize);
    //let anchor = new cv.Point(-1, -1);
    //let MM = cv.Mat.ones(5, 5, cv.CV_8U);

    //cv.dilate(dst, dst, MM, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue())

    cv.imshow('pros-image', dst);


    let conts = new cv.MatVector();
    let h = new cv.Mat();
    let min_Areal = horizentalCharSnitt * verticalCharSnitt;
    let max_Area = im.rows * im.cols * 0.2;
    cv.findContours(dst, conts, h, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < conts.size(); ++i) {
        let cnt = conts.get(i);
        const cntArea = cv.contourArea(cnt)

        if (cntArea > min_Areal && cntArea < max_Area) {
            // MaxCnt=cnt;
            //minCntArea=cntArea;
            let rect = cv.boundingRect(cnt);     // bounding lines with rectangles.
            /*
              let point1 = new cv.Point(rect.x, rect.y);
              let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
              cv.rectangle(im, point1, point2, rectangleColor, 1, cv.LINE_AA, 0);
            */
            rectArr.push(rect);         // push lines (rect) to array


            /*
                        rotatedRect = cv.minAreaRect(cnt);
                        rectArr.push(rotatedRect);
                        vertices = cv.RotatedRect.points(rotatedRect);
                        //cv.drawContours(im, contours, 0, contoursColor, 1, 8, hierarchy, 100);
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

    //let max_height = rectArr.sort((a,b) => b.height - a.height).at(0).height;
    // Sort Line (rect) based on height 'Y'
    rectArr.sort((a, b) => a.y - b.y);

    for (let i = 0; i < rectArr.length; i++) {

        let x = rectArr[i].x;
        let y = rectArr[i].y;
        let h = rectArr[i].height;
        let w = rectArr[i].width;
        let rect = new cv.Rect(x, y, w, h);
        let croped_rectIm = im.roi(rect);           // Crop Lines from Main Image
        cv.imshow('pros-image', croped_rectIm);

        // find out median char dimension in line
        /*
        let medianCharSize = line_Medin_char_line(croped_rectIm);
        if (medianCharSize.charMedianWidth && medianCharSize.charMedianHeight) {}
            let medianCharWidth = medianCharSize.charMedianWidth;
            let medianCharHeight = medianCharSize.charMedianHeight;

         */
        let dst = new cv.Mat();
        let M = new cv.Mat();
        // Apply morphological on words in line based on median width and height to char we founded in text
        let ksize = new cv.Size(horizentalCharSnitt * 0.32, verticalCharSnitt * 0.2);
        M = cv.getStructuringElement(cv.MORPH_CROSS, ksize);
        cv.morphologyEx(croped_rectIm, dst, cv.MORPH_GRADIENT, M);
        cv.imshow('pros-image', dst);
        cv.imshow('pros-image', croped_rectIm);
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        let min_Areal = horizentalCharSnitt * verticalCharSnitt * 0.3;
        let max_Areal = w * h;
        let rectArrOrd = [];

        // Find Contours for alle words in lines and bounded with rectangles then
        // sort Words (rectangles) Based on 'X' in every line then Crop words (rectangles)
        cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
        for (let i = 0; i < contours.size(); ++i) {
            let cnt = contours.get(i);
            const cntArea = cv.contourArea(cnt)

            if (cntArea > min_Areal && cntArea <= max_Areal) {
                // MaxCnt=cnt;
                //minCntArea=cntArea;
                let rect = cv.boundingRect(cnt);
                //let point1 = new cv.Point(rect.x, rect.y);
                //let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
                //cv.rectangle(croped_rectIm, point1, point2, rectangleColor, 1, cv.LINE_AA, 0);
                rectArrOrd.push(rect);
                // cv.imshow('pros-image', croped_rectIm);
            }


        }
        // sort row by x;
        rectArrOrd.sort((a, b) => a.x - b.x);       // Sort Rectangles (Words) in line
        cropImage(rectArrOrd);                               // Crop Words (Rectangle)
        rectArrOrd = [];                                     // Free Memory

    }
    addZoomButtons();
    /*

        let linje = 1
        let sort_by_lines = []
        for (let i=0;  i < rectArr.length-1; i++){
            if( (rectArr.at(i+1).y - rectArr.at(i).y) > (rectArr.at(i).height + rectArr.at(i+1).height)/2){
                //first_y = rectArr.at(i).y;
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

         contours.delete(); hierarchy.delete(); charHorizentalDistanse=[]; charVerticalDistanse =[];
        charactersDimention=[];  rectArr=[]; medianAngle.delete(); rectangleColor.delete();
        contoursColor.delete(); rotatedRect.delete(); vertices.delete();
        conts.delete(); h.delete(); M.delete(); MM.delete(); dst.delete();

        // Crop Image
        cropImage(sort_by_lines)

        for (let i=0; i< sort_by_lines.length; i++) {
            let cropIm = new cv.Mat();
            let rect = new cv.Rect(sort_by_lines.at(i).x,sort_by_lines.at(i).y,sort_by_lines.at(i).w,sort_by_lines.at(i).h);
            cropIm = transformedIm.roi(rect);
        }

         */

}

// -------------------- Crop Words in Lines --------------------
function cropImage(wordCoordinates) {
    const ctx = pros_image.getContext("2d");
    let capCtx;
    if (text_detection.checked) {
        capCtx = tesseractImg.getContext("2d");
    }
    for (let word of wordCoordinates) {
        let x, y, h, w, wordImage
        if (text_detection.checked) {
            x = word.bbox.x0;
            y = word.bbox.y0;
            w = word.bbox.x1 - x;
            h = word.bbox.y1 - y;
            // get the image of the current word
            wordImage = capCtx.getImageData(x, y, w, h);
        } else {
            x = word.x;
            y = word.y;
            w = word.width;
            h = word.height;
            // get the image of the current word
            wordImage = ctx.getImageData(x, y, w, h);
        }

        // create temporary canvas for word
        const newWordCanvas = document.createElement("canvas");

        newWordCanvas.setAttribute("name", "clipWord")
        newWordCanvas.width = w;   // set the canvas equal to the word dimensions.
        newWordCanvas.height = h;

        // draw the word on the new canvas
        const wordCtx = newWordCanvas.getContext("2d");
        wordCtx.putImageData(wordImage, 0, 0);
        // add the word to the assigned part of the page
        result.appendChild(newWordCanvas)


    }
    if (!OpenCV_projection.checked) {
        addZoomButtons();
    }
}

// ---------------- Add Zoom Buttons -------------------
function addZoomButtons() {
    const zoomInn = document.createElement("a");
    zoomInn.setAttribute("class", "bi bi-zoom-in")
    zoomInn.setAttribute("id", "zoom-inn-icon")
    zoomInn.setAttribute("type", "button")
    zoomButtonsDiv.appendChild(zoomInn)
    const zoomOut = document.createElement("a");
    zoomOut.setAttribute("class", "bi bi-zoom-out")
    zoomOut.setAttribute("id", "zoom-out-icon")
    zoomOut.setAttribute("type", "button")
    zoomButtonsDiv.appendChild(zoomOut)
    const zoomReset = document.createElement("a");
    zoomReset.setAttribute("class", "bi bi-arrows-move")
    zoomReset.setAttribute("id", "zoom-reset-icon")
    zoomReset.setAttribute("type", "button")
    zoomButtonsDiv.appendChild(zoomReset)
}


// ------------------ Extra Function to find Median characters Width and height --------------

// pre Test to find out median width for characters in line
/*
function line_Medin_char_line(im){
    // Contours
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    cv.findContours(im, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    let minCntArea= 60; // for å fjernet små brikker
    let imArea = im.rows * im.cols;
    let charHorizentalDistanse = [];
    let charVerticalDistanse = [];
    let rectangleColor = new cv.Scalar(0, 255, 0);
    let contoursColor = new cv.Scalar(0, 255,0);
    for (let i = 0; i < contours.size(); ++i) {
        //let r = Math.floor(Math.random() * contours.size());  // Randomize choose sample of width in different places
        let cnt = contours.get(i);
        const cntArea = cv.contourArea(cnt)

        if (cntArea > minCntArea && cntArea < imArea) {
            // MaxCnt=cnt;
            //minCntArea=cntArea;
            let rect= cv.boundingRect(cnt);

             let point1 = new cv.Point(rect.x, rect.y);
            let point2 = new cv.Point(rect.x + rect.width, rect.y + rect.height);
            //cv.rectangle(im, point1, point2, rectangleColor, 1, cv.LINE_AA, 0);

            if(!charHorizentalDistanse.includes(rect.width)) {
                charHorizentalDistanse.push(rect.width);
            }
            if(!charVerticalDistanse.includes(rect.height)) {
                charVerticalDistanse.push(rect.height);
            }



            let rotatedRect = cv.minAreaRect(cnt);
           let vertices = cv.RotatedRect.points(rotatedRect);
            cv.drawContours(im, contours, 0, contoursColor, 1, 8, hierarchy, 100);
            // draw rotatedRect
            for (let i = 0; i < 4; i++) {
                cv.line(im, vertices[i], vertices[(i + 1) % 4], rectangleColor, 2, cv.LINE_AA, 0);
            }

        }

    }
    cv.imshow('pros-image', im);

    // sortertAngle.sort((a,b) => a-b)
    // medianAngle = sortertAngle.at(sortertAngle.length/2);
    // let index = linesCntAngles.indexOf(medianAngle);
    // medianRect = rectArr.at(index)
    // distance between two characters

    //rectArr.sort((a,b) => a.x - b.x)
    for (let i = 1; i < rectArr.length; ++i) {
       let avstand = (rectArr[i - 1].x+rectArr[i - 1].width) - rectArr[i].x
       // horizentalDistanse.push(avstand);
    }


    // NB: her kunne jeg finne tallet til det mest repeterende av bokstaverbreden, men det er tung prossess for optiamlisering.
    charHorizentalDistanse.sort((a,b) => a-b);
    let horizentalCharSnitt = charHorizentalDistanse.at(charHorizentalDistanse.length-1)/2;
    charVerticalDistanse.sort((a,b) => a-b);
    let verticalCharSnitt = charVerticalDistanse.at(charVerticalDistanse.length-1)/2;

    return {'charMedianWidth':horizentalCharSnitt, 'charMedianHeight':verticalCharSnitt};
}
*/

// ---------------------- Modify and Select corner coordinates ------------------------------

function modifyCorners(pts) {

    let max_sum = pts.data32F[0] + pts.data32F[1];
    let min_sum = pts.data32F[0] + pts.data32F[1];
    let max_diff = Math.abs(pts.data32F[0] - pts.data32F[1]);
    let min_diff = Math.abs(pts.data32F[0] - pts.data32F[1]);
    let rect = [];
    for (let i = 0; i < pts.data32F.length; i += 2) {
        let new_sum = pts.data32F[i] + pts.data32F[i + 1];
        let new_diff = pts.data32F[i] - pts.data32F[i + 1];
        if (new_sum >= max_sum) {
            max_sum = new_sum;
            // Top left point
            rect[6] = pts.data32F[i]
            rect[7] = pts.data32F[i + 1]
        }
        if (new_sum <= min_sum) {
            min_sum = new_sum;
            // bottom right point
            rect[0] = pts.data32F[i]
            rect[1] = pts.data32F[i + 1]
        }
        if (new_diff >= max_diff) {
            max_diff = new_diff;
            // bottom left point
            if (ratio >= 1) {
                rect[4] = pts.data32F[i]
                rect[5] = pts.data32F[i + 1]
            } else {
                rect[2] = pts.data32F[i]
                rect[3] = pts.data32F[i + 1]
                console.log('h bilde')
            }
        }
        if (new_diff <= min_diff) {
            min_diff = new_diff;
            //Top right point
            if (ratio >= 1) {
                rect[2] = pts.data32F[i]
                rect[3] = pts.data32F[i + 1]
            } else {
                rect[4] = pts.data32F[i]
                rect[5] = pts.data32F[i + 1]
                console.log('h bilde')
            }
        }
    }


    for (let i = 0; i < rect.length; i++) {

        pts.data32F[i] = rect[i];
    }
    console.log(rect, pts.data32F)
    // Crop Max-Contour by shrinking vertices to inside
    if (ratio < 1) {
        pts.data32F[0] += modifyTall_h;
        pts.data32F[1] += modifyTall_h;
        pts.data32F[2] -= modifyTall_h;
        pts.data32F[3] += modifyTall_h;
        pts.data32F[4] += modifyTall_h;
        pts.data32F[5] -= modifyTall_h;
        pts.data32F[6] -= modifyTall_h;
        pts.data32F[7] -= modifyTall_h;
    }
    if (ratio >= 1) {
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
zoomButtonsDiv.addEventListener('click', function (event) {
    console.log(event.target.id)

    // let clipWord = document.getElementsByName("clipWord");
    if (event.target.id === 'zoom-inn-icon') {
        zoom += 0.15;
        document.documentElement.style.setProperty('--scale-zoom', zoom);
    }
    if (event.target.id === 'zoom-out-icon') {
        zoom -= 0.15;
        document.documentElement.style.setProperty('--scale-zoom', zoom);
    }
    if (event.target.id === 'zoom-reset-icon') {
        zoom = 1;
        document.documentElement.style.setProperty('--scale-zoom', zoom);
    }
});
