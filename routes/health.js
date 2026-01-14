const express = require('express');
const { getHealth } = require('../controllers/health');

const router = express.Router();

router.get('/', getHealth);

module.exports = router;
