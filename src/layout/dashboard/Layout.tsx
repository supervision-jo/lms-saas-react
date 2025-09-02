import { Outlet, useLocation, useNavigate } from "react-router";

import { Home, Users, Library, GraduationCap, LucideIcon } from "lucide-react";
import Header from "../../components/navigations/Header";
import { USER_KEY } from "../../utils/constants";

export interface NavItems {
  id: string;
  label: string;
  icon: LucideIcon;
}

const Layout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const mainNavigationItems: NavItems[] = [
    { id: "", label: "Home", icon: Home },
    { id: "catalog", label: "Courses", icon: GraduationCap },
    { id: "dashboard", label: "My Learning", icon: Users },
    { id: "instructor", label: "Teach", icon: Library },
  ];

  const userNavigationItems: NavItems[] = [
    { id: "profile", label: "Profile Settings", icon: Home },
    { id: "dashboard", label: "My Learning", icon: Users },
    { id: "instructor", label: "Instructor Dashboard", icon: Library },
    { id: "logout", label: "Sign Out", icon: GraduationCap },
  ];

  const authNavigationItems: NavItems[] = [
    { id: "login", label: "Log in", icon: Home },
    { id: "sign-up", label: "Sign up", icon: Users },
  ];

  const handleLogout = () => {
    localStorage.removeItem(USER_KEY);
    navigate("/");
  };

  const handleSearch = (query: string) => {
    console.log("Searching for:", query);
    if (query.trim()) {
      navigate("catalog");
    }
  };

  return (
    <div id="app-scroll" className="min-h-screen bg-gray-50">
      {!pathname.includes("player") &&
        !pathname.includes("login") &&
        !pathname.includes("sign-up") && (
          <Header
            onSearch={handleSearch}
            onLogout={handleLogout}
            authNavigationItems={authNavigationItems}
            mainNavigationItems={mainNavigationItems}
            userNavigationItems={userNavigationItems}
          />
        )}
      <div>{<Outlet />}</div>
    </div>
  );
};

export default Layout;
