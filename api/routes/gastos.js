const express = require('express');
const router = express.Router();
const { crear, listar, eliminar } = require('../controllers/gastosController');
const auth = require('../middleware/auth');

router.post('/', auth, crear);
router.get('/', auth, listar);
router.delete('/:id', auth, eliminar);

module.exports = router;
