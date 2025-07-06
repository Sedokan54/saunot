import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCustomToken
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
    throw error;
  }
};

// Login with Firebase
export const loginWithFirebase = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if email is verified
    if (!userCredential.user.emailVerified) {
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