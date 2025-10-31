import React, { useState, useCallback, useEffect } from 'react';
import type { FlyerOptions, ImageFile, FlyerType, CanvasFormat, StyleTheme } from './types';
import { generateFlyerHtml, generateCopySuggestions } from './services/geminiService';

import FlyerPreview from './components/FlyerPreview';
import BrandKitManager from './components/BrandKitManager';
import ColorPaletteSelector from './components/ColorPaletteSelector';
import BackgroundSelector from './components/BackgroundSelector';
import { SparklesIcon, RefreshCwIcon, SpinnerIcon, QrCodeIcon } from './components/icons';

// Declare QRCode as a global for the QR code generation
declare const QRCode: any;

const flyerTypes: FlyerType[] = ['Event Announcement', 'Product Promotion', 'Grand Opening', 'Workshop or Seminar', 'Hiring Ad'];
const canvasFormats: CanvasFormat[] = ['Instagram Post (Square 1080x1080)', 'Instagram Post (Portrait 1080x1350)', 'Instagram Story (1080x1920)', 'Landscape (1920x1080)', 'A4 Document (2480x3508)'];
const styleThemes: StyleTheme[] = ['Minimalist & Clean', 'Bold & Modern', 'Elegant & Corporate', 'Fun & Playful', 'AI Choice'];

