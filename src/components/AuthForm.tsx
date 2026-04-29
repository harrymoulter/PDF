import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

import { trackAuthEvent } from '../lib/history';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your settings.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data.user) {
          trackAuthEvent(data.user.id, 'login');
        }
      } else {
        // Sign Up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });

        if (signUpError) {
          console.error('Sign Up Error Details:', signUpError);
          throw signUpError;
        }

        if (signUpData.user) {
          trackAuthEvent(signUpData.user.id, 'signup');
          console.log('Auth user created:', signUpData.user.id);
          
          // Small delay to allow Supabase Auth to propagate if needed
          await new Promise(resolve => setTimeout(resolve, 500));

          // Automatically insert into 'profiles' table
          const { error: insertError } = await supabase
            .from('profiles')
            .upsert([
              {
                id: signUpData.user.id,
                email: email.toLowerCase(),
                username: fullName || email.split('@')[0],
                role: 'user'
              }
            ]);
          
          if (insertError) {
            console.error('Database Insert Error:', insertError);
            if (insertError.code === '42P01') {
              throw new Error('Database table "profiles" is missing from your new Supabase project. Please run the SQL setup script.');
            }
            if (insertError.message.includes('row-level security')) {
              throw new Error('Database permissions error (RLS) in your new project. Please check your SQL setup.');
            }
            // If it's a conflict or other error, we might just want to continue if user is created in Auth
            console.warn('Profile creation failed but proceeding:', insertError.message);
          }
          
          setSuccess('Account created successfully! Switching to login...');
          setTimeout(() => {
            setIsLogin(true);
            setSuccess(null);
          }, 2000);
        }
      }
    } catch (err: any) {
      console.error('Auth Workflow Error:', err);
      // Handle "User already registered" specially
      if (err.message?.includes('already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(err.message || 'An error occurred during authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
      >
        <div className="bg-slate-900 p-8 text-white">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center mb-6">
            {isLogin ? <LogIn size={24} /> : <UserPlus size={24} />}
          </div>
          <h2 className="text-3xl font-black mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 font-medium">
            {isLogin 
              ? 'Access your intelligent PDF toolkit' 
              : 'Join PDFMaster for free local AI intelligence'}
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="bg-amber-50 p-6 border-b border-amber-100">
            <div className="flex gap-3">
              <AlertCircle className="text-amber-600 shrink-0" size={20} />
              <div>
                <p className="text-sm font-bold text-amber-900 leading-tight">Supabase Configuration Required</p>
                <p className="text-xs text-amber-700 mt-1">To enable authentication, go to **Settings** and provide `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase project.</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 tracking-wider uppercase ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 tracking-wider uppercase ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 tracking-wider uppercase ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-2xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xl shadow-indigo-500/20"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Admin Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              {isLogin 
                ? "Don't have an account? Sign Up" 
                : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
