const express = require('express');
const router = express.Router();
const { resumen, dia } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/', auth, resumen);
router.get('/dia', auth, dia);

module.exports = router;
