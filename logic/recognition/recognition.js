const recognizeImage = require('../python/pythonInject');
const googleRecognize = require('./googleRecognizing');

const recognize500px = async (worker, index) => {
    const then = new Date();
    console.log(`parsing image number ${index}`);
    const { data: { text } } = await worker.recognize(`ptsImages/pts${index}x1000.jpg`);
    console.log(text);
    const now = new Date();
    return (now - then) / 1000;
};

const pyRecognizing = async index => {
    const then = new Date();
    console.log(`parsing image number ${index}`);
    const text = await recognizeImage(`ptsImages/pts${index}x500.jpg`);
    console.log(text);
    const now = new Date();
    return (now - then) / 1000;
};

const gRecognize = async index => {
    const then = new Date();
    console.log(`parsing image number ${index}`);
    await googleRecognize(`ptsImages/pts${index}x500.jpg`);
    const now = new Date();
    return (now - then) / 1000;
};

(async () => {
    const allTimes = [];

    for (let curAttempts = 1; curAttempts <= 3; ++curAttempts) {
        console.log(`attempt number ${curAttempts}`);
        const times = {
            px500: []
        };
        for (let now = 1; now <= 5; ++now)
            times.px500.push(await gRecognize(now));
        allTimes.push(times);
    }

    console.log(allTimes);
    allTimes.forEach( (item, index) => {
        const { px500 } = item;
        let sum = 0;
        px500.forEach(item => {
            sum += item;
        });
        console.log(`-------------------attempt №${index}----------------------`);
        console.log(`All values: ${px500}`);
        console.log(`middle value: ${sum / px500.length}`);
    });
    // console.log(await recognizeImage('ptsImages/pts1x500.jpg'));
})();