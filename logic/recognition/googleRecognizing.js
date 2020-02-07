const fs = require('fs');
const vision = require('@google-cloud/vision');
const image2base64 = require('image-to-base64');
const { pdf2Image } = require('../python/pythonInjects');
const { wait } = require('../helpers/waiting');
const { deleteFilesAndDirectory } = require('../helpers/fsHelpers');
const { getImprovedText } = require('../helpers/yandex');

googleRecognize = async imagePath => { //absolute path is required
    // Imports the Google Cloud client library
    // Creates a client
    const result = [];
    const request = { //one request obj for all requests, only image content is mutable
        imageContext: {
            languageHints: ["ru"]
        },
        image: {
            content: {}
        }
    };
    if (imagePath.indexOf('pdf') >= 0) { //if pdf, not image
        let convertedImages; //here 'll be paths of converted from pdf images
        try {
            convertedImages = await pdf2Image(imagePath);
            fs.unlinkSync(imagePath);
            console.log(convertedImages);
            for (let now = 0; now < convertedImages.length; now++) {
                request.image.content = await image2base64(convertedImages[now]); // send data encoded by base64
                console.log(`${__filename}: start recognizing page ${now}....`);
                const client = new vision.ImageAnnotatorClient(); // one client per request
                const [ recognizedData ] = await client.documentTextDetection(request);
                const recognizedText = recognizedData.fullTextAnnotation ? recognizedData.fullTextAnnotation.text.toString() : '';
                console.log(`${__filename}: recognized, ${convertedImages.length - now} pages left. Waiting....`);
                result.push(recognizedText);
                await wait(100); // no more than 10 requests per second
            }
            const deleteResponse = await deleteFilesAndDirectory(convertedImages);
            if (deleteResponse)
                return { err: deleteResponse.err };
        } catch (err) {
            console.log(`There is an error with pdf recognition: ${err}`);
            return { err };
        }
    } else {
        try {
            request.image.content = await image2base64(imagePath);
            console.log(`${__filename}: start recognizing....`);
            const client = new vision.ImageAnnotatorClient();
            const [ recognizedData ] = await client.documentTextDetection(request);
            const recognizedText = recognizedData.fullTextAnnotation.text.toString();
            result.push(recognizedText);
        } catch (err) {
            console.log(`There is an error with image recognition: ${err}`);
            return { err };
        }
    }
    let resultingString = '';
    for (let now = 0; now < result.length; ++now) {
        resultingString += ' ' + await getImprovedText(result[now]);
    }
    console.log(imagePath);
    console.log(resultingString);
    return { recognizedText: resultingString };
};

module.exports = {
    googleRecognize
};

// (async () => {
//     const improvedText = await getImprovedText('расси йская фе де рация м ы бо ремса');
//     console.log(improvedText);
// })();
// const absoluteFilePath = `${__dirname}/../passports/pasp2.pdf`;
// googleRecognize(absoluteFilePath);
// for (let now = 1; now <= 4; now++) {
//     const absoluteFilePath = `${__dirname}/../passports/pasp${now}.pdf`;
//     googleRecognize(absoluteFilePath);
// }



