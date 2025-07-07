import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle, RefreshCw, ArrowLeft, GraduationCap, AlertCircle } from 'lucide-react';
import { resendEmailVerification } from '../services/firebase-auth';

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  
  // Get email from location state or props
  const email = location.state?.email || '';

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await resendEmailVerification();
      setEmailSent(true);
    } catch (err) {
      setError('E-posta gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="logo-circle">
            <GraduationCap className="logo-icon" />
          </div>
          <h2>E-posta Doğrulama</h2>
          <p>Hesabınızı etkinleştirmek için e-posta adresinizi doğrulayın</p>
        </div>

        {/* Verification Card */}
        <div className="verification-card">
          <div className="verification-content">
            {/* Email Icon */}
            <div className="email-icon-container">
              <Mail className="email-icon" />
            </div>

            {/* Main Content */}
            <div className="verification-text">
              <h3>E-posta Doğrulama Gerekli</h3>
              <p>
                Hesabınızı güvenli tutmak için e-posta adresinizi doğrulamanız gerekiyor.
                {email && (
                  <>
                    <br />
                    <strong>{email}</strong> adresine gönderilen doğrulama linkine tıklayın.
                  </>
                )}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                <AlertCircle className="error-message-icon" />
                <span className="error-message-text">{error}</span>
              </div>
            )}

            {/* Success Message */}
            {emailSent && (
              <div className="success-message">
                <CheckCircle className="success-icon" />
                <span className="success-text">
                  Doğrulama e-postası başarıyla gönderildi! Lütfen e-posta kutunuzu kontrol edin.
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                onClick={handleResendEmail}
                disabled={isLoading}
                className="resend-btn"
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    Doğrulama E-postası Gönder
                  </>
                )}
              </button>

              <button
                onClick={handleBackToLogin}
                className="back-btn"
              >
                <ArrowLeft className="h-4 w-4" />
                Giriş Sayfasına Dön
              </button>
            </div>

            {/* Instructions */}
            <div className="instructions">
              <h4>📧 E-posta Gelmediyse:</h4>
              <ul>
                <li>Spam/Önemsiz klasörünü kontrol edin</li>
                <li>E-posta adresinizi doğru yazdığınızdan emin olun</li>
                <li>"Doğrulama E-postası Gönder" butonuna tekrar tıklayın</li>
                <li>Birkaç dakika bekleyip tekrar kontrol edin</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="info-footer">
          <p>Bu adım hesabınızın güvenliği için gereklidir</p>
          <p className="copyright">© 2025 SAÜ Arşiv MVP. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;