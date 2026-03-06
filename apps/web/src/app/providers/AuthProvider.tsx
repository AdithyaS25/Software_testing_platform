import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { apiClient } from '../../lib/axios';

interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'DEVELOPER' | 'TESTER';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.userId || payload.id,
          email: payload.email,
          role: payload.role,
        });
      } catch {
        sessionStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post('/api/auth/login', { email, password });
    sessionStorage.setItem('accessToken', res.data.accessToken);
    if (res.data.refreshToken)
      sessionStorage.setItem('refreshToken', res.data.refreshToken);
    const payload = JSON.parse(atob(res.data.accessToken.split('.')[1]));
    setUser({
      id: payload.userId || payload.id,
      email: payload.email,
      role: payload.role,
    });
  };

  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout-all');
    } catch {}
    sessionStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
