import type { TaskStatus } from '../types/task';

const config: Record<TaskStatus, { label: string; className: string }> = {
  pending:     { label: 'À faire',     className: 'bg-slate-100 text-slate-600' },
  in_progress: { label: 'En cours',   className: 'bg-blue-100 text-blue-700' },
  done:        { label: 'Terminé',    className: 'bg-emerald-100 text-emerald-700' },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
