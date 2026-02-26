import React from 'react';
import { 
  Building, 
  LayoutDashboard, 
  MapPin, 
  ListChecks, 
  HardHat, 
  Store, 
  Calendar, 
  Users, 
  Calculator, 
  Folder, 
  Archive,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../utils';

interface SidebarProps {
  currentView: string;
  onSwitchView: (view: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSwitchView, isOpen, onToggle }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Deal Pipeline', icon: MapPin },
    { id: 'duediligence', label: 'Due Diligence', icon: ListChecks },
    { id: 'development', label: 'Development', icon: HardHat },
    { id: 'franchises', label: 'Franchise Criteria', icon: Store },
    { id: 'tasks', label: 'Tasks & Dates', icon: Calendar },
    { id: 'contacts', label: 'Contact Book', icon: Users },
    { id: 'calculator', label: 'Rent Calculator', icon: Calculator },
    { id: 'library', label: 'Library', icon: Folder },
    { id: 'archive', label: 'Archive', icon: Archive },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onToggle}
        />
      )}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out w-64 bg-slate-900 text-white flex flex-col shrink-0 z-50 shadow-xl md:relative md:translate-x-0",
        !isOpen && "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Building className="text-emerald-400" />
              Ground<span className="text-emerald-400">Control</span>
            </h1>
            <p className="text-xs text-slate-400 mt-2">Retail Lease Management</p>
          </div>
          <button onClick={onToggle} className="md:hidden p-2 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSwitchView(item.id);
                if (window.innerWidth < 768) onToggle();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                currentView === item.id 
                  ? "bg-emerald-600 text-white shadow-md" 
                  : "text-slate-300 hover:bg-slate-800"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
          v2.44.0
        </div>
      </aside>
    </>
  );
};

interface HeaderProps {
  onToggleSidebar: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onLogout }) => {
  return (
    <header className="bg-white/80 backdrop-blur-lg z-40 shadow-sm border-b border-slate-200 shrink-0">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="font-extrabold text-lg md:text-2xl text-slate-900 truncate">
            Ground Lease Group
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onToggleSidebar} 
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
            >
              <Menu size={20} />
            </button>
            
            <button 
              onClick={onLogout}
              className="bg-amber-500 text-white font-bold py-2 px-3 rounded-lg hover:bg-amber-600 transition-colors text-xs md:text-sm whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
