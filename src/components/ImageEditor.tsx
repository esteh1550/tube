import React, { useState, useRef } from 'react';
import { getGeminiClient, MODELS } from '../lib/gemini';
import { Loader2, Wand2, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

const BrutalButton = ({ children, onClick, className, disabled, loading }: any) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={cn(
      "relative px-6 py-3 bg-white border-2 border-black font-bold text-lg uppercase tracking-wider transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed w-full flex items-center justify-center gap-2",
      className
    )}
  >
    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : children}
  </button>
);

const BrutalInput = ({ value, onChange, placeholder, className }: any) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={cn(
      "w-full p-3 border-2 border-black font-mono text-base focus:outline-none focus:ring-4 focus:ring-[#00FF00] placeholder:text-gray-400",
      className
    )}
  />
);

const BrutalCard = ({ title, children, className, number, icon: Icon }: any) => (
  <div className={cn("border-2 border-black bg-white p-6 relative flex flex-col h-full", className)}>
    {number && (
      <div className="absolute -top-4 -left-2 text-5xl font-display text-black/5 select-none z-0">
        {number}
      </div>
    )}
    <div className="flex items-center justify-between mb-4 border-b-2 border-black pb-2 relative z-10">
      <h3 className="text-2xl font-display uppercase">{title}</h3>
      {Icon && <Icon className="w-6 h-6" />}
    </div>
    <div className="relative z-10 flex-grow flex flex-col">{children}</div>
  </div>
);

export default function ImageEditor() {
  const [prompt, setPrompt] = useState('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setEditedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const editImage = async () => {
    if (!originalImage || !prompt) return;
    setLoading(true);
    try {
      const client = getGeminiClient();
      const base64Image = originalImage.split(',')[1];
      
      // Using Flash Image for editing (Nano Banana)
      // Note: The prompt specifically mentioned "Nano banana powered app" and "gemini-2.5-flash-image"
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash-image", // Explicitly using the requested model
        contents: {
          parts: [
            { inlineData: { mimeType: "image/png", data: base64Image } }, // Assuming PNG/JPEG works generally
            { text: prompt }
          ]
        }
      });

      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (part && part.inlineData) {
        setEditedImage(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrutalCard title="Image Editor" number="09" icon={Wand2}>
      <div className="space-y-4 flex-grow flex flex-col">
        <p className="font-mono text-sm text-gray-600">Edit images with AI prompts.</p>
        
        {!originalImage ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-black p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="font-mono text-sm">Click to upload image</p>
          </div>
        ) : (
          <div className="relative group">
            <img src={originalImage} alt="Original" className="w-full h-32 object-cover border-2 border-black" />
            <button 
              onClick={() => { setOriginalImage(null); setEditedImage(null); }}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 text-xs font-bold border-2 border-black hover:bg-red-600"
            >
              X
            </button>
          </div>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />

        <div className="flex flex-col gap-2">
          <BrutalInput 
            value={prompt} 
            onChange={(e: any) => setPrompt(e.target.value)} 
            placeholder="e.g., 'Add a retro filter'" 
            disabled={!originalImage}
          />
          <BrutalButton onClick={editImage} loading={loading} disabled={!originalImage || !prompt} className="bg-[#00FF00]">
            Edit Image
          </BrutalButton>
        </div>

        {editedImage && (
          <div className="mt-4 border-2 border-black">
            <p className="font-mono text-xs font-bold bg-black text-white p-1">RESULT:</p>
            <img src={editedImage} alt="Edited" className="w-full h-auto" />
          </div>
        )}
      </div>
    </BrutalCard>
  );
}
