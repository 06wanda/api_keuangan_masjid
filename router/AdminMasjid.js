const router = require('express').Router()
const controller = require('../controller/AdminMasjid')

// --- CRUD MASJID ---
router.post('/masjid', controller.tambahMasjid)
router.get('/masjid', controller.getMasjid)

// --- CRUD USER PENGURUS ---
router.post('/pengurus', controller.registrasiPengurus)
router.get('/pengurus', controller.getPengurus)
router.delete('/delete-pengurus/:id', controller.hapusPengurus)


module.exports = router
