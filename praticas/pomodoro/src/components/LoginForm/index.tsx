import { useState, useEffect, useRef, FormEvent } from 'react';
import { LoginInput } from '../LoginInput';
import { LoginActions } from '../LoginActions';
import { VIEW_MODES, ViewMode } from '../../constants/auth';
import { useAuthContext } from '../../context/auth/AuthContext';
import styles from './styles.module.css';

/**
 * LoginForm — gerencia o estado local do formulário de login.
 *
 * Estados controlados:
 *  - username / password: inputs controlados (useState)
 *  - viewMode: alterna entre login / cadastro / recuperar senha
 *  - isSubmitting: flag para animação de carregamento
 *  - feedbackMessage / feedbackType: mensagem de retorno ao usuário
 *
 * Efeitos:
 *  - Foca o campo usuário ao trocar viewMode (useEffect)
 *  - Auto-limpa mensagem de feedback após 5 segundos (useEffect)
 *  - Sincroniza erro do AuthContext com o feedback local (useEffect)
 */
export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(VIEW_MODES.LOGIN);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'info' | 'error' | ''>('');

  const usernameRef = useRef<HTMLInputElement>(null);
  const { login, error, clearError } = useAuthContext();

  // Foca o campo de usuário sempre que o modo de visualização muda
  useEffect(() => {
    if (usernameRef.current) {
      usernameRef.current.focus();
    }
  }, [viewMode]);

  // Remove a mensagem de feedback automaticamente após 5 segundos
  useEffect(() => {
    if (!feedbackMessage) return;
    const timer = setTimeout(() => {
      setFeedbackMessage('');
      setFeedbackType('');
    }, 5000);
    return () => clearTimeout(timer);
  }, [feedbackMessage]);

  // Sincroniza erro vindo do AuthContext (credenciais inválidas)
  useEffect(() => {
    if (error) {
      setFeedbackMessage(error);
      setFeedbackType('error');
      clearError();
    }
  }, [error, clearError]);

  // Lida com envio do formulário de login
  function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setFeedbackMessage('Por favor, preencha todos os campos.');
      setFeedbackType('error');
      return;
    }

    setIsSubmitting(true);

    // Simula um delay de requisição (800ms) antes de validar
    setTimeout(() => {
      const success = login(username, password);
      if (success) {
        setFeedbackMessage('Login realizado com sucesso! Redirecionando...');
        setFeedbackType('success');
      }
      setIsSubmitting(false);
    }, 800);
  }

  function handleRegisterClick() {
    setViewMode(VIEW_MODES.REGISTER);
    setFeedbackMessage('Fluxo de cadastro ainda será implementado em uma próxima etapa.');
    setFeedbackType('info');
  }

  function handleRecoverClick() {
    setViewMode(VIEW_MODES.RECOVER);
    setFeedbackMessage(
      'Fluxo de recuperação de senha ainda será implementado em uma próxima etapa.',
    );
    setFeedbackType('info');
  }

  function handleBackToLogin() {
    setViewMode(VIEW_MODES.LOGIN);
    setFeedbackMessage('');
    setFeedbackType('');
    setUsername('');
    setPassword('');
  }

  // ── Tela de cadastro (simulação) ───────────────────────────────────────────
  if (viewMode === VIEW_MODES.REGISTER) {
    return (
      <div className={styles.alternativeView}>
        <div className={styles.alternativeIcon}>📋</div>
        <h2 className={styles.alternativeTitle}>Criar Conta</h2>
        <p className={styles.alternativeText}>
          O fluxo de cadastro ainda será implementado em uma próxima etapa.
        </p>
        <p className={styles.alternativeSubtext}>
          Por enquanto, utilize as credenciais de demonstração para acessar o sistema.
        </p>
        <button type='button' className={styles.backButton} onClick={handleBackToLogin}>
          ← Voltar para o login
        </button>
      </div>
    );
  }

  // ── Tela de recuperação de senha (simulação) ───────────────────────────────
  if (viewMode === VIEW_MODES.RECOVER) {
    return (
      <div className={styles.alternativeView}>
        <div className={styles.alternativeIcon}>🔑</div>
        <h2 className={styles.alternativeTitle}>Recuperar Senha</h2>
        <p className={styles.alternativeText}>
          O fluxo de recuperação de senha ainda será implementado em uma próxima etapa.
        </p>
        <p className={styles.alternativeSubtext}>
          Por enquanto, utilize as credenciais de demonstração para acessar o sistema.
        </p>
        <button type='button' className={styles.backButton} onClick={handleBackToLogin}>
          ← Voltar para o login
        </button>
      </div>
    );
  }

  // ── Formulário de login principal ──────────────────────────────────────────
  return (
    <form
      className={styles.form}
      onSubmit={handleLoginSubmit}
      noValidate
      aria-label='Formulário de login'
    >
      {/* Feedback: renderização condicional — só aparece quando há mensagem */}
      {feedbackMessage && (
        <div
          className={`${styles.feedback} ${styles[feedbackType]}`}
          role='alert'
          aria-live='polite'
        >
          {feedbackMessage}
        </div>
      )}

      <LoginInput
        id='username'
        label='Usuário / E-mail'
        type='email'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder='usuario@pomodoro.com'
        required
      />

      <LoginInput
        id='password'
        label='Senha'
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder='••••••••'
        required
      />

      {/* Dica com credenciais de demonstração */}
      <p className={styles.hint} aria-label='Dica de acesso'>
        <span className={styles.hintLabel}>Demo:</span>{' '}
        usuario@pomodoro.com · pomodoro123
      </p>

      <LoginActions
        onRegisterClick={handleRegisterClick}
        onRecoverClick={handleRecoverClick}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}
