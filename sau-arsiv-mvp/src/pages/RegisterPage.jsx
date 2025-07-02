import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, GraduationCap, AlertCircle, Hash, BookOpen, ArrowLeft, Info } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentNumber: '',
    email: '',
    department: '',
    password: '',
    confirmPassword: '',
    kvkkAccepted: false,
    termsAccepted: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Sakarya Üniversitesi Bölümleri
  const departments = [
    { value: '', label: 'Bölüm Seçiniz' },
    { value: 'bilgisayar', label: 'Bilgisayar Mühendisliği' },
    { value: 'elektrik', label: 'Elektrik-Elektronik Mühendisliği' },
    { value: 'makine', label: 'Makine Mühendisliği' },
    { value: 'endustri', label: 'Endüstri Mühendisliği' },
    { value: 'insaat', label: 'İnşaat Mühendisliği' },
    { value: 'tip', label: 'Tıp Fakültesi' },
    { value: 'isletme', label: 'İşletme' },
    { value: 'hukuk', label: 'Hukuk' },
    { value: 'egitim', label: 'Eğitim Fakültesi' },
    { value: 'fen-edebiyat', label: 'Fen-Edebiyat Fakültesi' }
  ];

  const validateEmail = (email) => {
    const sakaryaEmailRegex = /^[^\s@]+@ogr\.sakarya\.edu\.tr$/;
    return sakaryaEmailRegex.test(email);
  };

  const validateStudentNumber = (number) => {
    const studentNumberRegex = /^[BG]\d{9}$/;
    return studentNumberRegex.test(number);
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

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad gerekli';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad gerekli';
    }
    if (formData.studentNumber && !validateStudentNumber(formData.studentNumber)) {
      newErrors.studentNumber = 'Geçerli bir öğrenci numarası giriniz (B123456789 formatında)';
    }
    if (!formData.email) {
      newErrors.email = 'E-posta adresi gerekli';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Sadece @ogr.sakarya.edu.tr uzantılı e-posta adresleri kabul edilir';
    }
    if (!formData.department) {
      newErrors.department = 'Bölüm seçimi gerekli';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Şifre en az 8 karakter olmalı';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermeli';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifre tekrarı gerekli';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    if (!formData.kvkkAccepted) {
      newErrors.kvkkAccepted = 'KVKK metnini kabul etmelisiniz';
    }
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'Kullanım şartlarını kabul etmelisiniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Registration successful:', formData);
      alert('Kayıt başarılı! E-posta adresinize doğrulama linki gönderildi.');
    } catch (error) {
      setErrors({ general: 'Kayıt olurken bir hata oluştu' });
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
          <h2>SAÜ Arşiv MVP</h2>
          <p>Öğrenci hesabı oluştur</p>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-labels">
            <span className={`progress-label ${currentStep >= 1 ? 'active' : ''}`}>
              Kişisel Bilgiler
            </span>
            <span className={`progress-label ${currentStep >= 2 ? 'active' : ''}`}>
              Güvenlik & Onay
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: currentStep === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="form-container">
          {/* General Error */}
          {errors.general && (
            <div className="error-message">
              <AlertCircle className="error-message-icon" />
              <span className="error-message-text">{errors.general}</span>
            </div>
          )}

          {currentStep === 1 ? (
            <>
              {/* Step 1: Personal Information */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Ad</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    placeholder="Adınız"
                  />
                  {errors.firstName && (
                    <p className="error-text">{errors.firstName}</p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Soyad</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Soyadınız"
                  />
                  {errors.lastName && (
                    <p className="error-text">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="studentNumber">Öğrenci Numarası (Opsiyonel)</label>
                <div className="input-wrapper">
                  <Hash className="input-icon" />
                  <input
                    id="studentNumber"
                    name="studentNumber"
                    type="text"
                    value={formData.studentNumber}
                    onChange={handleChange}
                    className={`form-input ${errors.studentNumber ? 'error' : ''}`}
                    placeholder="B123456789"
                  />
                </div>
                {errors.studentNumber && (
                  <p className="error-text">{errors.studentNumber}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Sakarya Üniversitesi E-postası</label>
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

              <div className="form-group">
                <label htmlFor="department">Bölüm</label>
                <div className="input-wrapper">
                  <BookOpen className="input-icon" />
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`form-input ${errors.department ? 'error' : ''}`}
                  >
                    {departments.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.department && (
                  <p className="error-text">{errors.department}</p>
                )}
              </div>

              <button
                onClick={handleNextStep}
                className="submit-btn"
              >
                Devam Et
              </button>
            </>
          ) : (
            <>
              {/* Step 2: Security & Approval */}
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
                <div className="info-box" style={{marginTop: '0.5rem'}}>
                  <div className="info-content">
                    <Info className="info-icon" />
                    <span className="info-text">En az 8 karakter, büyük/küçük harf ve rakam içermeli</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Şifre Tekrarı</label>
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

              {/* Terms and Conditions */}
              <div style={{marginBottom: '1.5rem'}}>
                <div className="checkbox-group">
                  <input
                    id="kvkkAccepted"
                    name="kvkkAccepted"
                    type="checkbox"
                    checked={formData.kvkkAccepted}
                    onChange={handleChange}
                  />
                  <label htmlFor="kvkkAccepted">
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      alert('KVKK Aydınlatma Metni gösterilecek');
                    }}>KVKK Aydınlatma Metni</a>'ni okudum ve kabul ediyorum
                  </label>
                </div>
                {errors.kvkkAccepted && (
                  <p className="error-text" style={{marginLeft: '1.5rem'}}>{errors.kvkkAccepted}</p>
                )}

                <div className="checkbox-group">
                  <input
                    id="termsAccepted"
                    name="termsAccepted"
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                  />
                  <label htmlFor="termsAccepted">
                    <a href="#" onClick={(e) => {
                      e.preventDefault();
                      alert('Kullanım Şartları gösterilecek');
                    }}>Kullanım Şartları</a>'nı okudum ve kabul ediyorum
                  </label>
                </div>
                {errors.termsAccepted && (
                  <p className="error-text" style={{marginLeft: '1.5rem'}}>{errors.termsAccepted}</p>
                )}
              </div>

              <div className="form-buttons">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="back-btn"
                  type="button"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Geri
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="submit-btn"
                  type="button"
                >
                  {isLoading ? (
                    <>
                      <div className="spinner"></div>
                      Kayıt Oluşturuluyor...
                    </>
                  ) : (
                    'Kayıt Ol'
                  )}
                </button>
              </div>
            </>
          )}

          {/* Login Link */}
          <div style={{textAlign: 'center'}}>
            <p style={{fontSize: '0.875rem', color: '#4b5563'}}>
              Zaten hesabınız var mı?{' '}
              <button
                className="link"
                onClick={() => navigate('/login')}
              >
                Giriş Yap
              </button>
            </p>
          </div>
        </div>

        {/* Info Footer */}
        <div className="info-footer">
          <p className="footer-text">Kayıt olduktan sonra e-posta adresinizi doğrulamanız gerekecektir</p>
          <p className="copyright">© 2025 SAÜ Arşiv MVP. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;