import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, GraduationCap, AlertCircle, MessageSquare, X, CheckCircle } from 'lucide-react';
import { authService } from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    name: '',
    email: '',
    type: 'oneri',
    message: ''
  });
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const validateEmail = (email) => {
    const sakaryaEmailRegex = /^[^\s@]+@ogr\.sakarya\.edu\.tr$/;
    return sakaryaEmailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'E-posta adresi gerekli';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Sadece @ogr.sakarya.edu.tr uzantılı e-posta adresleri kabul edilir';
    }

    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      console.log('Login successful:', response);
      // Dashboard'a yönlendir
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: error.message || 'Giriş yapılırken bir hata oluştu' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFeedbackSuccess(true);
      setTimeout(() => {
        setShowFeedbackForm(false);
        setFeedbackSuccess(false);
        setFeedbackData({ name: '', email: '', type: 'oneri', message: '' });
      }, 2000);
    } catch (error) {
      console.error('Feedback error:', error);
    } finally {
      setFeedbackLoading(false);
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
          <h2>SAÜ Arşiv MVP</h2>
          <p>Sakarya Üniversitesi öğrenci hesabınızla giriş yapın</p>
        </div>

        {/* Login Form */}
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            {/* General Error */}
            {errors.general && (
              <div className="error-message">
                <AlertCircle className="error-message-icon" />
                <span className="error-message-text">{errors.general}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Sakarya Üniversitesi Öğrenci E-postası</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="ogrenci@ogr.sakarya.edu.tr"
                />
              </div>
              {errors.email && (
                <p className="error-text">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Şifre</label>
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
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
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

            {/* Remember Me & Forgot Password */}
            <div className="remember-forgot">
              <div className="remember-me">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe">Beni Hatırla</label>
              </div>
              <button
                type="button"
                className="link"
                onClick={() => navigate('/forgot-password')}
              >
                Şifremi Unuttum?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn"
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Giriş Yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>

            {/* Register Link */}
            <div className="register-link">
              <p>
                Hesabınız yok mu?{' '}
                <button
                  type="button"
                  className="link"
                  onClick={() => navigate('/register')}
                >
                  Kayıt Ol
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Info Footer */}
        <div className="info-footer">
          <p>Bu platform sadece Sakarya Üniversitesi öğrencilerine özeldir</p>
          
          {/* Current Features */}
          <div className="feature-box">
            <h3>✨ Sunduklarımız</h3>
            <div className="feature-item">
              <span>✓</span>
              <span><strong>Güvenli Giriş:</strong> Sadece @ogr.sakarya.edu.tr uzantılı e-postalar ile kayıt</span>
            </div>
            <div className="feature-item">
              <span>✓</span>
              <span><strong>Ders Notları:</strong> PDF, Word ve görsel formatlarında not paylaşımı</span>
            </div>
            <div className="feature-item">
              <span>✓</span>
              <span><strong>Bölüm Bazlı Organizasyon:</strong> Tüm bölümler için ayrı kategoriler</span>
            </div>
            <div className="feature-item">
              <span>✓</span>
              <span><strong>Admin Onay Sistemi:</strong> Yüklenen içerikler kontrol ediliyor</span>
            </div>
            <div className="feature-item">
              <span>✓</span>
              <span><strong>Temel Arama:</strong> Ders adı ve bölüme göre filtreleme</span>
            </div>
          </div>

          {/* Upcoming Features */}
          <div className="feature-box">
            <h3>🚀 Yakında Geliyor</h3>
            <div className="feature-item">
              <span>⚡</span>
              <span><strong>Raporlama Sistemi:</strong> Kalitesiz veya uygunsuz içerikleri bildir</span>
            </div>
            <div className="feature-item">
              <span>💬</span>
              <span><strong>Ders Forumları:</strong> Her ders için özel tartışma alanları</span>
            </div>
            <div className="feature-item">
              <span>📊</span>
              <span><strong>Hoca Değerlendirme:</strong> Öğretim görevlileri için yorum ve puanlama</span>
            </div>
            <div className="feature-item">
              <span>🏆</span>
              <span><strong>Başarı Sistemi:</strong> Aktif kullanıcılar için rozetler</span>
            </div>
            <div className="feature-item">
              <span>🔍</span>
              <span><strong>Gelişmiş Arama:</strong> Ders kodu ve hoca adıyla arama</span>
            </div>
            <div className="feature-item">
              <span>🔔</span>
              <span><strong>Bildirim Sistemi:</strong> Yeni içerik ve güncellemeler için</span>
            </div>
          </div>

          {/* Feedback Button */}
          <button
            onClick={() => setShowFeedbackForm(true)}
            className="feedback-btn"
          >
            <MessageSquare className="h-4 w-4" />
            Şikayet & Öneri
          </button>

          {/* Legal Footer */}
          <div className="footer-links">
            <button className="link">Hakkımızda</button>
            <span>•</span>
            <button className="link">İletişim</button>
            <span>•</span>
            <button className="link">KVKK</button>
            <span>•</span>
            <button className="link">Gizlilik Politikası</button>
            <span>•</span>
            <button className="link">Kullanım Şartları</button>
          </div>
          <p className="copyright">© 2025 SAÜ Arşiv MVP. Tüm hakları saklıdır.</p>
        </div>
      </div>

      {/* Feedback Form Modal */}
      {showFeedbackForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                <MessageSquare className="h-5 w-5" />
                Şikayet & Öneri Formu
              </h3>
              <button
                onClick={() => setShowFeedbackForm(false)}
                className="modal-close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {feedbackSuccess ? (
              <div className="success-message">
                <CheckCircle className="success-icon" />
                <p className="success-title">Mesajınız başarıyla gönderildi!</p>
                <p className="success-text">En kısa sürede değerlendireceğiz.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit}>
                <div className="form-group">
                  <label>Ad Soyad</label>
                  <input
                    type="text"
                    name="name"
                    value={feedbackData.name}
                    onChange={handleFeedbackChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>E-posta</label>
                  <input
                    type="email"
                    name="email"
                    value={feedbackData.email}
                    onChange={handleFeedbackChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Konu</label>
                  <select
                    name="type"
                    value={feedbackData.type}
                    onChange={handleFeedbackChange}
                    className="form-input"
                  >
                    <option value="oneri">Öneri</option>
                    <option value="sikayet">Şikayet</option>
                    <option value="teknik">Teknik Sorun</option>
                    <option value="diger">Diğer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Mesajınız</label>
                  <textarea
                    name="message"
                    value={feedbackData.message}
                    onChange={handleFeedbackChange}
                    required
                    placeholder="Görüş ve önerilerinizi buraya yazabilirsiniz..."
                    className="form-input"
                  />
                </div>

                <div className="form-buttons">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackForm(false)}
                    className="back-btn"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={feedbackLoading}
                    className="submit-btn"
                  >
                    {feedbackLoading ? (
                      <>
                        <div className="spinner"></div>
                        Gönderiliyor...
                      </>
                    ) : (
                      'Gönder'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;