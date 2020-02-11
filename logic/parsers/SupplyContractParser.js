const Parser = require('./Parser');
const {
    NEW_LINE_KEYWORD,
    CONTRACT_KEYWORD,
    SUPPLY_POINT_4_KEYWORD,
    SUPPLY_POINT_4_2_KEYWORD,
    SUPPLY_POINT_14_KEYWORD,
    SUPPLY_RECIPIENT_KEYWORD,
    SUPPLY_SENDER_KEYWORD,
    ITN_KEYWORD,
    IEC_KEYWORD,
    SUPPLY_LOCATION_KEYWORD,
    SUPPLY_END_OF_SENDER_KEYWORD,
    SUPPLY_REQUISITES_KEYWORD,
    SUPPLY_SUPPLIER_NAME_KEYWORD,
    SUPPLY_ITN_AND_IEC_KEYWORD,
    SUPPLY_LEGAL_ADDRESS_KEYWORD,
    SUPPLY_POINT_14_END_OF_ADDRESS_KEYWORD,
    SUPPLY_BANK_DETAILS_KEYWORD,
    SUPPLY_BANK_NAME_KEYWORD,
    BIC_KEYWORD,
    SUPPLY_PAYER_NAME_KEYWORD,
    SUPPLY_TYPE_2_START_POINT,
    SUPPLY_SUPPLIER_NAME_TYPE_2_KEYWORD,
    SUPPLY_TYPE_2_SENDER_KEYWORD,
    CA_KEYWORDS,
    PAYER_ADDRESS_KEYWORD
} = require('../constants/keywords');
const {
    SUPPLY_DATE_REGEXP
} = require('../constants/regexp');
const {
    SC_TYPE
} = require('../constants/docTypes');
const moment = require('moment');
moment.locale('ru');

class SupplyContractParser extends Parser {
    constructor(isInStr) {
        super(isInStr);
    }

    isStrStartOfCompany(strIndex, keywords) {
        let result = true;
        keywords.forEach((item, index) => {
            if (result)
                result = this.docData[strIndex + index].text.indexOf(item) >= 0;
        });
        return result ? strIndex : -1;
    }

    // getCompanyData(index, endKeyword, companyKeywords) {
    //     const company = {
    //         name: '',
    //         address: '',
    //         ITN: '',
    //         IEC: ''
    //     };
    //     company.name = this.docData[index + companyKeywords.length].text + this.docData[index + companyKeywords.length + 1].text;
    //     let endIndex;
    //     for (let now = index; this.docData[now].text.indexOf(endKeyword) === -1; now++)
    //         endIndex = now;
    //     let addressStartIndex = -1;
    //     for (let now = index; now <= endIndex; now++) {
    //         const { text } = this.docData[now];
    //         if (text.indexOf(ITN_KEYWORD) >= 0) {
    //             company.ITN = this.docData[now + 1].text;
    //         } else if (text.indexOf(IEC_KEYWORD) >= 0) {
    //             company.IEC = this.docData[now + 1].text;
    //         } else if (addressStartIndex === -1 && text.indexOf(SUPPLY_LOCATION_KEYWORD) >= 0) {
    //             addressStartIndex = now;
    //             for (let now2 = addressStartIndex; now2 <= endIndex; now2++) {
    //                 company.address += this.docData[now2].text.replace(SUPPLY_LOCATION_KEYWORD, '');
    //             }
    //         }
    //     }
    //     return company;
    // }

    getContract() {
        const contract = {
            number: '',
            date: ''
        };
        this.docData = Parser.deleteToWord(this.docData, CONTRACT_KEYWORD);
        const reversedContractNumber = Parser.reverseStr(Parser.firstWord(this.docData));
        contract.number = Parser.reverseStr(reversedContractNumber.slice(reversedContractNumber.indexOf('К')));
        this.docData = Parser.deleteToWord(this.docData, contract.number, false);

        const wordLength = 18;
        let firstWord = this.docData.slice(wordLength);
        for (let now = 1; !firstWord.match(SUPPLY_DATE_REGEXP); now++) {
            this.docData = this.docData.slice(1);
            firstWord = this.docData.slice(0, wordLength);
        }
        const date = firstWord.match(SUPPLY_DATE_REGEXP)[0];
        this.docData = Parser.deleteToWord(this.docData, date);
        try {
            contract.date = moment(date, 'DD MMMM YYYY').format('DD.MM.YYYY');
        } catch (e) {
            console.log('There is no correct date of contract in this document. Error:', e);
        }

        return contract;
    }

