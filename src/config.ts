// Gradio app that serves the classifier: a Hugging Face Space id or a URL.
// Override with VITE_GRADIO_APP (see .env.example), e.g. to use a locally running gradio_app.py.
export const GRADIO_APP = import.meta.env.VITE_GRADIO_APP ?? "heytony/ml-pokemon-api";
