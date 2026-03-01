import React, { useState, useRef } from 'react';
import { getGeminiClient, MODELS } from '../lib/gemini';
import { Loader2, Video as VideoIcon, FileVideo } from 'lucide-react';
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

export default function VideoAnalyzer() {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    setLoading(true);
    try {
      // For video, we usually need to upload to File API first for large files, 
      // but for this demo/preview environment with small files, we might try inline data if small enough,
      // or just simulate the analysis if file is too large since we don't have a full backend for file upload handling to Google AI File API easily in this client-side only context without exposing keys or complex setup.
      // However, the prompt asks to "add video understanding".
      // We will try to read as base64. If it's too large, we'll catch the error.
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const client = getGeminiClient();
        
        // Note: Sending large video base64 might fail in browser or hit limits.
        // In a real app, we'd use the File API manager.
        const response = await client.models.generateContent({
          model: MODELS.PRO,
          contents: {
            parts: [
              { inlineData: { mimeType: file.type, data: base64data } },
              { text: "Analyze this video. What is happening? Provide a summary and key takeaways." }
            ]
          }
        });
        setAnalysis(response.text || "No analysis.");
        setLoading(false);
      };
    } catch (error) {
      console.error(error);
      setAnalysis("Error analyzing video. File might be too large for this demo.");
      setLoading(false);
    }
  };

  return (
    <BrutalCard title="Video Analyzer" number="11" icon={FileVideo}>
      <div className="space-y-4 flex-grow flex flex-col">
        <p className="font-mono text-sm text-gray-600">Upload a video for AI analysis.</p>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="video/*"
        />
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-black p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <VideoIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="font-mono text-sm">{fileName || "Click to upload video"}</p>
        </div>

        {loading && <p className="font-mono text-sm animate-pulse text-center">Analyzing video frames...</p>}

        {analysis && (
          <div className="mt-4 p-4 bg-gray-50 border-2 border-black font-mono text-sm whitespace-pre-wrap flex-grow overflow-y-auto max-h-60">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        )}
      </div>
    </BrutalCard>
  );
}
