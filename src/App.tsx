import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signInAnonymously, signOut } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Building, AlertCircle, ArrowRight, Menu, LayoutDashboard, MapPin, ListChecks, HardHat, Store, Calendar, Users, Calculator, Folder, Archive } from 'lucide-react';
import { Deal, Task, Contact, Franchise, LibraryItem, ConstructionCost } from './types';

// Views
import DashboardView from './views/DashboardView';
import PipelineView from './views/PipelineView';
import DueDiligenceView from './views/DueDiligenceView';
import DevelopmentView from './views/DevelopmentView';
import FranchisesView from './views/FranchisesView';
import TasksView from './views/TasksView';
import ContactsView from './views/ContactsView';
import CalculatorView from './views/CalculatorView';
import CostEstimatorView from './views/CostEstimatorView';
import LibraryView from './views/LibraryView';
import ArchiveView from './views/ArchiveView';

// Modals
import DealModal from './modals/DealModal';
import DealDetailModal from './modals/DealDetailModal';
import DDModal from './modals/DDModal';
import DevModal from './modals/DevModal';
import FranchiseModal from './modals/FranchiseModal';
import TaskModal from './modals/TaskModal';
import ContactModal from './modals/ContactModal';
import LibraryModal from './modals/LibraryModal';
import SoldModal from './modals/SoldModal';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data State
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [constructionCosts, setConstructionCosts] = useState<ConstructionCost[]>([]);

  // Modals State
  const [modals, setModals] = useState({
    deal: { open: false, id: null as string | null },
    dealDetail: { open: false, id: null as string | null },
    dd: { open: false, id: null as string | null },
    dev: { open: false, id: null as string | null },
    franchise: { open: false, id: null as string | null },
    task: { open: false, id: null as string | null, dealId: null as string | null },
    contact: { open: false, id: null as string | null, dealId: null as string | null, ddItemId: null as string | null, devItemId: null as string | null },
    library: { open: false, id: null as string | null },
    sold: { open: false, dealId: null as string | null },
  });

  const openModal = (name: keyof typeof modals, params: any = {}) => {
    setModals(prev => ({ 
      ...prev, 
      [name]: { 
        ...prev[name], 
        open: true, 
        id: null, 
        dealId: null, 
        ddItemId: null, 
        devItemId: null, 
        ...params 
      } 
    }));
  };
  const closeModal = (name: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [name]: { ...prev[name], open: false } }));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Subscriptions
    const unsubDeals = onSnapshot(collection(db, 'gc_deals'), (snapshot) => {
      setDeals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Deal)));
    });
    const unsubTasks = onSnapshot(collection(db, 'gc_tasks'), (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    });
    const unsubContacts = onSnapshot(collection(db, 'gc_contacts'), (snapshot) => {
      setContacts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Contact)));
    });
    const unsubFranchises = onSnapshot(collection(db, 'gc_franchises'), (snapshot) => {
      setFranchises(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Franchise)));
    });
    const unsubLibrary = onSnapshot(collection(db, 'gc_library'), (snapshot) => {
      setLibraryItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LibraryItem)));
    });
    const unsubConstructionCosts = onSnapshot(collection(db, 'gc_construction_costs'), (snapshot) => {
      setConstructionCosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConstructionCost)));
    });

    return () => {
      unsubDeals();
      unsubTasks();
      unsubContacts();
      unsubFranchises();
      unsubLibrary();
      unsubConstructionCosts();
    };
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      setLoginError(err.message || 'Demo access failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (loadingAuth) return <div className="h-screen flex items-center justify-center bg-slate-100">Loading...</div>;

  if (!user) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-3">
                <Building size={24} />
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">Ground Lease Group</h1>
              <p className="text-slate-500 text-sm mt-1">Retail Lease Management System</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="name@company.com" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <input type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="••••••••" required />
              </div>

              <button type="submit" disabled={isLoggingIn} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-slate-200 active:scale-[0.98]">
                {isLoggingIn ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 mb-4">Don't have an account? Ask your administrator.</p>
              <button onClick={handleGuestLogin} disabled={isLoggingIn} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center justify-center gap-2 mx-auto py-2 px-4 rounded-lg hover:bg-emerald-50 transition-colors">
                Enter as Guest (Demo) <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">v2.44 • Full System</p>
          </div>
        </div>
      </div>
    );
  }

  const NavItem = ({ id, icon: Icon, label }: any) => {
    const active = currentView === id;
    return (
      <button onClick={() => { setCurrentView(id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800'}`}>
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="bg-slate-100 text-slate-900 h-screen flex flex-col overflow-hidden">
      <header className="bg-white/80 backdrop-blur-lg z-40 shadow-sm border-b border-slate-200 shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="font-extrabold text-lg md:text-2xl text-slate-900 truncate">
              Ground Lease Group
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200">
                <Menu size={20} />
              </button>
              <button onClick={handleLogout} className="bg-amber-500 text-white font-bold py-2 px-3 rounded-lg hover:bg-amber-600 transition-colors text-xs md:text-sm whitespace-nowrap">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
        <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-slate-900 text-white flex flex-col shrink-0 z-50 shadow-xl md:shadow-none`}>
          <div className="p-6 border-b border-slate-700 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Building className="text-emerald-400" />
                Ground<span className="text-emerald-400">Control</span>
              </h1>
              <p className="text-xs text-slate-400 mt-2">Retail Lease Management</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg z-50 border border-slate-200">
              <Menu size={20} />
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem id="pipeline" icon={MapPin} label="Deal Pipeline" />
            <NavItem id="duediligence" icon={ListChecks} label="Due Diligence" />
            <NavItem id="development" icon={HardHat} label="Development" />
            <NavItem id="franchises" icon={Store} label="Franchise Criteria" />
            <NavItem id="tasks" icon={Calendar} label="Tasks & Dates" />
            <NavItem id="contacts" icon={Users} label="Contact Book" />
            <NavItem id="calculator" icon={Calculator} label="Rent Calculator" />
            <NavItem id="costestimator" icon={Building} label="Cost Estimator" />
            <NavItem id="library" icon={Folder} label="Library" />
            <NavItem id="archive" icon={Archive} label="Archive" />
          </nav>
          <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
            v2.44.0
          </div>
        </div>

        <main className="flex-1 relative bg-slate-100 overflow-hidden">
          {currentView === 'dashboard' && <DashboardView deals={deals} tasks={tasks} setCurrentView={setCurrentView} />}
          {currentView === 'pipeline' && <PipelineView deals={deals} franchises={franchises} openModal={openModal} />}
          {currentView === 'duediligence' && <DueDiligenceView deals={deals} franchises={franchises} openModal={openModal} />}
          {currentView === 'development' && <DevelopmentView deals={deals} franchises={franchises} openModal={openModal} />}
          {currentView === 'franchises' && <FranchisesView franchises={franchises} constructionCosts={constructionCosts} openModal={openModal} />}
          {currentView === 'tasks' && <TasksView tasks={tasks} deals={deals} openModal={openModal} />}
          {currentView === 'contacts' && <ContactsView contacts={contacts} deals={deals} openModal={openModal} />}
          {currentView === 'calculator' && <CalculatorView deals={deals} franchises={franchises} />}
          {currentView === 'costestimator' && <CostEstimatorView franchises={franchises} constructionCosts={constructionCosts} />}
          {currentView === 'library' && <LibraryView libraryItems={libraryItems} openModal={openModal} />}
          {currentView === 'archive' && <ArchiveView deals={deals} openModal={openModal} />}
        </main>
      </div>

      {modals.deal.open && <DealModal closeModal={() => closeModal('deal')} dealId={modals.deal.id} deals={deals} franchises={franchises} />}
      {modals.dealDetail.open && <DealDetailModal closeModal={() => closeModal('dealDetail')} dealId={modals.dealDetail.id} deals={deals} franchises={franchises} tasks={tasks} contacts={contacts} openModal={openModal} setCurrentView={setCurrentView} />}
      {modals.dd.open && <DDModal closeModal={() => closeModal('dd')} dealId={modals.dd.id} deals={deals} openModal={openModal} setCurrentView={setCurrentView} />}
      {modals.dev.open && <DevModal closeModal={() => closeModal('dev')} dealId={modals.dev.id} deals={deals} openModal={openModal} setCurrentView={setCurrentView} />}
      {modals.franchise.open && <FranchiseModal closeModal={() => closeModal('franchise')} franchiseId={modals.franchise.id} franchises={franchises} />}
      {modals.task.open && <TaskModal closeModal={() => closeModal('task')} taskId={modals.task.id} dealId={modals.task.dealId} deals={deals} tasks={tasks} />}
      {modals.contact.open && <ContactModal closeModal={() => closeModal('contact')} contactId={modals.contact.id} dealId={modals.contact.dealId} ddItemId={modals.contact.ddItemId} devItemId={modals.contact.devItemId} deals={deals} contacts={contacts} />}
      {modals.library.open && <LibraryModal closeModal={() => closeModal('library')} libraryId={modals.library.id} libraryItems={libraryItems} />}
      {modals.sold.open && <SoldModal closeModal={() => closeModal('sold')} dealId={modals.sold.dealId} deals={deals} />}
    </div>
  );
}
