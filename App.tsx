import React, { useState, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  BrainCircuit, 
  LineChart, 
  ScanEye,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { AppState, DatasetImage, ModelConfig, TrainingMetrics } from './types';
import { DEFAULT_CLASSES } from './constants';

import Dashboard from './pages/Dashboard';
import DataStudio from './pages/DataStudio';
import Training from './pages/Training';
import Evaluation from './pages/Evaluation';
import Inference from './pages/Inference';
import Augmentation from './pages/Augmentation';

// --- Context ---
interface AppContextType {
  appState: AppState;
  setAppState: (state: AppState) => void;
  dataset: DatasetImage[];
  addToDataset: (img: DatasetImage) => void;
  modelConfig: ModelConfig;
  updateModelConfig: (config: Partial<ModelConfig>) => void;
  trainingHistory: TrainingMetrics[];
  setTrainingHistory: React.Dispatch<React.SetStateAction<TrainingMetrics[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// --- Main Component ---
const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [dataset, setDataset] = useState<DatasetImage[]>([]);
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    modelName: 'My_Custom_Detector_v1',
    baseModel: 'YOLOv8',
    epochs: 50,
    batchSize: 16,
    learningRate: 0.001,
    classes: DEFAULT_CLASSES,
  });
  const [trainingHistory, setTrainingHistory] = useState<TrainingMetrics[]>([]);

  const addToDataset = (img: DatasetImage) => {
    setDataset(prev => [img, ...prev]);
  };

  const updateModelConfig = (config: Partial<ModelConfig>) => {
    setModelConfig(prev => ({ ...prev, ...config }));
  };

  return (
    <AppContext.Provider value={{ 
      appState, 
      setAppState, 
      dataset, 
      addToDataset, 
      modelConfig, 
      updateModelConfig,
      trainingHistory,
      setTrainingHistory
    }}>
      <HashRouter>
        <Layout />
      </HashRouter>
    </AppContext.Provider>
  );
};

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/dataset", icon: Database, label: "Data Studio" },
    { to: "/augmentation", icon: Zap, label: "Augmentation Lab" },
    { to: "/training", icon: BrainCircuit, label: "Model Training" },
    { to: "/evaluation", icon: LineChart, label: "Evaluation" },
    { to: "/inference", icon: ScanEye, label: "Real-Time Inference" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
              <ScanEye className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">NeuroVision</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isActive 
                  ? 'bg-primary-600/20 text-primary-500 border border-primary-600/20 shadow-lg shadow-primary-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Project Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-slate-200">Active Environment</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-white">
              {navItems.find(i => i.to === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
        </header>
        
        <div className="p-6 pb-20 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dataset" element={<DataStudio />} />
            <Route path="/augmentation" element={<Augmentation />} />
            <Route path="/training" element={<Training />} />
            <Route path="/evaluation" element={<Evaluation />} />
            <Route path="/inference" element={<Inference />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;