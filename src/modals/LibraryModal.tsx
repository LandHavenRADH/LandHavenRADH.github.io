import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { LibraryItem } from '../types';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { LIBRARY_CATEGORIES } from '../views/LibraryView';

export default function LibraryModal({ closeModal, libraryId, libraryItems }: { closeModal: () => void, libraryId: string | null, libraryItems: LibraryItem[] }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(LIBRARY_CATEGORIES[0]);
  const [tags, setTags] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (libraryId) {
      const item = libraryItems.find(x => x.id === libraryId);
      if (item) {
        setTitle(item.title || '');
        setCategory(item.category || LIBRARY_CATEGORIES[0]);
        setTags((item.tags || []).join(', '));
        setUrl(item.url || '');
        setDescription(item.description || '');
      }
    }
  }, [libraryId, libraryItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalUrl = url.trim();
      if (finalUrl && !/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl;
      if (!/drive\.google\.com|docs\.google\.com/i.test(finalUrl)) {
        const cont = window.confirm('This link does not look like a Google Drive URL. Save anyway?');
        if (!cont) {
          setIsSaving(false);
          return;
        }
      }

      const payload: any = {
        title: title.trim(),
        category,
        tags: tags.split(',').map(s => s.trim()).filter(Boolean),
        url: finalUrl,
        description: description.trim(),
        userId: auth.currentUser?.uid,
        updatedAt: serverTimestamp()
      };

      if (libraryId) {
        await updateDoc(doc(db, 'gc_library', libraryId), payload);
      } else {
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'gc_library'), payload);
      }
      closeModal();
    } catch (error) {
      console.error('Library save error:', error);
      alert('Error saving library item.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">{libraryId ? 'Edit Library Item' : 'New Library Item'}</h3>
          <button onClick={closeModal} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g., Operating Agreement" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                {LIBRARY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g., 2026, board, audit" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Google Drive URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="https://drive.google.com/..." required />
            <p className="text-[10px] text-slate-400 mt-1">Paste a valid Google Drive share link (Viewer access recommended).</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Brief summary of the document."></textarea>
          </div>

          <button type="submit" disabled={isSaving} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 mt-2 transition-colors">
            {isSaving ? 'Saving...' : (libraryId ? 'Update Item' : 'Save Item')}
          </button>
        </form>
      </div>
    </div>
  );
}
