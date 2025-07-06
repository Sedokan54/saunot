import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, GraduationCap, AlertCircle, Eye, EyeOff, CheckCircle, Info, KeyRound } from 'lucide-react';
import { authService } from '../services/api';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // URL'den token ve email al
  const resetToken = searchParams.get('token');
  const userEmail = searchParams.get('email');

  useEffect(() => {
    // Token veya email yoksa login sayfasına yönlendir
    if (!resetToken || !userEmail) {
      navigate('/login');
    }
  }, [resetToken, userEmail, navigate]);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Şifre en az 8 karakter olmalı';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermeli';
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Yeni şifre gerekli';
    } else {
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre tekrarı gerekli';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    
    try {
      await authService.resetPassword(resetToken, userEmail, formData.password);
      setIsSuccess(true);
    } catch (error) {
      setErrors({ general: error.message || 'Şifre sıfırlanırken bir hata oluştu. Lütfen tekrar deneyin.' });
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
          <h2>Yeni Şifre Belirle</h2>
          <p>{isSuccess ? 'Şifreniz başarıyla değiştirildi' : `${userEmail} için yeni şifre oluşturun`}</p>
        </div>

        {/* Form Container */}
        <div className="form-container">
          {isSuccess ? (
            <div>
              {/* Success Message */}
              <div className="success-message">
                <CheckCircle className="success-icon" />
                <h3 className="success-title">Şifreniz Güncellendi!</h3>
                <p className="success-text">
                  Şifreniz başarıyla değiştirildi. Artık yeni şifrenizle giriş yapabilirsiniz.
                </p>
                <div className="info-box" style={{marginTop: '1rem', background: '#dcfce7'}}>
                  <div className="info-content">
                    <KeyRound className="info-icon" style={{color: '#16a34a'}} />
                    <div>
                      <p style={{fontWeight: '500', color: '#1f2937', marginBottom: '0.25rem'}}>
                        Güvenlik İpuçları:
                      </p>
                      <ul style={{fontSize: '0.75rem', color: '#4b5563', marginLeft: '1rem'}}>
                        <li>Şifrenizi kimseyle paylaşmayın</li>
                        <li>Düzenli olarak şifrenizi değiştirin</li>
                        <li>Farklı platformlarda aynı şifreyi kullanmayın</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/login')}
                className="submit-btn"
                style={{marginTop: '1.5rem'}}
              >
                Giriş Sayfasına Git
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

              {/* Password Requirements Info */}
              <div className="info-box">
                <div className="info-content">
                  <Info className="info-icon" />
                  <div>
                    <p style={{fontWeight: '500', marginBottom: '0.25rem'}}>Güçlü Şifre Oluşturun</p>
                    <ul style={{fontSize: '0.75rem', color: '#4b5563', marginLeft: '1rem'}}>
                      <li>En az 8 karakter uzunluğunda</li>
                      <li>En az bir büyük harf (A-Z)</li>
                      <li>En az bir küçük harf (a-z)</li>
                      <li>En az bir rakam (0-9)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* New Password Field */}
              <div className="form-group">
                <label htmlFor="password">Yeni Şifre</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="error-text">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Yeni Şifre Tekrarı</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    type="button"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="error-text">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="submit-btn"
                type="button"
              >
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Şifre Değiştiriliyor...
                  </>
                ) : (
                  'Şifreyi Değiştir'
                )}
              </button>

              {/* Token Expiry Warning */}
              <div style={{textAlign: 'center', marginTop: '1rem'}}>
                <p style={{fontSize: '0.75rem', color: '#6b7280'}}>
                  Bu bağlantı 24 saat içinde geçerliliğini yitirecektir
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="info-footer">
          <p className="footer-text">
            Sorun mu yaşıyorsunuz?{' '}
            <button 
              className="link" 
              onClick={() => alert('Destek sayfasına yönlendiriliyorsunuz...')}
              style={{textDecoration: 'underline'}}
            >
              Destek alın
            </button>
          </p>
          <p className="copyright">© 2025 SAÜ Arşiv MVP. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;