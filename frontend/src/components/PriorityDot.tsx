import type { TaskPriority } from '../types/task';

const config: Record<TaskPriority, { label: string; className: string }> = {
  low:    { label: 'Basse',  className: 'bg-slate-300' },
  medium: { label: 'Moyenne', className: 'bg-amber-400' },
  high:   { label: 'Haute',  className: 'bg-rose-500' },
};

export function PriorityDot({ priority }: { priority: TaskPriority }) {
  const { label, className } = config[priority];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
      <span className={`w-2 h-2 rounded-full ${className}`} />
      {label}
    </span>
  );
}
