const Parser = require('./Parser');
const {
    VIN_CODE_KEYWORD,
    CONTRACT_KEYWORD,
    ITN_KEYWORD,
    //IECKeyword,
    CA_KEYWORDS,
    PHONE_KEYWORD,
    BANK_KEYWORDS,
    BIC_KEYWORD,
    COAC_KEYWORD
} = require('../constants/keywords');

const {
    PL_TYPE
} = require('../constants/docTypes');

class PackingListParser extends Parser {

    constructor(isInStr) {
        super(isInStr);
    }

    static getCompanyData(str) {

        const name = Parser.firstStrBeforeComma(str);
        const ITN = Parser.firstNumber(str.replace(ITN_KEYWORD, ''));//INN, first number after 'INN'
        const IEC = Parser.firstNumber(str.replace(ITN, ''));//KPP, first number after INN number

        const CAKeyword = Parser.getRightKeyword(str, CA_KEYWORDS);//R/S keyword
        const address = str.slice(str.indexOf(IEC) + IEC.length, str.indexOf(CAKeyword)).split(PHONE_KEYWORD)[0];
        const CA = Parser.firstNumber(str.slice(str.indexOf(CAKeyword)));//R/S
        str = Parser.deleteToWord(str, CA);

        const bankKeyword = Parser.getRightKeyword(str, BANK_KEYWORDS);
        const bank = Parser.firstStrBeforeComma(str.replace(bankKeyword, ''));
        str = Parser.deleteToWord(str, bank);

        const BIC = Parser.firstNumber(str.replace(BIC_KEYWORD, ''));
        str = Parser.deleteToWord(str, BIC);

        const CoAcKeyword = Parser.getRightKeyword(str, COAC_KEYWORD);
        const CoAc = Parser.firstNumber(str.replace(CoAcKeyword, ''));//K/S

        return {
            name,
            ITN,
            IEC,
            address,
            CA,
            bank,
            BIC,
            CoAc
        }
    }

    async parse() {
        try {
            const packingListData = { //data for parsing, flags cause similar data follow each other
                sendData: {
                    type: PL_TYPE
                },
                isSenderChecked: false,
                isRecipientChecked: false,
                isPayerChecked: false,
            };
            this.docData.forEach((item, index) => {
                const { text } = item;
                if (text.indexOf(ITN_KEYWORD) >= 0) {
                    const { isSenderChecked, isRecipientChecked, isPayerChecked } = packingListData;
                    if (!isSenderChecked) {
                        packingListData.sendData.sender = PackingListParser.getCompanyData(`${text} ${this.docData[index + 1].text} ${this.docData[index + 2].text}`); //current + two next cause 3 lines of text
                        packingListData.isSenderChecked = true
                    } else if (!isRecipientChecked) {
                        packingListData.sendData.recipient = PackingListParser.getCompanyData(`${text} ${this.docData[index + 1].text} ${this.docData[index + 2].text}`);
                        packingListData.isRecipientChecked = true
                    } else if (!isPayerChecked) {
                        packingListData.sendData.supplier = PackingListParser.getCompanyData(`${text} ${this.docData[index + 1].text} ${this.docData[index + 2].text}`);
                        packingListData.isPayerChecked = true
                    } else packingListData.sendData.payer = PackingListParser.getCompanyData(`${text} ${this.docData[index + 1].text} ${this.docData[index + 2].text}`);
                } else if (text.indexOf(VIN_CODE_KEYWORD) >= 0) {
                    packingListData.sendData.carVin = text.slice(VIN_CODE_KEYWORD.length);
                    packingListData.sendData.car = `${this.docData[index - 2].text} ${this.docData[index - 1].text}`
                } else if (text.indexOf(CONTRACT_KEYWORD) >= 0) {
                    const contractString = text.slice(CONTRACT_KEYWORD.length);
                    packingListData.sendData.contract = {
                        number: contractString.split(' ')[0],
                        date: contractString.split(' ')[2]
                    };
                }
            });
            return packingListData.sendData
        } catch (err) {
            console.log(`${__filename}: There is an error with packing list parsing here: ${err}`);
            throw new Error('There is en error with packing list parsing here.')
        }
    }
}

module.exports = PackingListParser;