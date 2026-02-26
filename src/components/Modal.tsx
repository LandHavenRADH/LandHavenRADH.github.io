import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = "max-w-lg" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={cn("bg-white rounded-xl shadow-2xl w-full overflow-hidden flex flex-col max-h-[90vh]", maxWidth)}>
        <div className="flex justify-between items-center p-4 border-b bg-slate-50 shrink-0">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto p-6 no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