const App: React.FC = () => {
    const [flyerOptions, setFlyerOptions] = useState<FlyerOptions>({
        flyerType: 'Event Announcement',
        topic: 'AI & The Future of Design',
        primaryText: 'Innovate & Create;A Seminar on AI-Powered Design;Featuring John Doe, CEO of TechCorp;July 20th, 2024',
        detailsBlock: 'Date: July 20, 2024 | Time: 10:00 AM - 4:00 PM | Location: Grand Tech Hall | RSVP: yourwebsite.com',
        ctaText: 'Register Now',
        brandName: '',
        canvasFormat: 'Instagram Post (Square 1080x1080)',
        styleTheme: 'Bold & Modern',
        primaryColor: '#6366F1', // Indigo
        accentColor: '#F472B6', // Pink
    });
    const [logo, setLogo] = useState<ImageFile | null>(null);
    const [speakerImage, setSpeakerImage] = useState<ImageFile | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<ImageFile | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
    const [htmlContent, setHtmlContent] = useState<string>('<div class="flex items-center justify-center h-full bg-gray-100"><p>Click "Generate Flyer" to start!</p></div>');
    const [isLoading, setIsLoading] = useState(false);
    const [isCopyLoading, setIsCopyLoading] = useState(false);
    const [copySuggestions, setCopySuggestions] = useState<string[]>([]);
    
    const updateOption = <K extends keyof FlyerOptions>(key: K, value: FlyerOptions[K]) => {
        setFlyerOptions(prev => ({ ...prev, [key]: value }));
    };

    const handleGenerateFlyer = useCallback(async (variationInstruction: string = '') => {
        setIsLoading(true);
        setHtmlContent(''); // Clear previous content
        try {
            const generatedHtml = await generateFlyerHtml(
                flyerOptions,
                !!logo,
                !!speakerImage,
                !!backgroundImage,
                !!qrCodeDataUrl,
                variationInstruction
            );
            setHtmlContent(generatedHtml);
        } catch (error) {
            console.error(error);
            setHtmlContent('<div class="p-4 text-red-500">Failed to generate flyer. See console for details.</div>');
        } finally {
            setIsLoading(false);
        }
    }, [flyerOptions, logo, speakerImage, backgroundImage, qrCodeDataUrl]);

    const handleGetCopySuggestions = useCallback(async () => {
        setIsCopyLoading(true);
        setCopySuggestions([]);
        try {
            const suggestions = await generateCopySuggestions(flyerOptions.flyerType, flyerOptions.topic);
            setCopySuggestions(suggestions);
        } catch (error) {
            console.error(error);
        } finally {
            setIsCopyLoading(false);
        }
    }, [flyerOptions.flyerType, flyerOptions.topic]);
    
    useEffect(() => {
        if (qrCodeUrl.trim() !== '') {
            QRCode.toDataURL(qrCodeUrl, { width: 256, margin: 1 }, (err: any, url: string) => {
                if (err) {
                    console.error('QR Code generation error:', err);
                    setQrCodeDataUrl(null);
                } else {
                    setQrCodeDataUrl(url);
                }
            });
        } else {
            setQrCodeDataUrl(null);
        }
    }, [qrCodeUrl]);

    // Auto-generate on first load
    useEffect(() => {
        handleGenerateFlyer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Controls Panel */}
            <aside className="w-[420px] h-full flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto p-6 space-y-6">
                <header>
                    <h1 className="text-2xl font-bold text-gray-800">Gemini Flyer Generator</h1>
                    <p className="text-sm text-gray-500">Create stunning flyers with the power of AI.</p>
                </header>

                {/* Main Form Sections */}
                <Section title="1. Flyer Content">
                    <div className="space-y-4">
                        <Select label="Flyer Type" value={flyerOptions.flyerType} onChange={e => updateOption('flyerType', e.target.value as FlyerType)} options={flyerTypes} />
                        <Input label="Topic or Event Title" placeholder="e.g., Summer Music Festival" value={flyerOptions.topic} onChange={e => updateOption('topic', e.target.value)} />
                        <div>
                            <Textarea
                                label="Primary Text"
                                value={flyerOptions.primaryText}
                                onChange={e => updateOption('primaryText', e.target.value)}
                                rows={4}
                                helpText="Use format: Title;Subtitle;Support Line 1;Support Line 2"
                            />
                            <button onClick={handleGetCopySuggestions} disabled={isCopyLoading || !flyerOptions.topic.trim()} className="mt-2 text-sm text-indigo-600 font-semibold hover:text-indigo-800 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1">
                                {isCopyLoading ? <SpinnerIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                                Get AI Suggestions
                            </button>
                             {copySuggestions.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {copySuggestions.map((s, i) => (
                                        <button key={i} onClick={() => updateOption('primaryText', s)} className="block w-full text-left text-xs p-2 bg-gray-100 hover:bg-indigo-100 rounded text-gray-600 truncate">
                                            {s.split(';')[0]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Textarea label="Details Block" value={flyerOptions.detailsBlock} onChange={e => updateOption('detailsBlock', e.target.value)} rows={3} helpText="Separate items with '|'. e.g., Date: ... | Time: ..."/>
                        <Input label="Call to Action (CTA)" placeholder="e.g., Register Now" value={flyerOptions.ctaText} onChange={e => updateOption('ctaText', e.target.value)} />
                    </div>
                </Section>
                
                <Section title="2. Branding & Assets">
                     <BrandKitManager
                        logo={logo}
                        onLogoSelect={setLogo}
                        speakerImage={speakerImage}
                        onSpeakerImageSelect={setSpeakerImage}
                        brandName={flyerOptions.brandName}
                        onBrandNameChange={name => updateOption('brandName', name)}
                    />
                </Section>
                
                <Section title="3. Design & Style">
                    <div className="space-y-4">
                        <Select label="Canvas Format" value={flyerOptions.canvasFormat} onChange={e => updateOption('canvasFormat', e.target.value as CanvasFormat)} options={canvasFormats} />
                        <Select label="Style Theme" value={flyerOptions.styleTheme} onChange={e => updateOption('styleTheme', e.target.value as StyleTheme)} options={styleThemes} />
                        <ColorPaletteSelector primaryColor={flyerOptions.primaryColor} accentColor={flyerOptions.accentColor} onColorChange={(p, a) => setFlyerOptions(prev => ({...prev, primaryColor: p, accentColor: a}))} />
                        <BackgroundSelector onFileSelect={setBackgroundImage} />
                        <div className="relative">
                            <label htmlFor="qr-code" className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2"><QrCodeIcon className="w-5 h-5"/> QR Code URL (Optional)</label>
                            <input id="qr-code" type="text" value={qrCodeUrl} onChange={e => setQrCodeUrl(e.target.value)} placeholder="https://your-website.com" className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                </Section>
                 
                {/* Actions */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                    <button
                        onClick={() => handleGenerateFlyer()}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-base font-semibold disabled:bg-gray-400"
                    >
                        {isLoading ? <SpinnerIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                        {isLoading ? 'Generating...' : 'Generate Flyer'}
                    </button>
                     <button
                        onClick={() => handleGenerateFlyer('Try a completely different layout and style.')}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors text-sm font-semibold disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-300"
                    >
                        {isLoading ? <SpinnerIcon className="w-4 h-4" /> : <RefreshCwIcon className="w-4 h-4" />}
                        Generate Variation
                    </button>
                </div>
            </aside>
            
            {/* Preview Panel */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 bg-gray-100">
                {isLoading && !htmlContent ? (
                    <div className="flex flex-col items-center gap-4 text-gray-500">
                        <SpinnerIcon className="w-12 h-12 text-indigo-500" />
                        <p className="font-semibold">Generating your masterpiece...</p>
                        <p className="text-sm text-center max-w-xs">The AI is warming up its creative circuits. This might take a moment.</p>
                    </div>
                ) : (
                    <FlyerPreview
                        htmlContent={htmlContent}
                        logo={logo}
                        speakerImage={speakerImage}
                        backgroundImage={backgroundImage}
                        qrCodeDataUrl={qrCodeDataUrl}
                        canvasFormat={flyerOptions.canvasFormat}
                    />
                )}
            </main>
        </div>
    );
};

// Helper components for form elements
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="space-y-1">
        <h2 className="text-base font-semibold text-gray-700">{title}</h2>
        <div className="p-4 bg-gray-50/70 rounded-lg border border-gray-200">{children}</div>
    </section>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}
const Input: React.FC<InputProps> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <input {...props} className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
    </div>
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    helpText?: string;
}
const Textarea: React.FC<TextareaProps> = ({ label, helpText, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <textarea {...props} className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
        {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: string[];
}
const Select: React.FC<SelectProps> = ({ label, options, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <select {...props} className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


export default App;