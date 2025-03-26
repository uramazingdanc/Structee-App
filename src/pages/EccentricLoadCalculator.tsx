
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useProjects, CalculationType } from "@/context/ProjectContext";
import { calculateEccentricLoad } from "@/utils/calculations";
import { formatNumber } from "@/utils/calculations";

export default function EccentricLoadCalculator() {
  const { toast } = useToast();
  const { saveProject } = useProjects();

  const [inputs, setInputs] = useState({
    deadLoad: 100,
    liveLoad: 50,
    length: 300,
    width: 300,
    eccentricityX: 50,
    eccentricityY: 0,
    fc: 21,
    fy: 415,
    numberOfBars: 8,
    barDiameter: 16,
    tieDiameter: 10,
    columnHeight: 3,
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
      const calculationResults = calculateEccentricLoad(inputs);
      setResults(calculationResults);
      
      toast({
        title: "Calculation Complete",
        description: calculationResults.isSafe 
          ? "The design is safe!" 
          : "The design is not safe. Please revise.",
        variant: calculationResults.isSafe ? "default" : "destructive",
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
      type: "eccentric" as CalculationType,
      inputs,
      results,
    });

    toast({
      title: "Project Saved",
      description: `"${projectName}" has been saved successfully.`,
    });
  };

  return (
    <PageContainer title="Eccentric Load Calculator">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Column Properties</CardTitle>
            <CardDescription>Enter the column dimensions and properties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadLoad">Dead Load (kN)</Label>
                <Input
                  id="deadLoad"
                  name="deadLoad"
                  type="number"
                  value={inputs.deadLoad}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="liveLoad">Live Load (kN)</Label>
                <Input
                  id="liveLoad"
                  name="liveLoad"
                  type="number"
                  value={inputs.liveLoad}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eccentricityX">Eccentricity X (mm)</Label>
                <Input
                  id="eccentricityX"
                  name="eccentricityX"
                  type="number"
                  value={inputs.eccentricityX}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eccentricityY">Eccentricity Y (mm)</Label>
                <Input
                  id="eccentricityY"
                  name="eccentricityY"
                  type="number"
                  value={inputs.eccentricityY}
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
            <CardTitle>Reinforcement Details</CardTitle>
            <CardDescription>Enter the reinforcement properties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numberOfBars">Number of Bars</Label>
                <Input
                  id="numberOfBars"
                  name="numberOfBars"
                  type="number"
                  value={inputs.numberOfBars}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barDiameter">Bar Diameter (mm)</Label>
                <Input
                  id="barDiameter"
                  name="barDiameter"
                  type="number"
                  value={inputs.barDiameter}
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
            <div className="space-y-2">
              <Label htmlFor="columnHeight">Column Height (m)</Label>
              <Input
                id="columnHeight"
                name="columnHeight"
                type="number"
                value={inputs.columnHeight}
                onChange={handleInputChange}
              />
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
                  {results.isSafe 
                    ? "The design is safe!" 
                    : "The design is not safe. Please revise."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <p className="text-muted-foreground">Factored Load</p>
                    <p className="font-medium">{formatNumber(results.factoredLoad)} kN</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cross-Sectional Area</p>
                    <p className="font-medium">{formatNumber(results.crossSectionalArea)} mm²</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <p className="text-muted-foreground">Steel Area</p>
                    <p className="font-medium">{formatNumber(results.steelArea)} mm²</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Moment X</p>
                    <p className="font-medium">{formatNumber(results.momentX)} kN·m</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <p className="text-muted-foreground">Moment Y</p>
                    <p className="font-medium">{formatNumber(results.momentY)} kN·m</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Load Capacity</p>
                    <p className="font-medium">{formatNumber(results.axialLoadCapacity)} kN</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground">Steel Ratio</p>
                    <p className="font-medium">
                      {formatNumber(results.steelRatio * 100, 2)}% 
                      <span className={results.isRatioValid ? "text-green-500" : "text-red-500"}>
                        {results.isRatioValid ? " (Valid)" : " (Invalid)"}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Safety Status</p>
                    <p className={`font-medium ${
                      results.isSafe ? "text-green-600" : "text-red-600"
                    }`}>
                      {results.isSafe ? "SAFE" : "NOT SAFE"}
                    </p>
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
