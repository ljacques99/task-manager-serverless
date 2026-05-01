import { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Plus, CheckSquare, RefreshCw } from 'lucide-react';
import { TaskList } from './components/TaskList';
import { TaskFilters } from './components/TaskFilters';
import { TaskForm } from './components/TaskForm';
import { useTasks, useCreateTask } from './hooks/useTasks';
import type { TaskStatus, TaskPriority } from './types/task';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

function Dashboard() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');

  const { data: tasks = [], isLoading, refetch, isFetching } = useTasks();
  const createTask = useCreateTask();

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  }), [tasks]);

  const handleCreate = (values: Parameters<typeof createTask.mutate>[0]) => {
    createTask.mutate(values, { onSuccess: () => setShowForm(false) });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <CheckSquare size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">TaskFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
              title="Actualiser"
            >
              <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={16} />
              Nouvelle tâche
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-slate-900', bg: 'bg-white' },
            { label: 'À faire', value: stats.pending, color: 'text-slate-600', bg: 'bg-white' },
            { label: 'En cours', value: stats.inProgress, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Terminées', value: stats.done, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-xl border border-slate-200 p-4`}>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
              <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <TaskFilters
            search={search} onSearch={setSearch}
            status={statusFilter} onStatus={setStatusFilter}
            priority={priorityFilter} onPriority={setPriorityFilter}
          />
        </div>

        <div className="mb-4">
          <p className="text-sm text-slate-500">
            {filtered.length} tâche{filtered.length !== 1 ? 's' : ''}
            {(search || statusFilter !== 'all' || priorityFilter !== 'all') && ' · Filtrées'}
          </p>
        </div>

        <TaskList tasks={filtered} isLoading={isLoading} />
      </main>

      {showForm && (
        <TaskForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          isLoading={createTask.isPending}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
