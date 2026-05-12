import { LoginForm } from '../../components/LoginForm';
import styles from './styles.module.css';

// Página de login — primeira tela exibida ao acessar a aplicação
export function Login() {
  return (
    <main className={styles.page} aria-label='Tela de login'>
      {/* Decorações de fundo (não interativas) */}
      <div className={styles.bgDecor1} aria-hidden='true' />
      <div className={styles.bgDecor2} aria-hidden='true' />
      <div className={styles.bgGrid} aria-hidden='true' />

      <div className={styles.container}>
        {/* Cabeçalho com marca */}
        <header className={styles.header}>
          <div className={styles.logoMark} aria-hidden='true'>
            ⏱
          </div>
          <div className={styles.brandText}>
            <h1 className={styles.brandName}>Chronos</h1>
            <span className={styles.brandTag}>Pomodoro</span>
          </div>
        </header>

        {/* Card com o formulário de autenticação */}
        <div className={styles.card} role='region' aria-label='Formulário de autenticação'>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Bem-vindo de volta</h2>
            <p className={styles.cardSubtitle}>Entre para continuar sua sessão de foco</p>
          </div>
          <LoginForm />
        </div>

        <footer className={styles.footer}>
          <p className={styles.footerText}>Chronos Pomodoro · Foco e produtividade</p>
        </footer>
      </div>
    </main>
  );
}
