import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Building } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { cn } from '../utils';

interface LoginOverlayProps {
  isVisible: boolean;
}

export const LoginOverlay: React.FC<LoginOverlayProps> = ({ isVisible }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error("Login Failed:", err);
      let msg = "Login failed.";
      if (err.code === 'auth/invalid-email') msg = "Invalid email address format.";
      else if (err.code === 'auth/user-not-found') msg = "No user found with this email.";
      else if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
      else if (err.code === 'auth/too-many-requests') msg = "Too many attempts. Try again later.";
      else if (err.message) msg = err.message;
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsGuestLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error("Guest login error:", err);
      setError("Demo access failed.");
    } finally {
      setIsGuestLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-4 transition-opacity duration-500">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900 mb-3">
              <Building size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Ground Lease Group</h1>
            <p className="text-slate-500 text-sm mt-1">Retail Lease Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                placeholder="name@company.com" 
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" 
                placeholder="••••••••" 
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-slate-200 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 mb-4">Don't have an account? Ask your administrator.</p>
            <button 
              onClick={handleGuestLogin}
              disabled={isGuestLoading}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center justify-center gap-2 mx-auto py-2 px-4 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50"
            >
              {isGuestLoading ? 'Accessing Demo...' : 'Enter as Guest (Demo)'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">v2.44 • Full System</p>
        </div>
      </div>
    </div>
  );
};
