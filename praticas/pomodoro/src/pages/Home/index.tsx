import { Container } from '../../components/Container';
import { Logo } from '../../components/Logo';
import { Menu } from '../../components/Menu';
import { CountDown } from '../../components/CountDown';
import { DefaultInput } from '../../components/DefaultInput';
import { Cycles } from '../../components/Cycles';
import { DefaultButton } from '../../components/DefaultButton';
import { PlayCircleIcon } from 'lucide-react';
import { Footer } from '../../components/Footer';
import { useAuthContext } from '../../context/auth/AuthContext';
import styles from './styles.module.css';

// Página principal do Pomodoro — acessível apenas após autenticação
export function Home() {
  const { user, logout } = useAuthContext();

  return (
    <>
      {/* Barra superior com saudação e botão de logout */}
      <div className={styles.userBar}>
        <span className={styles.userGreeting}>
          Olá, <strong>{user?.username}</strong>
        </span>
        <button className={styles.logoutButton} onClick={logout} aria-label='Sair da conta'>
          Sair
        </button>
      </div>

      <Container>
        <Logo />
      </Container>
      <Container>
        <Menu />
      </Container>
      <Container>
        <CountDown />
      </Container>
      <Container>
        <form className='form' action=''>
          <div className='formRow'>
            <DefaultInput
              labelText='task'
              id='meuInput'
              type='text'
              placeholder='Digite algo'
            />
          </div>

          <div className='formRow'>
            <p>Lorem ipsum dolor sit amet.</p>
          </div>

          <div className='formRow'>
            <Cycles />
          </div>

          <div className='formRow'>
            <DefaultButton icon={<PlayCircleIcon />} />
          </div>
        </form>
      </Container>
      <Container>
        <Footer />
      </Container>
    </>
  );
}
