'use client';

import { AlertCircle, ExternalLink } from 'lucide-react';

interface DemoBannerProps {
  isVisible: boolean;
}

export function DemoBanner({ isVisible }: DemoBannerProps) {
  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5" />
            <div className="flex items-center space-x-2">
              <span className="font-medium">Modo de Demonstração</span>
              <span className="text-blue-100">•</span>
              <span className="text-sm text-blue-100">
                Usando dados de exemplo para desenvolvimento
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/dotflow/dotflow-api"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-sm hover:text-blue-200 transition-colors"
            >
              <span>Documentação API</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-blue-100">API Offline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 