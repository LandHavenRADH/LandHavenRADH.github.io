import React, { useState, useEffect, useRef } from 'react';
import { Plus, List, Calendar as CalendarIcon, Check, MapPin, CalendarPlus, Trash2 } from 'lucide-react';
import { Task, Deal } from '../types';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

export default function TasksView({ tasks, deals, openModal }: { tasks: Task[], deals: Deal[], openModal: (name: string, params?: any) => void }) {
  const [displayMode, setDisplayMode] = useState<'list' | 'calendar' | 'completed'>('calendar');
  const calendarRef = useRef<FullCalendar>(null);

  const toggleTask = async (id: string, status: boolean) => {
    await updateDoc(doc(db, 'gc_tasks', id), { completed: status });
  };

  const deleteTask = async (id: string) => {
    await deleteDoc(doc(db, 'gc_tasks', id));
  };

  const downloadICS = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const dealName = deals.find(d => d.id === task.dealId)?.name || 'General';
    const dateStr = task.date.replace(/-/g, '');
    let dtStart, dtEnd;
    
    if (task.time) {
        const timeStr = task.time.replace(/:/g, '') + '00';
        dtStart = `DTSTART:${dateStr}T${timeStr}`;
        const [h, m] = task.time.split(':');
        let endH = (parseInt(h) + 1).toString().padStart(2, '0');
        dtEnd = `DTEND:${dateStr}T${endH}${m}00`;
    } else {
        dtStart = `DTSTART;VALUE=DATE:${dateStr}`;
        const d = new Date(task.date);
        d.setDate(d.getDate() + 1);
        const endStr = d.toISOString().split('T')[0].replace(/-/g, '');
        dtEnd = `DTEND;VALUE=DATE:${endStr}`;
    }

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        dtStart,
        dtEnd,
        `SUMMARY:${task.title} (${dealName})`,
        `DESCRIPTION:${task.notes || 'No notes added.'}`,
        task.location ? `LOCATION:${task.location}` : '',
        'BEGIN:VALARM',
        'TRIGGER:-PT15M',
        'ACTION:DISPLAY',
        'DESCRIPTION:Reminder',
        'END:VALARM',
        'END:VEVENT',
        'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    if (isIOS) {
        window.location.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(icsContent);
    } else {
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', `${task.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const formatTimeForDisplay = (timeString?: string) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const formattedMinutes = minutes.length < 2 ? `0${minutes}` : minutes;
    return `${h12}:${formattedMinutes} ${ampm}`;
  };

  const sortedTasks = [...tasks]
    .filter(t => displayMode === 'completed' ? t.completed : !t.completed)
    .sort((a,b) => (a.completed === b.completed ? new Date(a.date).getTime() - new Date(b.date).getTime() : a.completed ? 1 : -1));
  const today = new Date(); today.setHours(0,0,0,0);

  const events = tasks.map(t => ({
    id: t.id,
    title: t.title + (t.time ? ` @ ${formatTimeForDisplay(t.time)}` : ''),
    start: t.time ? `${t.date}T${t.time}` : t.date,
    backgroundColor: t.completed ? '#94a3b8' : '#3b82f6',
    borderColor: t.completed ? '#94a3b8' : '#3b82f6',
    textColor: '#ffffff'
  }));

  const handleEventDrop = async (info: any) => {
    const newDate = info.event.start.toISOString().split('T')[0];
    try {
      await updateDoc(doc(db, 'gc_tasks', info.event.id), { date: newDate });
    } catch (error) {
      info.revert();
    }
  };

  return (
    <div className="absolute inset-0 p-8 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Critical Dates & Tasks</h2>
          <p className="text-slate-500 text-sm">Manage deadlines and to-dos.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white rounded-lg border border-slate-200 p-1 flex mr-2">
            <button onClick={() => setDisplayMode('list')} className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors ${displayMode === 'list' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}>
              <List size={16} /> List
            </button>
            <button onClick={() => setDisplayMode('calendar')} className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors ${displayMode === 'calendar' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}>
              <CalendarIcon size={16} /> Calendar
            </button>
            <button onClick={() => setDisplayMode('completed')} className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors ${displayMode === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}>
              <Check size={16} /> Completed Tasks
            </button>
          </div>
          <button onClick={() => openModal('task')} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 transition">
            <Plus size={18} /> New Task
          </button>
        </div>
      </div>

      {displayMode === 'list' || displayMode === 'completed' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col h-full">
          <div className="overflow-y-auto flex-1 p-0">
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
                  <tr><td colSpan={5} className="text-center p-8 text-slate-400">No active tasks</td></tr>
                ) : (
                  sortedTasks.map(task => {
                    const dealName = deals.find(d => d.id === task.dealId)?.name || 'General';
                    const [y, m, d] = task.date.split('-').map(Number);
                    const taskDate = new Date(y, m - 1, d);
                    const isOverdue = !task.completed && taskDate < today;

                    return (
                      <tr key={task.id} className={`group hover:bg-slate-50 transition cursor-pointer ${task.completed ? 'bg-slate-50/50' : ''}`} onClick={() => openModal('task', { id: task.id })}>
                        <td className="p-4 text-center">
                          <button onClick={(e) => { e.stopPropagation(); toggleTask(task.id, !task.completed); }} className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-emerald-500'}`}>
                            {task.completed && <Check size={14} />}
                          </button>
                        </td>
                        <td className="p-4">
                          <p className={`font-medium text-slate-800 ${task.completed ? 'line-through text-slate-400' : ''}`}>{task.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{task.notes || 'No notes'}</p>
                          {task.location && (
                            <a href={task.location.startsWith('http') ? task.location : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.location)}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-1 w-fit">
                              <MapPin size={12} /> {task.location}
                            </a>
                          )}
                        </td>
                        <td className="p-4"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{dealName}</span></td>
                        <td className="p-4">
                          <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                            {new Date(y, m - 1, d).toLocaleDateString()}
                            {task.time && <span className="text-xs text-slate-400 ml-1">@ {formatTimeForDisplay(task.time)}</span>}
                            {isOverdue && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded uppercase">Overdue</span>}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={(e) => { e.stopPropagation(); downloadICS(task.id); }} className="text-slate-400 hover:text-blue-500 transition" title="Add to Calendar"><CalendarPlus size={16} /></button>
                            <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="text-slate-400 hover:text-red-500 transition" title="Delete Task"><Trash2 size={16} /></button>
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
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,listWeek' }}
            height="100%"
            editable={true}
            events={events}
            eventClick={(info) => openModal('task', { id: info.event.id })}
            eventDrop={handleEventDrop}
          />
        </div>
      )}
    </div>
  );
}
