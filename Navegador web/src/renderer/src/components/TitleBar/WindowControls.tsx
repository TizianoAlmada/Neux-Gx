import React from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { useBrowserStore } from '../../stores/browserStore';
import { soundEngine } from '../../services/soundEngine';

export const WindowControls: React.FC = () => {
  const { isMaximized, minimizeWindow, maximizeWindow, closeWindow } = useBrowserStore();

  return (
    <div className="flex items-center h-full no-drag">
      <button
        onClick={() => {
          soundEngine.playButtonClick();
          minimizeWindow();
        }}
        onMouseEnter={() => soundEngine.playButtonHover()}
        className="w-11 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        title="Minimizar"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => {
          soundEngine.playButtonClick();
          maximizeWindow();
        }}
        onMouseEnter={() => soundEngine.playButtonHover()}
        className="w-11 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        title={isMaximized ? 'Restaurar' : 'Maximizar'}
      >
        {isMaximized ? (
          <Copy className="w-3 h-3 rotate-180" />
        ) : (
          <Square className="w-3 h-3" />
        )}
      </button>

      <button
        onClick={() => {
          soundEngine.playButtonClick();
          closeWindow();
        }}
        onMouseEnter={() => soundEngine.playButtonHover()}
        className="w-11 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-600 transition-colors"
        title="Cerrar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
