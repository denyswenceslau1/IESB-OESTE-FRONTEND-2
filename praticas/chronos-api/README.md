# Chronos API — Backend Pomodoro

API REST construída com **Express + Prisma + MySQL** para o projeto Pomodoro/Chronos.

---

## Pré-requisitos

- Node.js 18+
- MySQL rodando localmente (porta 3306)
- Banco de dados `pomodoro_db` criado

```sql
CREATE DATABASE pomodoro_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## Instalação e setup

```bash
# 1. Instalar dependências
npm install

# 2. Copiar e configurar variáveis de ambiente
cp .env.example .env
# Edite .env com as suas credenciais MySQL

# 3. Rodar migration (cria as tabelas no banco)
npm run prisma:migrate
# Digite o nome: init

# 4. Subir em modo desenvolvimento
npm run dev
```

A API sobe em `http://localhost:3333`.

---

## Endpoints

| Método   | Rota                        | Descrição                          |
|----------|-----------------------------|------------------------------------|
| GET      | /health                     | Verifica se a API está no ar       |
| GET      | /settings                   | Busca configurações (cria defaults)|
| PUT      | /settings                   | Atualiza configurações             |
| GET      | /tasks                      | Lista histórico de tasks           |
| POST     | /tasks                      | Cria nova task                     |
| PATCH    | /tasks/:id/complete         | Marca task como concluída          |
| PATCH    | /tasks/:id/interrupt        | Marca task como interrompida       |
| DELETE   | /tasks                      | Limpa todo o histórico             |

---

## Exemplos de payload

### PUT /settings
```json
{
  "workTime": 25,
  "shortBreakTime": 5,
  "longBreakTime": 15
}
```

### POST /tasks
```json
{
  "id": "abc-123",
  "name": "Estudar Node.js",
  "duration": 25,
  "type": "workTime",
  "startDate": 1700000000000
}
```

### PATCH /tasks/:id/complete
```json
{ "completeDate": 1700001500000 }
```

### PATCH /tasks/:id/interrupt
```json
{ "interruptDate": 1700001500000 }
```

---

## Testando no Postman

### Environment: `Chronos Local`
| Variável    | Valor                  |
|-------------|------------------------|
| `baseUrl`   | `http://localhost:3333`|
| `taskId`    | *(preenchido via script após POST /tasks)* |

### Ordem de testes recomendada

1. **GET** `{{baseUrl}}/health` → `{ "ok": true }`
2. **GET** `{{baseUrl}}/settings` → objeto com os três tempos
3. **PUT** `{{baseUrl}}/settings` → novos valores salvos
4. **POST** `{{baseUrl}}/tasks` → status 201 + task criada
   - Na aba **Tests** do Postman, cole o script abaixo para salvar o id automaticamente:
     ```js
     const json = pm.response.json();
     pm.environment.set("taskId", json.id);
     ```
5. **PATCH** `{{baseUrl}}/tasks/{{taskId}}/complete`
6. **GET** `{{baseUrl}}/tasks` → lista ordenada por startDate desc
7. **DELETE** `{{baseUrl}}/tasks` → status 204
8. **GET** `{{baseUrl}}/tasks` → lista vazia

---

## Erros comuns

| Erro            | Causa                                  | Solução                        |
|-----------------|----------------------------------------|--------------------------------|
| ECONNREFUSED    | API não está rodando                   | `npm run dev`                  |
| 400             | Payload inválido                       | Verifique os campos e tipos    |
| 404 em PATCH    | `taskId` não existe no banco           | Faça um POST /tasks antes      |
| P1001           | Prisma não consegue conectar ao MySQL  | Verifique `.env` e se o MySQL está ativo |

---

## Scripts disponíveis

```bash
npm run dev           # Desenvolvimento com hot reload
npm run build         # Compila TypeScript → dist/
npm run start         # Executa versão compilada
npm run prisma:migrate # Roda migrations
npm run prisma:studio  # Abre Prisma Studio (GUI do banco)
```
