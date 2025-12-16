import React, { useEffect, useRef } from 'react';
import { DetectionResult } from '../types';

interface InferenceCanvasProps {
  detections: DetectionResult[];
  width: number;
  height: number;
}

const InferenceCanvas: React.FC<InferenceCanvasProps> = ({ detections, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    detections.forEach((det) => {
      // Box format from Gemini: [ymin, xmin, ymax, xmax] normalized 0-1000
      const ymin = (det.box_2d[0] / 1000) * height;
      const xmin = (det.box_2d[1] / 1000) * width;
      const ymax = (det.box_2d[2] / 1000) * height;
      const xmax = (det.box_2d[3] / 1000) * width;

      const boxWidth = xmax - xmin;
      const boxHeight = ymax - ymin;

      // Draw Box
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(xmin, ymin, boxWidth, boxHeight);

      // Draw Label Background
      ctx.fillStyle = '#00ff00';
      const text = det.label;
      const font = '16px sans-serif';
      ctx.font = font;
      const textWidth = ctx.measureText(text).width;
      ctx.fillRect(xmin, ymin - 25, textWidth + 10, 25);

      // Draw Text
      ctx.fillStyle = '#000000';
      ctx.fillText(text, xmin + 5, ymin - 7);
    });

  }, [detections, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    />
  );
};

export default InferenceCanvas;
