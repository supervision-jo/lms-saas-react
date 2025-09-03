import React, { useState } from 'react';
import { Search, Bell, User, ShoppingCart, Menu, X } from 'lucide-react';

interface HeaderProps {
  currentUser?: {
    name: string;
    avatar?: string;
  };
  onSearch: (query: string) => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onSearch, currentPage, onNavigate, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="text-2xl font-bold text-purple-600">LearnHub</div>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:block ml-10">
              <div className="flex items-center space-x-8">
                <button 
                  onClick={() => onNavigate('home')}
                  className={`transition-colors ${currentPage === 'home' ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'}`}
                >
                  Home
                </button>
                <button 
                  onClick={() => onNavigate('catalog')}
                  className={`transition-colors ${currentPage === 'catalog' ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'}`}
                >
                  Courses
                </button>
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className={`transition-colors ${currentPage === 'dashboard' ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'}`}
                >
                  My Learning
                </button>
                <button 
                  onClick={() => onNavigate('instructor')}
                  className={`transition-colors ${currentPage === 'instructor' || currentPage === 'course-builder' ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'}`}
                >
                  Teach
                </button>
              </div>
            </nav>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search for anything"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </form>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <Bell className="h-6 w-6" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-500">
              <ShoppingCart className="h-6 w-6" />
            </button>
            
            {currentUser ? (
              <div className="relative">
                <div 
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  {currentUser.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {currentUser.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="hidden md:block text-sm text-gray-700">{currentUser.name}</span>
                </div>
                
                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setIsUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Learning
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('instructor');
                        setIsUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Instructor Dashboard
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        if (onLogout) onLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => onNavigate('login')}
                  className="text-gray-700 hover:text-purple-600 font-medium"
                >
                  Log in
                </button>
                <button 
                  onClick={() => onNavigate('signup')}
                  className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                >
                  Sign up
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-500"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <button 
                onClick={() => { onNavigate('home'); setIsMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 transition-colors ${currentPage === 'home' ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'}`}
              >
                Home
              </button>
              <button 
                onClick={() => { onNavigate('catalog'); setIsMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 transition-colors ${currentPage === 'catalog' ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'}`}
              >
                Courses
              </button>
              <button 
                onClick={() => { onNavigate('dashboard'); setIsMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 transition-colors ${currentPage === 'dashboard' ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'}`}
              >
                My Learning
              </button>
              <button 
                onClick={() => { onNavigate('instructor'); setIsMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 transition-colors ${currentPage === 'instructor' ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'}`}
              >
                Teach
              </button>
              <button 
                onClick={() => { onNavigate('profile'); setIsMenuOpen(false); }}
                className={`block w-full text-left px-3 py-2 transition-colors ${currentPage === 'profile' ? 'text-purple-600 font-semibold' : 'text-gray-700 hover:text-purple-600'}`}
              >
                Profile
              </button>
              {!currentUser && (
                <>
                  <button 
                    onClick={() => { onNavigate('login'); setIsMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-purple-600"
                  >
                    Log in
                  </button>
                  <button 
                    onClick={() => { onNavigate('signup'); setIsMenuOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-purple-600"
                  >
                    Sign up
                  </button>
                </>
              )}
              {currentUser && onLogout && (
                <button 
                  onClick={() => { onLogout(); setIsMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;