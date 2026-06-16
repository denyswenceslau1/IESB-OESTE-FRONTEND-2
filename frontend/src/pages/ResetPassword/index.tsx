import React, { useState, useContext, type FormEvent, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext/AuthContext';
import styles from '../Login/styles.module.css';
import { useNavigate } from 'react-router';

export function ResetPassword() {
  const { resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    document.title = 'Redefinir senha - Chronos Pomodoro';
    // Tenta pegar o token da URL (?token=xxx)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) setToken(urlToken);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!token.trim()) {
      setFeedback({ text: 'Informe o token recebido por e-mail.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({ text: 'Nova senha deve ter pelo menos 6 caracteres.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ text: 'As senhas não coincidem.', type: 'error' });
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(token.trim(), newPassword);
    setIsLoading(false);

    if (!result.ok) {
      setFeedback({ text: result.message ?? 'Erro ao redefinir senha.', type: 'error' });
    } else {
      setFeedback({ text: 'Senha redefinida com sucesso! Redirecionando...', type: 'success' });
      setTimeout(() => navigate('/'), 2000);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardTitle}>Redefinir senha</div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor='resetToken'>Token recebido</label>
            <input
              id='resetToken'
              type='text'
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder='Cole o token aqui'
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor='newPassword'>Nova senha</label>
            <input
              id='newPassword'
              type='password'
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder='Mínimo 6 caracteres'
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor='confirmPassword'>Confirmar nova senha</label>
            <input
              id='confirmPassword'
              type='password'
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder='Repita a nova senha'
              required
            />
          </div>
          <button type='submit' className={styles.button} disabled={isLoading}>
            {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
          </button>
        </form>

        {feedback && (
          <div className={`${styles.feedback} ${styles[feedback.type]}`}>
            {feedback.text}
          </div>
        )}
      </div>
    </div>
  );
}
