import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task';

const BASE_URL = (import.meta.env.VITE_API_URL as string).replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? 'API error');
  return json.data as T;
}

export const tasksApi = {
  list: () => request<Task[]>('/tasks'),
  get: (id: string) => request<Task>(`/tasks/${id}`),
  create: (input: CreateTaskInput) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: UpdateTaskInput) =>
    request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  delete: (id: string) =>
    request<{ id: string; deleted: boolean }>(`/tasks/${id}`, { method: 'DELETE' }),
};
