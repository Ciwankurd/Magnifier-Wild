const video = document.getElementById("video-input");
const canvas = document.getElementById("canvas-output");
const canvas_image = document.getElementById("cap-image");
const pros_image = document.getElementById("pros-image");
const snap = document.getElementById("snap");
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

    // let dsizee = new cv.Size(300, 300);
    //cv.resize(dst, dst, dsizee, 0, 0, cv.INTER_AREA);

    //let M = cv.matFromArray(2, 3, cv.CV_64FC1, [1, 0, 30, 0, 1, 20]);
    //let dsize = new cv.Size(src.rows, src.cols);
    // cv.warpAffine(dst, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
    /*
    let dsize = new cv.Size(src.rows, src.cols);
    let center = new cv.Point(src.cols / 2, src.rows / 2);
    let M = cv.getRotationMatrix2D(center, 45, 2);
    cv.warpAffine(src, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
    */
    /*
    let srcTri = cv.matFromArray(3, 1, cv.CV_32FC2, [0, 0, 0, 1, 1, 0]);
    let dstTri = cv.matFromArray(3, 1, cv.CV_32FC2, [0.3, 0.2, 0.1, 1.3, 1.5, 0.3]);
    let dsize = new cv.Size(src.rows, src.cols);
    let M = cv.getAffineTransform(srcTri, dstTri);
    // You can try more different parameters
    cv.warpAffine(src, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
*/

    cv.imshow('pros-image', dst);
    im.delete();
    dst.delete();
}
(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
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
        context.drawImage(video,0,0,450,350);
        callback();
    });



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
})();