    getCompanyData(companyKeyword, endKeyword, preprocessingKeyword = '', is14Point = false) {
        let company = {
            name: '',
            ITN: '',
            IEC: '',
            address: ''
        };
        if (preprocessingKeyword)
            this.docData = Parser.deleteToWord(this.docData, preprocessingKeyword);

        if (!is14Point) {
            let companyStr = this.docData.slice(this.docData.indexOf(companyKeyword), this.docData.indexOf(endKeyword));
            companyStr = Parser.deleteToWord(companyStr, companyKeyword);
            // this.docData = Parser.deleteToWord(this.docData, companyKeyword);

            company.name = Parser.firstStrBeforeComma(companyStr);

            if (companyStr.indexOf(ITN_KEYWORD) >= 0) {
                companyStr = Parser.deleteToWord(companyStr, ITN_KEYWORD);
                company.ITN = Parser.firstNumber(companyStr);
            }
            companyStr = Parser.deleteToWord(companyStr, IEC_KEYWORD);

            company.IEC = Parser.firstNumber(companyStr);
            companyStr = Parser.deleteToWord(companyStr, SUPPLY_LOCATION_KEYWORD);

            company.address = companyStr;
            this.docData = Parser.deleteToWord(this.docData, company.address);
        } else {
            this.docData = Parser.deleteToWord(this.docData, companyKeyword);
            company.name = this.docData.slice(0, this.docData.indexOf(SUPPLY_ITN_AND_IEC_KEYWORD));
            this.docData = Parser.deleteToWord(this.docData, SUPPLY_ITN_AND_IEC_KEYWORD);

            company.ITN = Parser.firstNumber(this.docData);
            this.docData = Parser.deleteToWord(this.docData, company.ITN);

            company.IEC = Parser.firstNumber(this.docData);
            this.docData = Parser.deleteToWord(this.docData, SUPPLY_LEGAL_ADDRESS_KEYWORD);

            company.address = this.docData.slice(0, this.docData.indexOf(SUPPLY_POINT_14_END_OF_ADDRESS_KEYWORD));
            this.docData = Parser.deleteToWord(this.docData, SUPPLY_BANK_DETAILS_KEYWORD);

            company.CA = Parser.firstNumber(this.docData);
            this.docData = Parser.deleteToWord(this.docData, SUPPLY_BANK_NAME_KEYWORD);

            company.bank = this.docData.slice(0, this.docData.indexOf(BIC_KEYWORD));
            this.docData = Parser.deleteToWord(this.docData, BIC_KEYWORD);

            company.BIC = Parser.firstNumber(this.docData);
            this.docData = Parser.deleteToWord(this.docData, company.BIC);

            company.CoAc = Parser.firstNumber(this.docData);
            this.docData = Parser.deleteToWord(this.docData, company.CoAc);
        }
        return company;
    }

