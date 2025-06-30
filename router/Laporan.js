const router = require('express').Router()
const controller = require('../controller/Laporan')

router.get('/aktivitas', controller.laporanAktivitas)
router.get('/posisi-keuangan', controller.laporanPosisiKeuangan)
router.get('/aset-neto', controller.laporanPerubahanAsetNeto)
router.get('/arus-kas', controller.laporanArusKas)







module.exports = router