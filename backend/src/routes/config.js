const express = require('express');
const router = express.Router();
const { perfil, actualizarNombre, actualizarTelefono, cambiarPassword } = require('../controllers/configController');
const auth = require('../middleware/auth');

router.get('/', auth, perfil);
router.put('/nombre', auth, actualizarNombre);
router.put('/telefono', auth, actualizarTelefono);
router.put('/password', auth, cambiarPassword);

module.exports = router;
