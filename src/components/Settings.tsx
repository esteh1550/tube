import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Key, AlertTriangle, X } from 'lucide-react';
import { resetGeminiClient } from '../lib/gemini';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';

export default function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem("GEMINI_API_KEY");
    if (storedKey) setApiKey(storedKey);
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("GEMINI_API_KEY", apiKey.trim());
      resetGeminiClient(); // Reset the client to use the new key
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setIsOpen(false);
      window.location.reload(); // Reload to ensure everything picks up the new key fresh
    }
  };

  const handleClear = () => {
    localStorage.removeItem("GEMINI_API_KEY");
    setApiKey('');
    resetGeminiClient();
    window.location.reload();
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-8 z-50 bg-white text-black p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform font-bold font-mono flex items-center gap-2"
      >
        <SettingsIcon className="w-6 h-6" />
        SETTINGS
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
              className="bg-white border-4 border-black w-full max-w-md p-8 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 border-2 border-black"
              >
                <X className="w-6 h-6" />
              </button>

              <h2 className="text-3xl font-display mb-6 border-b-4 border-black pb-2">SETTINGS</h2>

              <div className="space-y-6">
                <div>
                  <label className="block font-mono font-bold mb-2 flex items-center gap-2">
                    <Key className="w-4 h-4" /> GEMINI API KEY
                  </label>
                  <p className="text-xs font-mono text-gray-500 mb-2">
                    Required if the app is not deployed with environment variables.
                  </p>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full p-3 border-2 border-black font-mono focus:outline-none focus:ring-4 focus:ring-[#00FF00]"
                  />
                </div>

                <div className="bg-yellow-100 border-2 border-black p-4 flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <p className="font-mono text-xs">
                    <strong>Note:</strong> Your API key is stored locally in your browser. It is never sent to our servers, only directly to Google's API.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleSave}
                    className="flex-1 bg-[#00FF00] border-2 border-black p-3 font-bold font-mono hover:bg-[#00CC00] flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> SAVE & RELOAD
                  </button>
                  {localStorage.getItem("GEMINI_API_KEY") && (
                     <button 
                     onClick={handleClear}
                     className="bg-red-500 text-white border-2 border-black p-3 font-bold font-mono hover:bg-red-600"
                   >
                     CLEAR
                   </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
