import { isAuthenticated as checkAuth } from "../services/auth";
import { create } from "zustand";

type Store = {
  isAuthenticated: boolean;
  setIsAuthenticated: () => void;
};

const useAuth = create<Store>()((set) => ({
  isAuthenticated: checkAuth(),
  setIsAuthenticated: () =>
    set((state) => ({ isAuthenticated: !state.isAuthenticated })),
}));

export default useAuth;
