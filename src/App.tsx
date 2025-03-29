
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProjectProvider } from "./context/ProjectContext";

import Index from "./pages/Index";
import SquareTiedColumnAnalysis from "./pages/AxialLoadCalculator";
import EccentricLoadCalculator from "./pages/EccentricLoadCalculator";
import ReinforcementCalculator from "./pages/ReinforcementCalculator";
import SpiralColumnCalculator from "./pages/SpiralColumnCalculator";
import TiedColumnCalculator from "./pages/TiedColumnCalculator";
import SavedProjects from "./pages/SavedProjects";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ProjectProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/axial-load-calculator" element={<SquareTiedColumnAnalysis />} />
            <Route path="/eccentric-load-calculator" element={<EccentricLoadCalculator />} />
            <Route path="/reinforcement-calculator" element={<ReinforcementCalculator />} />
            <Route path="/spiral-column-calculator" element={<SpiralColumnCalculator />} />
            <Route path="/tied-column-calculator" element={<TiedColumnCalculator />} />
            <Route path="/saved-projects" element={<SavedProjects />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ProjectProvider>
  </QueryClientProvider>
);

export default App;
