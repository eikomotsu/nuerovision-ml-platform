import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useApp } from '../App';
import { Camera, Plus, Trash2, Wand2, RefreshCw, Database } from 'lucide-react';
import { detectObjectsInFrame, generateSyntheticDataPrompt } from '../services/geminiService';
import { BoundingBox } from '../types';

const DataStudio: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const { dataset, addToDataset, modelConfig } = useApp();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAnnotations, setCurrentAnnotations] = useState<BoundingBox[]>([]);
  const [syntheticPrompt, setSyntheticPrompt] = useState<string>("");

  // Capture image from webcam
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setCurrentAnnotations([]);
    }
  }, [webcamRef]);

  // Use Gemini to auto-label the captured image
  const autoLabel = async () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    try {
      const boxes = await detectObjectsInFrame(capturedImage, modelConfig.classes);
      // Map DetectionResult (0-1000) to actual component logic if needed, 
      // but for this demo, let's store them as is and render properly.
      // We will assume 0-1000 for storage to be consistent with Gemini.
      const mappedBoxes: BoundingBox[] = boxes.map(b => ({
        label: b.label,
        ymin: b.box_2d[0],
        xmin: b.box_2d[1],
        ymax: b.box_2d[2],
        xmax: b.box_2d[3],
        confidence: 0.95
      }));
      setCurrentAnnotations(mappedBoxes);
    } catch (error) {
      alert("Auto-labeling failed. Check API Key.");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveToDataset = () => {
    if (!capturedImage) return;
    addToDataset({
      id: Date.now().toString(),
      src: capturedImage,
      annotations: currentAnnotations,
      createdAt: Date.now(),
    });
    setCapturedImage(null);
    setCurrentAnnotations([]);
  };

  const generatePrompt = async () => {
    const cls = modelConfig.classes[Math.floor(Math.random() * modelConfig.classes.length)];
    const prompt = await generateSyntheticDataPrompt(cls);
    setSyntheticPrompt(prompt);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      {/* Left Col: Capture Area */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex-1 flex flex-col relative overflow-hidden">
          <div className="relative flex-1 bg-black rounded-xl overflow-hidden flex items-center justify-center">
            {capturedImage ? (
              <div className="relative w-full h-full">
                <img src={capturedImage} alt="Capture" className="w-full h-full object-contain" />
                {/* Annotation Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                  {currentAnnotations.map((box, idx) => (
                    <g key={idx}>
                      <rect
                        x={box.xmin}
                        y={box.ymin}
                        width={box.xmax - box.xmin}
                        height={box.ymax - box.ymin}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="4"
                      />
                      <text x={box.xmin} y={box.ymin - 10} fill="#3b82f6" fontSize="24" fontWeight="bold">
                        {box.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            ) : (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                className="w-full h-full object-contain"
              />
            )}
            
            {/* Camera Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
              {!capturedImage ? (
                <button 
                  onClick={capture}
                  className="w-16 h-16 rounded-full bg-red-500 border-4 border-slate-900 hover:bg-red-600 transition-all shadow-lg flex items-center justify-center"
                >
                  <Camera className="text-white" size={32} />
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setCapturedImage(null)}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-medium transition-colors"
                  >
                    Retake
                  </button>
                  <button 
                    onClick={autoLabel}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-medium transition-colors flex items-center gap-2"
                  >
                    {isProcessing ? <RefreshCw className="animate-spin" /> : <Wand2 size={18} />}
                    Auto-Label (Gemini)
                  </button>
                  <button 
                    onClick={saveToDataset}
                    className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-full font-medium transition-colors"
                  >
                    Save to Dataset
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Synthetic Data Helper */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-semibold">Synthetic Data Generator Helper</h3>
            <button onClick={generatePrompt} className="text-primary-400 text-sm hover:underline">Generate Prompt</button>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-sm text-slate-400 min-h-[60px]">
            {syntheticPrompt || "Click 'Generate Prompt' to get a Stable Diffusion prompt for your classes..."}
          </div>
        </div>
      </div>

      {/* Right Col: Dataset List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Dataset</h2>
          <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-bold">{dataset.length} images</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {dataset.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">
              <Database size={48} className="mx-auto mb-4 opacity-20" />
              <p>No images collected yet.</p>
              <p className="text-sm">Capture images to build your dataset.</p>
            </div>
          ) : (
            dataset.map((img) => (
              <div key={img.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex gap-4 group">
                <div className="w-20 h-20 bg-slate-900 rounded-lg overflow-hidden shrink-0">
                  <img src={img.src} alt="thumbnail" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-500 font-mono">{new Date(img.createdAt).toLocaleTimeString()}</span>
                    <button className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {img.annotations.map((ann, i) => (
                      <span key={i} className="px-2 py-0.5 bg-primary-900/30 text-primary-400 text-[10px] rounded border border-primary-900/50">
                        {ann.label}
                      </span>
                    ))}
                    {img.annotations.length === 0 && <span className="text-xs text-orange-500">Unlabeled</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DataStudio;