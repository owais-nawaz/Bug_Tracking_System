import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('bts_user')); } catch { return null; }
  });
  const login  = u => { sessionStorage.setItem('bts_user', JSON.stringify(u)); setUser(u); };
  const logout = () => { sessionStorage.removeItem('bts_user'); setUser(null); };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
