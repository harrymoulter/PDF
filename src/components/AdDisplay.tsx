import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { Ad } from '../types';

interface AdDisplayProps {
  position: 'After Header' | 'Before Footer' | 'Inside Content' | 'Sidebar Top' | 'Sidebar Bottom';
  className?: string;
}

export function AdDisplay({ position, className }: AdDisplayProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const { data, error } = await supabase
          .from('ad_placements')
          .select('*')
          .eq('active', true)
          .or(`position.eq.${position},position.eq.ALL`);
        
        if (error) return;
        setAds(data || []);
      } catch (err) {
        console.error('Error fetching display ads:', err);
      }
    };

    fetchAds();
  }, [position]);

  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 15000); // 15s rotation for diversity
    return () => clearInterval(timer);
  }, [ads.length]);

  // Inject script when ad changes
  useEffect(() => {
    if (!ads[currentIndex] || !containerRef.current) return;
    
    // Clear previous ad content
    containerRef.current.innerHTML = '';
    
    const adCode = ads[currentIndex].code;
    const range = document.createRange();
    const fragment = range.createContextualFragment(adCode);
    
    containerRef.current.appendChild(fragment);
  }, [currentIndex, ads]);

  if (ads.length === 0) return null;

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.div
          key={ads[currentIndex].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative w-full flex flex-col items-center justify-center overflow-hidden"
        >
          <div className="w-full flex justify-center">
            <div 
              ref={containerRef}
              className="max-w-full overflow-hidden flex justify-center items-center"
            />
          </div>
          <div className="mt-1 flex items-center justify-center gap-1 opacity-20 hover:opacity-100 transition-opacity">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Advertisement</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
