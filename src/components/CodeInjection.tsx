import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function CodeInjection() {
  useEffect(() => {
    const injectCodes = async () => {
      try {
        const { data, error } = await supabase.from('custom_codes').select('*').eq('is_enabled', true);
        if (error) return;

        data.forEach(code => {
          if (!code.content) return;

          if (code.id === 'header') {
            const range = document.createRange();
            const documentFragment = range.createContextualFragment(code.content);
            document.head.appendChild(documentFragment);
          } else if (code.id === 'body' || code.id === 'footer') {
            const range = document.createRange();
            const documentFragment = range.createContextualFragment(code.content);
            document.body.appendChild(documentFragment);
          }
        });
      } catch (err) {
        console.error('Error injecting custom codes:', err);
      }
    };

    injectCodes();
  }, []);

  return null;
}
