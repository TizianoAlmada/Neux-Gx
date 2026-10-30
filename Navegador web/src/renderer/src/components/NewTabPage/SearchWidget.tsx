import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { useBrowserStore } from '../../stores/browserStore';
import { soundEngine } from '../../services/soundEngine';

export const SearchWidget: React.FC = () => {
  const { navigateTab, settings } = useBrowserStore();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      soundEngine.playButtonClick();
      navigateTab(query);
    }
  };

  const engineName = settings?.searchEngine || 'google';

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl relative my-5 group"
    >
      <div className="relative flex items-center bg-[#12121a]/85 backdrop-blur-md border border-[var(--color-border,rgba(255,0,85,0.3))] hover:border-[var(--color-primary,#ff0055)] rounded-2xl p-1.5 shadow-2xl transition-all duration-300 group-focus-within:border-[var(--color-primary,#ff0055)] group-focus-within:shadow-neon">
        <div className="pl-3 pr-2 text-gray-400 group-focus-within:text-[var(--color-primary,#ff0055)] transition-colors">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            soundEngine.playKeySound();
            setQuery(e.target.value);
          }}
          placeholder={`Buscar en la web con ${engineName.toUpperCase()} o ingresar dirección...`}
          className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500 text-sm py-2 px-1 font-sans tracking-wide"
          autoFocus
        />

        <button
          type="submit"
          onMouseEnter={() => soundEngine.playButtonHover()}
          className="w-9 h-9 rounded-xl bg-gradient-to-r from-[var(--color-primary,#ff0055)] to-[var(--color-secondary,#00f0ff)] flex items-center justify-center text-white shadow-neon hover:scale-105 active:scale-95 transition-all flex-shrink-0"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
