import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { useApp } from '../App';
import { AppState } from '../types';

const Evaluation: React.FC = () => {
  const { appState, trainingHistory } = useApp();

  if (appState !== AppState.TRAINED) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Model Not Trained</h2>
        <p className="text-slate-400 max-w-md">
          Please complete the training process in the "Model Training" tab to view evaluation metrics.
        </p>
      </div>
    );
  }

  // Mock Per-Class Data
  const classPerformance = [
    { name: 'Person', precision: 0.92, recall: 0.88, f1: 0.90 },
    { name: 'Cell Phone', precision: 0.85, recall: 0.82, f1: 0.83 },
    { name: 'Laptop', precision: 0.89, recall: 0.91, f1: 0.90 },
    { name: 'Bottle', precision: 0.78, recall: 0.75, f1: 0.76 },
    { name: 'Book', precision: 0.82, recall: 0.80, f1: 0.81 },
  ];

  const radarData = [
    { subject: 'mAP', A: 92, fullMark: 100 },
    { subject: 'Precision', A: 88, fullMark: 100 },
    { subject: 'Recall', A: 85, fullMark: 100 },
    { subject: 'F1-Score', A: 86, fullMark: 100 },
    { subject: 'Speed (FPS)', A: 95, fullMark: 100 },
    { subject: 'Robustness', A: 75, fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* New: Training History Dashboard */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
             <span className="w-2 h-6 bg-primary-500 rounded-full"></span>
             Training Dynamics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[300px]">
             {/* Loss Curve */}
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={trainingHistory}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                 <XAxis dataKey="epoch" stroke="#64748b" />
                 <YAxis stroke="#64748b" />
                 <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                 <Legend />
                 <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} dot={false} name="Train Loss" />
                 <Line type="monotone" dataKey="val_loss" stroke="#fbbf24" strokeWidth={2} dot={false} name="Val Loss" />
               </LineChart>
             </ResponsiveContainer>

             {/* Precision / Recall Curve over Epochs */}
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={trainingHistory}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                 <XAxis dataKey="epoch" stroke="#64748b" />
                 <YAxis stroke="#64748b" domain={[0, 1]} />
                 <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                 <Legend />
                 <Area type="monotone" dataKey="precision" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Precision" />
                 <Area type="monotone" dataKey="recall" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} name="Recall" />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Per-Class Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-6">Per-Class Metrics</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#64748b" domain={[0, 1]} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                <Tooltip 
                  cursor={{fill: '#1e293b'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="precision" fill="#3b82f6" name="Precision" radius={[0, 4, 4, 0]} />
                <Bar dataKey="recall" fill="#8b5cf6" name="Recall" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Radar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-6">Model Health Overview</h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Current Model"
                  dataKey="A"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confusion Matrix (Visualization) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-semibold">Confusion Matrix</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
               <span className="w-3 h-3 bg-blue-600 rounded"></span> Correct
               <span className="w-3 h-3 bg-slate-800 rounded ml-2"></span> Incorrect
            </div>
          </div>
          
          <div className="overflow-x-auto">
             <div className="grid grid-cols-6 gap-1 min-w-[500px] text-xs text-center">
              {/* Header */}
              <div className="col-span-1 flex items-end justify-end p-2 font-bold text-slate-500">Actual \ Pred</div>
              {classPerformance.map((c, i) => <div key={i} className="font-bold text-slate-400 p-2 border-b border-slate-800">{c.name}</div>)}
              
              {/* Rows */}
              {classPerformance.map((row, i) => (
                <React.Fragment key={i}>
                  <div className="font-bold text-slate-400 flex items-center justify-end pr-4 border-r border-slate-800">{row.name}</div>
                  {classPerformance.map((col, j) => {
                    // Generate matrix values
                    const isDiag = i === j;
                    const value = isDiag ? Math.floor(row.precision * 100) : Math.floor(Math.random() * 8);
                    
                    // Heatmap coloring
                    let bgColor = 'bg-slate-950';
                    let textColor = 'text-slate-500';
                    
                    if (isDiag) {
                      bgColor = 'bg-blue-600';
                      textColor = 'text-white';
                    } else if (value > 5) {
                      bgColor = 'bg-slate-800';
                      textColor = 'text-slate-300';
                    }

                    return (
                      <div key={j} className={`aspect-square flex flex-col items-center justify-center rounded m-0.5 ${bgColor}`}>
                        <span className={`font-bold ${textColor} text-sm`}>{value}</span>
                        {isDiag && <span className="text-[9px] text-blue-200">TP</span>}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evaluation;