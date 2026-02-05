"use client";

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { HiGlobeAlt } from 'react-icons/hi';

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1] || 'es';

  const changeLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    
    // Force hard navigation to ensure locale change
    window.location.href = newPath;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
        title="Cambiar idioma / Change language"
      >
        <HiGlobeAlt size={24} className="text-white" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-firstColor rounded-lg shadow-xl border border-white/20 z-50">
          <div className="py-2">
            <button
              onClick={() => changeLocale('es')}
              className={`block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors ${
                currentLocale === 'es' ? 'bg-white/20 font-semibold' : ''
              }`}
            >
              🇪🇸 Español
            </button>
            <button
              onClick={() => changeLocale('en')}
              className={`block w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors ${
                currentLocale === 'en' ? 'bg-white/20 font-semibold' : ''
              }`}
            >
              🇺🇸 English
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
