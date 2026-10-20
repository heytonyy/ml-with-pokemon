import { useState } from "react";
import type { Project } from "./types";
import PokemonClassifier from "./components/PokemonClassifier";
import PokemonDiffusion from "./components/PokemonDiffusion";
import TextGeneration from "./components/PokemonTextGeneration";
import About from "./components/About";
import NavigationBar from "./components/NavigationBar";

const App = () => {
  const [activeProject, setActiveProject] = useState<string>("about");

  const projects: Project[] = [
    { id: "about", name: "About", component: About },
    { id: "classifier", name: "Classifier", component: PokemonClassifier },
    { id: "diffusion", name: "Diffusion", component: PokemonDiffusion },
    { id: "text_generation", name: "Text Generation", component: TextGeneration },
  ];

  const currentProject = projects.find(p => p.id === activeProject);
  const CurrentComponent = currentProject?.component || About;

  return (
    <div className="min-h-screen bg-gray-100">
      <NavigationBar
        projects={projects}
        activeProject={activeProject}
        onProjectSelect={setActiveProject}
      />
      
      <div className="py-8">
        <CurrentComponent />
      </div>
    </div>
  );
};

export default App;
