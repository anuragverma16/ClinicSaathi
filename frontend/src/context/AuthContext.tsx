import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, demoMode, unwrap } from '../services/api';
import type { ClinicUser } from '../types';

type AuthContextValue = {
  user: ClinicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (values: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const demoUser: ClinicUser = { name: 'Dr. Meera Kapoor', email: 'meera@clinic.com', role: 'Clinic Owner' };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ClinicUser | null>(demoMode ? demoUser : null);
  const [loading, setLoading] = useState(!demoMode);

  const logout = useCallback(async () => {
    if (!demoMode) await api.post('/auth/logout');
    setUser(null);
  }, []);

  useEffect(() => {
    if (demoMode) return;
    let active = true;
    api.get('/auth/me')
      .then((response) => { if (active) setUser(unwrap<ClinicUser>(response)); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    const onUnauthorized = () => setUser(null);
    window.addEventListener('clinicsaathi:unauthorized', onUnauthorized);
    return () => {
      active = false;
      window.removeEventListener('clinicsaathi:unauthorized', onUnauthorized);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (demoMode) {
      setUser({ ...demoUser, email });
      return;
    }
    const response = await api.post('/auth/login', { email, password });
    setUser(unwrap<{ user: ClinicUser }>(response).user);
  }, []);

  const register = useCallback(async (values: Record<string, string>) => {
    if (demoMode) {
      setUser({ name: values.name, email: values.email, role: 'Clinic Owner' });
      return;
    }
    const response = await api.post('/auth/register', values);
    setUser(unwrap<{ user: ClinicUser }>(response).user);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
