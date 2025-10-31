import React from 'react';
import type { ImageFile } from '../types';
import { PhotoIcon } from './icons';

const stockBackgrounds = [
  { name: 'Retro Tech', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=1200' },
  { name: 'Abstract Waves', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200' },
  { name: 'Gradient Tech', url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1200' },
  { name: 'Global Network', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200' },
];

interface BackgroundSelectorProps {
  onFileSelect: (file: ImageFile | null) => void;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ onFileSelect }) => {
    const [selected, setSelected] = React.useState<'custom' | string>('custom');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleCustomFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    onFileSelect({ name: file.name, dataUrl: event.target.result as string });
                    setSelected('custom');
                }
            };
            reader.readAsDataURL(file);
        } else {
            onFileSelect(null);
        }
    };
    
    const handleStockSelect = (url: string) => {
        onFileSelect({ name: url, dataUrl: url });
        setSelected(url);
        // Clear file input if a stock image is selected
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                <PhotoIcon className="w-5 h-5" />
                Background Image (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
                 <div className="col-span-2">
                     <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*" 
                        onChange={handleCustomFileChange} 
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-600 hover:file:bg-gray-100"
                    />
                 </div>
                 {stockBackgrounds.map(bg => (
                     <button
                         key={bg.name}
                         onClick={() => handleStockSelect(bg.url)}
                         className={`relative h-16 w-full rounded-md overflow-hidden ring-offset-2 ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${selected === bg.url ? 'ring-2 ring-indigo-600' : 'ring-1 ring-gray-300'}`}
                     >
                         <img src={bg.url} alt={bg.name} className="absolute inset-0 w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/40"></div>
                         <span className="absolute bottom-1 left-2 text-white text-xs font-semibold">{bg.name}</span>
                     </button>
                 ))}
            </div>
        </div>
    );
};

export default BackgroundSelector;