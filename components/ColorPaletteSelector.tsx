import React from 'react';
import { PaletteIcon } from './icons';

const palettes = [
  { name: 'Indigo & Pink', primary: '#6366F1', accent: '#F472B6' },
  { name: 'Teal & Lime', primary: '#14B8A6', accent: '#A3E635' },
  { name: 'Slate & Sky', primary: '#475569', accent: '#38BDF8' },
  { name: 'Rose & Amber', primary: '#E11D48', accent: '#F59E0B' },
  { name: 'Violet & Emerald', primary: '#7C3AED', accent: '#10B981' },
  { name: 'Charcoal & Red', primary: '#334155', accent: '#EF4444' },
  { name: 'Ocean & Coral', primary: '#0891B2', accent: '#FB7185' },
  { name: 'Forest & Gold', primary: '#166534', accent: '#FACC15' },
];

interface ColorPaletteSelectorProps {
  primaryColor: string;
  accentColor: string;
  onColorChange: (primary: string, accent: string) => void;
}

const ColorPaletteSelector: React.FC<ColorPaletteSelectorProps> = ({ primaryColor, accentColor, onColorChange }) => {

  const handlePrimaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onColorChange(e.target.value, accentColor);
  };
  
  const handleAccentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onColorChange(primaryColor, e.target.value);
  };
    
  return (
    <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
            <PaletteIcon className="w-5 h-5" />
            Color Palette
        </label>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {palettes.map((palette) => {
            const isSelected = palette.primary.toLowerCase() === primaryColor.toLowerCase() && palette.accent.toLowerCase() === accentColor.toLowerCase();
            return (
              <button
                key={palette.name}
                title={palette.name}
                onClick={() => onColorChange(palette.primary, palette.accent)}
                className={`h-12 w-full rounded-md flex overflow-hidden cursor-pointer transition-all duration-200 ring-offset-2 ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isSelected ? 'ring-2 ring-indigo-600' : 'ring-1 ring-gray-300 hover:ring-indigo-400'}`}
              >
                <div style={{ backgroundColor: palette.primary }} className="w-2/3 h-full"></div>
                <div style={{ backgroundColor: palette.accent }} className="w-1/3 h-full"></div>
              </button>
            );
          })}
        </div>
        
        <details className="group">
            <summary className="text-sm font-medium text-gray-500 cursor-pointer list-none flex items-center justify-between">
                <span>Custom Colors</span>
                <span className="transition-transform duration-200 group-open:rotate-180">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </span>
            </summary>
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                    <label className="block text-xs font-medium text-gray-500">Primary</label>
                    <input type="color" value={primaryColor} onChange={handlePrimaryChange} className="mt-1 block w-full h-10 border border-gray-300 rounded-md p-0" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500">Accent</label>
                    <input type="color" value={accentColor} onChange={handleAccentChange} className="mt-1 block w-full h-10 border border-gray-300 rounded-md p-0" />
                </div>
            </div>
        </details>
    </div>
  );
};

export default ColorPaletteSelector;
