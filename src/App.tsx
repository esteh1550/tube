import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Type, Image as ImageIcon, Search, TrendingUp, Video, Loader2, Mic, Volume2, MessageSquare, Camera } from 'lucide-react';
import { getGeminiClient, MODELS, handleGeminiError } from './lib/gemini';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { Modality } from "@google/genai";

import ImageEditor from './components/ImageEditor';
import DeepStrategy from './components/DeepStrategy';
import VideoAnalyzer from './components/VideoAnalyzer';
import LiveVoiceChat from './components/LiveVoiceChat';
import LocationScout from './components/LocationScout';
import HelpGuide from './components/HelpGuide';
import Settings from './components/Settings';

// --- Components ---

const BrutalButton = ({ children, onClick, className, disabled, loading }: any) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={cn(
      "relative px-6 py-3 bg-white border-2 border-black font-bold text-lg uppercase tracking-wider transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto flex items-center justify-center gap-2",
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

// --- Sections ---

const IdeaGenerator = () => {
  const [topic, setTopic] = useState('');
  const [ideas, setIdeas] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateIdeas = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: MODELS.SEARCH,
        contents: `Generate 5 viral YouTube video ideas about "${topic}". 
        Use Google Search to find current trends related to this topic.
        For each idea, provide a catchy title and a 1-sentence hook.
        Format as a numbered list.`,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
      setIdeas(response.text || "No ideas generated.");
    } catch (error: any) {
      setIdeas(handleGeminiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrutalCard title="Idea Generator" number="01" icon={Search}>
      <div className="space-y-4 flex-grow flex flex-col">
        <p className="font-mono text-sm text-gray-600">Find trending topics and viral angles.</p>
        <div className="flex flex-col gap-2">
          <BrutalInput 
            value={topic} 
            onChange={(e: any) => setTopic(e.target.value)} 
            placeholder="Enter a niche (e.g., 'Minecraft')" 
          />
          <BrutalButton onClick={generateIdeas} loading={loading} className="bg-[#00FF00]">
            Generate Ideas
          </BrutalButton>
        </div>
        {ideas && (
          <div className="mt-4 p-4 bg-gray-50 border-2 border-black font-mono text-sm whitespace-pre-wrap flex-grow overflow-y-auto max-h-60">
            <ReactMarkdown>{ideas}</ReactMarkdown>
          </div>
        )}
      </div>
    </BrutalCard>
  );
};

const ScriptWriter = () => {
  const [title, setTitle] = useState('');
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);

  const generateScript = async () => {
    if (!title) return;
    setLoading(true);
    try {
      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: MODELS.PRO,
        contents: `Write a YouTube video script for a video titled "${title}".
        Structure it with: Hook, Intro, 3 Key Points, CTA, Outro.
        Keep it engaging and fast-paced.`,
      });
      setScript(response.text || "No script generated.");
    } catch (error: any) {
      setScript(handleGeminiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrutalCard title="Script Writer" number="02" icon={Type}>
      <div className="space-y-4 flex-grow flex flex-col">
        <p className="font-mono text-sm text-gray-600">Turn an idea into a full script.</p>
        <div className="flex flex-col gap-2">
          <BrutalInput 
            value={title} 
            onChange={(e: any) => setTitle(e.target.value)} 
            placeholder="Video Title" 
          />
          <BrutalButton onClick={generateScript} loading={loading} className="bg-[#00FF00]">
            Write Script
          </BrutalButton>
        </div>
        {script && (
          <div className="mt-4 p-4 bg-gray-50 border-2 border-black font-mono text-sm whitespace-pre-wrap flex-grow overflow-y-auto max-h-60">
            <ReactMarkdown>{script}</ReactMarkdown>
          </div>
        )}
      </div>
    </BrutalCard>
  );
};

const ThumbnailCreator = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("16:9");

  const generateThumbnail = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: MODELS.IMAGE_PRO,
        contents: {
          parts: [{ text: `YouTube thumbnail: ${prompt}. High contrast, bold text, expressive face, 4k resolution, vibrant colors.` }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: "1K"
          }
        }
      });
      
      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (part && part.inlineData) {
        setImageUrl(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
      }
    } catch (error) {
      console.error(handleGeminiError(error));
      alert(handleGeminiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrutalCard title="Thumbnail Gen" number="03" icon={ImageIcon}>
      <div className="space-y-4 flex-grow flex flex-col">
        <p className="font-mono text-sm text-gray-600">Create click-worthy thumbnails.</p>
        <div className="flex flex-col gap-2">
          <BrutalInput 
            value={prompt} 
            onChange={(e: any) => setPrompt(e.target.value)} 
            placeholder="Describe the thumbnail..." 
          />
           <select 
            value={aspectRatio} 
            onChange={(e) => setAspectRatio(e.target.value)}
            className="w-full p-3 border-2 border-black font-mono text-base focus:outline-none focus:ring-4 focus:ring-[#00FF00] bg-white"
          >
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Shorts)</option>
            <option value="1:1">1:1 (Square)</option>
            <option value="4:3">4:3</option>
          </select>
          <BrutalButton onClick={generateThumbnail} loading={loading} className="bg-[#00FF00]">
            Generate
          </BrutalButton>
        </div>
        {imageUrl && (
          <div className="mt-4 border-2 border-black">
            <img src={imageUrl} alt="Generated Thumbnail" className="w-full h-auto" referrerPolicy="no-referrer" />
          </div>
        )}
      </div>
    </BrutalCard>
  );
};

const VideoGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("16:9");

  const generateVideo = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const client = getGeminiClient();
      let operation = await client.models.generateVideos({
        model: MODELS.VEO,
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: aspectRatio as any
        }
      });

      // Poll for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await client.operations.getVideosOperation({operation: operation});
      }

      const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (uri) {
        // Fetch with API key
        const apiKey = process.env.GEMINI_API_KEY;
        const response = await fetch(uri, {
          headers: { 'x-goog-api-key': apiKey! }
        });
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error(handleGeminiError(error));
      alert(handleGeminiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrutalCard title="Veo Video Gen" number="04" icon={Video}>
      <div className="space-y-4 flex-grow flex flex-col">
        <p className="font-mono text-sm text-gray-600">Generate B-roll or shorts with Veo.</p>
        <div className="flex flex-col gap-2">
          <BrutalInput 
            value={prompt} 
            onChange={(e: any) => setPrompt(e.target.value)} 
            placeholder="Describe the video..." 
          />
          <select 
            value={aspectRatio} 
            onChange={(e) => setAspectRatio(e.target.value)}
            className="w-full p-3 border-2 border-black font-mono text-base focus:outline-none focus:ring-4 focus:ring-[#00FF00] bg-white"
          >
            <option value="16:9">16:9 (Landscape)</option>
            <option value="9:16">9:16 (Shorts)</option>
          </select>
          <BrutalButton onClick={generateVideo} loading={loading} className="bg-[#00FF00]">
            Generate Video
          </BrutalButton>
        </div>
        {videoUrl && (
          <div className="mt-4 border-2 border-black">
            <video src={videoUrl} controls className="w-full h-auto" />
          </div>
        )}
      </div>
    </BrutalCard>
  );
};

const AudioTranscriber = () => {
  const [transcription, setTranscription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setLoading(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        
        const client = getGeminiClient();
        const response = await client.models.generateContent({
          model: MODELS.AUDIO_TRANSCRIPTION,
          contents: {
            parts: [
              { inlineData: { mimeType: 'audio/webm', data: base64data } },
              { text: "Transcribe this audio." }
            ]
          }
        });
        setTranscription(response.text || "No transcription.");
        setLoading(false);
      };
    } catch (error) {
      setTranscription(handleGeminiError(error));
      setLoading(false);
    }
  };

  return (
    <BrutalCard title="Audio Transcriber" number="05" icon={Mic}>
      <div className="space-y-4 flex-grow flex flex-col">
        <p className="font-mono text-sm text-gray-600">Record and transcribe ideas.</p>
        <div className="flex flex-col gap-2">
          <BrutalButton 
            onClick={isRecording ? stopRecording : startRecording} 
            className={isRecording ? "bg-red-500 text-white" : "bg-[#00FF00]"}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </BrutalButton>
        </div>
        {loading && <p className="font-mono text-sm animate-pulse">Transcribing...</p>}
        {transcription && (
          <div className="mt-4 p-4 bg-gray-50 border-2 border-black font-mono text-sm whitespace-pre-wrap flex-grow overflow-y-auto max-h-60">
            {transcription}
          </div>
        )}
      </div>
    </BrutalCard>
  );
};

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSpeech = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const client = getGeminiClient();
      const response = await client.models.generateContent({
        model: MODELS.TTS,
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        setAudioUrl(`data:audio/mp3;base64,${base64Audio}`);
      }
    } catch (error) {
      console.error(handleGeminiError(error));
      alert(handleGeminiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrutalCard title="Text to Speech" number="06" icon={Volume2}>
      <div className="space-y-4 flex-grow flex flex-col">
        <p className="font-mono text-sm text-gray-600">Generate voiceovers for your videos.</p>
        <div className="flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to speak..."
            className="w-full p-3 border-2 border-black font-mono text-base focus:outline-none focus:ring-4 focus:ring-[#00FF00] h-32 resize-none"
          />
          <BrutalButton onClick={generateSpeech} loading={loading} className="bg-[#00FF00]">
            Generate Speech
          </BrutalButton>
        </div>
        {audioUrl && (
          <div className="mt-4 border-2 border-black p-2 bg-gray-100">
            <audio src={audioUrl} controls className="w-full" />
          </div>
        )}
      </div>
    </BrutalCard>
  );
};

