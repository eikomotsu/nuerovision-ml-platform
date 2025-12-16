import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../App';
import { DatasetImage, BoundingBox } from '../types';
import { 
  Wand2, 
  FlipHorizontal, 
  Grid, 
  Crop, 
  Save, 
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

const Augmentation: React.FC = () => {
  const { dataset, addToDataset } = useApp();
  const [selectedImage, setSelectedImage] = useState<DatasetImage | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewBoxes, setPreviewBoxes] = useState<BoundingBox[]>([]);
  
  // Augmentation Settings
  const [flip, setFlip] = useState(false);
  const [brightness, setBrightness] = useState(100); // %
  const [contrast, setContrast] = useState(100); // %
  const [hue, setHue] = useState(0); // deg
  const [mosaic, setMosaic] = useState(false);
  const [randomCrop, setRandomCrop] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Apply Augmentations
  useEffect(() => {
    if (!selectedImage && !mosaic) return;

    const process = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 640;
      canvas.height = 640;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (mosaic && dataset.length >= 4) {
        // Mosaic Logic
        // Pick 3 other random images + selected (or 4 random if none selected)
        const candidates = [...dataset].sort(() => 0.5 - Math.random()).slice(0, 4);
        const images: HTMLImageElement[] = [];
        
        // Load images
        for (const c of candidates) {
          const img = new Image();
          img.src = c.src;
          await new Promise(r => img.onload = r);
          images.push(img);
        }

        // Draw 4 images in quadrants
        const positions = [
          { x: 0, y: 0 }, { x: 320, y: 0 },
          { x: 0, y: 320 }, { x: 320, y: 320 }
        ];

        let newBoxes: BoundingBox[] = [];

        positions.forEach((pos, i) => {
          if (images[i]) {
            // Draw Image
            ctx.drawImage(images[i], pos.x, pos.y, 320, 320);
            
            // Adjust Boxes (Scale 0.5 and Translate)
            const scaledBoxes = candidates[i].annotations.map(b => ({
              ...b,
              xmin: b.xmin * 0.5 + (pos.x / 640 * 1000),
              xmax: b.xmax * 0.5 + (pos.x / 640 * 1000),
              ymin: b.ymin * 0.5 + (pos.y / 640 * 1000),
              ymax: b.ymax * 0.5 + (pos.y / 640 * 1000)
            }));
            newBoxes = [...newBoxes, ...scaledBoxes];
          }
        });
        
        // Apply filters to whole canvas
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) hue-rotate(${hue}deg)`;
        // Need to redraw safely to apply filter, or apply filter before drawing. 
        // For simplicity, we just leave filter for single image mode or apply roughly here
        // (Canvas context filter applies to drawing operations, so subsequent ops)
        // Resetting to draw full canvas on itself with filter:
        const tempImg = new Image();
        tempImg.src = canvas.toDataURL();
        await new Promise(r => tempImg.onload = r);
        ctx.clearRect(0,0,640,640);
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) hue-rotate(${hue}deg)`;
        ctx.drawImage(tempImg, 0, 0);
        ctx.filter = 'none';

        setPreviewBoxes(newBoxes);

      } else if (selectedImage) {
        // Single Image Logic
        const img = new Image();
        img.src = selectedImage.src;
        await new Promise(r => img.onload = r);

        ctx.save();

        // 1. Flip (Transform Context)
        if (flip) {
          ctx.translate(640, 0);
          ctx.scale(-1, 1);
        }

        // 2. Filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) hue-rotate(${hue}deg)`;

        // 3. Draw
        if (randomCrop) {
          // Simulate a crop: Zoom in 1.2x and show center
          // Source: crop 10% from edges.
          // sw = img.width * 0.8, sh = img.height * 0.8
          // sx = img.width * 0.1, sy = img.height * 0.1
          ctx.drawImage(img, img.width * 0.1, img.height * 0.1, img.width * 0.8, img.height * 0.8, 0, 0, 640, 640);
        } else {
          ctx.drawImage(img, 0, 0, 640, 640);
        }
        
        ctx.restore();

        // 4. Adjust Boxes
        let boxes = selectedImage.annotations.map(b => ({ ...b }));
        
        if (randomCrop) {
            // Remap 0-1000 coordinates based on crop
            // Old range 100-900 maps to 0-1000
            // x_new = (x_old - 100) * (1000 / 800)
            boxes = boxes.map(b => ({
                ...b,
                xmin: (b.xmin - 100) * 1.25,
                xmax: (b.xmax - 100) * 1.25,
                ymin: (b.ymin - 100) * 1.25,
                ymax: (b.ymax - 100) * 1.25
            })).filter(b => b.xmax > 0 && b.xmin < 1000 && b.ymax > 0 && b.ymin < 1000)
               .map(b => ({
                   ...b,
                   xmin: Math.max(0, b.xmin),
                   ymin: Math.max(0, b.ymin),
                   xmax: Math.min(1000, b.xmax),
                   ymax: Math.min(1000, b.ymax)
               }));
        }

        if (flip) {
          boxes = boxes.map(b => ({
            ...b,
            xmin: 1000 - b.xmax,
            xmax: 1000 - b.xmin
          }));
        }

        setPreviewBoxes(boxes);
      }

      setPreviewSrc(canvas.toDataURL('image/jpeg'));
    };

    process();
  }, [selectedImage, flip, brightness, contrast, hue, mosaic, randomCrop, dataset]);


  const saveAugmented = () => {
    if (!previewSrc) return;
    addToDataset({
      id: `aug_${Date.now()}`,
      src: previewSrc,
      annotations: previewBoxes,
      createdAt: Date.now()
    });
    alert("Augmented image added to dataset!");
  };

  const resetFilters = () => {
    setFlip(false);
    setBrightness(100);
    setContrast(100);
    setHue(0);
    setMosaic(false);
    setRandomCrop(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
      
      {/* Sidebar: Image Selector & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 overflow-y-auto">
        
        {/* Dataset Selector */}
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <ImageIcon size={18} className="text-primary-500" /> Source Image
          </h3>
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-2">
            {dataset.map(img => (
              <button 
                key={img.id}
                onClick={() => { setSelectedImage(img); setMosaic(false); }}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage?.id === img.id && !mosaic ? 'border-primary-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <img src={img.src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            {dataset.length === 0 && <p className="col-span-4 text-xs text-slate-500 italic">No images in dataset. Go to Data Studio.</p>}
          </div>
        </div>

        <hr className="border-slate-800" />

        {/* Augmentation Controls */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-semibold">Pipeline Config</h3>
            <button onClick={resetFilters} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
              <RefreshCw size={12} /> Reset
            </button>
          </div>

          <div className="space-y-4">
             {/* Geometric */}
             <div className="space-y-2">
               <label className="text-xs uppercase font-bold text-slate-500">Geometric</label>
               <div className="flex gap-2">
                 <button 
                   onClick={() => { setFlip(!flip); setMosaic(false); }}
                   className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 text-sm transition-all ${flip ? 'bg-primary-900/30 border-primary-500 text-primary-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                 >
                   <FlipHorizontal size={16} /> Flip
                 </button>
                 <button 
                   onClick={() => { setRandomCrop(!randomCrop); setMosaic(false); }}
                   className={`flex-1 py-2 rounded-lg border flex items-center justify-center gap-2 text-sm transition-all ${randomCrop ? 'bg-primary-900/30 border-primary-500 text-primary-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                 >
                   <Crop size={16} /> Crop
                 </button>
               </div>
               <button 
                   onClick={() => { setMosaic(!mosaic); if(!mosaic) resetFilters(); setMosaic(!mosaic); }} // Simple toggle logic needs care
                   className={`w-full py-2 rounded-lg border flex items-center justify-center gap-2 text-sm transition-all ${mosaic ? 'bg-purple-900/30 border-purple-500 text-purple-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'}`}
                 >
                   <Grid size={16} /> Mosaic Augmentation (Advanced)
               </button>
             </div>

             {/* Color */}
             <div className="space-y-3">
               <label className="text-xs uppercase font-bold text-slate-500">Color Jitter</label>
               
               <div className="space-y-1">
                 <div className="flex justify-between text-xs text-slate-400">
                   <span>Brightness</span>
                   <span>{brightness}%</span>
                 </div>
                 <input 
                   type="range" min="50" max="150" value={brightness} 
                   onChange={(e) => setBrightness(Number(e.target.value))}
                   className="w-full accent-primary-500" 
                 />
               </div>

               <div className="space-y-1">
                 <div className="flex justify-between text-xs text-slate-400">
                   <span>Contrast</span>
                   <span>{contrast}%</span>
                 </div>
                 <input 
                   type="range" min="50" max="150" value={contrast} 
                   onChange={(e) => setContrast(Number(e.target.value))}
                   className="w-full accent-primary-500" 
                 />
               </div>

               <div className="space-y-1">
                 <div className="flex justify-between text-xs text-slate-400">
                   <span>Hue</span>
                   <span>{hue}°</span>
                 </div>
                 <input 
                   type="range" min="-180" max="180" value={hue} 
                   onChange={(e) => setHue(Number(e.target.value))}
                   className="w-full accent-primary-500" 
                 />
               </div>
             </div>
          </div>
        </div>

        <div className="mt-auto">
          <button 
            onClick={saveAugmented}
            disabled={!previewSrc}
            className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20"
          >
            <Save size={20} /> Add to Dataset
          </button>
        </div>
      </div>

      {/* Main Preview */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-center relative overflow-hidden">
        <div className="relative aspect-square h-full max-h-[640px] bg-black rounded-xl overflow-hidden shadow-2xl">
          {/* We use a canvas for the actual processing but hide it or show it. 
              Actually we can just show the image src generated from canvas to ensure we see what we save. */}
          {previewSrc ? (
            <>
              <img src={previewSrc} alt="Preview" className="w-full h-full object-contain" />
              {/* Box Overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                  {previewBoxes.map((box, idx) => (
                    <g key={idx}>
                      <rect
                        x={box.xmin}
                        y={box.ymin}
                        width={box.xmax - box.xmin}
                        height={box.ymax - box.ymin}
                        fill="none"
                        stroke="#fbbf24" // Amber for augmented
                        strokeWidth="3"
                        strokeDasharray="5,5"
                      />
                      <text x={box.xmin} y={box.ymin - 5} fill="#fbbf24" fontSize="20" fontWeight="bold">
                        {box.label}
                      </text>
                    </g>
                  ))}
                </svg>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-600">
              <Wand2 size={48} className="mb-4 opacity-50" />
              <p>Select an image to start augmentation</p>
            </div>
          )}
          {/* Hidden Canvas for Processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        {/* Badge */}
        {previewSrc && (
          <div className="absolute top-8 right-8 bg-black/70 backdrop-blur text-white px-4 py-2 rounded-lg border border-white/10 text-sm">
             Preview Mode: <span className="text-amber-400 font-bold">{mosaic ? 'Mosaic' : 'Single Augmented'}</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default Augmentation;