import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut, Users, FileText, Settings, Bell } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Geçici user data - ileride context/state'den gelecek
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.email === 'kaanfurkankaya@gmail.com';

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-circle">
              <GraduationCap className="logo-icon" />
            </div>
            <h1>SAÜ Arşiv MVP</h1>
          </div>
          
          <div className="user-section">
            <div className="user-info">
              <span className="user-name">
                {user.firstName || 'Kullanıcı'} {user.lastName || ''}
                {isAdmin && <span className="admin-badge">Admin</span>}
              </span>
              <span className="user-email">{user.email}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut className="h-4 w-4" />
              Çıkış
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h2>Hoş Geldiniz!</h2>
            <p>SAÜ Arşiv MVP'ye başarıyla giriş yaptınız.</p>
            {isAdmin && (
              <div className="admin-notice">
                <Settings className="h-5 w-5" />
                <span>Admin paneli yakında aktif hale gelecek.</span>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FileText className="h-6 w-6" />
              </div>
              <div className="stat-content">
                <h3>Belgeler</h3>
                <p className="stat-number">0</p>
                <p className="stat-description">Toplam belge sayısı</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Users className="h-6 w-6" />
              </div>
              <div className="stat-content">
                <h3>Kullanıcılar</h3>
                <p className="stat-number">1</p>
                <p className="stat-description">Aktif kullanıcı</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Bell className="h-6 w-6" />
              </div>
              <div className="stat-content">
                <h3>Bildirimler</h3>
                <p className="stat-number">0</p>
                <p className="stat-description">Yeni bildirim</p>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="coming-soon">
            <h3>🚀 Yakında Geliyor</h3>
            <div className="feature-list">
              <div className="feature-item">📚 Ders notları yükleme ve indirme</div>
              <div className="feature-item">🔍 Gelişmiş arama ve filtreleme</div>
              <div className="feature-item">👥 Kullanıcı profilleri</div>
              <div className="feature-item">💬 Yorum ve değerlendirme sistemi</div>
              {isAdmin && (
                <div className="feature-item admin-feature">
                  ⚙️ Admin paneli ve içerik yönetimi
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;