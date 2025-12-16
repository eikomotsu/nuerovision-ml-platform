export const APP_NAME = "NeuroVision ML";

export const DEFAULT_CLASSES = [
  "Person",
  "Cell Phone",
  "Laptop",
  "Bottle",
  "Book"
];

export const MOCK_TRAINING_DATA = Array.from({ length: 50 }, (_, i) => {
  const epoch = i + 1;
  const decay = Math.exp(-0.08 * i);
  const noise = () => (Math.random() - 0.5) * 0.05;
  
  return {
    epoch,
    loss: Math.max(0.1, 2.5 * decay + noise()),
    val_loss: Math.max(0.15, 2.8 * decay + 0.1 + noise()), // Validation loss usually slightly higher
    accuracy: Math.min(0.99, 0.4 + 0.55 * (1 - decay) + noise()),
    precision: Math.min(0.95, 0.3 + 0.6 * (1 - decay) + noise()),
    recall: Math.min(0.92, 0.25 + 0.65 * (1 - decay) + noise()),
    mAP: Math.min(0.96, 0.2 + 0.7 * (1 - decay) + noise())
  };
});