const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const UserController = require('../controllers/user');

router.post('/', auth, UserController.get_user);

router.post('/signup', UserController.signup);

router.post('/login', UserController.login);

router.post('/delete', auth, UserController.user_delete);

module.exports = router;
