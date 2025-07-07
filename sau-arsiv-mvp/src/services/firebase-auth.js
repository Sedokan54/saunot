import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCustomToken,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';

// Register with Firebase
export const registerWithFirebase = async (userData) => {
  try {
    const { email, password } = userData;
    
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send email verification
    await sendEmailVerification(userCredential.user);
    
    // Also register with backend for additional user data
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Registration failed');
    }
    
    return result;
  } catch (error) {
    // Handle email already in use error
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Bu e-posta adresi ile zaten hesabınız bulunuyor. Giriş yapabilir veya şifrenizi sıfırlayabilirsiniz.');
    }
    throw error;
  }
};

// Login with Firebase
export const loginWithFirebase = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Admin user için email verification'ı pas geç
    const isAdmin = email === 'kaanfurkankaya@gmail.com';
    
    // Check if email is verified (admin hariç)
    if (!isAdmin && !userCredential.user.emailVerified) {
      throw new Error('Lütfen önce e-posta adresinizi doğrulayın');
    }
    
    // Get custom token from backend with UID
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uid: userCredential.user.uid })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

// Logout
export const logoutFromFirebase = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Send password reset email
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

// Resend email verification
export const resendEmailVerification = async () => {
  try {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  } catch (error) {
    throw error;
  }
};

// Check if email exists - using create user attempt
export const checkEmailExists = async (email) => {
  try {
    // İlk önce fetchSignInMethods deneyelim (verified emails için)
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    console.log('Sign-in methods for', email, ':', signInMethods);
    
    if (signInMethods.length > 0) {
      return { exists: true, methods: signInMethods };
    }
    
    // Eğer boş ise, unverified email olabilir - createUser ile test edelim
    try {
      await createUserWithEmailAndPassword(auth, email, 'temppass123456');
      
      // Eğer success ise email yok demektir, ama şimdi hesap oluşturduk
      // Hemen silelim
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
      
      return { exists: false };
      
    } catch (createError) {
      console.log('Create user error:', createError.code);
      
      if (createError.code === 'auth/email-already-in-use') {
        return { exists: true };
      }
      
      // Başka hata varsa rethrow
      throw createError;
    }
    
  } catch (error) {
    console.error('checkEmailExists error:', error);
    throw error;
  }
};