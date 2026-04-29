import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (view === 'login') {
        // LOGIN FLOW: Simple and direct via email
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email, // Use email state directly
          password,
        });

        if (authError) throw authError;

        // AUTH SUCCESS: Check and Auto-Repair profile if missing
        if (authData?.user) {
          const user = authData.user;
          const { data: profileCheck } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

          if (!profileCheck) {
            // AUTO-REPAIR: Profile is missing, let's create it
            const { error: repairError } = await supabase.from('profiles').insert({
              id: user.id,
              email: user.email!,
              username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
              role: 'user'
            });
            if (repairError) {
              console.error('Profile auto-repair failed:', repairError);
            }
          }
        }

        onClose();
      } else {
        // SIGNUP FLOW
        // 1. Pre-validation of username
        if (username.length < 3) throw new Error('Username must be at least 3 characters');
        
        const { data: usernameExists } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .maybeSingle();

        if (usernameExists) {
          throw new Error('This username is already taken. Please choose another.');
        }

        // 2. Auth Sign Up
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username // Stored in metadata for trigger/fallback
            }
          }
        });

        if (authError) {
          if (authError.message === 'User already registered') {
            throw new Error('This email is already associated with an account. Please sign in.');
          }
          throw authError;
        }

        // 3. Profile Sync
        if (data.user) {
          const { error: insertError } = await supabase.from('profiles').upsert({ 
            id: data.user.id, 
            email: data.user.email!, 
            username: username,
            role: 'user' 
          });
          
          if (insertError) {
            console.error('Initial profile sync failed:', insertError);
            // If the table is missing it's a critical setup issue
            if (insertError.code === '42P01') {
              throw new Error('Database setup incomplete: The "profiles" table is missing in your NEW Supabase project. Please run the SQL setup script.');
            }
            if (insertError.message.includes('row-level security')) {
              throw new Error('Database permissions error: RLS policy is blocking the profile creation. Please check your SQL setup.');
            }
          }
          
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-6 md:p-8 overflow-y-auto">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              {view === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-500 mt-2 font-medium">
              {view === 'login' 
                ? 'Login to view your results and history' 
                : 'Join PDFMaster AI to start processing documents'}
            </p>
            {view === 'signup' && (
              <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-black text-green-600 bg-green-50 py-1.5 px-3 rounded-full uppercase tracking-wider mx-auto w-fit">
                <CreditCard size={12} />
                Sign up for free – no credit card required
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Email Address
              </label>
              <div className="relative">
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-100 h-12 pl-10 pr-4 rounded-xl text-sm focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500/50 outline-none transition-all font-medium"
                />
                <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              </div>
            </div>

            {view === 'signup' && (
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Username
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    required={view === 'signup'}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="johndoe"
                    className="w-full bg-slate-50 border border-slate-100 h-12 pl-10 pr-4 rounded-xl text-sm focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500/50 outline-none transition-all font-medium"
                  />
                  <User className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 h-12 pl-10 pr-4 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500/50 outline-none transition-all font-medium"
                />
                <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 text-xs font-bold"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              disabled={loading}
              className="w-full bg-slate-900 text-white h-12 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                view === 'login' ? 'Sign In' : 'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            {view === 'login' ? (
              <>
                Don't have an account?{' '}
                <button 
                  onClick={() => setView('signup')}
                  className="text-red-500 font-black hover:underline underline-offset-4"
                >
                  Create Account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button 
                  onClick={() => setView('login')}
                  className="text-red-500 font-black hover:underline underline-offset-4"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
