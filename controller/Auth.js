const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.registrasiUser = async (req, res) => {
    try {
        const data = req.body
        const cekUser = await prisma.users.findUnique({
            where: {
                username: data.username
            }
        })
        if (cekUser) {
            res.json({
            status: false, 
            msg:'Username sudah digunakan!!'
            })
        }else{
            const query = await prisma.users.create({
                data : data
            })
            res.json({
                status: true,
                msg: 'Berhasil registrasi'
            })
        }
        
    } catch (error) {
        res.json({
            status: false,
            msg: 'Terjadi kesalahan Pada Server!!'
        })
    }
}