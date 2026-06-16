import { useContext, useEffect } from 'react';
import { Container } from '../../components/Container';
import { CountDown } from '../../components/CountDown';
import { MainForm } from '../../components/MainForm';
import { MainTemplate } from '../../templates/MainTemplate';
import { AuthContext } from '../../contexts/AuthContext/AuthContext';

export function Home() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Chronos Pomodoro';
  }, []);

  return (
    <MainTemplate>
      {user && (
        <Container>
          <p
            style={{
              textAlign: 'center',
              color: 'var(--color-primary)',
              fontWeight: '600',
              fontSize: '1rem',
              marginBottom: '0.5rem',
            }}
          >
            Bem-vindo(a), {user.name}! 👋
          </p>
        </Container>
      )}

      <Container>
        <CountDown />
      </Container>

      <Container>
        <MainForm />
      </Container>
    </MainTemplate>
  );
}
