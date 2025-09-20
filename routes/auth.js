const express = require('express');
const router = express.Router();

// Hiển thị form login
router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Login' });
});

// Xử lý login
router.post('/login', (req, res) => {
  // TODO: xử lý login thật với DB
  req.session.userId = 'demoUser';
  res.redirect('/');
});

// Hiển thị form register
router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Register' });
});

// Xử lý register
router.post('/register', (req, res) => {
  // TODO: lưu user vào DB
  res.redirect('/auth/login');
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
