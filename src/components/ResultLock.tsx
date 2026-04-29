import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, UserPlus, LogIn, ShieldCheck, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ResultLockProps {
  children: React.ReactNode;
  isResultReady: boolean;
  message?: string;
}

export function ResultLock({ children, isResultReady, message = "Create a free account to view your result" }: ResultLockProps) {
  const { user, openLogin, openSignup } = useAuth();

  // If user is logged in, just show the result
  if (user && isResultReady) {
    return <>{children}</>;
  }

  // If result is not ready, don't show the lock yet (the tool will show its own loading/upload state)
  if (!isResultReady) {
    return <>{children}</>;
  }

  return (
    <div className="relative group/lock">
      {/* Blurred background content */}
      <div className="blur-md pointer-events-none select-none opacity-50 grayscale transition-all duration-700">
        {children}
      </div>

      {/* Lock Overlay Content */}
      <div className="absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full text-center relative overflow-hidden"
        >
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-100/50 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-slate-900/20 rotate-3">
              <Lock size={36} />
            </div>

            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
              {message}
            </h3>
            
            <p className="text-slate-500 font-medium mb-8">
              Sign up for free to unlock your result and join thousands of students and professionals.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck size={14} />
                Completely Free
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[11px] font-black uppercase tracking-wider border border-slate-200">
                <CreditCard size={14} />
                No Credit Card
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={openSignup}
                className="flex items-center justify-center gap-2 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 group"
              >
                <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                SIGN UP FREE
              </button>
              <button
                onClick={openLogin}
                className="flex items-center justify-center gap-2 h-14 bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-900 font-black rounded-2xl transition-all active:scale-95 group"
              >
                <LogIn size={20} className="group-hover:scale-110 transition-transform" />
                LOG IN
              </button>
            </div>

            <p className="mt-8 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
              Secured by SmartPDF AI
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
