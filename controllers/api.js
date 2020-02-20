const fs = require('fs');
const { loadFileByUrl } = require('../logic/helpers/fsHelpers');
const { googleRecognize } = require('../logic/recognition/googleRecognizing');
const { comparePassport } = require('../logic/passportComparator');
const PackingListParser = require('../logic/parsers/PackingListParser');
const InvoiceParser = require('../logic/parsers/InvoiceParser');
const SupplyContractParser = require('../logic/parsers/SupplyContractParser');
const NewComparator = require('../logic/comparators/NewComparator');

class Api {
    static async compareDocs(req, res) {
        const { pl_url, invoice_url, supply_url } = req.body;
        console.log(req.body);
        try {
            if (!pl_url || !invoice_url || !supply_url)
                throw new Error('U didnt pass required params');

            const loadedPLPath = await loadFileByUrl(pl_url);
            const loadedInvoicePath = await loadFileByUrl(invoice_url);
            const loadedSupplyPath = await loadFileByUrl(supply_url);

            const plReader = new PackingListParser();
            const invoiceReader = new InvoiceParser();
            const supplyReader = new SupplyContractParser(true);

            await plReader.parseDoc(loadedPLPath);
            const plData = await plReader.parse();

            await invoiceReader.parseDoc(loadedInvoicePath);
            const invoiceData = await invoiceReader.parse();

            await supplyReader.parseDoc(loadedSupplyPath);
            const supplyData = await supplyReader.parse();

            fs.unlinkSync(loadedPLPath);
            fs.unlinkSync(loadedInvoicePath);
            fs.unlinkSync(loadedSupplyPath);

            const comparingData = await NewComparator.compareDocs(plData, invoiceData, supplyData);
            res.json({ data: comparingData });
        } catch (err) {
            res.status(500).json({ err: `There is an error with docs parsing here: ${err}\nPlease check if u pass right links to docs and docs are available to downloading`});
        }
    }
    static async parsePassportPdf(req, res) { //rewrite this please!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Error handling is weird
        const { passport_url, name, last_name, patronymic, series, number, issued_by, issue_date, department_code  } = req.body;
        if (!passport_url || !name || !last_name || !patronymic || !series || !number || !issued_by || !issue_date || !department_code ) {
            res.status(500).json({ err: 'u didnt pass required params'});
            return;
        }
        const loadedFileData = await loadFileByUrl(passport_url);
        if (loadedFileData.err) {
            const { err } = loadedFileData;
            res.status(500).json({ err });
            return;
        }
        const { fullFilePath } = loadedFileData;
        const recognizedData = await googleRecognize(fullFilePath);
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