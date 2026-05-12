// Credenciais mockadas para simulação de login (sem API ou banco de dados)
export const MOCK_CREDENTIALS = {
  username: 'usuario@pomodoro.com',
  password: 'pomodoro123',
};

// Modos de visualização da tela de autenticação
export const VIEW_MODES = {
  LOGIN: 'login',
  REGISTER: 'register',
  RECOVER: 'recover',
} as const;

export type ViewMode = (typeof VIEW_MODES)[keyof typeof VIEW_MODES];
