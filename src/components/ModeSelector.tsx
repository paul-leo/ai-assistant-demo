import React from 'react';
import { getSystemPrompts, type PromptModeId } from '../config/ai';

interface ModeSelectorProps {
  currentMode: PromptModeId;
  onModeChange: (mode: PromptModeId) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-1">
      {Object.values(getSystemPrompts()).map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id as PromptModeId)}
          className={`px-3 py-1 rounded text-sm transition-colors duration-200 whitespace-nowrap ${
            currentMode === mode.id
              ? 'bg-white text-black font-medium'
              : 'bg-gray-200 text-black hover:bg-white hover:text-black'
          }`}
        >
          {mode.name}
        </button>
      ))}
    </div>
  );
};
