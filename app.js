const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const cors = require('cors');
const session = require('express-session');

// ✅ CORS Configuration (allow all origins that the browser sends)
app.use(cors({
  origin: true,          // Allow all dynamic origins (Netlify, Railway, localhost, etc.)
  credentials: true      // Allow cookies to be sent
}));

// ✅ Session Configuration
app.use(session({
  secret: 'rahasia-wanda',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // secure true only if in production (Railway/HTTPS)
    sameSite: 'none',      // Allow cross-origin cookies
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// ✅ Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ API routes
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/users', require('./router/Auth'));
app.use('/data_keuangan', require('./router/DataTransaksi'));
app.use('/data_aset', require('./router/DataAset'));
app.use('/admin', require('./router/AdminMasjid'));
app.use('/laporan', require('./router/Laporan'));

// ✅ Serve Vue frontend from /dist (for production build)
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server berjalan di http://localhost:${port}`);
});
