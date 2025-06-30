const express = require('express');
const router = express.Router();
const controller = require('../controller/Auth');

router.post('/registrasi', controller.registrasiUser)
router.post('/login', controller.loginUser)
router.get('/get-users', controller.getAllUsers) //metode get untuk menampilkan data
router.get('/get-users/:id', controller.getUserById)
router.put('/ganti-password/:id_user', controller.gantiPassword)
router.get('/check-session', controller.checkSession)
router.post('/logout', controller.logout);
    



module.exports = router