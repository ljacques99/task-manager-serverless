import { useState } from 'react';
import { Pencil, Trash2, Clock } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { PriorityDot } from './PriorityDot';
import { TaskForm } from './TaskForm';
import { useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import type { Task, TaskStatus } from '../types/task';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(dueDate: string | null, status: TaskStatus) {
  if (!dueDate || status === 'done') return false;
  return new Date(dueDate) < new Date();
}

export function TaskCard({ task }: { task: Task }) {
  const [editing, setEditing] = useState(false);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const handleDelete = () => {
    if (confirm(`Supprimer « ${task.title} » ?`)) deleteTask.mutate(task.id);
  };

  const handleUpdate = (values: Parameters<typeof updateTask.mutate>[0]['input']) => {
    updateTask.mutate({ id: task.id, input: values }, { onSuccess: () => setEditing(false) });
  };

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all group">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold truncate ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">{task.description}</p>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors">
              <Pencil size={14} />
            </button>
            <button onClick={handleDelete} disabled={deleteTask.isPending} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={task.status} />
          <PriorityDot priority={task.priority} />
          {task.dueDate && (
            <span className={`inline-flex items-center gap-1 text-xs ${overdue ? 'text-rose-500 font-medium' : 'text-slate-400'}`}>
              <Clock size={11} />
              {formatDate(task.dueDate)}
              {overdue && ' · En retard'}
            </span>
          )}
        </div>
      </div>

      {editing && (
        <TaskForm
          task={task}
          onSubmit={handleUpdate}
          onClose={() => setEditing(false)}
          isLoading={updateTask.isPending}
        />
      )}
    </>
  );
}
