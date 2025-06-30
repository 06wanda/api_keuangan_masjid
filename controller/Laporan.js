// ⬅️ Tambahkan ini di paling atas
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.laporanAktivitas = async (req, res) => {
  try {
    const { bulan, tahun } = req.query;

    if (!tahun) {
      return res.status(400).json({ error: "Tahun wajib diisi!" });
    }

    const awalBulan = bulan
      ? new Date(tahun, bulan - 1, 1)
      : new Date(tahun, 0, 1);
    const akhirBulan = bulan
      ? new Date(tahun, bulan, 0, 23, 59, 59)
      : new Date(tahun, 11, 31, 23, 59, 59);

    const idMasjid = req.session?.user?.id_masjid || 1;

    // ✅ Ambil data keuangan
    const data = await prisma.data_keuangan.findMany({
      where: {
        id_masjid: idMasjid,
        tanggal_transaksi: { gte: awalBulan, lte: akhirBulan },
      },
    });

    const result = {
      tidak_terikat: {
        pemasukan: 0,
        pengeluaran: 0,
        rincian_pendapatan: [],
        rincian_beban: [],
        total_pendapatan: 0,
        total_beban: 0,
      },
      terikat: {
        pemasukan: 0,
        pengeluaran: 0,
        rincian_pendapatan: [],
        rincian_beban: [],
        total_pendapatan: 0,
        total_beban: 0,
      },
    };

    data.forEach((tx) => {
      tx.jenis_transaksi = tx.jenis_transaksi?.toLowerCase();
      tx.sumber_dana = tx.sumber_dana?.toLowerCase();

      if (tx.sumber_dana && tx.jenis_transaksi && result[tx.sumber_dana]) {
        result[tx.sumber_dana][tx.jenis_transaksi] += Number(tx.nominal || 0);
      }
    });

    const rekap = (list, jenis, sumber) => {
      const kelompok = {};
      list
        .filter((tx) => tx.jenis_transaksi === jenis && tx.sumber_dana === sumber)
        .forEach((tx) => {
          const key = tx.kategori || tx.keterangan || "Tanpa Kategori";
          kelompok[key] = (kelompok[key] || 0) + Number(tx.nominal || 0);
        });
      return Object.entries(kelompok).map(([nama, jumlah]) => ({ nama, jumlah }));
    };
    result.tidak_terikat.rincian_pendapatan = rekap(data, "pemasukan", "tidak_terikat");
    result.tidak_terikat.rincian_beban = rekap(data, "pengeluaran", "tidak_terikat");
    result.terikat.rincian_pendapatan = rekap(data, "pemasukan", "terikat");
    result.terikat.rincian_beban = rekap(data, "pengeluaran", "terikat");

    result.tidak_terikat.total_pendapatan = result.tidak_terikat.pemasukan;
    result.tidak_terikat.total_beban = result.tidak_terikat.pengeluaran;
    result.terikat.total_pendapatan = result.terikat.pemasukan;
    result.terikat.total_beban = result.terikat.pengeluaran;

    const surplus = {
      tidak_terikat: result.tidak_terikat.pemasukan - result.tidak_terikat.pengeluaran,
      terikat: result.terikat.pemasukan - result.terikat.pengeluaran,
    };
    
    // ✅ Ambil nilai dari tabel ASET untuk penghasilan_komprehensif_lain
   // ✅ Ambil nilai dari tabel ASET untuk penghasilan_komprehensif_lain
const totalAsetDonasi = await prisma.aset.aggregate({
  _sum: { nilai_aset: true },
  where: {
    id_masjid: idMasjid,
    tanggal_perolehan: {
      gte: awalBulan,
      lte: akhirBulan,
    },
    sumber_aset: "donasi", // ⚡ Hanya yang sumber_aset-nya 'donasi'
  },
});

const penghasilan_komprehensif_lain = Number(totalAsetDonasi._sum.nilai_aset || 0);

    res.json({
      status: "success",
      bulan: bulan || null,
      tahun,
      result,
      surplus,
      penghasilan_komprehensif_lain,
    });
  } catch (err) {
    console.error("❌ Laporan Error:", err);
    res.status(500).json({ error: "Gagal memproses laporan aktivitas" });
  }
};



