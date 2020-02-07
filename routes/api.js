const express = require('express');
const router = express.Router();
const Api = require('../controllers/api');

/* GET home page. */
router.post('/passport', Api.parsePassportPdf);

module.exports = router;
