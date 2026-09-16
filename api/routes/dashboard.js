const express = require('express');
const router = express.Router();
const { resumen, dia, historial } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/', auth, resumen);
router.get('/dia', auth, dia);
router.get('/historial', auth, historial);

module.exports = router;