exports.laporanPosisiKeuangan = async (req, res) => {
  try {
    const tahun = req.query.tahun;
    if (!tahun) return res.status(400).json({ error: "Tahun wajib diisi" });

    const idMasjid = req.session?.user?.id_masjid || 1;
    const awalTahun = new Date(`${tahun}-01-01T00:00:00`);
    const akhirTahun = new Date(`${parseInt(tahun) + 1}-01-01T00:00:00`);

    // === SALDO KAS (LANCAR) ===
    const [pemasukanTidakTerikat, pengeluaranTidakTerikat] = await Promise.all([
      prisma.data_keuangan.aggregate({
        _sum: { nominal: true },
        where: {
          id_masjid: idMasjid,
          sumber_dana: "tidak_terikat",
          jenis_transaksi: "Pemasukan",
          tanggal_transaksi: { lt: akhirTahun },
        },
      }),
      prisma.data_keuangan.aggregate({
        _sum: { nominal: true },
        where: {
          id_masjid: idMasjid,
          sumber_dana: "tidak_terikat",
          jenis_transaksi: "Pengeluaran",
          tanggal_transaksi: { lt: akhirTahun },
        },
      }),
    ]);

    const saldoTidakTerikat = Number(pemasukanTidakTerikat._sum.nominal || 0) - Number(pengeluaranTidakTerikat._sum.nominal || 0);

    const [pemasukanTerikat, pengeluaranTerikat] = await Promise.all([
      prisma.data_keuangan.aggregate({
        _sum: { nominal: true },
        where: {
          id_masjid: idMasjid,
          sumber_dana: "terikat",
          jenis_transaksi: "Pemasukan",
          tanggal_transaksi: { lt: akhirTahun },
        },
      }),
      prisma.data_keuangan.aggregate({
        _sum: { nominal: true },
        where: {
          id_masjid: idMasjid,
          sumber_dana: "terikat",
          jenis_transaksi: "Pengeluaran",
          tanggal_transaksi: { lt: akhirTahun },
        },
      }),
    ]);

    const saldoTerikat = Number(pemasukanTerikat._sum.nominal || 0) - Number(pengeluaranTerikat._sum.nominal || 0);

    // === ASET TIDAK LANCAR (TETAP) ===
    const [
      asetBaruTidakTerikat, asetBaruTerikat,
      asetLamaTidakTerikat, asetLamaTerikat
    ] = await Promise.all([
      prisma.aset.aggregate({
        _sum: { nilai_aset: true },
        where: {
          id_masjid: idMasjid,
          jenis_aset: 'tidak_lancar',
          sumber_dana: 'tidak_terikat',
          tanggal_perolehan: { lt: akhirTahun },
        },
      }),
      prisma.aset.aggregate({
        _sum: { nilai_aset: true },
        where: {
          id_masjid: idMasjid,
          jenis_aset: 'tidak_lancar',
          sumber_dana: 'terikat',
          tanggal_perolehan: { lt: akhirTahun },
        },
      }),
      prisma.aset_lama.aggregate({
        _sum: { nilai_aset: true },
        where: {
          id_masjid: idMasjid,
          jenis_aset: 'tidak_lancar',
          sumber_dana: 'tidak_terikat',
        },
      }),
      prisma.aset_lama.aggregate({
        _sum: { nilai_aset: true },
        where: {
          id_masjid: idMasjid,
          jenis_aset: 'tidak_lancar',
          sumber_dana: 'terikat',
        },
      }),
    ]);

    const asetTetapTidakTerikat = Number(asetBaruTidakTerikat._sum.nilai_aset || 0) + Number(asetLamaTidakTerikat._sum.nilai_aset || 0);
    const asetTetapTerikat = Number(asetBaruTerikat._sum.nilai_aset || 0) + Number(asetLamaTerikat._sum.nilai_aset || 0);
    const totalAsetTidakLancar = asetTetapTidakTerikat + asetTetapTerikat;

    // === LIABILITAS ===
    const liabilitas = await prisma.aset.aggregate({
      _sum: { nilai_sisa: true },
      where: {
        id_masjid: idMasjid,
        status_pembayaran: { in: ["belum_lunas", "tidak_lunas"] },
        tanggal_perolehan: { lt: akhirTahun },
      },
    });

    const totalLiabilitasJangkaPendek = Number(liabilitas._sum.nilai_sisa || 0);
    const totalLiabilitasJangkaPanjang = 0; // jika belum ada pemisahan
    const totalLiabilitas = totalLiabilitasJangkaPendek + totalLiabilitasJangkaPanjang;

    // === TOTAL & ASET NETO ===
    const totalAsetLancar = saldoTidakTerikat + saldoTerikat;
    const totalAset = totalAsetLancar + totalAsetTidakLancar;

    const asetNetoTidakTerikat = saldoTidakTerikat + asetTetapTidakTerikat;
    const asetNetoTerikat = saldoTerikat + asetTetapTerikat;
    const totalAsetNeto = asetNetoTidakTerikat + asetNetoTerikat;

    // === FORMAT LAPORAN ===
    const laporanPosisiKeuangan = {
      aset: {
        lancar: {
          kas_dan_setara_kas: totalAsetLancar,
          piutang: 0,
          persediaan: 0,
          total_aset_lancar: totalAsetLancar,
        },
        tidak_lancar: {
          aset_tetap: totalAsetTidakLancar,
          total_aset_tidak_lancar: totalAsetTidakLancar,
        },
        total_aset: totalAset,
      },
      liabilitas: {
        jangka_pendek: totalLiabilitasJangkaPendek,
        jangka_panjang: totalLiabilitasJangkaPanjang,
        total_liabilitas: totalLiabilitas,
      },
      aset_neto: {
        tidak_terikat: asetNetoTidakTerikat,
        terikat: asetNetoTerikat,
        total_aset_neto: totalAsetNeto,
      },
      total_liabilitas_dan_aset_neto: totalLiabilitas + totalAsetNeto,
    };

    res.json({ status: "success", tahun, laporanPosisiKeuangan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal membuat laporan posisi keuangan" });
  }
};




exports.laporanPerubahanAsetNeto = async (req, res) => {
  try {
    const tahun = Number(req.query.tahun);
    const idMasjid = req.session?.user?.id_masjid || 1;
    if (!tahun) return res.status(400).json({ error: "Parameter tahun tidak valid." });

    let saldoAwalTidakTerikat = 0;
    let saldoAwalTerikat = 0;

    // 🔁 Aset lama
    const asetLama = await prisma.aset_lama.findMany({ where: { id_masjid: idMasjid } });
    for (const item of asetLama) {
      if (item.kategori_aset === "tidak_terikat") {
        saldoAwalTidakTerikat += Number(item.nilai_aset);
      } else if (item.kategori_aset === "terikat") {
        saldoAwalTerikat += Number(item.nilai_aset);
      }
    }

    // 🔁 Aset baru sebelum tahun ini
    const asetSebelumnya = await prisma.aset.findMany({
      where: {
        id_masjid: idMasjid,
        tanggal_perolehan: { lt: new Date(`${tahun}-01-01`) },
      },
    });
    for (const item of asetSebelumnya) {
      if (item.kategori_aset === "tidak_terikat") {
        saldoAwalTidakTerikat += Number(item.nilai_aset);
      } else if (item.kategori_aset === "terikat") {
        saldoAwalTerikat += Number(item.nilai_aset);
      }
    }

    // 🔁 Surplus tahun-tahun SEBELUM tahun ini
    const transaksiSebelumnya = await prisma.data_keuangan.findMany({
      where: {
        id_masjid: idMasjid,
        tanggal_transaksi: {
          lt: new Date(`${tahun}-01-01`),
        },
      },
    });

    let surplusAkumulasiTidakTerikat = 0;
    let surplusAkumulasiTerikat = 0;

    for (const item of transaksiSebelumnya) {
      const nominal = Number(item.nominal);
      if (item.sumber_dana === "tidak_terikat") {
        surplusAkumulasiTidakTerikat += item.jenis_transaksi === "Pemasukan" ? nominal : -nominal;
      } else if (item.sumber_dana === "terikat") {
        surplusAkumulasiTerikat += item.jenis_transaksi === "Pemasukan" ? nominal : -nominal;
      }
    }

    // ✅ Tambahkan surplus sebelumnya ke saldo awal
    saldoAwalTidakTerikat += surplusAkumulasiTidakTerikat;
    saldoAwalTerikat += surplusAkumulasiTerikat;

    // 🔁 Surplus tahun ini
    const transaksiTahunIni = await prisma.data_keuangan.findMany({
      where: {
        id_masjid: idMasjid,
        tanggal_transaksi: {
          gte: new Date(`${tahun}-01-01`),
          lt: new Date(`${tahun + 1}-01-01`),
        },
      },
    });

    let surplusTidakTerikat = 0;
    let surplusTerikat = 0;

    for (const item of transaksiTahunIni) {
      const nominal = Number(item.nominal);
      if (item.sumber_dana === "tidak_terikat") {
        surplusTidakTerikat += item.jenis_transaksi === "Pemasukan" ? nominal : -nominal;
      } else if (item.sumber_dana === "terikat") {
        surplusTerikat += item.jenis_transaksi === "Pemasukan" ? nominal : -nominal;
      }
    }

    // 🔁 Tambahan aset tetap tahun berjalan
    const asetBaruTahunIni = await prisma.aset.findMany({
      where: {
        id_masjid: idMasjid,
        tanggal_perolehan: {
          gte: new Date(`${tahun}-01-01`),
          lt: new Date(`${tahun + 1}-01-01`),
        },
      },
    });

    let nilaiAsetPembelianTidakTerikat = 0;
    let nilaiAsetPembelianTerikat = 0;

    for (const item of asetBaruTahunIni) {
      if (item.kategori_aset === "tidak_terikat") {
        nilaiAsetPembelianTidakTerikat += Number(item.nilai_aset);
      } else if (item.kategori_aset === "terikat") {
        nilaiAsetPembelianTerikat += Number(item.nilai_aset);
      }
    }

    // ✅ Perhitungan akhir: tambahkan pembelian aset ke saldo akhir
    const saldoAkhirTidakTerikat =
      saldoAwalTidakTerikat + surplusTidakTerikat + nilaiAsetPembelianTidakTerikat;

    const saldoAkhirTerikat =
      saldoAwalTerikat + surplusTerikat + nilaiAsetPembelianTerikat;

    const totalAsetNeto = saldoAkhirTidakTerikat + saldoAkhirTerikat;
    console.log({
  saldoAwalTerikat,
  surplusTerikat,
  nilaiAsetPembelianTerikat,
  saldoAkhirTerikat
});


    res.json({
      status: "success",
      data: {
        saldoAwalTidakTerikat,
        surplusTidakTerikat,
        nilaiAsetPembelianTidakTerikat,
        saldoAkhirTidakTerikat,

        saldoAwalTerikat,
        surplusTerikat,
        nilaiAsetPembelianTerikat,
        saldoAkhirTerikat,

        totalAsetNeto,
        
      },
    });
  } catch (error) {
    console.error("❌ Laporan Error:", error);
    res.status(500).json({ error: "Gagal memproses laporan perubahan aset neto" });
  }
};

exports.laporanArusKas = async (req, res) => {
  try {
    const { tahun } = req.query;
    if (!tahun) {
      return res.status(400).json({ error: "Tahun wajib diisi!" });
    }

    const awalTahun = new Date(`${tahun}-01-01`);
    const akhirTahun = new Date(`${tahun}-12-31T23:59:59`);
    const idMasjid = req.session?.user?.id_masjid || 1;

    // Ambil data keuangan di tahun tertentu
    const data = await prisma.data_keuangan.findMany({
      where: {
        id_masjid: idMasjid,
        tanggal_transaksi: { gte: awalTahun, lte: akhirTahun },
      },
    });

    const jenisKas = {
      Operasi: { pemasukan: 0, pengeluaran: 0, rincian: [] },
      Inventaris: { pemasukan: 0, pengeluaran: 0, rincian: [] },
      Pendanaan: { pemasukan: 0, pengeluaran: 0, rincian: [] },
    };

    data.forEach((tx) => {
      const jenis = tx.jenis_transaksi?.toLowerCase(); // pemasukan / pengeluaran
      const klasifikasi = tx.klasifikasi_kas || "Operasi";

      const key = klasifikasi in jenisKas ? klasifikasi : "Operasi";
      const obj = {
        nama: tx.kategori || tx.keterangan || "Tanpa Kategori",
        jumlah: Number(tx.nominal || 0),
        jenis: tx.jenis_transaksi,
      };

      if (jenis === "pemasukan") {
        jenisKas[key].pemasukan += obj.jumlah;
      } else if (jenis === "pengeluaran") {
        jenisKas[key].pengeluaran += obj.jumlah;
      }

      jenisKas[key].rincian.push(obj);
    });

    // Hitung total kas bersih dari tiap aktivitas
    const kasOperasional = jenisKas.Operasi.pemasukan - jenisKas.Operasi.pengeluaran;
    const kasInvestasi = jenisKas.Inventaris.pemasukan - jenisKas.Inventaris.pengeluaran;
    const kasPendanaan = jenisKas.Pendanaan.pemasukan - jenisKas.Pendanaan.pengeluaran;
    const totalKasBersih = kasOperasional + kasInvestasi + kasPendanaan;

    // Hitung kas awal tahun dari transaksi sebelum tahun tersebut
    const transaksiAwal = await prisma.data_keuangan.findMany({
      where: {
        id_masjid: idMasjid,
        tanggal_transaksi: { lt: awalTahun },
      },
    });

    let kasAwalTahun = 0;
    transaksiAwal.forEach((tx) => {
      if (tx.jenis_transaksi === "Pemasukan") kasAwalTahun += Number(tx.nominal || 0);
      else if (tx.jenis_transaksi === "Pengeluaran") kasAwalTahun -= Number(tx.nominal || 0);
    });

    const kasAkhirTahun = kasAwalTahun + totalKasBersih;

    res.json({
      status: "success",
      tahun,
      kas_awal_tahun: kasAwalTahun,
      kas_operasional: kasOperasional,
      kas_investasi: kasInvestasi,
      kas_pendanaan: kasPendanaan,
      total_kas_bersih: totalKasBersih,
      kas_akhir_tahun: kasAkhirTahun,
      rincian: jenisKas,
    });
  } catch (err) {
    console.error("❌ Arus Kas Error:", err);
    res.status(500).json({ error: "Gagal memproses laporan arus kas" });
  }
};
