const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, studentNumber, department } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi zaten kayıtlı'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      studentNumber,
      department
    });

    // Generate email verification token
    const verifyToken = user.getEmailVerificationToken();
    await user.save();

    // Send verification email
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}&email=${email}`;
    const message = `
      <h1>Hoş Geldiniz ${firstName}!</h1>
      <p>SAU Arşiv'e kayıt olduğunuz için teşekkürler.</p>
      <p>Hesabınızı aktifleştirmek için lütfen aşağıdaki butona tıklayın:</p>
      <a href="${verifyUrl}" style="background-color: #144182; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">E-postamı Doğrula</a>
      <p>Veya bu linki kopyalayıp tarayıcınıza yapıştırın:</p>
      <p>${verifyUrl}</p>
      <p>Bu link 24 saat geçerlidir.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'SAU Arşiv - E-posta Doğrulama',
        message
      });

      res.status(201).json({
        success: true,
        message: 'Kayıt başarılı! E-posta adresinize doğrulama linki gönderildi.'
      });
    } catch (emailError) {
      // Detaylı hata logu
      console.error('Email Error Details:', emailError);
      
      // Email gönderilemezse user'ı sil
      await User.findByIdAndDelete(user._id);
      
      return res.status(500).json({
        success: false,
        message: 'E-posta gönderilemedi: ' + emailError.message
      });
    }

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Kayıt sırasında bir hata oluştu'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'E-posta ve şifre gerekli'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz e-posta veya şifre'
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Lütfen önce e-posta adresinizi doğrulayın'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız askıya alınmış. Lütfen destek ekibiyle iletişime geçin.'
      });
    }

    // Check password
    const isPasswordMatched = await user.matchPassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz e-posta veya şifre'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        department: user.department,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş sırasında bir hata oluştu'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Create reset url
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`;

    const message = `
      <h1>Şifre Sıfırlama Talebi</h1>
      <p>Merhaba ${user.firstName},</p>
      <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
      <a href="${resetUrl}" style="background-color: #144182; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Şifremi Sıfırla</a>
      <p>Veya bu linki kopyalayıp tarayıcınıza yapıştırın:</p>
      <p>${resetUrl}</p>
      <p>Bu link 1 saat geçerlidir.</p>
      <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'SAU Arşiv - Şifre Sıfırlama',
        message
      });

      res.status(200).json({
        success: true,
        message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi'
      });
    } catch (emailError) {
      console.error('Email Error Details:', emailError);
      
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: 'E-posta gönderilemedi: ' + emailError.message
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;

    // Find user with valid token
    const user = await User.findOne({
      email,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş token'
      });
    }

    // Check if token matches
    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Şifreniz başarıyla değiştirildi'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Şifre sıfırlanırken bir hata oluştu'
    });
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.body;

    const user = await User.findOne({
      email,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş doğrulama linki'
      });
    }

    // Check if token matches
    const isTokenValid = await bcrypt.compare(token, user.emailVerificationToken);
    if (!isTokenValid) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz doğrulama kodu'
      });
    }

    // Verify email
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'E-posta adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz.'
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'E-posta doğrulanırken bir hata oluştu'
    });
  }
};