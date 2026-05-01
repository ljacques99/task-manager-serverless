import { Search } from 'lucide-react';
import type { TaskStatus, TaskPriority } from '../types/task';

interface Props {
  search: string;
  onSearch: (v: string) => void;
  status: TaskStatus | 'all';
  onStatus: (v: TaskStatus | 'all') => void;
  priority: TaskPriority | 'all';
  onPriority: (v: TaskPriority | 'all') => void;
}

export function TaskFilters({ search, onSearch, status, onStatus, priority, onPriority }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-48">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Rechercher..."
          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
      </div>

      <select
        value={status}
        onChange={e => onStatus(e.target.value as TaskStatus | 'all')}
        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
      >
        <option value="all">Tous les statuts</option>
        <option value="pending">À faire</option>
        <option value="in_progress">En cours</option>
        <option value="done">Terminés</option>
      </select>

      <select
        value={priority}
        onChange={e => onPriority(e.target.value as TaskPriority | 'all')}
        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
      >
        <option value="all">Toutes les priorités</option>
        <option value="high">Haute</option>
        <option value="medium">Moyenne</option>
        <option value="low">Basse</option>
      </select>
    </div>
  );
}
