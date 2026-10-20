import type { Project } from "../types";

const NavigationBar = ({ 
  projects, 
  activeProject, 
  onProjectSelect 
}: {
  projects: Project[];
  activeProject: string;
  onProjectSelect: (projectId: string) => void;
}) => {
  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">ML with Pokemon</h1>
          </div>
          
          <div className="flex space-x-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onProjectSelect(project.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  activeProject === project.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;