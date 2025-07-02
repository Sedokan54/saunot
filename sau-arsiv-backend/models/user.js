const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Ad gerekli'],
    trim: true,
    maxlength: [50, 'Ad 50 karakterden uzun olamaz']
  },
  lastName: {
    type: String,
    required: [true, 'Soyad gerekli'],
    trim: true,
    maxlength: [50, 'Soyad 50 karakterden uzun olamaz']
  },
  email: {
    type: String,
    required: [true, 'E-posta adresi gerekli'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@ogr\.sakarya\.edu\.tr$/, 'Sadece @ogr.sakarya.edu.tr uzantılı e-posta adresleri kabul edilir']
  },
  password: {
    type: String,
    required: [true, 'Şifre gerekli'],
    minlength: [8, 'Şifre en az 8 karakter olmalı'],
    select: false
  },
  studentNumber: {
    type: String,
    sparse: true,
    unique: true,
    match: [/^[BG]\d{9}$/, 'Geçersiz öğrenci numarası formatı']
  },
  department: {
    type: String,
    required: [true, 'Bölüm seçimi gerekli'],
    enum: ['bilgisayar', 'elektrik', 'makine', 'endustri', 'insaat', 'tip', 'isletme', 'hukuk', 'egitim', 'fen-edebiyat']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  profilePicture: {
    type: String,
    default: null
  },
  uploadedDocuments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  favoriteDocuments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Password hash middleware
userSchema.pre('save', async function(next) {
  // Sadece şifre değiştiğinde hash'le
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Şifre doğrulama metodu
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// JWT token oluşturma
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Email doğrulama token'ı oluştur
userSchema.methods.getEmailVerificationToken = function() {
  // Random token oluştur
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash'le ve kaydet
  this.emailVerificationToken = bcrypt.hashSync(verificationToken, 10);
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 saat
  
  return verificationToken;
};

// Şifre sıfırlama token'ı oluştur
userSchema.methods.getResetPasswordToken = function() {
  // Random token
  const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Hash'le ve kaydet
  this.resetPasswordToken = bcrypt.hashSync(resetToken, 10);
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 saat
  
  return resetToken;
};

// Virtual field for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hassas bilgileri çıkar
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpire;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);