from easyocr import easyocr
from script.js import createObject
from pyodide.ffi import create_proxy

createObject(create_proxy(globals()), "pyodideGlobals")
def DetectText(im):
    reader = easyocr.Reader(['en'], gpu=False)  # bedre om du har gpu og raaskere
    result = reader.readtext(im, detail=1, ycenter_ths=0.2, paragraph=False, width_ths=0.1)  # Matris
    i = 0
    imgs = []
    for text in result:
        i = 1 + i
        p1 = text[0][0]
        p2 = text[0][2]
        y1 = p1[1]
        y2 = p2[1]
        x1 = p1[0]
        x2 = p2[0]
        # cpx = text[0][2]
        detectedText = text[1]
        cropped = im[y1:y2, x1:x2]
        imgs.append(cropped)
    return imgs