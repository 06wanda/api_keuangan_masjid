const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const cors = require('cors');
const session = require('express-session');

// ✅ 1. Izinkan frontend lokal dan Netlify (ganti domain Netlify kalau beda)
const allowedOrigins = [
  'http://localhost:8080',
  'https://laporan-keuangan-masjid.netlify.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl/postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ 2. Konfigurasi Session
app.use(session({
  secret: 'rahasia-wanda',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,            // true jika pakai HTTPS (di Railway ✔️)
    sameSite: 'none',         // ✅ TANPA spasi
    maxAge: 24 * 60 * 60 * 1000 // 1 hari
  }
}));

// ✅ 3. Parsing body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ 4. Routing
app.get('/', (req, res) => {
  res.json({ api: 'Wanda' });
});

app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/users', require('./router/Auth'));
app.use('/data_keuangan', require('./router/DataTransaksi'));
app.use('/data_aset', require('./router/DataAset'));
app.use('/admin', require('./router/AdminMasjid'));
app.use('/laporan', require('./router/Laporan'));

// ✅ 5. Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
