import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import { MOCK_CREDENTIALS } from '../../constants/auth';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface AuthState {
  isAuthenticated: boolean;
  user: { username: string } | null;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => boolean;
  logout: () => void;
  clearError: () => void;
}

// ─── Estado inicial ───────────────────────────────────────────────────────────

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  error: null,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type AuthAction =
  | { type: 'LOGIN'; payload: { username: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: true, user: action.payload, error: null };
    case 'LOGOUT':
      return { ...initialState };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// ─── Contexto ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Valida credenciais contra os valores mockados
  function login(username: string, password: string): boolean {
    if (
      username === MOCK_CREDENTIALS.username &&
      password === MOCK_CREDENTIALS.password
    ) {
      dispatch({ type: 'LOGIN', payload: { username } });
      return true;
    }
    dispatch({
      type: 'SET_ERROR',
      payload: 'Usuário ou senha incorretos. Tente: usuario@pomodoro.com / pomodoro123',
    });
    return false;
  }

  function logout() {
    dispatch({ type: 'LOGOUT' });
  }

  function clearError() {
    dispatch({ type: 'CLEAR_ERROR' });
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        error: state.error,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext deve ser usado dentro de AuthContextProvider');
  }
  return context;
}
