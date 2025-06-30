const { PrismaClient } = require('@prisma/client') //untuk konek database
const { json } = require('express')
const prisma = new PrismaClient()

exports.inputDataTransaksi = async (req, res) => {
  try {
    const data = req.body;
    const idMasjid = req.session?.user?.id_masjid;

    if (!idMasjid || isNaN(idMasjid)) {
      return res.status(400).json({
        status: false,
        msg: 'ID Masjid tidak valid. Silakan login ulang.'
      });
    }

    data.tanggal_transaksi = new Date(data.tanggal_transaksi);
    data.bukti = req.file.filename;

    await prisma.data_keuangan.create({
      data: {
        jenis_transaksi: data.jenis_transaksi,
        tanggal_transaksi: data.tanggal_transaksi,
        kategori: data.kategori || '',
        klasifikasi_kas: data.klasifikasi_kas, // simpan dari frontend
        nominal: parseFloat(data.nominal),
        keterangan: data.keterangan,
        bukti: data.bukti,
        sumber_dana: data.sumber_dana,
        masjid: {
          connect: {
            id_masjid: idMasjid
          }
        }
      }
    });

    res.json({
      status: true,
      msg: 'Berhasil input data Transaksi'
    });
  } catch (error) {
    console.error(error);
    res.json({
      status: false,
      msg: 'Terjadi kesalahan Pada Server!!'
    });
  }
};



exports.getDataTransaksi = async (req, res) => {
  try {
    const role = req.session?.user?.role;
    const idMasjid = req.session?.user?.id_masjid;

    if (!role) {
      return res.status(401).json({ status: false, msg: 'Belum login' });
    }

    // Jika role 'admin' -> Ambil semua data
    // Jika role 'pengurus' -> Filter sesuai id_masjid
    const filter = role === 'admin' 
      ? {} 
      : { id_masjid: idMasjid };
    
    const data = await prisma.data_keuangan.findMany({ where: filter });

    if (data.length === 0) {
      return res.json({ status: false, msg: 'Tidak ada data.' });
    }

    res.json({ status: true, msg: 'Berhasil mengambil data', data });
  } catch (error) {
    console.error(error);
    res.json({ status: false, msg: 'Terjadi kesalahan Pada Server!!' });
  }
};



exports.getDataById = async (req, res) => {
    try {
        const query = await prisma.data_keuangan.findUnique({//untuk menampilkan satu data saja memekai finduniq
            where: {
                id_transaksi: Number(req.params.id)
            }
        })
        if(!query) return res.json({status: false, msg: `Data dengan id_transaksi => ${req.params.id} tidak ditemukan!!`})
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

exports.hapusDataTransaksi = async (req, res) => {
    try {
        const query = await prisma.data_keuangan.delete({
            where: {
                id_transaksi: Number(req.params.id)
            }
        })
        res.json({
            status: true,
            msg: `Data dengan id => ${req.params.id} Berhasil di hapus`
        })
    } catch (error) {
        console.log(error);
        res.json({
            status: false,
            msg: 'Terjadi kesalahan Pada Server!!'
        })
    }
}

exports.updateTransaksi = async (req, res) => {
  try {
    const data = req.body;

    const cleanData = {
      jenis_transaksi: data.jenis_transaksi,
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



// exports.updateTransaksi = async (req, res) => {
//     try {
//         // const data = JSON.parse(req.body.data)
//         const data = req.body
//         if(req.file){
//             data.bukti = req.file.filename
//         }
//                 // console.log(error)

//         console.log(data) //buat cek codingan
//         await prisma.data_keuangan.update({
//             where: {
//                 id: Number(req.params.id_transaksi)
//             },
//             data: data
//         })
//         res.json({
//             status: true,
//             msg: 'Berhasil Merubah Data '
//         })
//     } catch (error) {
//         res.json({
//             status: false,
//             msg: 'Terjadi kesalahan Pada Server!!'
//         })
//     }
// }