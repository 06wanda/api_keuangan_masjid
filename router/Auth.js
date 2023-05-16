const router = require('express').Router()
const controller = require('../controller/Auth')


router.post('/registrasi', controller.registrasiUser)

module.exports = router