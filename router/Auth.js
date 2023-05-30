const router = require('express').Router()
const controller = require('../controller/Auth')


router.post('/registrasi', controller.registrasiUser)
router.post('/login', controller.loginUser)

module.exports = router