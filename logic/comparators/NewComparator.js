const {
    PL_TYPE,
    INVOICE_TYPE,
    SC_TYPE
} = require('../constants/docTypes');

class NewComparator {
    static clearString(str) {
        return str.split(' ').join('')
            .split(',').join('')
            .split('«').join('')
            .split('»').join('')
            .split('"').join('')
            .split("'").join('')
            .split('.').join('')
            .split('(').join('')
            .split(')').join('')
            .split(':').join('')
            .toUpperCase();
    }

    static compareClearStrings(first, second) {
        return !NewComparator.clearString(first).localeCompare(NewComparator.clearString(second));
    }

    static getDocByType(type, first, second, third) {
        if (third) {
            switch (type) {
                case first.type:
                    return first;
                case second.type:
                    return second;
                case third.type:
                    return third;
            }
        } else {
            switch (type) {
                case first.type:
                    return first;
                case second.type:
                    return second;
            }
        }
    }

    static compareClearValues(first, second, third) {
        if (third)
            return NewComparator.compareClearStrings(first, second) && NewComparator.compareClearStrings(first, third) && NewComparator.compareClearStrings(second, third);
        else
            return NewComparator.compareClearStrings(first, second)
    }

    static compareVariables(variableName, first, second, third) {
        const firstVariable = variableName.split('.')[0];
        const secondVariable = variableName.split('.')[1];

        const PL = NewComparator.getDocByType(PL_TYPE, first, second, third);
        const SC = NewComparator.getDocByType(SC_TYPE, first, second, third);
        const invoice = NewComparator.getDocByType(INVOICE_TYPE, first, second, third);

        if (third) {
            if (secondVariable) {
                if (NewComparator.compareClearValues(first[firstVariable][secondVariable], second[firstVariable][secondVariable], third[firstVariable][secondVariable]))
                    return null;
                else
                    return {
                        PL: PL[firstVariable][secondVariable],
                        SC: SC[firstVariable][secondVariable],
                        invoice: invoice[firstVariable][secondVariable]
                    }
            }
        } else {
            let result;
            if (PL) {
                if (secondVariable) {
                    if (SC) {
                        if (NewComparator.compareClearValues(PL[firstVariable][secondVariable], SC[firstVariable][secondVariable]))
                            return null;
                        else
                            return {
                                PL: PL[firstVariable][secondVariable],
                                SC: SC[firstVariable][secondVariable]
                            }
                    } else if (invoice) {
                        if (NewComparator.compareClearValues(PL[firstVariable][secondVariable], invoice[firstVariable][secondVariable]))
                            return null;
                        else
                            return {
                                PL: PL[firstVariable][secondVariable],
                                invoice: invoice[firstVariable][secondVariable]
                            }
                    }
                } else if (invoice) {
                    if (NewComparator.compareClearValues(PL[firstVariable], invoice[firstVariable]))
                        return null;
                    else
                        return {
                            PL: PL[firstVariable],
                            invoice: invoice[firstVariable]
                        }
                }
            } else if (SC) {
                if (secondVariable) {
                    if (invoice) {
                        if (NewComparator.compareClearValues(SC[firstVariable][secondVariable], invoice[firstVariable][secondVariable]))
                            return null;
                        else
                            return {
                                SC: SC[firstVariable][secondVariable],
                                invoice: invoice[firstVariable][secondVariable]
                            }
                    }
                }
            }
        }

    }

    static async compareDocs(first, second, third) {
        const PL = NewComparator.getDocByType(PL_TYPE, first, second, third);
        const SC = NewComparator.getDocByType(SC_TYPE, first, second, third);
        const invoice = NewComparator.getDocByType(INVOICE_TYPE, first, second, third);

        return {
            sender_name: NewComparator.compareVariables('sender.name', PL, SC, invoice),
            sender_address: NewComparator.compareVariables('sender.address', PL, SC, invoice),
            sender_IEC: NewComparator.compareVariables('sender.IEC', PL, SC),

            recipient_name: NewComparator.compareVariables('recipient.name', PL, SC, invoice),
            recipient_address: NewComparator.compareVariables('recipient.address', PL, SC, invoice),
            recipient_IEC: NewComparator.compareVariables('recipient.IEC', PL, SC),

            supplier_name: NewComparator.compareVariables('supplier.name', PL, SC,  invoice),
            supplier_address: NewComparator.compareVariables('supplier.address', PL, SC, invoice),
            supplier_ITN: NewComparator.compareVariables('supplier.ITN', PL, SC),
            supplier_IEC: NewComparator.compareVariables('supplier.IEC', PL, SC),
            supplier_CA: NewComparator.compareVariables('supplier.CA', PL, SC),
            supplier_bank: NewComparator.compareVariables('supplier.bank', PL, SC),
            supplier_BIC: NewComparator.compareVariables('supplier.BIC', PL, SC),
            supplier_CoAc: NewComparator.compareVariables('supplier.CoAc', PL, SC),

            payer_name: NewComparator.compareVariables('payer.name', PL, SC, invoice),
            payer_ITN: NewComparator.compareVariables('payer.ITN', PL, SC, invoice),
            payer_IEC: NewComparator.compareVariables('payer.IEC', PL, SC, invoice),
            payer_address: NewComparator.compareVariables('payer.address', PL, SC, invoice),
            payer_CA: NewComparator.compareVariables('payer.CA', PL, SC),
            payer_bank: NewComparator.compareVariables('payer.bank', PL, SC),
            payer_BIC: NewComparator.compareVariables('payer.BIC', PL, SC),
            payer_CoAc: NewComparator.compareVariables('payer.CoAc', PL, SC),

            car: NewComparator.compareVariables('car', PL, invoice),
            carVin: NewComparator.compareVariables('carVin', PL, invoice)
        }
    }
}

module.exports = NewComparator;