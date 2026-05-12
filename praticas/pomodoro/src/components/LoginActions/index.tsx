import styles from './styles.module.css';

interface LoginActionsProps {
  onRegisterClick: () => void;
  onRecoverClick: () => void;
  isSubmitting: boolean;
}

// Componente com botão de submit e links auxiliares (cadastro / recuperar senha)
export function LoginActions({
  onRegisterClick,
  onRecoverClick,
  isSubmitting,
}: LoginActionsProps) {
  return (
    <div className={styles.actions}>
      <button
        type='submit'
        className={styles.submitButton}
        disabled={isSubmitting}
        aria-label='Entrar no sistema'
      >
        {isSubmitting ? (
          /* Animação de carregamento com três pontos */
          <span className={styles.loadingText}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </span>
        ) : (
          'Entrar'
        )}
      </button>

      <div className={styles.links}>
        <button
          type='button'
          className={styles.linkButton}
          onClick={onRecoverClick}
          aria-label='Recuperar senha'
        >
          Esqueci minha senha
        </button>

        <span className={styles.separator} aria-hidden='true'>
          ·
        </span>

        <button
          type='button'
          className={styles.linkButton}
          onClick={onRegisterClick}
          aria-label='Ir para cadastro'
        >
          Criar conta
        </button>
      </div>
    </div>
  );
}
