import type { ChangeEvent } from 'react';
import styles from './styles.module.css';

interface LoginInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoFocus?: boolean;
  required?: boolean;
}

// Componente de input reutilizável para o formulário de login
export function LoginInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoFocus = false,
  required = false,
}: LoginInputProps) {
  return (
    <div className={styles.inputGroup}>
      {/* Label acessível vinculado ao input via htmlFor/id */}
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        required={required}
        className={styles.input}
        aria-label={label}
        autoComplete={type === 'password' ? 'current-password' : 'username'}
      />
    </div>
  );
}
