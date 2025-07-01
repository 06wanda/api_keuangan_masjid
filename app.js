const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const cors = require('cors');
const session = require('express-session');

// Middleware cek session untuk debug
app.use((req, res, next) => {
  console.log('Session object:', req.session);
  next();
});

// CORS Configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://apikeuanganmasjid-production.up.railway.app' : 'http://localhost:8080',
  credentials: true,
}));


// Session Configuration
app.use(session({
  secret: 'rahasia-wanda',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // hanya HTTPS di production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',  // none untuk cross-origin production, lax untuk development
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API routes
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/users', require('./router/Auth'));
app.use('/data_keuangan', require('./router/DataTransaksi'));
app.use('/data_aset', require('./router/DataAset'));
app.use('/admin', require('./router/AdminMasjid'));
app.use('/laporan', require('./router/Laporan'));

// Serve Vue frontend (production)
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`✅ Server berjalan di http://localhost:${port}`);
});
