import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';

export default function HelpGuide() {
  const [isOpen, setIsOpen] = useState(false);

  const features = [
    { title: "Idea Generator", desc: "Enter a niche (e.g., 'Tech') to get viral video ideas using Google Search trends." },
    { title: "Script Writer", desc: "Enter a video title to generate a full script with hooks, intro, and outro." },
    { title: "Thumbnail Gen", desc: "Describe your thumbnail to generate a 4K image. Select aspect ratio for Shorts/Long-form." },
    { title: "Veo Video Gen", desc: "Generate AI video B-roll by describing a scene. Supports 1080p." },
    { title: "Audio Transcriber", desc: "Record your voice to transcribe ideas into text instantly." },
    { title: "Text to Speech", desc: "Convert your script into a professional voiceover." },
    { title: "Image Editor", desc: "Upload an image and use a text prompt (e.g., 'Add neon lights') to edit it." },
    { title: "Deep Strategy", desc: "Get a detailed growth plan using Gemini's Thinking Mode (High Reasoning)." },
    { title: "Video Analyzer", desc: "Upload a video file to get an AI summary and analysis." },
    { title: "Live Voice Chat", desc: "Have a real-time voice conversation with Gemini for brainstorming." },
    { title: "Location Scout", desc: "Find filming locations nearby based on a 'vibe' (requires location permission)." },
    { title: "Thumbnail Rater", desc: "Upload your thumbnail to get a rating (1-10) and improvement tips." },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 bg-black text-[#00FF00] p-4 border-2 border-[#00FF00] shadow-[4px_4px_0px_0px_#00FF00] hover:-translate-y-1 transition-transform font-bold font-mono flex items-center gap-2"
      >
        <HelpCircle className="w-6 h-6" />
        HOW TO USE
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-4 border-[#00FF00] w-full max-w-4xl max-h-[80vh] overflow-y-auto p-8 relative shadow-[8px_8px_0px_0px_#00FF00]"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 border-2 border-black"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-4xl font-display mb-8 border-b-4 border-black pb-4">MANUAL / GUIDE</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((f, i) => (
                  <div key={i} className="border-2 border-black p-4 hover:bg-[#00FF00]/10 transition-colors">
                    <h3 className="font-display text-xl mb-2 flex items-center gap-2">
                      <span className="bg-black text-white px-2 text-sm font-mono">{i + 1}</span>
                      {f.title}
                    </h3>
                    <p className="font-mono text-sm text-gray-600">{f.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-black text-white font-mono text-sm border-2 border-[#00FF00]">
                <p className="font-bold mb-2">PRO TIP:</p>
                <p>Use the "Creator Assistant" chat at the bottom for any general questions or to combine multiple tools (e.g., "Generate an idea and then write a script for it").</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