const ChatBot = () => {
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const client = getGeminiClient();
      const chat = client.chats.create({
        model: MODELS.PRO,
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      const result = await chat.sendMessage({ message: input });
      const botMsg = { role: 'model', text: result.text || "No response." };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg = { role: 'model', text: handleGeminiError(error) };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrutalCard title="Creator Assistant" number="07" icon={MessageSquare}>
      <div className="space-y-4 flex-grow flex flex-col h-[400px]">
        <div className="flex-grow overflow-y-auto border-2 border-black p-4 bg-gray-50 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("p-3 max-w-[80%] border-2 border-black font-mono text-sm", 
              m.role === 'user' ? "ml-auto bg-[#00FF00]" : "bg-white"
            )}>
              <ReactMarkdown>{m.text}</ReactMarkdown>
            </div>
          ))}
          {loading && <div className="p-3 bg-white border-2 border-black w-fit animate-pulse">Thinking...</div>}
        </div>
        <div className="flex gap-2">
          <BrutalInput 
            value={input} 
            onChange={(e: any) => setInput(e.target.value)} 
            placeholder="Ask anything..." 
          />
          <BrutalButton onClick={sendMessage} disabled={loading} className="bg-black text-white px-4">
            Send
          </BrutalButton>
        </div>
      </div>
    </BrutalCard>
  );
};

const ImageAnalyzer = () => {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        const client = getGeminiClient();
        const response = await client.models.generateContent({
          model: MODELS.PRO,
          contents: {
            parts: [
              { inlineData: { mimeType: file.type, data: base64data } },
              { text: "Analyze this image for YouTube. Is it a good thumbnail? What improvements would you suggest? Rate it out of 10." }
            ]
          }
        });
        setAnalysis(response.text || "No analysis.");
        setLoading(false);
      };
    } catch (error) {
      setAnalysis(handleGeminiError(error));
      setLoading(false);
    }
  };

  return (
    <BrutalCard title="Thumbnail Rater" number="08" icon={Camera}>
      <div className="space-y-4 flex-grow flex flex-col">
        <p className="font-mono text-sm text-gray-600">Upload a thumbnail to get AI feedback.</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
        <BrutalButton onClick={() => fileInputRef.current?.click()} loading={loading} className="bg-[#00FF00]">
          Upload Image
        </BrutalButton>
        {analysis && (
          <div className="mt-4 p-4 bg-gray-50 border-2 border-black font-mono text-sm whitespace-pre-wrap flex-grow overflow-y-auto max-h-60">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        )}
      </div>
    </BrutalCard>
  );
};

// --- Main App ---

export default function App() {
  return (
    <div className="min-h-screen bg-[#f0f0f0] p-4 md:p-8 font-sans">
      {/* Header */}
      <header className="mb-12 border-b-4 border-black pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-6xl md:text-8xl font-display leading-[0.8] tracking-tighter">
              TUBE<br/><span className="text-[#00FF00] bg-black px-2 inline-block transform -skew-x-6">BOOSTER</span>
            </h1>
            <p className="font-mono mt-4 text-lg font-bold uppercase tracking-widest border-l-4 border-[#00FF00] pl-4">
              Ultimate Creator Toolkit
            </p>
          </div>
          <div className="font-mono text-xs md:text-sm text-right hidden md:block opacity-70">
            <p>STATUS: ONLINE</p>
            <p>MODEL: GEMINI 3.1 PRO / 2.5 FLASH</p>
            <p>VEO: ENABLED</p>
          </div>
        </div>
      </header>

      {/* Marquee */}
      <div className="mb-12 overflow-hidden border-y-4 border-black bg-[#00FF00] py-3 transform -rotate-1">
        <div className="animate-marquee whitespace-nowrap font-display text-3xl uppercase tracking-wider">
          Make it viral • Monetize Now • 4000 Watch Hours • 1000 Subscribers • High CTR • Trending Topics • 
          Make it viral • Monetize Now • 4000 Watch Hours • 1000 Subscribers • High CTR • Trending Topics •
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <IdeaGenerator />
        <ScriptWriter />
        <ThumbnailCreator />
        <VideoGenerator />
        <AudioTranscriber />
        <TextToSpeech />
        <ImageEditor />
        <DeepStrategy />
        <VideoAnalyzer />
        <LiveVoiceChat />
        <LocationScout />
        <div className="md:col-span-2 xl:col-span-2">
          <ChatBot />
        </div>
        <ImageAnalyzer />
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t-4 border-black pt-8 text-center font-mono uppercase text-sm opacity-50 pb-8">
        <p>© 2026 TubeBooster. Powered by Google Gemini.</p>
      </footer>
      
      <HelpGuide />
      <Settings />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
