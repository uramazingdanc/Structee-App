
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CalculationType = "axial" | "eccentric" | "reinforcement";

export interface CalculationResult {
  factoredLoad: number; // Pu (kN)
  crossSectionalArea: number; // mm²
  areaOfBar: number; // mm²
  steelArea: number; // mm²
  axialLoadCapacity: number; // Design Pu (kN)
  isSafe: boolean;
  isRatioValid: boolean;
}

export interface CalculationInputs {
  deadLoad: number; // kN
  liveLoad: number; // kN
  numberOfBars: number;
  tieDiameter: number; // mm
  barDiameter: number; // mm
  columnHeight: number; // m
  length: number; // mm
  width: number; // mm
  fc: number; // MPa (concrete strength)
  fy: number; // MPa (steel strength)
}

export interface SavedProject {
  id: string;
  name: string;
  type: CalculationType;
  date: Date;
  inputs: CalculationInputs;
  results?: CalculationResult;
}

interface ProjectContextType {
  savedProjects: SavedProject[];
  recentProjects: SavedProject[];
  saveProject: (project: Omit<SavedProject, "id" | "date">) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => SavedProject | undefined;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);

  // Load saved projects from localStorage on mount
  useEffect(() => {
    const storedProjects = localStorage.getItem("savedProjects");
    if (storedProjects) {
      const parsedProjects = JSON.parse(storedProjects).map((project: any) => ({
        ...project,
        date: new Date(project.date),
      }));
      setSavedProjects(parsedProjects);
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("savedProjects", JSON.stringify(savedProjects));
  }, [savedProjects]);

  // Get the 5 most recent projects
  const recentProjects = [...savedProjects]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const saveProject = (project: Omit<SavedProject, "id" | "date">) => {
    const newProject: SavedProject = {
      ...project,
      id: Date.now().toString(),
      date: new Date(),
    };
    setSavedProjects((prev) => [...prev, newProject]);
  };

  const deleteProject = (id: string) => {
    setSavedProjects((prev) => prev.filter((project) => project.id !== id));
  };

  const getProject = (id: string) => {
    return savedProjects.find((project) => project.id === id);
  };

  return (
    <ProjectContext.Provider
      value={{
        savedProjects,
        recentProjects,
        saveProject,
        deleteProject,
        getProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}
