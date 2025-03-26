import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { useProjects } from "@/context/ProjectContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { calculateReinforcement } from "@/utils/calculations";
import { toast } from "sonner";

export default function ReinforcementCalculator() {
  const { saveProject } = useProjects();
  const [name, setName] = useState("Reinforcement Design");
  const [length, setLength] = useState(300);
  const [width, setWidth] = useState(300);
  const [columnHeight, setColumnHeight] = useState(3000);
  const [longitudinalBars, setLongitudinalBars] = useState(8);
  const [barSize, setBarSize] = useState(16);
  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    // Perform the reinforcement design calculation
    const calculatedResults = calculateReinforcement({
      length,
      width,
      columnHeight,
      numberOfBars: longitudinalBars,
      barDiameter: barSize,
      // Add required properties for CalculationInputs
      deadLoad: 0,
      liveLoad: 0,
      tieDiameter: 10,
      fc: 25, // Default concrete strength in MPa
      fy: 420, // Default steel strength in MPa
      axialLoad: 1000 // Default axial load in kN
    });

    setResults(calculatedResults);
    toast.success("Calculation complete!");
  };

  const saveCurrentProject = () => {
    if (!results) return;

    saveProject({
      // Removed the 'id' property as it's handled by saveProject function
      name,
      type: "reinforcement",
      inputs: {
        length,
        width,
        columnHeight,
        numberOfBars: longitudinalBars,
        barDiameter: barSize,
        deadLoad: 0,
        liveLoad: 0,
        tieDiameter: 10,
        fc: 25,
        fy: 420,
        axialLoad: 1000
      },
      results
    });

    toast.success("Project saved successfully!");
  };

  return (
    <PageContainer title="Reinforcement Calculator">
      <Card>
        <CardHeader>
          <CardTitle>Column Details</CardTitle>
          <CardDescription>Enter the column dimensions and reinforcement details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project Name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="length">Length (mm)</Label>
              <Input
                id="length"
                type="number"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="width">Width (mm)</Label>
              <Input
                id="width"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="columnHeight">Height (mm)</Label>
            <Input
              id="columnHeight"
              type="number"
              value={columnHeight}
              onChange={(e) => setColumnHeight(Number(e.target.value))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="longitudinalBars">Number of Bars</Label>
              <Input
                id="longitudinalBars"
                type="number"
                value={longitudinalBars}
                onChange={(e) => setLongitudinalBars(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="barSize">Bar Size (mm)</Label>
              <Input
                id="barSize"
                type="number"
                value={barSize}
                onChange={(e) => setBarSize(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={calculate} className="w-full">Calculate</Button>
        </CardFooter>
      </Card>

      {results && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Calculation Results</CardTitle>
            <CardDescription>Reinforcement design output</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Steel Area:</p>
                <p className="font-medium">{results.steelArea.toFixed(2)} mm²</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reinforcement Ratio:</p>
                <p className="font-medium">{(results.steelRatio * 100).toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Capacity:</p>
                <p className="font-medium">{results.axialLoadCapacity.toFixed(2)} kN</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status:</p>
                <p className={`font-medium ${results.isSafe ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {results.isSafe ? "SAFE" : "UNSAFE"}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveCurrentProject} variant="outline" className="w-full">
              Save Project
            </Button>
          </CardFooter>
        </Card>
      )}
    </PageContainer>
  );
}
