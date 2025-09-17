import { createContext, useContext, useEffect, useState } from "react";
import jwtDecode from "jwt-decode";

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

/**
 * Stores JWT in localStorage and exposes `user`, `token`, `login`, `logout`.
 * Call `login(token)` after a successful /auth/login or /auth/signup response.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => (token ? jwtDecode(token) : null));

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      setUser(jwtDecode(token));
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  const login = tkn => setToken(tkn);
  const logout = () => setToken(null);

  return (
    <AuthCtx.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}
