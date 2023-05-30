const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')

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
            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(data.password, salt)
            data.password = hash

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

exports.loginUser = async(req, res) => {
    try {
        const data = req.body
        const cekUser = await prisma.users.findFirst({
            where: {
                username: data.username
            }
        })

        if(!cekUser) return res.json({status: false, msg: 'Username tidak terdaftar'})
        if(!bcrypt.compareSync(data.password, cekUser.password)) return res.json({status: false, msg: 'password salah!!!'})
        delete cekUser.password
        res.json({
            status: true,
            msg: 'Berhasil Login',
            data: cekUser
        })
    } catch (error) {
        res.json({
            status: false,
            msg: 'Terjadi kesalahan Pada Server!!'
        })
    }
}