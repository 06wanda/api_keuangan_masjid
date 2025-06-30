const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt')

// === CRUD MASJID ===

// Tambah Masjid
exports.tambahMasjid = async (req, res) => {
    try {
        const data = req.body

        await prisma.masjid.create({
            data: data
        })

        res.json({
            status: true,
            msg: 'Masjid berhasil ditambahkan'
        })

    } catch (error) {
        console.error(error)
        res.json({
            status: false,
            msg: 'Terjadi kesalahan pada server'
        })
    }
}

// Ambil semua data masjid
exports.getMasjid = async (req, res) => {
    try {
        const masjid = await prisma.masjid.findMany({})
        res.json({
            status: true,
            data: masjid
        })
    } catch (error) {
        res.json({
            status: false,
            msg: 'Terjadi kesalahan pada server'
        })
    }
}

// === CRUD USERS PENGURUS ===

// Tambah User (pengurus)
exports.registrasiPengurus = async (req, res) => {
    try {
        const data = req.body

        // Hash password
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(data.password, salt)
        data.password = hash

        await prisma.users.create({
            data: {
                username: data.username,
                password: data.password,
                no_hp: data.no_hp,
                id_masjid: data.id_masjid,
                role: data.role,  // pastikan role = 'pengurus'
                must_change_password: data.must_change_password,
            }
        })

        res.json({
            status: true,
            msg: 'Pengurus berhasil ditambahkan'
        })

    } catch (error) {
        console.error(error)
        res.json({
            status: false,
            msg: 'Terjadi kesalahan pada server'
        })
    }
}

// Ambil semua User Pengurus

exports.getPengurus = async (req, res) => {
  try {
    const pengurus = await prisma.users.findMany({
      where: {
        role: 'pengurus'
      },
      include: {
        masjid: true
      }
    })

    res.json({
      status: true,
      data: pengurus
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: false,
      message: 'Gagal mengambil data pengurus'
    })
  }
}


// Hapus user pengurus
exports.hapusPengurus = async (req, res) => {
    try {
        await prisma.users.delete({
            where: {
                id_user: Number(req.params.id)
            }
        })

        res.json({
            status: true,
            msg: 'Pengurus berhasil dihapus'
        })

    } catch (error) {
        console.error(error)
        res.json({
            status: false,
            msg: 'Terjadi kesalahan pada server'
        })
    }
}

exports.updatePengurus = async (req, res) => {
  try {
    const data = req.body;

    const cleanData = {
      username: data.username,
      tanggal_transaksi: new Date(data.tanggal_transaksi), // convert ke Date
      nominal: Number(data.nominal), // pastikan ini number
      keterangan: data.keterangan,
    };

    if (req.file) {
      cleanData.bukti = req.file.filename;
    }

    console.log(cleanData); // Debugging

    await prisma.data_keuangan.update({
      where: {
        id_transaksi: Number(req.params.id), // sesuai schema
      },
      data: cleanData,
    });

    res.json({
      status: true,
      msg: 'Berhasil Merubah Data',
    });
  } catch (error) {
    console.error(error); // tampilkan detail error
    res.status(500).json({
      status: false,
      msg: 'Terjadi kesalahan pada server',
    });
  }
};


