import React, { createContext, useReducer, useEffect, type ReactNode } from 'react';

// ─── Tipos ─────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ ok: boolean; message?: string; devToken?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ ok: boolean; message?: string }>;
}

type AuthAction =
  | { type: 'LOGIN'; payload: { user: AuthUser; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESTORE'; payload: { user: AuthUser; token: string } };

// ─── Context ───────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ─── Reducer ───────────────────────────────────────────────────────────────

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true, // começa true para checar o localStorage antes de renderizar
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
    case 'RESTORE':
      return {
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
      };
    case 'LOGOUT':
      return { isAuthenticated: false, user: null, token: null, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// ─── Provider ──────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:3333';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restaura sessão do localStorage ao iniciar o app
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    if (storedToken && storedUser) {
      try {
        const user: AuthUser = JSON.parse(storedUser);
        dispatch({ type: 'RESTORE', payload: { user, token: storedToken } });
      } catch {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // ─── Login ──────────────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.message ?? 'Erro ao fazer login.' };
      }
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      dispatch({ type: 'LOGIN', payload: { user: data.user, token: data.token } });
      return { ok: true };
    } catch {
      return { ok: false, message: 'Não foi possível conectar ao servidor.' };
    }
  };

  // ─── Register ───────────────────────────────────────────────────────────
  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.message ?? 'Erro ao criar conta.' };
      }
      return { ok: true, message: data.message };
    } catch {
      return { ok: false, message: 'Não foi possível conectar ao servidor.' };
    }
  };

  // ─── Logout ─────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    dispatch({ type: 'LOGOUT' });
  };

  // ─── Forgot Password ────────────────────────────────────────────────────
  const forgotPassword = async (email: string) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.message ?? 'Erro ao solicitar redefinição.' };
      }
      return { ok: true, message: data.message, devToken: data.devToken };
    } catch {
      return { ok: false, message: 'Não foi possível conectar ao servidor.' };
    }
  };

  // ─── Reset Password ─────────────────────────────────────────────────────
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, message: data.message ?? 'Erro ao redefinir senha.' };
      }
      return { ok: true, message: data.message };
    } catch {
      return { ok: false, message: 'Não foi possível conectar ao servidor.' };
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
