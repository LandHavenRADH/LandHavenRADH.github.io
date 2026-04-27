import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task, Deal } from '../types';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function TaskModal({ closeModal, taskId, dealId, deals, tasks }: { closeModal: () => void, taskId: string | null, dealId: string | null, deals: Deal[], tasks: Task[] }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [selectedDealId, setSelectedDealId] = useState(dealId || '');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setTitle(task.title || '');
        setDate(task.date || '');
        setTime(task.time || '');
        setLocation(task.location || '');
        setSelectedDealId(task.dealId || '');
        setNotes(task.notes || '');
      }
    } else if (dealId) {
      setSelectedDealId(dealId);
    }
  }, [taskId, dealId, tasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const taskData: any = {
        title, date, time, location, dealId: selectedDealId, notes,
        userId: auth.currentUser?.uid
      };
      if (taskId) {
        await updateDoc(doc(db, 'gc_tasks', taskId), taskData);
      } else {
        taskData.completed = false;
        await addDoc(collection(db, 'gc_tasks'), taskData);
      }
      closeModal();
    } catch (error) {
      console.error("Task save error:", error);
      alert("Error saving task.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">{taskId ? 'Edit Task' : 'New Task'}</h3>
          <button onClick={closeModal} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Task / Action</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Sign Purchase Agreement" required />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 123 Main St, City, ST or Zoom Link" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Related Deal</label>
            <select value={selectedDealId} onChange={e => setSelectedDealId(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
              <option value="">-- General Task --</option>
              {deals.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
          </div>
          <button type="submit" disabled={isSaving} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 mt-4 transition-colors">
            {isSaving ? 'Saving...' : (taskId ? 'Update Task' : 'Save Task')}
          </button>
        </form>
      </div>
    </div>
  );
}
