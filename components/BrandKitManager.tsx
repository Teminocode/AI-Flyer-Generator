import React, { useRef } from 'react';
import type { ImageFile } from '../types';

interface BrandKitManagerProps {
  logo: ImageFile | null;
  speakerImage: ImageFile | null;
  brandName: string;
  onLogoSelect: (file: ImageFile | null) => void;
  onSpeakerImageSelect: (file: ImageFile | null) => void;
  onBrandNameChange: (name: string) => void;
}

const BrandKitManager: React.FC<BrandKitManagerProps> = ({
  logo,
  speakerImage,
  brandName,
  onLogoSelect,
  onSpeakerImageSelect,
  onBrandNameChange,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const speakerImageInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (file: ImageFile | null) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          callback({ name: file.name, dataUrl: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    } else {
      callback(null);
    }
    // Clear the input value to allow re-selecting the same file
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="brandName" className="block text-sm font-medium text-gray-600 mb-1">
          Brand Name (Optional)
        </label>
        <input
          id="brandName"
          type="text"
          value={brandName}
          onChange={(e) => onBrandNameChange(e.target.value)}
          placeholder="e.g., Acme Corp"
          className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Logo Uploader */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Logo (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            ref={logoInputRef}
            onChange={(e) => handleFileChange(e, onLogoSelect)}
            className="hidden"
          />
          <button
            onClick={() => logoInputRef.current?.click()}
            className="w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
          >
            {logo ? (
              <img src={logo.dataUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-xs text-center">Click to upload</span>
            )}
          </button>
          {logo && (
             <button onClick={() => onLogoSelect(null)} className="text-xs text-red-500 hover:underline mt-1">Remove</button>
          )}
        </div>

        {/* Speaker/Promo Image Uploader */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Speaker/Promo Image (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            ref={speakerImageInputRef}
            onChange={(e) => handleFileChange(e, onSpeakerImageSelect)}
            className="hidden"
          />
          <button
            onClick={() => speakerImageInputRef.current?.click()}
            className="w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
          >
            {speakerImage ? (
              <img src={speakerImage.dataUrl} alt="Speaker image preview" className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-xs text-center">Click to upload</span>
            )}
          </button>
          {speakerImage && (
             <button onClick={() => onSpeakerImageSelect(null)} className="text-xs text-red-500 hover:underline mt-1">Remove</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandKitManager;
