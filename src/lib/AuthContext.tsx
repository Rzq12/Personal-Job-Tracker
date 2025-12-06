import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name: string | null;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || '/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('accessToken')
  );
  const [refreshToken, setRefreshToken] = useState<string | null>(
    localStorage.getItem('refreshToken')
  );
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setAccessToken(token);
          setRefreshToken(localStorage.getItem('refreshToken'));
        } else {
          // Token invalid, clear storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setAccessToken(null);
          setRefreshToken(null);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();

    // Save tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    setUser(data.user);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      console.log('Registering user...', { email, name });

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      console.log('Register response status:', response.status);

      // Get response text first to debug
      const responseText = await response.text();
      console.log('Register response text:', responseText);

      if (!response.ok) {
        let error;
        try {
          error = JSON.parse(responseText);
        } catch {
          throw new Error(`Registration failed: ${response.status} - ${responseText}`);
        }
        throw new Error(error.message || 'Registration failed');
      }

      const data = JSON.parse(responseText);
      console.log('Register success:', data);

      // Save tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      setUser(data.user);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
    }
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
