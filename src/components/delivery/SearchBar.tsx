'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

export function SearchBar({ searchTerm, onSearchChange, placeholder = "Buscar pizzas, bebidas..." }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <div className="relative max-w-2xl mx-auto mb-8 lg:mb-12">
      <div className="relative">
        {/* Input de busca */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={`w-full pl-12 lg:pl-14 pr-12 py-4 lg:py-5 bg-white dark:bg-gray-800 border-2 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none shadow-lg hover:shadow-xl transition-all duration-200 text-base lg:text-lg ${
            isFocused 
              ? 'border-red-500 dark:border-red-500 shadow-xl shadow-red-500/20' 
              : 'border-gray-300 dark:border-gray-700'
          }`}
        />
        
        {/* Ícone de busca */}
        <div className="absolute left-4 lg:left-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Search className={`w-5 h-5 lg:w-6 lg:h-6 transition-colors duration-200 ${
            isFocused ? 'text-red-500' : 'text-gray-400'
          }`} />
        </div>
        
        {/* Botão de limpar */}
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-4 lg:right-5 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all active:scale-95"
          >
            <X className="w-5 h-5 lg:w-6 lg:h-6 text-gray-400 hover:text-red-500 dark:hover:text-red-400" />
          </button>
        )}
      </div>
      
      {/* Contador de resultados */}
      {searchTerm && (
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-400">
            Buscando por: <span className="font-semibold text-white">&quot;{searchTerm}&quot;</span>
          </span>
        </div>
      )}
    </div>
  );
}
