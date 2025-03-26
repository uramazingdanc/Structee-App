
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useProjects, CalculationType } from "@/context/ProjectContext";
import { calculateReinforcement } from "@/utils/calculations";
import { formatNumber } from "@/utils/calculations";

export default function ReinforcementCalculator() {
  const { toast } = useToast();
  const { saveProject } = useProjects();

  const [inputs, setInputs] = useState({
    axialLoad: 1000,
    length: 300,
    width: 300, 
    fc: 21,
    fy: 415,
    minSteelRatio: 0.01,
    maxSteelRatio: 0.08,
    concretecover: 40,
    tieDiameter: 10,
  });

  const [results, setResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [projectName, setProjectName] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleCalculate = () => {
    setIsCalculating(true);
    
    try {
      const calculationResults = calculateReinforcement(inputs);
      setResults(calculationResults);
      
      toast({
        title: "Calculation Complete",
        description: "Reinforcement sizing has been calculated.",
      });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: "An error occurred during calculation.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSave = () => {
    if (!results) {
      toast({
        title: "Cannot Save",
        description: "Please perform a calculation first.",
        variant: "destructive",
      });
      return;
    }

    if (!projectName.trim()) {
      toast({
        title: "Cannot Save",
        description: "Please enter a project name.",
        variant: "destructive",
      });
      return;
    }

    saveProject({
      name: projectName,
      type: "reinforcement" as CalculationType,
      inputs,
      results,
    });

    toast({
      title: "Project Saved",
      description: `"${projectName}" has been saved successfully.`,
    });
  };

  return (
    <PageContainer title="Reinforcement Sizing Calculator">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Column Properties</CardTitle>
            <CardDescription>Enter the column dimensions and loading</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="axialLoad">Axial Load (kN)</Label>
                <Input
                  id="axialLoad"
                  name="axialLoad"
                  type="number"
                  value={inputs.axialLoad}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length">Length (mm)</Label>
                <Input
                  id="length"
                  name="length"
                  type="number"
                  value={inputs.length}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Width (mm)</Label>
                <Input
                  id="width"
                  name="width"
                  type="number"
                  value={inputs.width}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Material Properties</CardTitle>
            <CardDescription>Enter concrete and steel properties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fc">Concrete Strength, f'c (MPa)</Label>
                <Input
                  id="fc"
                  name="fc"
                  type="number"
                  value={inputs.fc}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fy">Steel Yield Strength, fy (MPa)</Label>
                <Input
                  id="fy"
                  name="fy"
                  type="number"
                  value={inputs.fy}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Design Parameters</CardTitle>
            <CardDescription>Enter reinforcement constraints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minSteelRatio">Min Steel Ratio</Label>
                <Input
                  id="minSteelRatio"
                  name="minSteelRatio"
                  type="number"
                  step="0.01"
                  value={inputs.minSteelRatio}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxSteelRatio">Max Steel Ratio</Label>
                <Input
                  id="maxSteelRatio"
                  name="maxSteelRatio"
                  type="number"
                  step="0.01"
                  value={inputs.maxSteelRatio}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="concretecover">Concrete Cover (mm)</Label>
                <Input
                  id="concretecover"
                  name="concretecover"
                  type="number"
                  value={inputs.concretecover}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tieDiameter">Tie Diameter (mm)</Label>
                <Input
                  id="tieDiameter"
                  name="tieDiameter"
                  type="number"
                  value={inputs.tieDiameter}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          className="w-full"
          onClick={handleCalculate}
          disabled={isCalculating}
        >
          {isCalculating ? "Calculating..." : "Calculate"}
        </Button>

        {results && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Calculation Results</CardTitle>
                <CardDescription>
                  Required reinforcement details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <p className="text-muted-foreground">Required Steel Area</p>
                    <p className="font-medium">{formatNumber(results.requiredSteelArea)} mm²</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Steel Ratio</p>
                    <p className="font-medium">{formatNumber(results.steelRatio * 100, 2)}%</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <p className="text-muted-foreground">Recommended Bar Size</p>
                    <p className="font-medium">{results.recommendedBarSize} mm</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Number of Bars</p>
                    <p className="font-medium">{results.numberOfBars}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Bar Arrangement</p>
                    <p className="font-medium">{results.barArrangement}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Maximum Tie Spacing</p>
                    <p className="font-medium">{formatNumber(results.maxTieSpacing)} mm</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Save Calculation</CardTitle>
                <CardDescription>
                  Enter a name to save this calculation for future reference
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter a project name"
                  />
                </div>
                <Button 
                  className="w-full"
                  onClick={handleSave}
                >
                  Save Project
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageContainer>
  );
}
