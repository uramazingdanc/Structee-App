import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useProjects } from "@/context/ProjectContext";
import { formatNumber } from "@/utils/calculations";
import { Calculator, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SavedProjects() {
  const { savedProjects, deleteProject } = useProjects();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProjects = savedProjects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    deleteProject(id);
    toast.success("Project deleted successfully");
  };

  return (
    <PageContainer title="Saved Projects">
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">No saved projects</h3>
          <p className="text-muted-foreground mb-6">
            Your saved calculations will appear here.
          </p>
          <Button variant="outline" onClick={() => setSearchTerm("")}>
            Clear search
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <Card key={project.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>
                      {new Date(project.date).toLocaleDateString()} · {project.type === "axial" ? "Axial Load" : project.type}
                    </CardDescription>
                  </CardHeader>
                  {project.results && (
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Column</p>
                          <p className="font-medium">{project.inputs.length}×{project.inputs.width} mm</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Load</p>
                          <p className="font-medium">{formatNumber(project.results.factoredLoad)} kN</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Capacity</p>
                          <p className="font-medium">{formatNumber(project.results.axialLoadCapacity)} kN</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className={`font-medium ${project.results.isSafe 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400"}`}
                          >
                            {project.results.isSafe ? "SAFE" : "UNSAFE"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </div>
                <div className="p-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Project</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{project.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleDelete(project.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
