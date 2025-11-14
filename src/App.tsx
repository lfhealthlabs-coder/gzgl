import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import CustomCursor from './components/CustomCursor';
import LoginPage from './pages/LoginPage';
import AccueilPage from './pages/AccueilPage';
import ActualitePage from './pages/ActualitePage';
import CommunautePage from './pages/CommunautePage';
import ProfilPage from './pages/ProfilPage';
import VideoDetailPage from './pages/VideoDetailPage';
import BottomNav, { TabType } from './components/BottomNav';
import FloatingSupportButton from './components/FloatingSupportButton';
import IAPage from './pages/AI';
import TurboPage from './pages/TurboPage';
import BonusPage from './pages/BonusPage';
import LotoGains10xPage from './pages/LotoGains10xPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('accueil');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Verificar se o usuário já está logado ao carregar o app
  useEffect(() => {
    const checkAuth = () => {
      const userEmail = localStorage.getItem('user_email');
      const isLogged = localStorage.getItem('user_logged_in');
      
      if (userEmail && isLogged === 'true') {
        setIsLoggedIn(true);
      }
      
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  const handleLogin = () => setIsLoggedIn(true);

  const handleLogout = () => {
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_logged_in');
    setIsLoggedIn(false);
    setActiveTab('accueil');
    setSelectedFeature(null);
  };

  // Mostrar loading enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2BC047]/10 via-white to-[#F7D25F]/10">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#18A238] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const handleFeatureClick = (feature: string) => {
    setSelectedFeature(feature);
  };

  const handleBackToHome = () => {
    setSelectedFeature(null);
  };

  if (!isLoggedIn) {
    return (
      <>
        <CustomCursor />
        <LoginPage onLogin={handleLogin} />
        <Analytics />
      </>
    );
  }

  if (selectedFeature) {
    if (selectedFeature === 'ai') {
      return (
        <>
          <CustomCursor />
          <IAPage onBack={handleBackToHome} />
          <Analytics />
        </>
      );
    }

    if (selectedFeature === 'turbo') {
      return (
        <>
          <CustomCursor />
          <TurboPage onBack={handleBackToHome} />
          <Analytics />
        </>
      );
    }

    if (selectedFeature === 'bonus') {
      return (
        <>
          <CustomCursor />
          <BonusPage onBack={handleBackToHome} />
          <Analytics />
        </>
      );
    }

    if (selectedFeature === '10x') {
      return (
        <>
          <CustomCursor />
          <LotoGains10xPage onBack={handleBackToHome} />
          <Analytics />
        </>
      );
    }

    return (
      <>
        <CustomCursor />
        <VideoDetailPage featureName={selectedFeature} onBack={handleBackToHome} />
        <Analytics />
      </>
    );
  }

  return (
    <>
      <CustomCursor />
      <div className="min-h-screen">
        {activeTab === 'accueil' && <AccueilPage onFeatureClick={handleFeatureClick} />}
        {activeTab === 'actualite' && <ActualitePage />}
        {activeTab === 'communaute' && <CommunautePage />}
        {activeTab === 'profil' && <ProfilPage onLogout={handleLogout} />}

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        <FloatingSupportButton />
      </div>
      <Analytics />
    </>
  );
}

export default App;
