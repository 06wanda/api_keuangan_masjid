const { PrismaClient } = require('@prisma/client') //untuk konek database
const prisma = new PrismaClient()

exports.inputDataKopi = async (req, res) => {
    try {
        const data = req.body //req body untuk itu karna mengirim data lewat body
        data.gambar = req.file.filename
        await prisma.data_kopi.create({
            data: data
        })
        res.json({
            status: true,
            msg: 'Berhasil input data kopi'
        })
    } catch (error) {
        res.json({
            status: false,
            msg: 'Terjadi kesalahan Pada Server!!'
        })
    }
}