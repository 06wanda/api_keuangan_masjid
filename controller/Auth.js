const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

//  Registrasi User
exports.registrasiUser = async (req, res) => {
  try {
    const data = req.body;

    // Cek apakah username sudah terdaftar
    const cekUser = await prisma.users.findUnique({
      where: { username: data.username },
    });

    if (cekUser) {
      return res.json({
        status: false,
        msg: 'Username sudah digunakan!',
      });
    }

    // Validasi masjid wajib dipilih
    if (!data.id_masjid) {
      return res.json({
        status: false,
        msg: 'Masjid harus dipilih!',
      });
    }

    // Enkripsi password
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(data.password, salt);

    // Buat user baru
    const userBaru = await prisma.users.create({
      data: {
        username: data.username,
        password: hashPassword,
        no_hp: data.no_hp || null,
        role: data.role || 'pengurus',
        id_masjid: parseInt(data.id_masjid),
        must_change_password: !!data.must_change_password,
      },
    });

    res.json({
      status: true,
      msg: 'Berhasil registrasi user',
      data: userBaru,
    });

  } catch (error) {
    console.error('Registrasi Error:', error);
    res.status(500).json({
      status: false,
      msg: 'Terjadi kesalahan pada server',
    });
  }
};

// ✅ Ambil Semua Data User
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      include: {
        masjid: true, // jika kamu punya relasi dengan tabel masjid
      },
      orderBy: {
        id_user: 'asc'
      }
    });

    // Jangan tampilkan password ke frontend
    const cleanUsers = users.map(user => {
      const { password, ...rest } = user;
      return rest;
    });

    res.json({
      status: true,
      msg: 'Berhasil mengambil data pengguna',
      data: cleanUsers,
    });

  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({
      status: false,
      msg: 'Terjadi kesalahan pada server',
    });
  }
};

// 3. Tampilkan data pengurus berdasarkan ID
exports.getUserById = async (req, res) => {
  try {
    const pengurus = await prisma.pengurus_masjid.findUnique({
      where: {
        id_pengurus: Number(req.params.id)
      }
    })
    if (!pengurus) {
      return res.json({
        status: false,
        msg: `Pengurus dengan ID ${req.params.id} tidak ditemukan`
      })
    }
    res.json({
      status: true,
      data: pengurus
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: 'Gagal ambil data'
    })
  }
}

// 4. Cari pengurus berdasarkan nama masjid
exports.cariUserMasjid = async (req, res) => {
  try {
    const { nama_masjid } = req.query
    const hasil = await prisma.pengurus_masjid.findMany({
      where: {
        nama_masjid: {
          contains: nama_masjid,
          mode: 'insensitive'
        }
      }
    })
    res.json({
      status: true,
      msg: `Pengurus dari masjid "${nama_masjid}" ditemukan`,
      data: hasil
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: 'Gagal mencari pengurus berdasarkan masjid'
    })
  }
}



exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({ status: false, msg: "Username dan password wajib diisi" });
    }

    const user = await prisma.users.findFirst({ where: { username } });
    if (!user) {
      return res.json({ status: false, msg: "Username tidak terdaftar" });
    }

    const passwordValid = bcrypt.compareSync(password, user.password);
    if (!passwordValid) {
      return res.json({ status: false, msg: "Password salah" });
    }

    // ✅ Simpan user ke dalam session
    req.session.user = {
      id_user: user.id_user,
      username: user.username,
      role: user.role,
      id_masjid: user.id_masjid,
    };
    console.log("✅ User Session Created:", req.session.user);

    return res.json({
      status: true,
      msg: "Berhasil login",
      force_change_password: user.must_change_password,
      data: req.session.user,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ status: false, msg: "Terjadi kesalahan pada server" });
  }
};

// controller/authController.js
// controller/Auth.js
exports.checkSession = (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ status: true, user: req.session.user }); 
  } else {
    return res.status(401).json({ status: false, msg: 'Tidak ada sesi login' }); 
  }
};





exports.gantiPassword = async (req, res) => {
  try {
    const { password } = req.body
    const hashed = bcrypt.hashSync(password, 10)

    await prisma.users.update({
      where: { id_user: Number(req.params.id_user) },
      data: {
        password: hashed,
        must_change_password: false
      }
    })

    res.json({ status: true, msg: 'Password berhasil diganti.' })
  } catch (err) {
    console.error('Gagal ganti password:', err)
    res.status(500).json({ status: false, msg: 'Gagal ganti password' })
  }
}


exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ status: false, msg: 'Gagal logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ status: true, msg: 'Berhasil logout' });
  });
};
