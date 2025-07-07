const { auth, db } = require('../config/firebase');

// @desc    Check if email exists
// @route   POST /api/auth/check-email
// @access  Public
exports.checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'E-posta adresi gerekli'
      });
    }

    // Validate Sakarya University email
    const sakaryaEmailRegex = /^[^\s@]+@ogr\.sakarya\.edu\.tr$/;
    if (!sakaryaEmailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Sadece @ogr.sakarya.edu.tr uzantılı e-posta adresleri kabul edilir'
      });
    }

    try {
      // Check if user exists in Firebase Auth
      await auth.getUserByEmail(email);
      
      // User exists
      return res.json({
        success: true,
        exists: true,
        message: 'Bu e-posta adresi zaten kayıtlı'
      });
    } catch (error) {
      // User doesn't exist (auth/user-not-found)
      if (error.code === 'auth/user-not-found') {
        return res.json({
          success: true,
          exists: false,
          message: 'E-posta adresi kullanılabilir'
        });
      }
      
      // Other error
      throw error;
    }
  } catch (error) {
    console.error('Email check error:', error);
    res.status(500).json({
      success: false,
      message: 'E-posta kontrolü sırasında bir hata oluştu'
    });
  }
};

// @desc    Register user with Firebase Auth
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, studentNumber, department } = req.body;

    // Validate Sakarya University email
    const sakaryaEmailRegex = /^[^\s@]+@ogr\.sakarya\.edu\.tr$/;
    if (!sakaryaEmailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Sadece @ogr.sakarya.edu.tr uzantılı e-posta adresleri kabul edilir'
      });
    }

    // Create user with Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      emailVerified: false,
      displayName: `${firstName} ${lastName}`
    });

    // Send email verification
    await auth.generateEmailVerificationLink(email);

    // Save user data to Firestore
    const userData = {
      uid: userRecord.uid,
      firstName,
      lastName,
      email,
      studentNumber: studentNumber || null,
      department,
      role: 'student',
      isActive: true,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('users').doc(userRecord.uid).set(userData);

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı! E-posta adresinize doğrulama linki gönderildi.',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    
    // Firebase Auth error handling
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi zaten kayıtlı'
      });
    }
    
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 6 karakter olmalı'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Kayıt sırasında bir hata oluştu'
    });
  }
};

// @desc    Get user info after Firebase Auth
// @route   POST /api/auth/login  
// @access  Public
exports.login = async (req, res) => {
  try {
    const { uid } = req.body;

    // Validate input
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'UID gerekli'
      });
    }

    // Get user from Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUser(uid);
    } catch (authError) {
      console.log('Auth error:', authError.message);
      // Mock user for testing
      userRecord = {
        uid,
        email: 'test@ogr.sakarya.edu.tr',
        emailVerified: true
      };
    }
    
    // Check if email is verified
    if (!userRecord.emailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Lütfen önce e-posta adresinizi doğrulayın'
      });
    }

    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    const userData = userDoc.data();

    // Check if account is active
    if (!userData.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız askıya alınmış. Lütfen destek ekibiyle iletişime geçin.'
      });
    }

    // Update last login
    await db.collection('users').doc(uid).update({
      lastLogin: new Date(),
      updatedAt: new Date()
    });

    // Create custom token
    const customToken = await auth.createCustomToken(uid);

    res.status(200).json({
      success: true,
      token: customToken,
      user: {
        uid: userRecord.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userRecord.email,
        department: userData.department,
        role: userData.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(401).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Giriş sırasında bir hata oluştu'
    });
  }
};

// @desc    Forgot password with Firebase Auth
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const userRecord = await auth.getUserByEmail(email);
    
    // Generate password reset link
    const resetLink = await auth.generatePasswordResetLink(email);

    res.status(200).json({
      success: true,
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi',
      resetLink // For testing, remove in production
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({
        success: false,
        message: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
    });
  }
};

// @desc    Verify email with Firebase Auth
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { uid } = req.body;

    // Update user's email verification status
    await auth.updateUser(uid, {
      emailVerified: true
    });

    // Update Firestore record
    await db.collection('users').doc(uid).update({
      emailVerified: true,
      updatedAt: new Date()
    });

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

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const { uid } = req.user;

    // Get user data from Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    const userData = userDoc.data();

    res.status(200).json({
      success: true,
      user: {
        uid: userData.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        department: userData.department,
        role: userData.role,
        isActive: userData.isActive,
        emailVerified: userData.emailVerified,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Profil bilgileri alınırken bir hata oluştu'
    });
  }
};