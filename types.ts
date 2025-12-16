export interface BoundingBox {
  label: string;
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  confidence?: number;
}

export interface DatasetImage {
  id: string;
  src: string;
  annotations: BoundingBox[];
  createdAt: number;
}

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  val_loss: number;
  accuracy: number;
  precision: number;
  recall: number;
  mAP: number;
}

export interface ModelConfig {
  modelName: string;
  baseModel: 'YOLOv8' | 'Faster R-CNN' | 'SSD MobileNet';
  epochs: number;
  batchSize: number;
  learningRate: number;
  classes: string[];
}

export enum AppState {
  IDLE = 'IDLE',
  TRAINING = 'TRAINING',
  TRAINED = 'TRAINED',
}

export interface DetectionResult {
  box_2d: number[]; // [ymin, xmin, ymax, xmax] 0-1000 normalized
  label: string;
}