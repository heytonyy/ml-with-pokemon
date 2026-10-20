import { useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { Client, handle_file } from "@gradio/client";
import type { Prediction } from "../types";
import { GRADIO_APP } from "../config";

// Connect once and reuse the client across predictions
let clientPromise: Promise<Client> | null = null;
const getClient = () => {
  clientPromise ??= Client.connect(GRADIO_APP).catch((err) => {
    clientPromise = null;
    throw err;
  });
  return clientPromise;
};

const PokemonClassifier = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isDragging, setIsDragging] = useState<boolean>(false);

  const selectImage = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
    setPrediction(null);
    setError(null);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    selectImage(e.target.files?.[0]);
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    // Ignore drag events moving between child elements of the drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    selectImage(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedImage) {
      setError("Please select an image");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = await getClient();
      const response = await client.predict("/predict", [handle_file(selectedImage)]);
      const result = (response.data as [Prediction])[0];
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
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-4 flex h-56 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors duration-200 focus-within:ring-2 focus-within:ring-blue-400 ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="sr-only"
          />
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="px-4 text-center text-gray-500">
              <p className="font-semibold text-gray-700">
                {isDragging ? "Drop it like it's hot!" : "Drag & drop a Pokemon image"}
              </p>
              <p className="mt-1 text-sm">
                or <span className="font-semibold text-blue-600">click to browse</span>
              </p>
            </div>
          )}
        </label>

        {selectedImage && (
          <p className="-mt-2 mb-4 truncate text-center text-sm text-gray-500">
            {selectedImage.name} · drop or click to change
          </p>
        )}

        <button
          type="submit"
          disabled={!selectedImage || loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Classifying... (the first one can take a minute)" : "Classify Image"}
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
            {prediction.predictions.map((predictionData) => (
              <li key={predictionData.class_id}>
                {predictionData.class_name}:{" "}
                {(predictionData.confidence * 100).toFixed(2)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PokemonClassifier;