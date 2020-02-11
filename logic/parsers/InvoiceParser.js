const Parser = require('./Parser');
const {
    SUPPLIER_NAME_KEYWORD,
    SUPPLIER_ADDRESS_KEYWORD,
    SUPPLIER_ITN_AND_IEC_KEYWORD,
    SENDER_KEYWORD,
    RECIPIENT_KEYWORD,
    PAYER_NAME_KEYWORD,
    PAYER_ADDRESS_KEYWORD,
    PAYER_ITN_AND_IEC_KEYWORD,
    VIN_CODE_KEYWORD
} = require('../constants/keywords');
const {
    INVOICE_TYPE
} = require('../constants/docTypes');

class InvoiceParser extends Parser {
    constructor() {
        super();
    }

    async parse() {
        try {
            const sendData = {
                supplier: {},
                sender: {},
                recipient: {},
                payer: {},
                type: INVOICE_TYPE
            };

            this.docData.forEach((item, index) => {
                const { text } = item;
                if (text.indexOf(SUPPLIER_NAME_KEYWORD) >= 0) {
                    sendData.supplier.name = text.replace(SUPPLIER_NAME_KEYWORD, '');
                    const address = this.docData[index + 1].text;
                    sendData.supplier.address = address.replace(SUPPLIER_ADDRESS_KEYWORD, '');
                } else if (text.indexOf(SUPPLIER_ITN_AND_IEC_KEYWORD) >= 0) {
                    const ITNandIEC = text.replace(SUPPLIER_ITN_AND_IEC_KEYWORD, '');
                    sendData.supplier.ITN = ITNandIEC.split('/')[0];
                    sendData.supplier.IEC = ITNandIEC.split('/')[1];
                } else if (text.indexOf(SENDER_KEYWORD) >= 0) {
                    const nameAndAddress = text.replace(SENDER_KEYWORD, '');
                    sendData.sender.name = Parser.firstStrBeforeComma(nameAndAddress);
                    sendData.sender.address = nameAndAddress.replace(sendData.sender.name, '');
                } else if (text.indexOf(RECIPIENT_KEYWORD) >= 0) {
                    const nameAndAddress = text.replace(RECIPIENT_KEYWORD, '');
                    sendData.recipient.name = Parser.firstStrBeforeComma(nameAndAddress);
                    sendData.recipient.address = nameAndAddress.replace(sendData.recipient.name, '');
                } else if (text.indexOf(PAYER_NAME_KEYWORD) >= 0) {
                    sendData.payer.name = text.replace(PAYER_NAME_KEYWORD, '');
                } else if (text.indexOf(PAYER_ADDRESS_KEYWORD) >= 0) {
                    sendData.payer.address = text.replace(PAYER_ADDRESS_KEYWORD, '');
                } else if (text.indexOf(PAYER_ITN_AND_IEC_KEYWORD) >= 0) {
                    const ITNandIEC = text.replace(PAYER_ITN_AND_IEC_KEYWORD, '');
                    sendData.payer.ITN = ITNandIEC.split('/')[0];
                    sendData.payer.IEC = ITNandIEC.split('/')[1];
                } else if (text.indexOf(VIN_CODE_KEYWORD) >= 0) {
                    sendData.carVin = text.slice(VIN_CODE_KEYWORD.length);
                    sendData.car = `${this.docData[index - 2].text} ${this.docData[index - 1].text}`
                }
            });
            return sendData;
        } catch (err) {
            console.log(`${__filename}: There is an error with invoice parsing here: ${err}`);
            throw new Error('There is en error with invoice parsing here.')
        }
    }
}

module.exports = InvoiceParser;