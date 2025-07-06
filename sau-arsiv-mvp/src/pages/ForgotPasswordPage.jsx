import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, GraduationCap, AlertCircle, ArrowLeft, CheckCircle, Info } from 'lucide-react';
import { authService } from '../services/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email) => {
    const sakaryaEmailRegex = /^[^\s@]+@ogr\.sakarya\.edu\.tr$/;
    return sakaryaEmailRegex.test(email);
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'E-posta adresi gerekli';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Sadece @ogr.sakarya.edu.tr uzantılı e-posta adresleri kabul edilir';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    
    try {
      await authService.forgotPassword(email);
      setIsSuccess(true);
    } catch (error) {
      setErrors({ general: error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="logo-circle">
            <GraduationCap className="logo-icon" />
          </div>
          <h2>Şifremi Unuttum</h2>
          <p>{isSuccess ? 'Şifre sıfırlama bağlantısı gönderildi' : 'Şifrenizi sıfırlamak için e-posta adresinizi girin'}</p>
        </div>

        {/* Form Container */}
        <div className="form-container">
          {isSuccess ? (
            <div>
              {/* Success Message */}
              <div className="success-message">
                <CheckCircle className="success-icon" />
                <h3 className="success-title">E-posta Gönderildi!</h3>
                <p className="success-text">
                  Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi.
                </p>
                <div className="info-box" style={{marginTop: '1rem'}}>
                  <p style={{fontWeight: 'bold', marginBottom: '0.5rem'}}>Lütfen kontrol edin:</p>
                  <ul style={{marginLeft: '1rem', fontSize: '0.875rem'}}>
                    <li>E-posta gelen kutunuzu</li>
                    <li>Spam/gereksiz klasörünü</li>
                    <li>E-posta 5 dakika içinde gelecektir</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="submit-btn"
                style={{marginTop: '1.5rem'}}
              >
                <ArrowLeft className="h-4 w-4" />
                Giriş Sayfasına Dön
              </button>
            </div>
          ) : (
            <div>
              {/* General Error */}
              {errors.general && (
                <div className="error-message">
                  <AlertCircle className="error-message-icon" />
                  <span className="error-message-text">{errors.general}</span>
                </div>
              )}

              {/* Info Box */}
              <div className="info-box">
                <div className="info-content">
                  <Info className="info-icon" />
                  <div>
                    <p style={{fontWeight: '500', marginBottom: '0.25rem'}}>Şifrenizi mi unuttunuz?</p>
                    <p style={{fontSize: '0.75rem', color: '#4b5563'}}>
                      Kayıtlı e-posta adresinizi girin. Size şifre sıfırlama bağlantısı göndereceğiz.
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Sakarya Üniversitesi E-postası</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors({});
                      }
                    }}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="ogrenci@ogr.sakarya.edu.tr"
                  />
                </div>
                {errors.email && (
                  <p className="error-text">{errors.email}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="submit-btn"
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Gönderiliyor...
                  </>
                ) : (
                  'Şifre Sıfırlama Bağlantısı Gönder'
                )}
              </button>

              {/* Back to Login */}
              <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
                <button
                  onClick={() => navigate('/login')}
                  className="link"
                  style={{display: 'inline-flex', alignItems: 'center', gap: '0.25rem'}}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Giriş sayfasına geri dön
                </button>
              </div>

              {/* Divider */}
              <div style={{position: 'relative', margin: '1.5rem 0'}}>
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center'}}>
                  <div style={{width: '100%', borderTop: '1px solid #e5e7eb'}}></div>
                </div>
                <div style={{position: 'relative', display: 'flex', justifyContent: 'center'}}>
                  <span style={{padding: '0 1rem', background: 'white', color: '#6b7280', fontSize: '0.875rem'}}>veya</span>
                </div>
              </div>

              {/* Register Link */}
              <div style={{textAlign: 'center'}}>
                <p style={{fontSize: '0.875rem', color: '#4b5563'}}>
                  Hesabınız yok mu?{' '}
                  <button
                    className="link"
                    onClick={() => navigate('/register')}
                  >
                    Kayıt Ol
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="info-footer">
          <p className="footer-text">Şifre sıfırlama bağlantısı 24 saat geçerlidir</p>
          <p className="copyright">© 2025 SAÜ Arşiv MVP. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;