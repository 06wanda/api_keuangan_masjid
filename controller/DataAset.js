        // controller/AsetController.js
        const { PrismaClient } = require("@prisma/client");
        const prisma = new PrismaClient();

        // Tambah Aset
      // Controller/DataAset.js
exports.inputAset = async (req, res) => {
  try {
    const data = req.body;

    // ✅ 1️⃣ Validasi idMasjid dari Session
    const idMasjid = req.session?.user?.id_masjid;

    if (!idMasjid || isNaN(idMasjid)) {
      return res
        .status(400)
        .json({ status: false, msg: "ID Masjid tidak valid atau belum login" });
    }

    // ✅ 2️⃣ Tentukan Kategori Aset
   let kategori_aset;

if (data.sumber_aset === "kas_terikat" || data.sumber_aset === "donasi_barang") {
  kategori_aset = "terikat";
} else {
  kategori_aset = "tidak_terikat";
}


    // ✅ 3️⃣ Simpan Aset ke Database
    await prisma.aset.create({
      data: {
        nama_aset: data.nama_aset,
        jumlah: parseInt(data.jumlah),
        nilai_aset: parseFloat(data.nilai_aset),
        sumber_aset: data.sumber_aset,
        tanggal_perolehan: new Date(data.tanggal_perolehan),
        status_pembayaran: data.status_pembayaran || "lunas",
        nilai_bayar: parseFloat(data.nilai_bayar) || 0,
        nilai_sisa: parseFloat(data.nilai_sisa) || 0,
        jenis_aset: "tidak_lancar",
        kategori_aset: kategori_aset, // ✅ Tambahan ini
        masjid: {
          connect: {
            id_masjid: idMasjid,
          },
        },
      },
    });

    // ✅ 4️⃣ Berikan Response
    res.json({ status: true, msg: "Berhasil input Aset" });
  } catch (error) {
    console.error(error);
    res.json({ status: false, msg: "Terjadi kesalahan pada server!!" });
  }
};




// GET Aset sesuai Role
exports.getDataAset = async (req, res) => {
  try {
    const role = req.session?.user?.role;
    const idMasjid = req.session?.user?.id_masjid;

    if (!role) {
      return res.status(401).json({ status: false, msg: "Belum login" });
    }

    const filter = role === "admin" 
      ? {} 
      : { id_masjid: idMasjid }; // pengurus hanya dapat data masjid-nya

    const data = await prisma.aset.findMany({ where: filter });
    if (!data || data.length === 0) {
      return res.json({ status: false, msg: "Tidak ada data" }); 
    }

    res.json({ status: true, data }); 
  } catch (error) {
    console.error(error);
    res.json({ status: false, msg: "Terjadi kesalahan di server" }); 
  }
};


exports.getDataAsetById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    // ⚡️ 1. Cek apakah id valid
    if (isNaN(id)) {
      return res.status(400).json({ status: false, msg: "ID Aset tidak valid" }); 
    }

    const data = await prisma.aset.findUnique({
      where: { id_aset: id },
    });

    if (!data) {
      return res.json({ status: false, msg: `Data id ${id} tidak ditemukan.` }); 
    }

    res.json({ status: true, data }); 
  } catch (error) {
    console.error(error);
    res.json({ status: false, msg: 'Terjadi kesalahan di server' }); 
  }
};

  // 3️⃣ hapusAset
exports.hapusAset = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const role = req.session?.user?.role;
    const idMasjid = req.session?.user?.id_masjid;

    const aset = await prisma.aset.findUnique({ where: { id_aset: id } });
    if (!aset) {
      return res.json({ status: false, msg: `Aset id ${id} tidak ditemukan.` });
    }

    // Jika bukan admin, cek apakah id_masjid sesuai
    if (role !== 'admin' && aset.id_masjid !== idMasjid) {
      return res.json({ status: false, msg: 'Tidak diizinkan menghapus data ini.' });
    }

    await prisma.aset.delete({ where: { id_aset: id } }); 
    res.json({ status: true, msg: `Aset id ${id} berhasil dihapus.` }); 
  } catch (error) {
    console.error(error);
    res.json({ status: false, msg: 'Terjadi kesalahan di server' }); 
  }
};

// 4️⃣ updateAset
exports.updateAset = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ status: false, msg: "ID Aset tidak valid" });
    }

    const role = req.session?.user?.role;
    const idMasjid = req.session?.user?.id_masjid;

    const aset = await prisma.aset.findUnique({ where: { id_aset: id } });
    if (!aset) {
      return res.json({ status: false, msg: `Aset id ${id} tidak ditemukan.` }); 
    }

    // Jika bukan admin, batasi hanya data dari masjid yang login
    if (role !== 'admin' && aset.id_masjid !== idMasjid) {
      return res.json({ status: false, msg: "Anda tidak memiliki izin untuk memperbarui data ini" }); 
    }

    const data = req.body;

    await prisma.aset.update({
      where: { id_aset: id },
      data: {
        nama_aset: data.nama_aset,
        nilai_aset: parseFloat(data.nilai_aset),
        tanggal_perolehan: new Date(data.tanggal_perolehan),
      },
    }); 

    res.json({ status: true, msg: 'Aset berhasil diupdate' }); 
  } catch (error) {
    console.error(error);
    res.json({ status: false, msg: 'Terjadi kesalahan di server' }); 
  }
};


