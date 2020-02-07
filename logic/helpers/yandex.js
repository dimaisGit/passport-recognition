const axios = require('axios');

const getImprovedText = async text => {
    const response = await axios.get(`https://speller.yandex.net/services/spellservice.json/checkTexts?text=${encodeURI(text)}`); //if there is no errors in request it returns array of detected blots with their positions
    return replaceWithResponse(text, response);
};

const replaceWithResponse = (destinationStr, response) => {
    const [ source ] = response.data;
    source.forEach(item => {
        const [ replacement ] = item.s;
        destinationStr = destinationStr.replace(item.word, replacement);
    });
    return destinationStr;
};

module.exports = {
    getImprovedText,
    replaceWithResponse
};