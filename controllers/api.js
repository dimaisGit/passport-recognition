const { loadFileByUrl } = require('../logic/helpers/fsHelpers');
const { googleRecognize } = require('../logic/recognition/googleRecognizing');
const { comparePassport } = require('../logic/passportComparator');

class Api {
    static async parsePassportPdf(req, res) {
        const { passport_url } = req.body;
        if (!passport_url) {
            res.status(500).json({ err: 'u didnt pass required params: passport_url'});
            return;
        }
        const loadedFileData = await loadFileByUrl(passport_url);
        if (loadedFileData.err) {
            const { err } = loadedFileData;
            res.status(500).json({ err });
            return;
        }
        const { fileName } = loadedFileData;
        const recognizedData = await googleRecognize(fileName);
        if (recognizedData.err) {
            const { err } = recognizedData;
            res.status(500).json({ err });
            return;
        }
        const { recognizedText } = recognizedData;
        const comparedData = await comparePassport(recognizedText, req.body);
        res.json({ comparedData });
    }
}

module.exports = Api;