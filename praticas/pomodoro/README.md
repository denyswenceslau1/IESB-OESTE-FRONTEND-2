# Chronos Pomodoro — Tela de Login

Projeto desenvolvido como atividade prática da disciplina de React JS.

## 📁 Localização

Este projeto está na pasta `praticas/pomodoro` do repositório.

## 🚀 Como rodar

```bash
cd praticas/pomodoro
npm install
npm run dev
```

## 🔐 Credenciais de acesso (mock)

| Campo | Valor |
|-------|-------|
| Usuário | `usuario@pomodoro.com` |
| Senha | `pomodoro123` |

## 📋 O que foi implementado

### Tela de Login (`/`)
- Inputs controlados para usuário e senha (`useState`)
- Validação básica de campos vazios
- Feedback visual para login, erro e simulações
- Auto-limpeza do feedback após 5 segundos (`useEffect`)
- Foco automático no campo usuário ao trocar de tela (`useEffect + useRef`)
- Links para "Cadastrar" e "Recuperar senha" com renderização condicional
- Prevenção do comportamento padrão do formulário (`event.preventDefault`)

### AuthContext (`/src/context/auth/AuthContext.tsx`)
- Contexto global de autenticação com `useReducer`
- Actions: `LOGIN`, `LOGOUT`, `SET_ERROR`, `CLEAR_ERROR`
- Validação contra credenciais mockadas em `constants/auth.ts`

### Rota protegida
- Componente `ProtectedRoute` redireciona para `/` se não autenticado
- `RootRoute` redireciona para `/home` se já autenticado

### Componentização
- `LoginForm` — lógica principal do formulário
- `LoginInput` — input reutilizável com label acessível
- `LoginActions` — botão submit + links auxiliares

## 🏗️ Estrutura de pastas

```
src/
├── components/
│   ├── LoginForm/
│   ├── LoginInput/
│   ├── LoginActions/
│   ├── ProtectedRoute/
│   └── ... (componentes do Pomodoro)
├── constants/
│   └── auth.ts          # credenciais mock + ViewMode enum
├── context/
│   └── auth/
│       └── AuthContext.tsx
├── pages/
│   ├── Login/
│   └── Home/
└── styles/
    ├── global.css
    └── theme.css
```
