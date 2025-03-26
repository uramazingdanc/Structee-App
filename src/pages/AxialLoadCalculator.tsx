import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { calculateAxialLoad, formatNumber } from "@/utils/calculations";
import { CalculationInputs, CalculationResult, useProjects } from "@/context/ProjectContext";
import { Check, Save, AlertTriangle, Calculator } from "lucide-react";
import { toast } from "sonner";

export default function AxialLoadCalculator() {
  const { saveProject } = useProjects();
  const [projectName, setProjectName] = useState("Untitled Project");
  const [inputs, setInputs] = useState<CalculationInputs>({
    deadLoad: 100,
    liveLoad: 50,
    numberOfBars: 8,
    tieDiameter: 10,
    barDiameter: 16,
    columnHeight: 3,
    length: 300,
    width: 300,
    fc: 21,
    fy: 415,
  });
  
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
    setIsCalculated(false);
  };

  const handleCalculate = () => {
    // Validate inputs
    if (inputs.numberOfBars < 4) {
      toast.error("Number of bars must be at least 4");
      return;
    }

    if (inputs.length <= 0 || inputs.width <= 0) {
      toast.error("Column dimensions must be greater than 0");
      return;
    }

    // Perform calculation
    const calculationResults = calculateAxialLoad(inputs);
    setResults(calculationResults);
    setIsCalculated(true);
    
    toast.success("Calculation completed successfully");
  };

  const handleSave = () => {
    if (!results) return;
    
    saveProject({
      name: projectName,
      type: "axial",
      inputs,
      results,
    });
    
    toast.success("Project saved successfully");
  };

  return (
    <PageContainer title="Axial Load Calculator">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Enter a name for your calculation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Column Properties</CardTitle>
            <CardDescription>Enter column dimensions and material properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="length">Length (mm)</Label>
                  <Input
                    id="length"
                    name="length"
                    type="number"
                    placeholder="300"
                    value={inputs.length}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="width">Width (mm)</Label>
                  <Input
                    id="width"
                    name="width"
                    type="number"
                    placeholder="300"
                    value={inputs.width}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="columnHeight">Column Height (m)</Label>
                  <Input
                    id="columnHeight"
                    name="columnHeight"
                    type="number"
                    placeholder="3"
                    value={inputs.columnHeight}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="fc">f'c (MPa)</Label>
                  <Input
                    id="fc"
                    name="fc"
                    type="number"
                    placeholder="21"
                    value={inputs.fc}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="fy">fy (MPa)</Label>
                  <Input
                    id="fy"
                    name="fy"
                    type="number"
                    placeholder="415"
                    value={inputs.fy}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="deadLoad">Dead Load (kN)</Label>
                  <Input
                    id="deadLoad"
                    name="deadLoad"
                    type="number"
                    placeholder="100"
                    value={inputs.deadLoad}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="liveLoad">Live Load (kN)</Label>
                  <Input
                    id="liveLoad"
                    name="liveLoad"
                    type="number"
                    placeholder="50"
                    value={inputs.liveLoad}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="numberOfBars">Number of Bars (≥ 4)</Label>
                  <Input
                    id="numberOfBars"
                    name="numberOfBars"
                    type="number"
                    placeholder="8"
                    value={inputs.numberOfBars}
                    onChange={handleInputChange}
                    min={4}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="barDiameter">Bar Diameter (mm)</Label>
                  <Input
                    id="barDiameter"
                    name="barDiameter"
                    type="number"
                    placeholder="16"
                    value={inputs.barDiameter}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="tieDiameter">Tie Diameter (mm)</Label>
                  <Input
                    id="tieDiameter"
                    name="tieDiameter"
                    type="number"
                    placeholder="10"
                    value={inputs.tieDiameter}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                onClick={handleCalculate} 
                className="w-full sm:w-auto"
              >
                <Calculator className="mr-2 h-4 w-4" />
                Calculate
              </Button>
            </div>
          </CardContent>
        </Card>

        {isCalculated && results && (
          <Card className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Results</CardTitle>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 rounded-lg border flex items-center gap-2">
                {results.isSafe ? (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-2">
                      <Check className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Design is Safe</p>
                      <p className="text-sm text-muted-foreground">
                        Axial load capacity exceeds factored load
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 dark:text-red-400">
                    <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-2">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Design is Not Safe</p>
                      <p className="text-sm text-muted-foreground">
                        Factored load exceeds axial load capacity
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {!results.isRatioValid && (
                <div className="mb-4 p-3 rounded-lg border bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30 flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="text-sm">
                    Steel reinforcement ratio is outside recommended range (1-8%)
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Load Analysis</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Factored Load (Pu):</span>
                      <span className="font-medium">{formatNumber(results.factoredLoad)} kN</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Axial Load Capacity:</span>
                      <span className="font-medium">{formatNumber(results.axialLoadCapacity)} kN</span>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Safety Margin:</span>
                      <span className={`font-medium ${results.isSafe ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatNumber((results.axialLoadCapacity / results.factoredLoad - 1) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Section Properties</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Cross-Sectional Area:</span>
                      <span className="font-medium">{formatNumber(results.crossSectionalArea)} mm²</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Area per Bar:</span>
                      <span className="font-medium">{formatNumber(results.areaOfBar)} mm²</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total Steel Area:</span>
                      <span className="font-medium">{formatNumber(results.steelArea)} mm²</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Steel Ratio:</span>
                      <span className={`font-medium ${results.isRatioValid ? '' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        {formatNumber(results.steelArea / results.crossSectionalArea * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
