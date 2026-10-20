type PredictionResult = {
  class_id: number;
  class_name: string;
  confidence: number;
};

type Prediction = {
  top_prediction: PredictionResult;
  predictions: PredictionResult[];
};

type Project = {
  id: string;
  name: string;
  component: React.ComponentType;
};

export type { Prediction, Project };