new Vue({
    data() {
        return {
            initialized: false,
            imageData: null,
            MIN_CONTOURS_SCALE: 20, // Minimum original image ratio
            THRESHOLD: 170, // Monochrome threshold
        }
    },
    methods: {
        onFileChange(e) {

            const files = e.target.files;

            if(files.length > 0) {

                const file = files[0];
                const reader = new FileReader();
                reader.onload = (e) => {

                    this.imageData = e.target.result;

                };
                reader.readAsDataURL(file);

            }

        },

        // opencv
        transform() {

            const imageElement = document.querySelector('#image');
            const im = cv.imread(imageElement);
            const pts = this.getContoursPoints(im);

            if(pts) {

                const transformedIm = this.getTransformedImage(im, pts);
                cv.imshow('outputCanvas', transformedIm);
                console.log('Done!');

            } else {

                console.log('Failed...');

            }

            im.delete();

        },
        getContoursPoints(im) {

            // Image area
            const imRectArea = im.cols * im.rows //

            // Grayscale
            let im_gray = new cv.Mat();
            cv.cvtColor(im, im_gray, cv.COLOR_RGBA2GRAY);

            // Threshold
            let threshold_im = new cv.Mat();
            cv.threshold(im_gray, threshold_im, this.THRESHOLD, 255, cv.THRESH_BINARY);

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

                if (maxRectScale>= this.MIN_CONTOURS_SCALE) {// Filter by ratio to original image

                    if (cntArea> maxCntArea) {// Keep larger

                        let approx = new cv.Mat ();
                        const epsilon = 0.02 * cv.arcLength (cnt, true)
                        cv.approxPolyDP (cnt, approx, epsilon, true)

                        if (approx.size (). height === 4) {// Keep if it is a rectangle

                            maxCntArea = cntArea;
                            pts = approx // Coordinates of the rectangle to be cut out (4 points)

                        }

                    }

                }

            }

            contours.delete();
            im_gray.delete();
            threshold_im.delete();
            pts.convertTo(pts, cv.CV_32FC2);

            return pts;

        },

        getTransformedImage(im, fromPts) {

            let transformedIm = new cv.Mat();
            const rows = im.rows;
            const cols = im.cols;
            let dsize = new cv.Size(cols, rows);
            const toPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
                cols, 0, 0, 0, 0, rows, cols, rows
            ]);
            const M = cv.getPerspectiveTransform(fromPts, toPts); // Matrix of transformations
            cv.warpPerspective(im, transformedIm, M, dsize);

            fromPts.delete();
            toPts.delete();
            return transformedIm;

        }

    },
    mounted() {

        cv['onRuntimeInitialized'] = () => {

            this.initialized = true;

        };

    }
}).$mount('#app');
