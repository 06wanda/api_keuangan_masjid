const router = require('express').Router()
const controller = require('../controller/DataTransaksi')
const multer = require('multer')

const gambar = multer.diskStorage({
    filename: async function (req,file, cb){
        let ext = file.originalname.substring(
            file.originalname.lastIndexOf("."),
            file.originalname.length
        )
        cb(null, Date.now() + ext)
    },
    destination: async function (req, file, cb) {
        cb(null, './public/img')
    }
})

const uploadImg = multer({ storage: gambar }).single("bukti")

router.post('/input', uploadImg, controller.inputDataTransaksi)
router.get('/get-data', controller.getDataTransaksi) //metode get untuk menampilkan data
router.get('/get-data/:id', controller.getDataById)
router.delete('/delete-transaksi/:id', controller.hapusDataTransaksi)
router.put('/update-transaksi/:id', uploadImg, controller.updateTransaksi)

module.exports = router