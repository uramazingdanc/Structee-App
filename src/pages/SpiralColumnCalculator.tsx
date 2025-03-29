
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CalculationInputs, CalculationResult, useProjects } from "@/context/ProjectContext";
import { Check, Save, AlertTriangle, Calculator } from "lucide-react";
import { toast } from "sonner";
import { calculateSpiralColumn, formatNumber } from "@/utils/calculations";

export default function SpiralColumnCalculator() {
  const { saveProject } = useProjects();
  const [projectName, setProjectName] = useState("Spiral Column Analysis");
  const [inputs, setInputs] = useState<CalculationInputs>({
    deadLoad: 100,
    liveLoad: 50,
    columnDiameter: 300,
    fc: 21,
    fy: 415,
    barDiameter: 16,
    spiralBarDiameter: 10,
    columnHeight: 3,
    numberOfBars: 8,
    tieDiameter: 10,
    steelRatio: 0.02, // 2%
    concretecover: 40,
  });
  
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
    setIsCalculated(false);
  };

  const handleCalculate = () => {
    if (inputs.columnDiameter <= 0) {
      toast.error("Column diameter must be greater than 0");
      return;
    }

    try {
      const calculationResults = calculateSpiralColumn(inputs);
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
      type: "spiral",
      inputs,
      results,
    });
    
    toast.success("Project saved successfully");
  };

  return (
    <PageContainer title="Spiral Column Analysis">
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Analysis of Spiral Column</CardTitle>
                <CardDescription>Review the formulas and computation process</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAnalysis(!showAnalysis)}
              >
                {showAnalysis ? "Hide Analysis" : "Show Analysis"}
              </Button>
            </div>
          </CardHeader>
          {showAnalysis && (
            <CardContent className="text-sm">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Parameters Required:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Dead Load</li>
                    <li>Live Load</li>
                    <li>Concrete compressive strength (f'c)</li>
                    <li>Yield strength of steel (fy)</li>
                    <li>Bar Diameter</li>
                    <li>Spiral Bar Diameter</li>
                    <li>Column Height</li>
                    <li>Column Diameter</li>
                    <li>Number of Longitudinal Bars</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Formulas and Computations:</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">1. Cross-Sectional Area of Column:</p>
                      <p className="bg-muted p-2 rounded">Ag = π × (Column Diameter)² / 4</p>
                    </div>

                    <div>
                      <p className="font-medium">2. Area of One Bar:</p>
                      <p className="bg-muted p-2 rounded">Ab = π × (Bar Diameter)² / 4</p>
                    </div>

                    <div>
                      <p className="font-medium">3. Total Steel Area:</p>
                      <p className="bg-muted p-2 rounded">Ast = Number of Bars × Ab</p>
                    </div>

                    <div>
                      <p className="font-medium">4. Steel Reinforcement Ratio:</p>
                      <p className="bg-muted p-2 rounded">ρ = Ast / Ag</p>
                    </div>

                    <div>
                      <p className="font-medium">5. Minimum and Maximum Reinforcement Ratios:</p>
                      <p className="bg-muted p-2 rounded">ρmin = 1.4 / fy</p>
                      <p className="bg-muted p-2 rounded">ρmax = (0.75 × 0.85 × f'c × β1 × 600) / (fy × (600 + 228))</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Condition for Beta1 (β₁):</h3>
                  <ul className="space-y-1">
                    <li>If f'c ≤ 30 MPa → β₁ = 0.85</li>
                    <li>If f'c &gt; 30 MPa → β₁ = 0.85 - (0.05/7)(f'c - 30)</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Reinforcement Ratio Validation:</h3>
                  <ul className="space-y-1">
                    <li>If ρmin &lt; ρ &lt; ρmax → OK</li>
                    <li>If ρ &lt; ρmin or ρ &gt; ρmax → NOT OK</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Axial Load Capacity Calculation:</h3>
                  <p className="bg-muted p-2 rounded mb-2">
                    Pu(design) = 0.75 × 0.85 × [(0.85 × f'c × (Ag - Ast)) + (fy × Ast)]
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Safety Condition:</h3>
                  <ul className="space-y-1">
                    <li>If Pu(design) ≥ Pu (applied) → Safe</li>
                    <li>If Pu(design) &lt; Pu (applied) → Not Safe</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          )}
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
                  <Label htmlFor="columnDiameter">Column Diameter (mm)</Label>
                  <Input
                    id="columnDiameter"
                    name="columnDiameter"
                    type="number"
                    placeholder="300"
                    value={inputs.columnDiameter}
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

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="concretecover">Concrete Cover (mm)</Label>
                  <Input
                    id="concretecover"
                    name="concretecover"
                    type="number"
                    placeholder="40"
                    value={inputs.concretecover}
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
                  <Label htmlFor="spiralBarDiameter">Spiral Bar Diameter (mm)</Label>
                  <Input
                    id="spiralBarDiameter"
                    name="spiralBarDiameter"
                    type="number"
                    placeholder="10"
                    value={inputs.spiralBarDiameter}
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
                    Steel reinforcement ratio is outside recommended range ({formatNumber(results.minSteelRatio! * 100)}% - {formatNumber(results.maxSteelRatio! * 100)}%)
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
                      <span className="text-muted-foreground">Column Diameter:</span>
                      <span className="font-medium">{formatNumber(results.columnDimension || 0)} mm</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Steel Ratio:</span>
                      <span className={`font-medium ${results.isRatioValid ? '' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        {formatNumber(results.steelRatio! * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Steel Area:</span>
                      <span className="font-medium">{formatNumber(results.steelArea)} mm²</span>
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
                      <span className="font-medium">{results.numberOfBars}</span>
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
                  <h3 className="font-semibold text-sm mb-2">Spiral Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Beta1 (β₁) Value:</span>
                      <span className="font-medium">{formatNumber(results.beta1 || 0.85, 2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Spiral Ratio:</span>
                      <span className="font-medium">{formatNumber(results.spiralRatio! * 100, 3)}%</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Spiral Spacing:</span>
                      <span className="font-medium">{formatNumber(results.spiralSpacing || 0)} mm</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Clear Spacing:</span>
                      <span className={`font-medium ${(results.clearSpacing || 0) < 25 || (results.clearSpacing || 0) > 75 ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
                        {formatNumber(results.clearSpacing || 0)} mm
                        {(results.clearSpacing || 0) < 25 && " (< 25mm min)"}
                        {(results.clearSpacing || 0) > 75 && " (> 75mm max)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Final Design</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Column Size:</span> {formatNumber(results.columnDimension || 0)} mm diameter</p>
                  <p><span className="font-medium">Main Bars:</span> {results.numberOfBars} - {inputs.barDiameter}mm Ø bars</p>
                  <p><span className="font-medium">Spiral:</span> {inputs.spiralBarDiameter}mm Ø @ {formatNumber(results.spiralSpacing || 0)} mm pitch</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
