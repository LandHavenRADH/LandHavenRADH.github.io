import React, { useState, useEffect, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, getCollectionRef, getDocRef } from './firebase';
import { 
  Deal, 
  Task, 
  Contact, 
  Franchise, 
  LibraryItem, 
  DealStage,
  CalcParams
} from './types';
import { 
  ListChecks, 
  HardHat 
} from 'lucide-react';
import { Sidebar, Header } from './components/Layout';
import { LoginOverlay } from './components/LoginOverlay';
import { Dashboard } from './components/Dashboard';
import { Pipeline } from './components/Pipeline';
import { ChecklistBoard } from './components/ChecklistBoard';
import { Franchises } from './components/Franchises';
import { Tasks } from './components/Tasks';
import { Contacts } from './components/Contacts';
import { Calculator } from './components/Calculator';
import { Library } from './components/Library';
import { Archive } from './components/Archive';
import { 
  DealModal, 
  TaskModal, 
  ContactModal, 
  FranchiseModal, 
  LibraryModal 
} from './components/Modals';
import { DD_STAGES, DEV_STAGES } from './constants';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Data State
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  
  // UI State
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    type: 'deal' | 'task' | 'contact' | 'franchise' | 'library' | null;
    editingId: string | null;
    initialData?: any;
  }>({ type: null, editingId: null });

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setCurrentView('dashboard');
      }
    });
    return () => unsubscribe();
  }, []);

  // Data Listeners
  useEffect(() => {
    if (!user) return;

    const unsubDeals = onSnapshot(getCollectionRef('gc_deals'), (snapshot) => {
      setDeals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deal)));
    });

    const unsubTasks = onSnapshot(getCollectionRef('gc_tasks'), (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    });

    const unsubContacts = onSnapshot(getCollectionRef('gc_contacts'), (snapshot) => {
      setContacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact)));
    });

    const unsubFranchises = onSnapshot(getCollectionRef('gc_franchises'), (snapshot) => {
      setFranchises(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Franchise)));
    });

    const unsubLibrary = onSnapshot(getCollectionRef('gc_library'), (snapshot) => {
      setLibraryItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LibraryItem)));
    });

    return () => {
      unsubDeals();
      unsubTasks();
      unsubContacts();
      unsubFranchises();
      unsubLibrary();
    };
  }, [user]);

  const handleLogout = () => signOut(auth);

  const handleMoveStage = async (id: string, stage: DealStage) => {
    await updateDoc(getDocRef('gc_deals', id), { stage, updatedAt: serverTimestamp() });
  };

  const handleMoveDDStage = async (id: string, ddStatus: string) => {
    await updateDoc(getDocRef('gc_deals', id), { ddStatus, updatedAt: serverTimestamp() });
  };

  const handleMoveDevStage = async (id: string, devStatus: string) => {
    await updateDoc(getDocRef('gc_deals', id), { devStatus, updatedAt: serverTimestamp() });
  };

  const handleDeleteDeal = async (id: string) => {
    if (confirm('Delete this deal?')) {
      await deleteDoc(getDocRef('gc_deals', id));
    }
  };

  const handleRestoreDeal = async (id: string) => {
    const deal = deals.find(d => d.id === id);
    if (deal) {
      await updateDoc(getDocRef('gc_deals', id), { 
        stage: deal.previousStage || 'prospect',
        updatedAt: serverTimestamp()
      });
    }
  };

  const handleSaveCalcParams = async (dealId: string, params: CalcParams, purchasePrice: number) => {
    await updateDoc(getDocRef('gc_deals', dealId), { 
      calcParams: params,
      value: purchasePrice,
      updatedAt: serverTimestamp() 
    });
  };

  // Generic Save Handlers
  const handleSaveDeal = async (data: Partial<Deal>) => {
    if (modalState.editingId) {
      await updateDoc(getDocRef('gc_deals', modalState.editingId), { ...data, updatedAt: serverTimestamp() });
    } else {
      await addDoc(getCollectionRef('gc_deals'), { 
        ...data, 
        createdAt: serverTimestamp(), 
        updatedAt: serverTimestamp(),
        checklist: [],
        devChecklist: [],
        ddStatus: 'not-started',
        devStatus: 'not-started'
      });
    }
    setModalState({ type: null, editingId: null });
  };

  const handleSaveTask = async (data: Partial<Task>) => {
    if (modalState.editingId) {
      await updateDoc(getDocRef('gc_tasks', modalState.editingId), { ...data, updatedAt: serverTimestamp() });
    } else {
      await addDoc(getCollectionRef('gc_tasks'), { 
        ...data, 
        completed: false,
        createdAt: serverTimestamp(), 
        updatedAt: serverTimestamp() 
      });
    }
    setModalState({ type: null, editingId: null });
  };

  const handleSaveContact = async (data: Partial<Contact>) => {
    if (modalState.editingId) {
      await updateDoc(getDocRef('gc_contacts', modalState.editingId), { ...data, updatedAt: serverTimestamp() });
    } else {
      await addDoc(getCollectionRef('gc_contacts'), { 
        ...data, 
        createdAt: serverTimestamp(), 
        updatedAt: serverTimestamp() 
      });
    }
    setModalState({ type: null, editingId: null });
  };

  const handleSaveFranchise = async (data: Partial<Franchise>) => {
    if (modalState.editingId) {
      await updateDoc(getDocRef('gc_franchises', modalState.editingId), { ...data, updatedAt: serverTimestamp() });
    } else {
      await addDoc(getCollectionRef('gc_franchises'), { 
        ...data, 
        createdAt: serverTimestamp(), 
        updatedAt: serverTimestamp() 
      });
    }
    setModalState({ type: null, editingId: null });
  };

  const handleSaveLibrary = async (data: Partial<LibraryItem>) => {
    if (modalState.editingId) {
      await updateDoc(getDocRef('gc_library', modalState.editingId), { ...data, updatedAt: serverTimestamp() });
    } else {
      await addDoc(getCollectionRef('gc_library'), { 
        ...data, 
        createdAt: serverTimestamp(), 
        updatedAt: serverTimestamp() 
      });
    }
    setModalState({ type: null, editingId: null });
  };

  const handleDeleteFranchise = async (id: string) => {
    if (confirm('Delete this franchise profile?')) {
      await deleteDoc(getDocRef('gc_franchises', id));
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm('Delete this contact?')) {
      await deleteDoc(getDocRef('gc_contacts', id));
    }
  };

  const handleDeleteLibraryItem = async (id: string) => {
    if (confirm('Delete this library item?')) {
      await deleteDoc(getDocRef('gc_library', id));
    }
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    await updateDoc(getDocRef('gc_tasks', id), { completed, updatedAt: serverTimestamp() });
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Delete this task?')) {
      await deleteDoc(getDocRef('gc_tasks', id));
    }
  };

  const handleDownloadICS = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const deal = deals.find(d => d.id === task.dealId);
    const dateStr = task.date.replace(/-/g, '');
    let dtStart = `DTSTART;VALUE=DATE:${dateStr}`;
    let dtEnd = `DTEND;VALUE=DATE:${dateStr}`;

    if (task.time) {
      const timeStr = task.time.replace(/:/g, '') + '00';
      dtStart = `DTSTART:${dateStr}T${timeStr}`;
      const [h, m] = task.time.split(':');
      let endH = (parseInt(h) + 1).toString().padStart(2, '0');
      dtEnd = `DTEND:${dateStr}T${endH}${m}00`;
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      dtStart,
      dtEnd,
      `SUMMARY:${task.title} (${deal?.name || 'General'})`,
      `DESCRIPTION:${task.notes || ''}`,
      task.location ? `LOCATION:${task.location}` : '',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${task.title.replace(/[^a-z0-9]/gi, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            deals={deals} 
            tasks={tasks} 
            onSwitchView={setCurrentView}
            onEditTask={(id) => setModalState({ type: 'task', editingId: id })}
          />
        );
      case 'pipeline':
        return (
          <Pipeline 
            deals={deals.filter(d => d.stage !== 'sold' && d.stage !== 'cancelled')} 
            franchises={franchises}
            onNewDeal={() => setModalState({ type: 'deal', editingId: null })}
            onOpenDeal={(id) => { setModalState({ type: 'deal', editingId: id }); }}
            onDeleteDeal={handleDeleteDeal}
            onMoveStage={handleMoveStage}
          />
        );
      case 'duediligence':
        return (
          <ChecklistBoard 
            title="Due Diligence Tracking"
            description="Manage environmental, survey, and title action items per deal."
            deals={deals.filter(d => d.stage !== 'sold' && d.stage !== 'cancelled')}
            franchises={franchises}
            stages={DD_STAGES}
            statusKey="ddStatus"
            checklistKey="checklist"
            icon={ListChecks}
            accentColor="bg-emerald-500"
            onOpenDetail={(id) => { setModalState({ type: 'deal', editingId: id }); }}
            onMoveStage={handleMoveDDStage}
          />
        );
      case 'development':
        return (
          <ChecklistBoard 
            title="Site Development"
            description="Manage construction and 'pad ready' tasks per deal."
            deals={deals.filter(d => d.stage !== 'sold' && d.stage !== 'cancelled')}
            franchises={franchises}
            stages={DEV_STAGES}
            statusKey="devStatus"
            checklistKey="devChecklist"
            icon={HardHat}
            accentColor="bg-amber-500"
            onOpenDetail={(id) => { setModalState({ type: 'deal', editingId: id }); }}
            onMoveStage={handleMoveDevStage}
          />
        );
      case 'franchises':
        return (
          <Franchises 
            franchises={franchises}
            onNewFranchise={() => setModalState({ type: 'franchise', editingId: null })}
            onEditFranchise={(id) => setModalState({ type: 'franchise', editingId: id })}
            onDeleteFranchise={handleDeleteFranchise}
            onRemoveLink={() => {}} // Placeholder
          />
        );
      case 'tasks':
        return (
          <Tasks 
            tasks={tasks}
            deals={deals}
            onNewTask={() => setModalState({ type: 'task', editingId: null })}
            onEditTask={(id) => setModalState({ type: 'task', editingId: id })}
            onDeleteTask={handleDeleteTask}
            onToggleTask={handleToggleTask}
            onDownloadICS={handleDownloadICS}
          />
        );
      case 'contacts':
        return (
          <Contacts 
            contacts={contacts}
            deals={deals}
            onNewContact={() => setModalState({ type: 'contact', editingId: null })}
            onEditContact={(id) => setModalState({ type: 'contact', editingId: id })}
            onDeleteContact={handleDeleteContact}
          />
        );
      case 'calculator':
        return (
          <Calculator 
            deals={deals.filter(d => d.stage !== 'cancelled')}
            franchises={franchises}
            selectedDealId={selectedDealId}
            onDealSelect={setSelectedDealId}
            onSaveParams={handleSaveCalcParams}
          />
        );
      case 'library':
        return (
          <Library 
            items={libraryItems}
            onNewItem={() => setModalState({ type: 'library', editingId: null })}
            onEditItem={(id) => setModalState({ type: 'library', editingId: id })}
            onDeleteItem={handleDeleteLibraryItem}
          />
        );
      case 'archive':
        return (
          <Archive 
            deals={deals}
            onOpenDeal={(id) => { setModalState({ type: 'deal', editingId: id }); }}
            onRestoreDeal={handleRestoreDeal}
          />
        );
      default:
        return <Dashboard deals={deals} tasks={tasks} onSwitchView={setCurrentView} onEditTask={() => {}} />;
    }
  };

  return (
    <div className="bg-slate-100 text-slate-900 h-screen flex flex-col overflow-hidden">
      <LoginOverlay isVisible={!user} />
      
      {user && (
        <>
          <Header 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            onLogout={handleLogout} 
          />
          
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
            <Sidebar 
              currentView={currentView} 
              onSwitchView={setCurrentView} 
              isOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            
            <main className="flex-1 relative bg-slate-100 overflow-hidden">
              {renderView()}
            </main>
          </div>

          {/* Modals */}
          <DealModal 
            isOpen={modalState.type === 'deal'}
            onClose={() => setModalState({ type: null, editingId: null })}
            onSave={handleSaveDeal}
            deal={modalState.editingId ? deals.find(d => d.id === modalState.editingId) : null}
            franchises={franchises}
          />

          <TaskModal 
            isOpen={modalState.type === 'task'}
            onClose={() => setModalState({ type: null, editingId: null })}
            onSave={handleSaveTask}
            task={modalState.editingId ? tasks.find(t => t.id === modalState.editingId) : null}
            deals={deals}
            initialDealId={modalState.initialData?.dealId}
          />

          <ContactModal 
            isOpen={modalState.type === 'contact'}
            onClose={() => setModalState({ type: null, editingId: null })}
            onSave={handleSaveContact}
            contact={modalState.editingId ? contacts.find(c => c.id === modalState.editingId) : null}
            deals={deals}
            initialDealId={modalState.initialData?.dealId}
          />

          <FranchiseModal 
            isOpen={modalState.type === 'franchise'}
            onClose={() => setModalState({ type: null, editingId: null })}
            onSave={handleSaveFranchise}
            franchise={modalState.editingId ? franchises.find(f => f.id === modalState.editingId) : null}
          />

          <LibraryModal 
            isOpen={modalState.type === 'library'}
            onClose={() => setModalState({ type: null, editingId: null })}
            onSave={handleSaveLibrary}
            item={modalState.editingId ? libraryItems.find(i => i.id === modalState.editingId) : null}
          />
        </>
      )}
    </div>
  );
}

// Re-importing icons for the renderView function
