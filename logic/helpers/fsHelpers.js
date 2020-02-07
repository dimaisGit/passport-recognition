const fs = require('fs');
const axios = require('axios');
const { getRandomString } = require('./string');
const ProgressBar = require('progress');

const deleteFilesAndDirectory = async filesPaths => {
    try {
        filesPaths.forEach(item => {
            console.log(`${__filename}: deleting file ${item}`);
            fs.unlinkSync(item);
        });
        const folders = filesPaths[0].split('/');
        const dirName = folders[folders.length - 2];
        console.log(`${__filename}: deleting directory ${dirName}`);
        fs.rmdirSync(dirName);
    } catch (err) {
        console.log(`${__filename}: There is an error with files and folder deleting: ${err}`);
        return { err: `There is an error with files and folder deleting: ${err}` };
    }
};

const loadFileByUrl = async url => {
    try {
        console.log(`${__filename}: ${url} is downloading...`);
        const fileFormat = url.split('.').reverse()[0];
        let fileName = `${__dirname}/${getRandomString(15)}.${fileFormat}`;
        while (fs.existsSync(fileName))
            fileName = getRandomString(15) + fileFormat;

        const { data, headers } = await axios.get(url, {
            responseType: 'stream',
        });

        const totalLength = headers['content-length'];
        const progressBar = new ProgressBar('-> downloading [:bar] :percent :etas', {
            width: 40,
            complete: '=',
            incomplete: ' ',
            renderThrottle: 1,
            total: parseInt(totalLength)
        });

        const file = fs.createWriteStream(fileName);
        data.on('data', (chunk) => progressBar.tick(chunk.length));
        data.pipe(file);
        return new Promise((resolve, reject) => {
            file.on('error', err => {
                console.log(`${__filename}: there is error with url:${url} downloading: ${err}`);
                reject({ err: `there is error with url:${url} downloading: ${err}` });
            });
            file.on('finish', () => {
                console.log(`${__filename}: ${url} is successfully downloaded! File path: ${fileName}`);
                resolve({ fileName });
            });
        });
    } catch (err) {
        console.log(`${__filename}: there is some error with file downloading: ${err}`);
        return { err: `there is error with url:${url} downloading: ${err}` };
    }
};

// large pdf: https://www.hq.nasa.gov/alsj/a17/A17_FlightPlan.pdf
// small pdf: http://www.africau.edu/images/default/sample.pdf
module.exports = {
    deleteFilesAndDirectory,
    loadFileByUrl
};