    async parse() {
        try {
            const sendData = {
                contract: {},
                recipient: {},
                sender: {},
                supplier: {},
                type: SC_TYPE
            };

            if (this.isInStr) {
                if (this.docData.indexOf(SUPPLY_POINT_14_KEYWORD) >= 0) {
                    sendData.contract = this.getContract();//.slice(0, Parser.firstWord(this.docData).indexOf('К') + 1));
                    sendData.recipient = this.getCompanyData(SUPPLY_RECIPIENT_KEYWORD, SUPPLY_SENDER_KEYWORD, SUPPLY_POINT_4_KEYWORD);
                    sendData.sender = this.getCompanyData(SUPPLY_SENDER_KEYWORD, SUPPLY_POINT_4_2_KEYWORD);
                    sendData.supplier = this.getCompanyData(SUPPLY_SUPPLIER_NAME_KEYWORD, '', '', true);
                    sendData.payer = this.getCompanyData(SUPPLY_PAYER_NAME_KEYWORD, '', '', true);
                } else if (this.docData.indexOf(SUPPLY_TYPE_2_START_POINT) >= 0) {
                    this.docData = Parser.deleteToWord(Parser.deleteToWord(this.docData, SUPPLY_TYPE_2_START_POINT), SUPPLY_TYPE_2_START_POINT);
                    let supplier = {};
                    let payer = {};
                    let sender = {};
                    let recipient = {};

                    this.docData = Parser.deleteToWord(this.docData, SUPPLY_SUPPLIER_NAME_TYPE_2_KEYWORD);
                    supplier.name = this.docData.slice(0, this.docData.indexOf(SUPPLY_PAYER_NAME_KEYWORD));

                    this.docData = Parser.deleteToWord(this.docData, SUPPLY_PAYER_NAME_KEYWORD);
                    payer.name = this.docData.slice(0, this.docData.indexOf(ITN_KEYWORD));

                    supplier.ITN = Parser.firstNumber(this.docData);
                    this.docData = Parser.deleteToWord(this.docData, supplier.ITN);

                    supplier.IEC = Parser.firstNumber(this.docData);
                    this.docData = Parser.deleteToWord(this.docData, SUPPLY_LEGAL_ADDRESS_KEYWORD);

                    supplier.address = this.docData.slice(0, this.docData.indexOf(SUPPLY_TYPE_2_SENDER_KEYWORD));
                    this.docData = Parser.deleteToWord(this.docData, SUPPLY_TYPE_2_SENDER_KEYWORD);

                    sender.name = Parser.firstStrBeforeComma(this.docData);
                    this.docData = Parser.deleteToWord(this.docData, sender.name);

                    if (this.docData.indexOf(ITN_KEYWORD) !== -1 && this.docData.indexOf(ITN_KEYWORD) < this.docData.indexOf(IEC_KEYWORD)) {
                        sender.ITN = Parser.firstNumber(this.docData);
                    }
                    this.docData = Parser.deleteToWord(this.docData, IEC_KEYWORD);

                    sender.IEC = Parser.firstNumber(this.docData);
                    this.docData = Parser.deleteToWord(this.docData, SUPPLY_LOCATION_KEYWORD);

                    sender.address = this.docData.slice(0, this.docData.indexOf(Parser.getRightKeyword(this.docData, CA_KEYWORDS)));
                    this.docData = Parser.deleteToWord(this.docData, sender.address);

                    sender.CA = Parser.firstNumber(this.docData);
                    this.docData = Parser.deleteToWord(this.docData, SUPPLY_BANK_NAME_KEYWORD);

                    sender.bank = this.docData.slice(0, this.docData.indexOf(BIC_KEYWORD));
                    this.docData = Parser.deleteToWord(this.docData, BIC_KEYWORD);

                    sender.BIC = Parser.firstNumber(this.docData);
                    this.docData = Parser.deleteToWord(this.docData, sender.BIC);

                    sender.CoAc = Parser.firstNumber(this.docData);
                    this.docData = Parser.deleteToWord(this.docData, ITN_KEYWORD);
                    console.log(this.docData.slice(0, 100));

                    payer.ITN = Parser.firstNumber(this.docData);
                    this.docData = Parser.deleteToWord(this.docData, IEC_KEYWORD);

                    payer.IEC = Parser.firstNumber(this.docData);
                    this.docData = Parser.deleteToWord(this.docData, PAYER_ADDRESS_KEYWORD);

                    payer.address = this.docData.slice(0, this.docData.indexOf(SUPPLY_RECIPIENT_KEYWORD));
                    this.docData = Parser.deleteToWord(this.docData, SUPPLY_RECIPIENT_KEYWORD);

                    recipient.name = Parser.firstStrBeforeComma(this.docData);
                    this.docData = Parser.deleteToWord(this.docData, recipient.name);

                    if (this.docData.indexOf(ITN_KEYWORD) !== -1 && this.docData.indexOf(ITN_KEYWORD) < this.docData.indexOf(IEC_KEYWORD)) {
                        recipient.ITN = Parser.firstNumber(this.docData);
                    }
                    this.docData = Parser.deleteToWord(this.docData, IEC_KEYWORD);

                    recipient.IEC = Parser.firstNumber(this.docData);
                    this.docData = Parser.deleteToWord(this.docData, SUPPLY_LOCATION_KEYWORD);

                    recipient.address = this.docData.slice(0, this.docData.indexOf(Parser.getRightKeyword(this.docData, CA_KEYWORDS)));
                    this.docData = Parser.deleteToWord(this.docData, recipient.address);

                    recipient.CA = Parser.firstNumber(this.docData);
                    this.docData = Parser.deleteToWord(this.docData, SUPPLY_BANK_NAME_KEYWORD);

                    recipient.bank  = this.docData.slice(0, this.docData.indexOf(BIC_KEYWORD));
                    this.docData = Parser.deleteToWord(this.docData, BIC_KEYWORD);

                    recipient.BIC = Parser.firstNumber(this.docData);
                    this.docData = Parser.deleteToWord(this.docData, recipient.BIC);

                    recipient.CoAc = Parser.firstNumber(this.docData);

                    return {
                        supplier,
                        payer,
                        sender,
                        recipient
                    }
                }
            }
            return sendData;
        } catch (err) {
            console.log(`${__filename}: There is an error with supply parsing here: ${err}`);
            throw new Error('There is en error with supply parsing here.')
        }
    }
}

module.exports = SupplyContractParser;