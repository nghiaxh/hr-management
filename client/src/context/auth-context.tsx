import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('JSESSIONID='));
    
    if (cookie) {
      const token = cookie.split('=')[1];
      authApi.getMe()
        .then((u) => setUser(u))
        .catch(() => { setToken(null); })
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      authApi.getMe()
        .then((u) => setUser(u))
        .catch(() => { setToken(null); })
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    document.cookie = 'JSESSIONID=; Max-Age=0; path=/';
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);