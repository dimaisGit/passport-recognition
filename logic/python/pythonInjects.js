const { spawn } = require('child_process');

const pdf2Image = pdfPath => {
    return new Promise((resolve, reject) => {
        console.log(`${__filename} pdf2Image converting is started`);
        const pythonProcess = spawn('python3', [`${__dirname}/pythonPdfToPng.py`, pdfPath]);
        pythonProcess.stdout.on('data', data => { //on complete
            console.log(`${__filename} pdf successfully converted to image`);
            console.log(data);
            const convertedToJsonData = JSON.parse(data.toString('utf8').split("'").join('"'));
            resolve(convertedToJsonData);
        });
        pythonProcess.on('error', (err) => { //on error
            console.error(`There is an error with pdf2Image converting here: stderr: ${err}`);
            reject({ err });
        });
    })
};

const recognizeImage = imagePath => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', ['index.py', imagePath]);
        pythonProcess.stdout.on('data', (data) => {
            console.log(data.toString());
            resolve(data.toString());
        });
    })
};

module.exports = {
    recognizeImage,
    pdf2Image
};