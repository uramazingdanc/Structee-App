import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Calculator, FolderOpen, ArrowRight } from "lucide-react";
import { useProjects } from "@/context/ProjectContext";
import { formatNumber } from "@/utils/calculations";

export default function Index() {
  const { recentProjects } = useProjects();

  const calculationTypes = [
    {
      title: "Square Tied Column Analysis",
      description: "Calculate axial load capacity for square tied columns",
      icon: <Calculator className="h-5 w-5" />,
      path: "/axial-load-calculator",
    },
    {
      title: "Eccentric Load Calculator",
      description: "Calculate eccentric load capacity",
      icon: <Calculator className="h-5 w-5" />,
      path: "/eccentric-load-calculator",
      disabled: false,
    },
    {
      title: "Spiral Column Analysis",
      description: "Design and analyze spiral columns",
      icon: <Calculator className="h-5 w-5" />,
      path: "/spiral-column-calculator",
      disabled: false,
    },
    {
      title: "Tied Column Design",
      description: "Design and analyze tied columns",
      icon: <Calculator className="h-5 w-5" />,
      path: "/tied-column-calculator",
      disabled: false,
    },
  ];

  return (
    <PageContainer>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Structee</h1>
        <p className="text-muted-foreground">The Smart Structural Load Calculator</p>
      </div>

      <div className="grid gap-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {calculationTypes.map((type) => (
              <Card 
                key={type.title} 
                to={type.disabled ? undefined : type.path}
                className={type.disabled ? "opacity-60" : ""}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">{type.title}</CardTitle>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {type.icon}
                  </div>
                </CardHeader>
                <CardDescription>{type.description}</CardDescription>
              </Card>
            ))}
          </div>
        </section>

        {recentProjects.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Calculations</h2>
              <Card 
                to="/saved-projects" 
                className="px-3 py-1 flex items-center gap-1 text-sm"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Card>
            </div>
            <div className="grid gap-4">
              {recentProjects.map((project) => (
                <Card key={project.id} to={`/saved-projects/${project.id}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardHeader>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>
                          {new Date(project.date).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      {project.results && (
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Factored Load:</p>
                              <p className="font-medium">{formatNumber(project.results.factoredLoad)} kN</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Load Capacity:</p>
                              <p className="font-medium">{formatNumber(project.results.axialLoadCapacity)} kN</p>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </div>
                    <div className="pr-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center
                        ${project.results?.isSafe 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`
                      }>
                        <span className="text-xs font-medium">
                          {project.results?.isSafe ? "SAFE" : "FAIL"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageContainer>
  );
}
