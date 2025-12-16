import React from 'react';
import { useApp } from '../App';
import { 
  Database, 
  BrainCircuit, 
  CheckCircle, 
  Layers, 
  Cpu,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { dataset, modelConfig, appState } = useApp();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Cards */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-500">
              <Database size={24} />
            </div>
            <span className="text-slate-500 text-sm font-medium">Total Images</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{dataset.length}</div>
          <div className="text-sm text-slate-400">Labeled Samples</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg text-purple-500">
              <BrainCircuit size={24} />
            </div>
            <span className="text-slate-500 text-sm font-medium">Model Status</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {appState === 'IDLE' ? 'Not Trained' : appState}
          </div>
          <div className="text-sm text-slate-400">Architecture: {modelConfig.baseModel}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500">
              <Layers size={24} />
            </div>
            <span className="text-slate-500 text-sm font-medium">Target Classes</span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{modelConfig.classes.length}</div>
          <div className="text-sm text-slate-400">Custom Objects</div>
        </div>
      </div>

      {/* Project Workflow Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-white mb-6">ML Pipeline Workflow</h2>
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 hidden md:block" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            
            <WorkflowStep 
              number="1" 
              title="Data Collection" 
              desc="Capture & Label" 
              link="/dataset"
              active={true}
            />
            <WorkflowStep 
              number="2" 
              title="Training" 
              desc="Fine-tune Model" 
              link="/training"
              active={dataset.length > 5}
            />
            <WorkflowStep 
              number="3" 
              title="Evaluation" 
              desc="Analyze Metrics" 
              link="/evaluation"
              active={appState === 'TRAINED'}
            />
            <WorkflowStep 
              number="4" 
              title="Deployment" 
              desc="Real-time Inference" 
              link="/inference"
              active={appState === 'TRAINED'}
            />
            
          </div>
        </div>
      </div>

      {/* Recent Activity / Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-lg text-white mb-4">Project Guidelines</h3>
          <ul className="space-y-3">
            {[
              "Collect at least 10 images per class for a demo.",
              "Ensure varied lighting conditions in your dataset.",
              "Use 'Augmentation' to improve model robustness.",
              "Monitor Loss and mAP curves during training."
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-300">
                <CheckCircle size={18} className="text-primary-500 mt-0.5 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-primary-900/50 to-slate-900 border border-primary-500/20 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
          <Cpu className="w-12 h-12 text-primary-400 mb-4" />
          <h3 className="font-bold text-xl text-white mb-2">Ready to Deploy?</h3>
          <p className="text-slate-400 mb-6 max-w-md">
            Your custom model environment is initialized. Head to the inference lab to test real-time detection powered by Gemini.
          </p>
          <Link 
            to="/inference" 
            className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-full transition-colors flex items-center gap-2"
          >
            Launch Inference Lab <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

const WorkflowStep: React.FC<{
  number: string;
  title: string;
  desc: string;
  active: boolean;
  link: string;
}> = ({ number, title, desc, active, link }) => (
  <Link 
    to={link}
    className={`
      flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all
      ${active 
        ? 'bg-slate-800 border-primary-500 shadow-lg shadow-primary-900/20 cursor-pointer hover:bg-slate-800/80' 
        : 'bg-slate-900 border-slate-700 opacity-60 cursor-not-allowed'}
    `}
  >
    <div className={`
      w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg mb-3
      ${active ? 'bg-primary-500 text-white' : 'bg-slate-700 text-slate-400'}
    `}>
      {number}
    </div>
    <h3 className="font-bold text-white">{title}</h3>
    <p className="text-sm text-slate-400">{desc}</p>
  </Link>
);

export default Dashboard;
