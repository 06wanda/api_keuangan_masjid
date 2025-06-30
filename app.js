const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const cors = require('cors');
const session = require('express-session');

// 1️⃣ Atur CORS dulu
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));

// 2️⃣ Baru Session
app.use(session({
  secret: 'rahasia-wanda',
  resave: false,
  saveUninitialized: false,
  cookie: {
  httpOnly: true,
  secure: true,        // ✅ WAJIB true karena Railway pakai HTTPS
  sameSite: 'none',    // ✅ supaya cookie bisa lintas origin
  maxAge: 24 * 60 * 60 * 1000
}

}));

// 3️⃣ Parsing body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ api: 'Wanda' });
});

// 4️⃣ Route static dan lainnya
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/users', require('./router/Auth'));
app.use('/data_keuangan', require('./router/DataTransaksi'));
app.use('/data_aset', require('./router/DataAset'));
app.use('/admin', require('./router/AdminMasjid'));
app.use('/laporan', require('./router/Laporan'));

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
