import React, { useContext } from 'react';
import { TaskContextProvider } from './contexts/TaskContext/TaskContextProvider';
import { MessagesContainer } from './components/MessagesContainer';
import { MainRouter } from './routers/MainRouter';
import './styles/theme.css';
import './styles/global.css';

import { AuthContext } from './contexts/AuthContext/AuthContext';
import Login from './pages/Login/index';

export function App() {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  // Aguarda o contexto verificar o localStorage antes de decidir o que renderizar.
  // Evita o flash de tela de login para usuários já autenticados.
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: 'var(--color-white)',
        }}
      >
        Carregando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <TaskContextProvider>
      <MessagesContainer>
        <MainRouter />
      </MessagesContainer>
    </TaskContextProvider>
  );
}
