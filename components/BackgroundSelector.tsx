import React, { useState, useRef, useCallback } from 'react';
import type { ImageFile } from '../types';
import { PhotoIcon, SpinnerIcon, WandIcon, SparklesIcon } from './icons';
import { generateBackgroundImage, generateImagePromptSuggestion } from '../services/geminiService';


const stockBackgrounds = [
  { name: 'Retro Tech', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=1200' },
  { name: 'Abstract Waves', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1200' },
  { name: 'Gradient Tech', url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1200' },
  { name: 'Global Network', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200' },
];

interface BackgroundSelectorProps {
  onFileSelect: (file: ImageFile | null) => void;
  flyerTopic: string;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ onFileSelect, flyerTopic }) => {
    const [selected, setSelected] = useState<'custom' | 'ai' | string>('custom');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<ImageFile | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCustomFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    onFileSelect({ name: file.name, dataUrl: event.target.result as string });
                    setSelected('custom');
                    setGeneratedImage(null);
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
        setGeneratedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleGenerateImage = useCallback(async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        setGeneratedImage(null);
        try {
            const imageDataUrl = await generateBackgroundImage(aiPrompt);
            const newImage = { name: `AI: ${aiPrompt}`, dataUrl: imageDataUrl };
            setGeneratedImage(newImage);
            onFileSelect(newImage);
            setSelected('ai');
        } catch (error) {
            console.error("Failed to generate background image:", error);
            alert("Sorry, the image could not be generated. Please try a different prompt.");
        } finally {
            setIsGenerating(false);
        }
    }, [aiPrompt, onFileSelect]);

    const handlePromptSuggestion = useCallback(async () => {
        setIsSuggesting(true);
        try {
            const suggestion = await generateImagePromptSuggestion(flyerTopic);
            setAiPrompt(suggestion);
        } catch (error) {
            console.error("Failed to get prompt suggestion:", error);
        } finally {
            setIsSuggesting(false);
        }
    }, [flyerTopic]);

    return (
        <div className="space-y-4">
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <PhotoIcon className="w-5 h-5" />
                    Background Image
                </label>
                <div className="space-y-3 p-3 bg-gray-100 rounded-md">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase">AI Generation</h3>
                    <div className="space-y-2">
                        <textarea 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="e.g., A vibrant abstract watercolor splash"
                            rows={2}
                            className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                         <div className="flex gap-2">
                             <button
                                 onClick={handlePromptSuggestion}
                                 disabled={isSuggesting || !flyerTopic.trim()}
                                 className="flex-1 flex items-center justify-center gap-1 text-xs px-2 py-1 bg-white text-indigo-600 border border-indigo-300 rounded-md hover:bg-indigo-50 transition-colors disabled:bg-gray-200 disabled:text-gray-400"
                             >
                                 {isSuggesting ? <SpinnerIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                                 Suggest
                             </button>
                            <button
                                onClick={handleGenerateImage}
                                disabled={isGenerating || !aiPrompt.trim()}
                                className="flex-1 flex items-center justify-center gap-1 text-xs px-2 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                            >
                                {isGenerating ? <SpinnerIcon className="w-4 h-4" /> : <WandIcon className="w-4 h-4" />}
                                Generate
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                     <div className="col-span-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Upload or Select</h3>
                         <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            onChange={handleCustomFileChange} 
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-600 hover:file:bg-gray-100"
                        />
                     </div>
                     {generatedImage && (
                        <button
                             onClick={() => {
                                onFileSelect(generatedImage);
                                setSelected('ai');
                             }}
                             className={`relative h-16 w-full rounded-md overflow-hidden ring-offset-2 ring-offset-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${selected === 'ai' ? 'ring-2 ring-indigo-600' : 'ring-1 ring-gray-300'}`}
                         >
                             <img src={generatedImage.dataUrl} alt="AI Generated Background" className="absolute inset-0 w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/40"></div>
                             <span className="absolute top-1 right-1 bg-indigo-500 text-white rounded-full p-1">
                                <WandIcon className="w-3 h-3"/>
                             </span>
                             <span className="absolute bottom-1 left-2 text-white text-xs font-semibold">AI Generated</span>
                         </button>
                     )}
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
        </div>
    );
};

export default BackgroundSelector;
