const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const getRandomString = charCount => {
    let result = '';
    for (let now = 0; now < charCount; now++)
        result += characters[Math.floor(Math.random() * characters.length)];
    return result;
};

module.exports = {
    getRandomString
};