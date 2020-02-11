const { PdfReader } = require('pdfreader');
const {
    NEW_LINE_KEYWORD
} = require('../constants/keywords');

class Parser {
    constructor(isInStr) {
        this.isInStr = isInStr;
        if (isInStr)
            this.docData = '';
        else
            this.docData = []
    }

    static firstWord(str, index = 0) {
        str = str.slice(index);
        let result;
        str.split(' ').forEach(item => {
            if (item && !result)
                result = item;
        });
        return result;
    }

    static deleteToWord(str, word, includingWord = true) {
        return includingWord ? str.slice(str.indexOf(word) + word.length) : str.slice(str.indexOf(word));
    }

    static firstNumber(str, index = 0) {
        str = str.slice(index);
        let result = '';
        let firstNumberWas= false;
        let endOfNumber = false;
        Array.from(str).forEach(item => {
            if (item >= '0' && item <= '9') {
                firstNumberWas = true;
                if (firstNumberWas && !endOfNumber) {
                    result += item;
                }
            } else if (firstNumberWas)
                endOfNumber = true;
        });
        return result;
    }

    static reverseStr(str) {
        return str.split('').reverse().join('');
    }

    static getRightKeyword(str, keywords) {
        let keyword = '';
        keywords.forEach(item => {
            if (str.indexOf(item) >= 0 && !keyword)
                keyword = item
        });
        return keyword;
    }

    static firstStrBeforeComma(str) {
        return str.split(',')[0]
    }

    // static firstWordInQuotes(str) {
    //     let result = '';
    //     let firstQuoteWas = false;
    //     Array.from(str).forEach(item => {
    //         if (item === '"') {
    //             firstQuoteWas = !result;
    //         } else if (firstQuoteWas)
    //             result += item;
    //     });
    //     return result;
    // }

    async parseDoc(docPath) {
        return new Promise((resolve, reject) => {
            new PdfReader().parseFileItems(docPath, (err, item) => {
                if (err) {
                    reject(err);
                }
                if (!item) {  // end of doc
                    resolve();
                } else if (item.text) {
                    if (this.isInStr) {
                        this.docData += item.text;
                    }
                    else
                        this.docData.push(item)
                }
            });
        })
    }
}
module.exports = Parser;
