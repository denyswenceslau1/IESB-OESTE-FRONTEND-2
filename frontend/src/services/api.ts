// Centraliza todas as chamadas à pomodoro-api
const BASE_URL = 'http://localhost:3333';

// Injeta o Bearer token em todas as requisições autenticadas
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `Erro ${response.status}`);
  }

  // 204 No Content não tem body
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

// ─── Settings ──────────────────────────────────────────────────────────────

export type ApiSettings = {
  id: number;
  userId: number;
  workTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  updatedAt: string;
};

export const settingsApi = {
  get: () => request<ApiSettings>('/settings'),

  put: (data: Omit<ApiSettings, 'id' | 'userId' | 'updatedAt'>) =>
    request<ApiSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ─── Tasks ─────────────────────────────────────────────────────────────────

export type ApiTask = {
  id: string;
  userId: number;
  name: string;
  duration: number;
  type: string;
  startDate: number;
  completeDate: number | null;
  interruptDate: number | null;
  createdAt: string;
};

export const tasksApi = {
  list: () => request<ApiTask[]>('/tasks'),

  create: (data: Omit<ApiTask, 'userId' | 'createdAt'>) =>
    request<ApiTask>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  complete: (id: string, completeDate: number) =>
    request<ApiTask>(`/tasks/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completeDate }),
    }),

  interrupt: (id: string, interruptDate: number) =>
    request<ApiTask>(`/tasks/${id}/interrupt`, {
      method: 'PATCH',
      body: JSON.stringify({ interruptDate }),
    }),

  deleteAll: () => request<void>('/tasks', { method: 'DELETE' }),
};
