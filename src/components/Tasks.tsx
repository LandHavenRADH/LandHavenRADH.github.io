import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  List, 
  Calendar as CalendarIcon, 
  Check, 
  Trash2, 
  CalendarPlus,
  MapPin
} from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { Task, Deal } from '../types';
import { formatDate, formatTime, cn } from '../utils';

interface TasksProps {
  tasks: Task[];
  deals: Deal[];
  onNewTask: () => void;
  onEditTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleTask: (id: string, completed: boolean) => void;
  onDownloadICS: (id: string) => void;
}

export const Tasks: React.FC<TasksProps> = ({
  tasks,
  deals,
  onNewTask,
  onEditTask,
  onDeleteTask,
  onToggleTask,
  onDownloadICS
}) => {
  const [displayMode, setDisplayMode] = useState<'list' | 'calendar'>('calendar');

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [tasks]);

  const calendarEvents = useMemo(() => {
    return tasks.map(t => ({
      id: t.id,
      title: t.title + (t.time ? ` @ ${formatTime(t.time)}` : ''),
      start: t.time ? `${t.date}T${t.time}` : t.date,
      backgroundColor: t.completed ? '#94a3b8' : '#3b82f6',
      borderColor: t.completed ? '#94a3b8' : '#3b82f6',
      textColor: '#ffffff'
    }));
  }, [tasks]);

  return (
    <div className="p-8 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Critical Dates & Tasks</h2>
          <p className="text-slate-500 text-sm">Manage deadlines and to-dos.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white rounded-lg border border-slate-200 p-1 flex mr-2">
            <button 
              onClick={() => setDisplayMode('list')}
              className={cn(
                "px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors",
                displayMode === 'list' ? "bg-emerald-100 text-emerald-700" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <List size={16} /> List
            </button>
            <button 
              onClick={() => setDisplayMode('calendar')}
              className={cn(
                "px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors",
                displayMode === 'calendar' ? "bg-emerald-100 text-emerald-700" : "text-slate-500 hover:bg-slate-50"
              )}
            >
              <CalendarIcon size={16} /> Calendar
            </button>
          </div>
          <button 
            onClick={onNewTask}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 transition"
          >
            <Plus size={18} /> New Task
          </button>
        </div>
      </div>

      {displayMode === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col h-full">
          <div className="overflow-y-auto flex-1 p-0 no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="p-4 w-12 text-center">Done</th>
                  <th className="p-4">Task / Action</th>
                  <th className="p-4">Related Deal</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-slate-400">No active tasks</td>
                  </tr>
                ) : (
                  sortedTasks.map(task => {
                    const deal = deals.find(d => d.id === task.dealId);
                    const isOverdue = !task.completed && new Date(task.date) < new Date(new Date().setHours(0,0,0,0));
                    
                    return (
                      <tr 
                        key={task.id}
                        onClick={() => onEditTask(task.id)}
                        className={cn(
                          "group hover:bg-slate-50 transition cursor-pointer",
                          task.completed && "bg-slate-50/50"
                        )}
                      >
                        <td className="p-4 text-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleTask(task.id, !task.completed);
                            }}
                            className={cn(
                              "w-6 h-6 rounded border flex items-center justify-center transition-colors",
                              task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 hover:border-emerald-500"
                            )}
                          >
                            {task.completed && <Check size={14} />}
                          </button>
                        </td>
                        <td className="p-4">
                          <p className={cn(
                            "font-medium text-slate-800",
                            task.completed && "line-through text-slate-400"
                          )}>
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">{task.notes || 'No notes'}</p>
                          {task.location && (
                            <div className="text-xs text-blue-500 flex items-center gap-1 mt-1 w-fit">
                              <MapPin size={12} /> {task.location}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          {deal ? (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{deal.name}</span>
                          ) : (
                            <span className="text-slate-400 text-xs">General</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className={cn(
                            "flex items-center gap-2 text-sm",
                            isOverdue ? "text-red-600 font-bold" : "text-slate-600"
                          )}>
                            {formatDate(task.date)}
                            {task.time && <span className="text-xs text-slate-400 ml-1">@ {formatTime(task.time)}</span>}
                            {isOverdue && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded uppercase">Overdue</span>}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDownloadICS(task.id);
                              }}
                              className="text-slate-400 hover:text-blue-500 transition"
                              title="Add to Calendar"
                            >
                              <CalendarPlus size={16} />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTask(task.id);
                              }}
                              className="text-slate-400 hover:text-red-500 transition"
                              title="Delete Task"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex-1 h-full overflow-hidden">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,listWeek'
            }}
            height="100%"
            events={calendarEvents}
            eventClick={(info) => onEditTask(info.event.id)}
          />
        </div>
      )}
    </div>
  );
};
