import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  FileText, 
  ExternalLink, 
  Trash2, 
  X
} from 'lucide-react';
import { LibraryItem } from '../types';
import { LIBRARY_CATEGORIES } from '../constants';
import { cn } from '../utils';

interface LibraryProps {
  items: LibraryItem[];
  onNewItem: () => void;
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
}

export const Library: React.FC<LibraryProps> = ({
  items,
  onNewItem,
  onEditItem,
  onDeleteItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return items.filter(it => {
      const matchCat = (selectedCategory === 'All') || (it.category === selectedCategory);
      const flat = `${it.title} ${it.description || ''} ${it.category} ${it.tags.join(' ')}`.toLowerCase();
      const matchText = flat.includes(query);
      return matchCat && matchText;
    });
  }, [items, searchQuery, selectedCategory]);

  return (
    <div className="p-8 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Library</h2>
          <p className="text-slate-500 text-sm">Central repository of company documents (Google Drive links).</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input 
              type="text" 
              placeholder="Search library..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" 
            />
          </div>
          <button 
            onClick={onNewItem}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 transition"
          >
            <Plus size={18} /> New Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-3 mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Filter by Category:</span>
        <div className="flex flex-wrap gap-2">
          {['All', ...LIBRARY_CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-2.5 py-1.5 rounded-full text-xs border transition-colors",
                selectedCategory === cat 
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-4 no-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            No items match your filters.
          </div>
        ) : (
          filteredItems.map(it => {
            const host = (() => {
              try { return new URL(it.url).hostname; } catch { return ''; }
            })();

            return (
              <div 
                key={it.id}
                onClick={() => onEditItem(it.id)}
                className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition relative group cursor-pointer flex flex-col h-full"
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(it.id);
                  }}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">{it.title}</h4>
                    <div className="text-xs text-slate-500">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">{it.category}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 line-clamp-3 mb-3 flex-1">{it.description}</p>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1">
                    {it.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">{tag}</span>
                    ))}
                  </div>
                  <a 
                    href={it.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-xs font-medium"
                  >
                    <ExternalLink size={14} /> {host.replace('www.', '') || 'Open'}
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
