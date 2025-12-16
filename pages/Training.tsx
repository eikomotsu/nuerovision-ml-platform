import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { AppState } from '../types';
import { Play, RotateCcw, Activity } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { MOCK_TRAINING_DATA } from '../constants';

const Training: React.FC = () => {
  const { appState, setAppState, modelConfig, updateModelConfig, trainingHistory, setTrainingHistory } = useApp();
  const [progress, setProgress] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(0);

  // Simulation logic
  useEffect(() => {
    if (appState === AppState.TRAINING) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setAppState(AppState.TRAINED);
            return 100;
          }
          return prev + 1;
        });
      }, 100); // 10 seconds total simulation

      return () => clearInterval(interval);
    }
  }, [appState, setAppState]);

  useEffect(() => {
    // Update chart data based on progress
    if (appState === AppState.TRAINING) {
      const dataIndex = Math.floor((progress / 100) * MOCK_TRAINING_DATA.length);
      setTrainingHistory(MOCK_TRAINING_DATA.slice(0, dataIndex + 1));
      setCurrentEpoch(Math.floor((progress / 100) * modelConfig.epochs));
    } else if (appState === AppState.TRAINED) {
      setTrainingHistory(MOCK_TRAINING_DATA);
      setCurrentEpoch(modelConfig.epochs);
      setProgress(100);
    } else if (appState === AppState.IDLE) {
       // Reset logic handled by explicit button
    }
  }, [progress, appState, modelConfig.epochs, setTrainingHistory]);

  const startTraining = () => {
    setAppState(AppState.TRAINING);
    setProgress(0);
  };

  const resetTraining = () => {
    setAppState(AppState.IDLE);
    setProgress(0);
    setTrainingHistory([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Config Panel */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="text-primary-500" />
            Hyperparameters
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Base Architecture</label>
              <select 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-primary-500"
                value={modelConfig.baseModel}
                onChange={(e) => updateModelConfig({ baseModel: e.target.value as any })}
                disabled={appState !== AppState.IDLE}
              >
                <option value="YOLOv8">YOLOv8 (Recommended)</option>
                <option value="Faster R-CNN">Faster R-CNN</option>
                <option value="SSD MobileNet">SSD MobileNet v2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Epochs ({modelConfig.epochs})</label>
              <input 
                type="range" 
                min="10" 
                max="200" 
                step="10"
                value={modelConfig.epochs}
                onChange={(e) => updateModelConfig({ epochs: Number(e.target.value) })}
                className="w-full accent-primary-500"
                disabled={appState !== AppState.IDLE}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Batch Size ({modelConfig.batchSize})</label>
              <select 
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-primary-500"
                value={modelConfig.batchSize}
                onChange={(e) => updateModelConfig({ batchSize: Number(e.target.value) })}
                disabled={appState !== AppState.IDLE}
              >
                <option value="8">8</option>
                <option value="16">16</option>
                <option value="32">32</option>
                <option value="64">64</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Learning Rate</label>
              <input 
                type="text" 
                value={modelConfig.learningRate}
                readOnly
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
            {appState === AppState.IDLE ? (
              <button 
                onClick={startTraining}
                className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-900/20 flex items-center justify-center gap-2"
              >
                <Play size={20} fill="currentColor" />
                Start Training
              </button>
            ) : appState === AppState.TRAINING ? (
              <button 
                disabled
                className="w-full py-3 bg-slate-700 text-slate-400 rounded-xl font-bold cursor-wait flex items-center justify-center gap-2"
              >
                <Activity className="animate-spin" size={20} />
                Training in Progress...
              </button>
            ) : (
              <button 
                onClick={resetTraining}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} />
                Reset Model
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Visualization Panel */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-slate-400 text-sm mb-1">Current Epoch</p>
            <p className="text-3xl font-bold text-white">{currentEpoch} <span className="text-lg text-slate-500 font-normal">/ {modelConfig.epochs}</span></p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
             <p className="text-slate-400 text-sm mb-1">Mean Average Precision (mAP)</p>
             <p className="text-3xl font-bold text-emerald-400">
               {trainingHistory.length > 0 ? (trainingHistory[trainingHistory.length - 1].mAP * 100).toFixed(1) : '0.0'}%
             </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[400px]">
          <h3 className="text-white font-semibold mb-6">Live Training Metrics</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trainingHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="epoch" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} dot={false} name="Train Loss" />
              <Line type="monotone" dataKey="val_loss" stroke="#fbbf24" strokeWidth={2} dot={false} name="Val Loss" />
              <Line type="monotone" dataKey="mAP" stroke="#10b981" strokeWidth={2} dot={false} name="mAP" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Terminal Output Simulation */}
        <div className="bg-black rounded-xl p-4 font-mono text-xs text-green-400 h-32 overflow-y-auto border border-slate-800">
           <p className="opacity-50">$ initializing training sequence...</p>
           {appState !== AppState.IDLE && (
             <>
               <p className="opacity-70">$ loading dataset: found 50 images</p>
               <p className="opacity-70">$ architecture: {modelConfig.baseModel}</p>
               {trainingHistory.map((d, i) => (
                 <p key={i}>Epoch {d.epoch}: loss={d.loss.toFixed(4)} val_loss={d.val_loss.toFixed(4)} mAP={d.mAP.toFixed(4)}</p>
               ))}
             </>
           )}
           {appState === AppState.TRAINED && <p className="text-white bg-green-900/30 inline-block px-2 mt-2">Training Complete. Model saved.</p>}
        </div>
      </div>
    </div>
  );
};

export default Training;