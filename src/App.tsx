import React, { useState } from 'react';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CourseCatalogPage from './pages/CourseCatalogPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CoursePlayerPage from './pages/CoursePlayerPage';
import DashboardPage from './pages/DashboardPage';
import InstructorPage from './pages/InstructorPage';
import CourseBuilderPage from './pages/CourseBuilderPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
  };

  // If user is not logged in and trying to access protected pages
  const protectedPages = ['dashboard', 'instructor', 'course-builder', 'profile'];
  
  React.useEffect(() => {
    if (!currentUser && protectedPages.includes(currentPage)) {
      setCurrentPage('login');
    }
  }, [currentUser, currentPage]);

  const mockUser = currentUser || {
    name: 'John Doe',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    if (query.trim()) {
      setCurrentPage('catalog');
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    // Show login page if not authenticated and trying to access protected pages
    if (!currentUser && protectedPages.includes(currentPage)) {
      return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'catalog':
        return <CourseCatalogPage onNavigate={handleNavigate} />;
      case 'course':
        return <CourseDetailPage onNavigateToPlayer={() => handleNavigate('player')} />;
      case 'player':
        return <CoursePlayerPage />;
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'instructor':
        return <InstructorPage onNavigate={handleNavigate} />;
      case 'course-builder':
        return <CourseBuilderPage />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />;
      case 'signup':
        return <SignupPage onNavigate={handleNavigate} onLogin={handleLogin} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage !== 'player' && currentPage !== 'login' && currentPage !== 'signup' && (
        <Header 
          currentUser={currentUser} 
          onSearch={handleSearch}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      
      {renderPage()}
      
    </div>
  );
}

export default App;