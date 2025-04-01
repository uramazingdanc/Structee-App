
// This is a new file I'm creating to add a step-by-step solution to the Eccentric Load Calculator
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CalculationInputs, CalculationResult, useProjects } from "@/context/ProjectContext";
import { Check, Save, AlertTriangle, Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { calculateEccentricLoad, formatNumber } from "@/utils/calculations";

export default function EccentricLoadCalculator() {
  const { saveProject } = useProjects();
  const [projectName, setProjectName] = useState("Eccentric Load Analysis");
  const [inputs, setInputs] = useState<CalculationInputs>({
    deadLoad: 100,
    liveLoad: 50,
    length: 300,
    width: 300,
    fc: 21,
    fy: 415,
    barDiameter: 16,
    tieDiameter: 10,
    numberOfBars: 8,
    columnHeight: 3,
    eccentricityX: 50,
    eccentricityY: 50,
  });
  
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [showStepByStep, setShowStepByStep] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
    setIsCalculated(false);
  };

  const handleCalculate = () => {
    try {
      const calculationResults = calculateEccentricLoad(inputs);
      setResults(calculationResults);
      setIsCalculated(true);
      
      toast.success("Calculation completed successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error in calculation. Please check your inputs.");
    }
  };

  const handleSave = () => {
    if (!results) return;
    
    saveProject({
      name: projectName,
      type: "eccentric",
      inputs,
      results,
    });
    
    toast.success("Project saved successfully");
  };

  return (
    <PageContainer title="Eccentric Load Calculator">
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
                  <Label htmlFor="length">Column Length (mm)</Label>
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
                  <Label htmlFor="width">Column Width (mm)</Label>
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
                  <Label htmlFor="eccentricityX">Eccentricity in X-direction (mm)</Label>
                  <Input
                    id="eccentricityX"
                    name="eccentricityX"
                    type="number"
                    placeholder="50"
                    value={inputs.eccentricityX}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="eccentricityY">Eccentricity in Y-direction (mm)</Label>
                  <Input
                    id="eccentricityY"
                    name="eccentricityY"
                    type="number"
                    placeholder="50"
                    value={inputs.eccentricityY}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="numberOfBars">Number of Bars</Label>
                  <Input
                    id="numberOfBars"
                    name="numberOfBars"
                    type="number"
                    placeholder="8"
                    value={inputs.numberOfBars}
                    onChange={handleInputChange}
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
                    Steel reinforcement ratio is outside recommended range (1% - 8%)
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
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Moment X:</span>
                      <span className="font-medium">{formatNumber(results.momentX || 0)} kN·m</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Moment Y:</span>
                      <span className="font-medium">{formatNumber(results.momentY || 0)} kN·m</span>
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
                      <span className="text-muted-foreground">Steel Area:</span>
                      <span className="font-medium">{formatNumber(results.steelArea)} mm²</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Steel Ratio:</span>
                      <span className={`font-medium ${results.isRatioValid ? '' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        {formatNumber(results.steelRatio! * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Reinforcement Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Number of Bars:</span>
                      <span className="font-medium">{inputs.numberOfBars}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Bar Diameter:</span>
                      <span className="font-medium">{inputs.barDiameter} mm</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Area per Bar:</span>
                      <span className="font-medium">{formatNumber(results.areaOfBar)} mm²</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Eccentricity Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Eccentricity X:</span>
                      <span className="font-medium">{inputs.eccentricityX} mm</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Eccentricity Y:</span>
                      <span className="font-medium">{inputs.eccentricityY} mm</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Total Eccentricity:</span>
                      <span className="font-medium">{formatNumber(Math.sqrt(Math.pow(inputs.eccentricityX!, 2) + Math.pow(inputs.eccentricityY!, 2)))} mm</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setShowStepByStep(!showStepByStep)}
                  className="w-full flex justify-between items-center"
                >
                  <span>Step-by-Step Solution</span>
                  {showStepByStep ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                
                {showStepByStep && (
                  <div className="mt-4 space-y-4 bg-muted/30 p-4 rounded-lg border">
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 1: Calculate Factored Load</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>P<sub>u</sub> = 1.2 × D + 1.6 × L</p>
                        <p>P<sub>u</sub> = 1.2 × {inputs.deadLoad} + 1.6 × {inputs.liveLoad}</p>
                        <p>P<sub>u</sub> = {1.2 * inputs.deadLoad} + {1.6 * inputs.liveLoad}</p>
                        <p>P<sub>u</sub> = {formatNumber(results.factoredLoad)} kN</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 2: Calculate Cross-Sectional Area</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Cross-Sectional Area = Length × Width</p>
                        <p>Cross-Sectional Area = {inputs.length} × {inputs.width}</p>
                        <p>Cross-Sectional Area = {formatNumber(results.crossSectionalArea)} mm²</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 3: Calculate Area of a Single Bar</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Area of One Bar = π × (Bar Diameter / 2)²</p>
                        <p>Area of One Bar = π × ({inputs.barDiameter} / 2)²</p>
                        <p>Area of One Bar = π × {Math.pow(inputs.barDiameter / 2, 2)}</p>
                        <p>Area of One Bar = {formatNumber(results.areaOfBar)} mm²</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 4: Calculate Total Steel Area</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Total Steel Area = Number of Bars × Area of One Bar</p>
                        <p>Total Steel Area = {inputs.numberOfBars} × {formatNumber(results.areaOfBar)}</p>
                        <p>Total Steel Area = {formatNumber(results.steelArea)} mm²</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 5: Calculate Steel Ratio</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Steel Ratio = Steel Area / Cross-Sectional Area</p>
                        <p>Steel Ratio = {formatNumber(results.steelArea)} / {formatNumber(results.crossSectionalArea)}</p>
                        <p>Steel Ratio = {formatNumber(results.steelRatio || 0, 4)}</p>
                        <p>Steel Ratio = {formatNumber((results.steelRatio || 0) * 100, 2)}%</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 6: Calculate Moments Due to Eccentricity</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Moment X = P<sub>u</sub> × e<sub>x</sub></p>
                        <p>Moment X = {formatNumber(results.factoredLoad)} × {inputs.eccentricityX} / 1000</p>
                        <p>Moment X = {formatNumber(results.momentX || 0)} kN·m</p>
                        
                        <p>Moment Y = P<sub>u</sub> × e<sub>y</sub></p>
                        <p>Moment Y = {formatNumber(results.factoredLoad)} × {inputs.eccentricityY} / 1000</p>
                        <p>Moment Y = {formatNumber(results.momentY || 0)} kN·m</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 7: Calculate Eccentricity Reduction Factor</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Total Eccentricity = √(e<sub>x</sub>² + e<sub>y</sub>²)</p>
                        <p>Total Eccentricity = √({inputs.eccentricityX}² + {inputs.eccentricityY}²)</p>
                        <p>Total Eccentricity = √({Math.pow(inputs.eccentricityX!, 2)} + {Math.pow(inputs.eccentricityY!, 2)})</p>
                        <p>Total Eccentricity = {formatNumber(Math.sqrt(Math.pow(inputs.eccentricityX!, 2) + Math.pow(inputs.eccentricityY!, 2)))} mm</p>
                        
                        <p>Minimum Column Dimension = min({inputs.length}, {inputs.width})</p>
                        <p>Minimum Column Dimension = {Math.min(inputs.length!, inputs.width!)} mm</p>
                        
                        <p>Eccentricity Ratio = Total Eccentricity / Minimum Column Dimension</p>
                        <p>Eccentricity Ratio = {formatNumber(Math.sqrt(Math.pow(inputs.eccentricityX!, 2) + Math.pow(inputs.eccentricityY!, 2)))} / {Math.min(inputs.length!, inputs.width!)}</p>
                        <p>Eccentricity Ratio = {formatNumber(Math.sqrt(Math.pow(inputs.eccentricityX!, 2) + Math.pow(inputs.eccentricityY!, 2)) / Math.min(inputs.length!, inputs.width!), 3)}</p>
                        
                        <p>Eccentricity Reduction Factor = max(0.2, 1 - 0.5 × Eccentricity Ratio)</p>
                        <p>Eccentricity Reduction Factor = max(0.2, 1 - 0.5 × {formatNumber(Math.sqrt(Math.pow(inputs.eccentricityX!, 2) + Math.pow(inputs.eccentricityY!, 2)) / Math.min(inputs.length!, inputs.width!), 3)})</p>
                        <p>Eccentricity Reduction Factor = max(0.2, {formatNumber(1 - 0.5 * (Math.sqrt(Math.pow(inputs.eccentricityX!, 2) + Math.pow(inputs.eccentricityY!, 2)) / Math.min(inputs.length!, inputs.width!)), 3)})</p>
                        <p>Eccentricity Reduction Factor = {formatNumber(Math.max(0.2, 1 - 0.5 * (Math.sqrt(Math.pow(inputs.eccentricityX!, 2) + Math.pow(inputs.eccentricityY!, 2)) / Math.min(inputs.length!, inputs.width!))), 3)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 8: Calculate Axial Load Capacity with Eccentricity</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Axial Load Capacity = φ × Eccentricity Reduction Factor × [0.85 × f'c × (Ag - As) + fy × As]</p>
                        <p>= 0.65 × {formatNumber(Math.max(0.2, 1 - 0.5 * (Math.sqrt(Math.pow(inputs.eccentricityX!, 2) + Math.pow(inputs.eccentricityY!, 2)) / Math.min(inputs.length!, inputs.width!))), 3)} × [0.85 × {inputs.fc} × ({formatNumber(results.crossSectionalArea)} - {formatNumber(results.steelArea)}) + {inputs.fy} × {formatNumber(results.steelArea)}]</p>
                        <p>= 0.65 × {formatNumber(Math.max(0.2, 1 - 0.5 * (Math.sqrt(Math.pow(inputs.eccentricityX!, 2) + Math.pow(inputs.eccentricityY!, 2)) / Math.min(inputs.length!, inputs.width!))), 3)} × [{formatNumber(0.85 * inputs.fc * (results.crossSectionalArea - results.steelArea))} + {formatNumber(inputs.fy * results.steelArea)}]</p>
                        <p>= 0.65 × {formatNumber(Math.max(0.2, 1 - 0.5 * (Math.sqrt(Math.pow(inputs.eccentricityX!, 2) + Math.pow(inputs.eccentricityY!, 2)) / Math.min(inputs.length!, inputs.width!))), 3)} × {formatNumber(0.85 * inputs.fc * (results.crossSectionalArea - results.steelArea) + inputs.fy * results.steelArea)} N</p>
                        <p>= {formatNumber(0.65 * Math.max(0.2, 1 - 0.5 * (Math.sqrt(Math.pow(inputs.eccentricityX!, 2) + Math.pow(inputs.eccentricityY!, 2)) / Math.min(inputs.length!, inputs.width!))) * (0.85 * inputs.fc * (results.crossSectionalArea - results.steelArea) + inputs.fy * results.steelArea))} N</p>
                        <p>= {formatNumber(results.axialLoadCapacity * 1000)} N</p>
                        <p>= {formatNumber(results.axialLoadCapacity)} kN</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 9: Verify Design Safety</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Factored Load (P<sub>u</sub>) = {formatNumber(results.factoredLoad)} kN</p>
                        <p>Axial Load Capacity (φP<sub>n</sub>) = {formatNumber(results.axialLoadCapacity)} kN</p>
                        <p>Safety Margin = (φP<sub>n</sub> / P<sub>u</sub> - 1) × 100% = {formatNumber((results.axialLoadCapacity / results.factoredLoad - 1) * 100)}%</p>
                        <p>Is {formatNumber(results.axialLoadCapacity)} kN ≥ {formatNumber(results.factoredLoad)} kN?</p>
                        <p>The design is {results.isSafe ? 'SAFE' : 'NOT SAFE'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
