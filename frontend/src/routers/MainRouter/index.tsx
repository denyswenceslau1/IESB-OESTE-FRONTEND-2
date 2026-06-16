import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router';
import { AboutPomodoro } from '../../pages/AboutPomodoro';
import { NotFound } from '../../pages/NotFound';
import { Home } from '../../pages/Home';
import { useContext, useEffect } from 'react';
import { History } from '../../pages/History';
import { Settings } from '../../pages/Settings';
import { ResetPassword } from '../../pages/ResetPassword';
import { AuthContext } from '../../contexts/AuthContext/AuthContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

// Protege rotas: se não autenticado, redireciona para /
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to='/' replace />;
  return <>{children}</>;
}

export function MainRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública: redefinição de senha (acessível sem login) */}
        <Route path='/reset-password' element={<ResetPassword />} />

        {/* Rotas protegidas */}
        <Route
          path='/'
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path='/history/'
          element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          }
        />
        <Route
          path='/settings/'
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path='/about-pomodoro/'
          element={
            <PrivateRoute>
              <AboutPomodoro />
            </PrivateRoute>
          }
        />
        <Route path='*' element={<NotFound />} />
      </Routes>
      <ScrollToTop />
    </BrowserRouter>
  );
}
