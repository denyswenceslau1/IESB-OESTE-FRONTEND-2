import React, { useState, useContext, type FormEvent } from 'react';
import { AuthContext } from '../../contexts/AuthContext/AuthContext';
import styles from './styles.module.css';

type ViewMode = 'login' | 'register' | 'forgot' | 'forgotSent';

export default function Login() {
  const { login, register, forgotPassword } = useContext(AuthContext);

  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [feedback, setFeedback] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Campos login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Campos registro
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // Campo recuperação
  const [forgotEmail, setForgotEmail] = useState('');
  // Token devolvido pela API em modo dev para facilitar os testes
  const [devToken, setDevToken] = useState('');

  function clearFeedback() {
    setFeedback(null);
  }

  // ─── LOGIN ───────────────────────────────────────────────────────────────
  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    clearFeedback();

    if (!loginEmail.trim() || !loginPassword) {
      setFeedback({ text: 'Preencha e-mail e senha.', type: 'error' });
      return;
    }

    setIsLoading(true);
    const result = await login(loginEmail.trim().toLowerCase(), loginPassword);
    setIsLoading(false);

    if (!result.ok) {
      setFeedback({ text: result.message ?? 'Erro ao fazer login.', type: 'error' });
    }
    // Se ok, o AuthContext atualiza isAuthenticated e o App redireciona automaticamente
  }

  // ─── REGISTER ────────────────────────────────────────────────────────────
  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    clearFeedback();

    if (regName.trim().length < 2) {
      setFeedback({ text: 'Nome deve ter pelo menos 2 caracteres.', type: 'error' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      setFeedback({ text: 'E-mail inválido.', type: 'error' });
      return;
    }
    if (regPassword.length < 6) {
      setFeedback({ text: 'Senha deve ter pelo menos 6 caracteres.', type: 'error' });
      return;
    }
    if (regPassword !== regConfirm) {
      setFeedback({ text: 'As senhas não coincidem.', type: 'error' });
      return;
    }

    setIsLoading(true);
    const result = await register(regName.trim(), regEmail.trim().toLowerCase(), regPassword);
    setIsLoading(false);

    if (!result.ok) {
      setFeedback({ text: result.message ?? 'Erro ao criar conta.', type: 'error' });
    } else {
      setFeedback({ text: 'Conta criada! Faça login.', type: 'success' });
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirm('');
      setTimeout(() => {
        clearFeedback();
        setViewMode('login');
      }, 2000);
    }
  }

  // ─── FORGOT PASSWORD ─────────────────────────────────────────────────────
  async function handleForgot(e: FormEvent) {
    e.preventDefault();
    clearFeedback();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setFeedback({ text: 'Digite um e-mail válido.', type: 'error' });
      return;
    }

    setIsLoading(true);
    const result = await forgotPassword(forgotEmail.trim().toLowerCase());
    setIsLoading(false);

    if (!result.ok) {
      setFeedback({ text: result.message ?? 'Erro na solicitação.', type: 'error' });
    } else {
      if (result.devToken) setDevToken(result.devToken);
      setViewMode('forgotSent');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────

  if (viewMode === 'register') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Criar conta</div>
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor='regName'>Nome</label>
              <input
                id='regName'
                type='text'
                value={regName}
                onChange={e => setRegName(e.target.value)}
                placeholder='Seu nome'
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor='regEmail'>E-mail</label>
              <input
                id='regEmail'
                type='email'
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                placeholder='seu@email.com'
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor='regPassword'>Senha</label>
              <input
                id='regPassword'
                type='password'
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder='Mínimo 6 caracteres'
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor='regConfirm'>Confirmar senha</label>
              <input
                id='regConfirm'
                type='password'
                value={regConfirm}
                onChange={e => setRegConfirm(e.target.value)}
                placeholder='Repita a senha'
                required
              />
            </div>
            <button type='submit' className={styles.button} disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar conta'}
            </button>
          </form>
          {feedback && (
            <div className={`${styles.feedback} ${styles[feedback.type]}`}>
              {feedback.text}
            </div>
          )}
          <div className={styles.actions}>
            <button type='button' className={styles.linkButton} onClick={() => { clearFeedback(); setViewMode('login'); }}>
              Já tenho conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'forgot') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Recuperar senha</div>
          <p className={styles.description}>
            Informe seu e-mail e enviaremos instruções para redefinir sua senha.
          </p>
          <form onSubmit={handleForgot} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor='forgotEmail'>E-mail</label>
              <input
                id='forgotEmail'
                type='email'
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder='seu@email.com'
                required
              />
            </div>
            <button type='submit' className={styles.button} disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar instruções'}
            </button>
          </form>
          {feedback && (
            <div className={`${styles.feedback} ${styles[feedback.type]}`}>
              {feedback.text}
            </div>
          )}
          <div className={styles.actions}>
            <button type='button' className={styles.linkButton} onClick={() => { clearFeedback(); setViewMode('login'); }}>
              Voltar ao login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'forgotSent') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Verifique seu e-mail</div>
          <p className={styles.description}>
            Se o endereço estiver cadastrado, você receberá um link para redefinir a senha.
          </p>
          {devToken && (
            <div className={styles.devBox}>
              <strong>🛠 Ambiente de laboratório</strong>
              <p>Use o token abaixo na tela de redefinição de senha:</p>
              <code className={styles.devToken}>{devToken}</code>
              <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Acesse: <code>/reset-password?token={devToken}</code>
              </p>
            </div>
          )}
          <div className={styles.actions}>
            <button type='button' className={styles.linkButton} onClick={() => { clearFeedback(); setViewMode('login'); }}>
              Voltar ao login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── VIEW LOGIN (default) ─────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Chronos · Denys Wenceslau</div>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor='email'>E-mail</label>
            <input
              id='email'
              type='email'
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              placeholder='seu@email.com'
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor='password'>Senha</label>
            <div className={styles.passwordWrapper}>
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder='Sua senha'
                required
              />
              <button
                type='button'
                className={styles.togglePasswordBtn}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Ocultar' : 'Revelar'}
              </button>
            </div>
          </div>

          <button type='submit' className={styles.button} disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {feedback && (
          <div className={`${styles.feedback} ${styles[feedback.type]}`}>
            {feedback.text}
          </div>
        )}

        <div className={styles.actions}>
          <button type='button' className={styles.linkButton} onClick={() => { clearFeedback(); setViewMode('forgot'); }}>
            Esqueci minha senha
          </button>
          <button type='button' className={styles.linkButton} onClick={() => { clearFeedback(); setViewMode('register'); }}>
            Criar uma conta
          </button>
        </div>
      </div>
    </div>
  );
}
