import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

type Prediction = {
  top_prediction: {
    class_id: number;
    class_name: string;
    confidence: number;
  };
  predictions: {
    [id: string]: {
      class_id: number;
      class_name: string;
      confidence: number;
    };
  };
};

const App = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedImage) {
      setError("Please select an image");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await fetch("http://localhost:5050/classifier/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const result: Prediction = await response.json();
      setPrediction(result);

      console.log("Prediction Result:", result);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Pokemon Gen1 Classifier</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {preview && (
          <div className="mb-4">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedImage || loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Classifying..." : "Classify Image"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {prediction && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
          <h3 className="font-bold text-lg">Prediction Results:</h3>
          <p>
            <strong>Class:</strong> {prediction.top_prediction.class_name}
          </p>
          <p>
            <strong>Confidence:</strong>{" "}
            {(prediction.top_prediction.confidence * 100).toFixed(2)}%
          </p>

          <h4 className="font-semibold mt-2">All Probabilities:</h4>
          <ul className="text-sm">
            {Object.entries(prediction.predictions).map(
              ([id, predictionData]) => (
                <li key={id}>
                  {predictionData.class_name}:{" "}
                  {(predictionData.confidence * 100).toFixed(2)}%
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default App;
