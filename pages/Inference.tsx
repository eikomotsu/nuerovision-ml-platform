import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useApp } from '../App';
import { Play, Pause, AlertTriangle, Cpu } from 'lucide-react';
import { detectObjectsInFrame } from '../services/geminiService';
import { DetectionResult } from '../types';
import InferenceCanvas from '../components/InferenceCanvas';

const Inference: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const { modelConfig } = useApp();
  const [isRunning, setIsRunning] = useState(false);
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [fps, setFps] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Custom classes input
  const [customClasses, setCustomClasses] = useState(modelConfig.classes.join(', '));

  // Loop for inference
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    let frameCount = 0;
    
    // FPS Counter
    const fpsInterval = setInterval(() => {
      setFps(frameCount);
      frameCount = 0;
    }, 1000);

    const runInference = async () => {
      if (!isRunning || isProcessing) return;
      
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) return;

      setIsProcessing(true);
      const startTime = performance.now();

      try {
        const targetClasses = customClasses.split(',').map(c => c.trim()).filter(c => c.length > 0);
        const results = await detectObjectsInFrame(imageSrc, targetClasses);
        setDetections(results);
        frameCount++; // Increment simulated FPS count for successful frames
      } catch (e) {
        console.error(e);
      } finally {
        setIsProcessing(false);
        const endTime = performance.now();
        // Adjust polling based on processing time to avoid freezing UI
        // In real app, we might just loop. Here we rely on the component re-render cycle via useEffect dep on isRunning
      }
    };

    if (isRunning) {
      // Poll every 500ms (2 FPS target) because API is network bound
      intervalId = setInterval(runInference, 800);
    }

    return () => {
      clearInterval(intervalId);
      clearInterval(fpsInterval);
    };
  }, [isRunning, customClasses, isProcessing]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="text-primary-500" />
            Live Inference Lab
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Running Custom Model on Gemini 2.5 Flash Backend
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="text-right">
             <div className="text-2xl font-mono font-bold text-white">{fps} FPS</div>
             <div className="text-xs text-slate-500">Effective Rate</div>
           </div>
           <button 
             onClick={() => setIsRunning(!isRunning)}
             className={`
               w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg
               ${isRunning 
                 ? 'bg-red-500 hover:bg-red-600 shadow-red-900/20' 
                 : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-900/20'}
             `}
           >
             {isRunning ? <Pause fill="white" /> : <Play fill="white" className="ml-1" />}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-800 shadow-2xl">
            <Webcam
              ref={webcamRef}
              audio={false}
              className="w-full h-full object-contain"
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "environment" }}
            />
            
            {/* Overlay Canvas */}
            <InferenceCanvas 
               detections={detections}
               width={640} // Assuming standard webcam ratio, responsive scaling handled by CSS
               height={480} 
            />

            {/* Status Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
               {isProcessing && (
                 <div className="bg-black/60 backdrop-blur text-white text-xs px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                   <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                   Processing Frame...
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
           <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
             <h3 className="text-white font-semibold mb-4">Target Classes</h3>
             <p className="text-xs text-slate-400 mb-3">
               Edit the list below to change what the model detects in real-time.
             </p>
             <textarea 
               value={customClasses}
               onChange={(e) => setCustomClasses(e.target.value)}
               className="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 text-sm focus:border-primary-500 focus:outline-none resize-none"
             />
             <div className="mt-2 flex flex-wrap gap-2">
               {customClasses.split(',').map((c, i) => c.trim() && (
                 <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-700">
                   {c.trim()}
                 </span>
               ))}
             </div>
           </div>

           <div className="bg-orange-900/20 border border-orange-500/20 rounded-2xl p-6">
             <div className="flex items-start gap-3">
               <AlertTriangle className="text-orange-500 shrink-0" size={20} />
               <div>
                 <h4 className="text-orange-200 font-semibold text-sm">Performance Note</h4>
                 <p className="text-orange-200/60 text-xs mt-1">
                   This demo uses Gemini API for inference. Framerate is limited by network latency (approx 1-2 FPS). 
                   For production 60 FPS, export to TensorFlow.js or ONNX.
                 </p>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Inference;