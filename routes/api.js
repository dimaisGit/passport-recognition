const express = require('express');
const router = express.Router();
const Api = require('../controllers/api');

/* GET home page. */
router.post('/passport', Api.parsePassportPdf);
router.post('/compare_pl_invoice_supply', Api.compareDocs);

module.exports = router;
