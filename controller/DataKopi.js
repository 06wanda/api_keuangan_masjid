const { PrismaClient } = require('@prisma/client') //untuk konek database
const { json } = require('express')
const prisma = new PrismaClient()

exports.inputDataKopi = async (req, res) => {
    try {
        const data = JSON.parse(req.body.data)
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

exports.getDataKopi = async (req, res)=> {

    try {
        const query = await prisma.data_kopi.findMany({}) //findmany untuk menampilkan kaya select*
        if(query.length < 0) return res.json({status: false, msg: 'tidak ada data kopo!!!!'})
        res.json({
            status: true,
            msg: 'Berhasil mengambil data',
            data: query
        })
    } catch (error) {
        res.json({
            status: false,
            msg: 'Terjadi kesalahan Pada Server!!'
        })
    }
}

exports.getDataById = async (req, res) => {
    try {
        const query = await prisma.data_kopi.findUnique({//untuk menampilkan satu data saja memekai finduniq
            where: {
                id: Number(req.params.id)
            }
        })
        if(!query) return res.json({status: false, msg: `Data dengan id => ${req.params.id} tidak ditemukan!!`})
        res.json({
            status: true, 
            msg: 'Berhasil mengambil data',
            data: query
    })
    } catch (error) {
        res.json({
            status: false,
            msg: 'Terjadi kesalahan Pada Server!!'
        })
    }
}

exports.hapusDataKopi = async (req, res) => {
    try {
        const query = await prisma.data_kopi.delete({
            where: {
                id: Number(req.params.id)
            }
        })
        res.json({
            status: true,
            msg: `Data dengan id => ${req.params.id} Berhasil di hapus`
        })
    } catch (error) {
        res.json({
            status: false,
            msg: 'Terjadi kesalahan Pada Server!!'
        })
    }
}

exports.updateKopi = async (req, res) => {
    try {
        const data = JSON.parse(req.body.data)
        if(req.file){
            data.gambar = req.file.filename
        }
        // console.log(data) //buat cek codingan
        await prisma.data_kopi.update({
            where: {
                id: Number(req.params.id)
            },
            data: data
        })
        res.json({
            status: true,
            msg: 'Berhasil Merubah Data '
        })
    } catch (error) {
        res.json({
            status: false,
            msg: 'Terjadi kesalahan Pada Server!!'
        })
    }
}