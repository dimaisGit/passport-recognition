const Parser = require('./Parser');
const {
    PTS_VIN_KEYWORD,
    PTS_MODEL_KEYWORD,
    PTS_COMMERCIAL_NAME,
    PTS_CAR_CATEGORY,
    PTS_TRANSPORT_NAME
} = require('../constants/keywords');

class PTSParser extends Parser {
    constructor(isInStr) {
        super(isInStr);
    }

    async parse() {
        const sendData = {
            carVin: '',
            car: ''
        };
        if (this.isInStr) {
            this.docData = Parser.deleteToWord(this.docData, PTS_VIN_KEYWORD);
            if (this.docData.indexOf(PTS_TRANSPORT_NAME) >= 0)
                sendData.carVin = this.docData.slice(0, this.docData.indexOf(PTS_TRANSPORT_NAME));
            else
                sendData.carVin = this.docData.slice(0, this.docData.indexOf(PTS_MODEL_KEYWORD));

            this.docData = Parser.deleteToWord(this.docData, PTS_MODEL_KEYWORD);
            sendData.car = this.docData.slice(0, this.docData.indexOf(PTS_COMMERCIAL_NAME));

        }
        return sendData;
    }
}

module.exports = PTSParser;