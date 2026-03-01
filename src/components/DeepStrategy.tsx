import React, { useState, useEffect, useRef } from 'react';
import { getGeminiClient, MODELS } from '../lib/gemini';
import { Loader2, BrainCircuit } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { ThinkingLevel } from "@google/genai";

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

export default function DeepStrategy() {
  const [query, setQuery] = useState('');
  const [strategy, setStrategy] = useState('');
  const [loading, setLoading] = useState(false);

  const generateStrategy = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: MODELS.PRO,
        contents: `Develop a comprehensive YouTube growth strategy for: "${query}".
        Include:
        1. Target Audience Analysis
        2. Content Pillars
        3. 3-Month Upload Schedule
        4. Monetization Path`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
      });
      setStrategy(response.text || "No strategy generated.");
    } catch (error) {
      console.error(error);
      setStrategy("Error generating strategy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrutalCard title="Deep Strategy" number="10" icon={BrainCircuit}>
      <div className="space-y-4 flex-grow flex flex-col">
        <p className="font-mono text-sm text-gray-600">Advanced planning with Thinking Mode.</p>
        <div className="flex flex-col gap-2">
          <BrutalInput 
            value={query} 
            onChange={(e: any) => setQuery(e.target.value)} 
            placeholder="Describe your channel goals..." 
          />
          <BrutalButton onClick={generateStrategy} loading={loading} className="bg-[#00FF00]">
            Generate Plan
          </BrutalButton>
        </div>
        {strategy && (
          <div className="mt-4 p-4 bg-gray-50 border-2 border-black font-mono text-sm whitespace-pre-wrap flex-grow overflow-y-auto max-h-60">
            <ReactMarkdown>{strategy}</ReactMarkdown>
          </div>
        )}
      </div>
    </BrutalCard>
  );
}
