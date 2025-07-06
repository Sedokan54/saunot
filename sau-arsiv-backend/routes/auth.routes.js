const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  verifyEmail,
  getProfile
} = require('../controllers/firebase-auth.controller');

// Validation middleware (opsiyonel - daha sonra ekleyebiliriz)
const validateRegister = (req, res, next) => {
  const { firstName, lastName, email, password, department } = req.body;
  
  if (!firstName || !lastName || !email || !password || !department) {
    return res.status(400).json({
      success: false,
      message: 'Tüm alanlar zorunludur'
    });
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@ogr\.sakarya\.edu\.tr$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Sadece @ogr.sakarya.edu.tr uzantılı e-posta adresleri kabul edilir'
    });
  }
  
  // Password validation
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Şifre en az 8 karakter olmalı'
    });
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return res.status(400).json({
      success: false,
      message: 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermeli'
    });
  }
  
  next();
};

// Routes
router.post('/register', validateRegister, register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-email', verifyEmail);
router.get('/profile', getProfile);

module.exports = router;