exports.inputAsetLama = async (req, res) => {
  try {
    const data = req.body;
    const idMasjid = req.session?.user?.id_masjid;

    if (!idMasjid || isNaN(idMasjid)) {
      return res.status(400).json({ status: false, msg: "ID Masjid tidak valid atau belum login" });
    }

    // Set default jenis dan kategori tanpa input dari user
    const jenis_aset = "tidak_lancar";
    const kategori_aset = "tidak_terikat";

    await prisma.aset_lama.create({
      data: {
        nama_aset: data.nama_aset,
        jumlah: parseInt(data.jumlah),
        nilai_aset: parseFloat(data.nilai_aset),
        jenis_aset: jenis_aset,
        kategori_aset: kategori_aset,
        id_masjid: idMasjid,
      },
    });

    res.json({ status: true, msg: "Berhasil input Aset Lama" });
  } catch (error) {
    console.error(error);
    res.json({ status: false, msg: "Terjadi kesalahan pada server!" });
  }
};


// Get semua aset lama sesuai masjid dan role
exports.getDataAsetLama = async (req, res) => {
  try {
    const role = req.session?.user?.role;
    const idMasjid = req.session?.user?.id_masjid;

    if (!role) {
      return res.status(401).json({ status: false, msg: "Belum login" });
    }

    const filter = role === "admin" ? {} : { id_masjid: idMasjid };

    const data = await prisma.aset_lama.findMany({ where: filter });
    if (!data || data.length === 0) {
      return res.json({ status: false, msg: "Tidak ada data" });
    }

    res.json({ status: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: "Terjadi kesalahan di server" });
  }
};

exports.getDataAsetLamaById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    // ⚡️ 1. Cek apakah id valid
    if (isNaN(id)) {
      return res.status(400).json({ status: false, msg: "ID Aset tidak valid" }); 
    }

    const data = await prisma.aset.findUnique({
      where: { id_aset: id },
    });

    if (!data) {
      return res.json({ status: false, msg: `Data id ${id} tidak ditemukan.` }); 
    }

    res.json({ status: true, data }); 
  } catch (error) {
    console.error(error);
    res.json({ status: false, msg: 'Terjadi kesalahan di server' }); 
  }
};
// Update aset lama
exports.updateAsetLama = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ status: false, msg: "ID Aset tidak valid" });
    }

    const role = req.session?.user?.role;
    const idMasjid = req.session?.user?.id_masjid;

    const aset = await prisma.aset_lama.findUnique({ where: { id_aset_lama: id } });
    if (!aset) {
      return res.json({ status: false, msg: `Aset id ${id} tidak ditemukan.` });
    }

    if (role !== "admin" && aset.id_masjid !== idMasjid) {
      return res.json({ status: false, msg: "Anda tidak memiliki izin untuk memperbarui data ini" });
    }

    const data = req.body;

    await prisma.aset_lama.update({
      where: { id_aset_lama: id },
      data: {
        nama_aset: data.nama_aset,
        jumlah: parseInt(data.jumlah),
        nilai_aset: parseFloat(data.nilai_aset),
        jenis_aset: data.jenis_aset || "tidak_lancar",
        kategori_aset: data.kategori_aset || "tidak_terikat",
      },
    });

    res.json({ status: true, msg: "Aset lama berhasil diupdate" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: "Terjadi kesalahan di server" });
  }
};

// Hapus aset lama
exports.hapusAsetLama = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const role = req.session?.user?.role;
    const idMasjid = req.session?.user?.id_masjid;

    if (isNaN(id)) {
      return res.status(400).json({ status: false, msg: "ID Aset tidak valid" });
    }

    const aset = await prisma.aset_lama.findUnique({ where: { id_aset_lama: id } });
    if (!aset) {
      return res.json({ status: false, msg: `Aset id ${id} tidak ditemukan.` });
    }

    if (role !== "admin" && aset.id_masjid !== idMasjid) {
      return res.json({ status: false, msg: "Tidak diizinkan menghapus data ini." });
    }

    await prisma.aset_lama.delete({ where: { id_aset_lama: id } });

    res.json({ status: true, msg: `Aset id ${id} berhasil dihapus.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, msg: "Terjadi kesalahan di server" });
  }
};
