import React from 'react';
import { X, Lock, Sparkles, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function UsageLimitModal({ isOpen, onClose, onLogin }: UsageLimitModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[2.5rem] border-4 border-slate-900 shadow-2xl overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
            >
              <X size={20} className="text-slate-400" />
            </button>

            <div className="p-8 pt-12 text-center">
              <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
                <Lock size={40} />
              </div>

              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Daily Limit Reached</h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                You have reached your daily limit of 5 free operations. Log in to your account to continue using our advanced PDF tools without restrictions.
              </p>

              <div className="space-y-4">
                <button
                  onClick={onLogin}
                  className="w-full bg-slate-900 text-white h-14 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  <LogIn size={20} />
                  Log In to Continue
                </button>
                
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-3">
                  <Sparkles size={18} className="text-indigo-600 flex-shrink-0" />
                  <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest text-left">
                    Registered users get priority processing & unlimited operations.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">&copy; 2026 SmartPDF Professional</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
