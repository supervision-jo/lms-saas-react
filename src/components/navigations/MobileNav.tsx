import { NavLink, useNavigate } from "react-router";
import { NavItems } from "../../layout/dashboard/Layout";
import { Home } from "lucide-react";
import { readUserFromStorage } from "../../services/auth";

interface Props {
  setIsMenuOpen: (s: boolean) => void;
  mainNavigationItems: NavItems[];
  authNavigationItems: NavItems[];
  onLogout?: () => void;
}

export default function MobileNav({
  setIsMenuOpen,
  authNavigationItems,
  mainNavigationItems,
  onLogout,
}: Props) {
  const navigate = useNavigate();

  const currentUser = readUserFromStorage();
  return (
    <div className="lg:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
        {mainNavigationItems
          .concat([{ id: "profile", label: "Profile Settings", icon: Home }])
          .map((i, idx) => {
            const path = i.id ? `/${i.id}` : "/";
            return (
              <NavLink
                key={idx + 4000}
                to={path}
                end={path === "/"}
                className={({ isActive }) =>
                  `block w-full text-left px-3 py-2 transition-colors ${
                    isActive
                      ? "text-purple-600 font-semibold"
                      : "text-gray-700 hover:text-purple-600"
                  }`
                }
              >
                {i.label}
              </NavLink>
            );
          })}

        {!currentUser && (
          <>
            {authNavigationItems.map((i, idx) => {
              return (
                <button
                  key={idx + 5000}
                  onClick={() => {
                    navigate(i.id);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-purple-600"
                >
                  {i.label}
                </button>
              );
            })}
          </>
        )}
        <button className="block w-full text-left px-3 py-2 text-gray-700 hover:text-purple-600">
          Notifications
        </button>
        <button className="block w-full text-left px-3 py-2 text-gray-700 hover:text-purple-600">
          Shopping Cart
        </button>
        {currentUser && onLogout && (
          <button
            onClick={() => {
              onLogout();
              setIsMenuOpen(false);
            }}
            className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700"
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
