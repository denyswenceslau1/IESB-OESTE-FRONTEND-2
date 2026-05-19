import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/theme.css';
import './styles/global.css';
import { AuthContextProvider, useAuthContext } from './context/auth/AuthContext';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { ProtectedRoute } from './components/ProtectedRoute';

/**
 * RootRoute: redireciona automaticamente com base no estado de autenticação.
 * Se autenticado → /home | Se não autenticado → tela de login
 */
function RootRoute() {
  const { isAuthenticated } = useAuthContext();
  return isAuthenticated ? <Navigate to='/home' replace /> : <Login />;
}

export function App() {
  return (
    <AuthContextProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota raiz: tela de login ou redirect para home */}
          <Route path='/' element={<RootRoute />} />

          {/* Rota protegida: sistema Pomodoro */}
          <Route
            path='/home'
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          {/* Redireciona qualquer rota desconhecida para raiz */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContextProvider>
  );
}
