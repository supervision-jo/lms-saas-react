import React, { useState } from "react";
import { Search, Bell, ShoppingCart, Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import MobileNav from "./MobileNav";
import { NavItems } from "../../layout/dashboard/Layout";
import { readUserFromStorage } from "../../services/auth";

interface HeaderProps {
  onSearch: (query: string) => void;
  onLogout?: () => void;
  mainNavigationItems: NavItems[];
  userNavigationItems: NavItems[];
  authNavigationItems: NavItems[];
}

const Header: React.FC<HeaderProps> = ({
  onSearch,
  onLogout,
  mainNavigationItems,
  userNavigationItems,
  authNavigationItems,
}) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const currentUser = readUserFromStorage();

  console.log(currentUser);

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
                {mainNavigationItems.map((i) => {
                  return (
                    <button
                      key={i.id}
                      onClick={() => navigate(i.id)}
                      className={`transition-colors
                        ${
                          pathname.includes(i.id)
                            ? "text-purple-600 font-semibold"
                            : "text-gray-700 hover:text-purple-600"
                        }
                        `}
                    >
                      {i.label}
                    </button>
                  );
                })}
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
                  <span className="hidden md:block text-sm text-gray-700">
                    {currentUser.name}
                  </span>
                </div>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {userNavigationItems.map((i) => {
                      return (
                        <>
                          {i.id === "logout" && <hr className="my-2" />}
                          <button
                            key={i.id}
                            onClick={() => {
                              if (i.id === "logout") {
                                if (onLogout) onLogout();
                                setIsUserMenuOpen(false);
                              } else {
                                navigate(i.id);
                              }
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm ${
                              i.id === "logout"
                                ? "text-red-600 hover:bg-red-50"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {i.label}
                          </button>
                        </>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {authNavigationItems.map((i) => {
                  return (
                    <button
                      key={i.id}
                      onClick={() => navigate(i.id)}
                      className={`${
                        i.id === "login"
                          ? "text-gray-700 hover:text-purple-600 font-medium"
                          : "bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                      }`}
                    >
                      {i.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-500"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <MobileNav
            authNavigationItems={authNavigationItems}
            mainNavigationItems={mainNavigationItems}
            setIsMenuOpen={setIsMenuOpen}
            onLogout={onLogout}
          />
        )}
      </div>
    </header>
  );
};

export default Header;
