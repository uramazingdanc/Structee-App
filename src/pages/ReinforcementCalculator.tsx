
// This is a new file I'm creating to add a step-by-step solution to the Reinforcement Calculator
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
import { calculateReinforcement, formatNumber } from "@/utils/calculations";

export default function ReinforcementCalculator() {
  const { saveProject } = useProjects();
  const [projectName, setProjectName] = useState("Reinforcement Design");
  const [inputs, setInputs] = useState<CalculationInputs>({
    axialLoad: 1000,
    length: 300,
    width: 300,
    fc: 21,
    fy: 415,
    minSteelRatio: 0.01,
    maxSteelRatio: 0.08,
    tieDiameter: 10,
    concretecover: 40,
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
      const calculationResults = calculateReinforcement(inputs);
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
      type: "reinforcement",
      inputs,
      results,
    });
    
    toast.success("Project saved successfully");
  };

  return (
    <PageContainer title="Reinforcement Calculator">
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
            <CardDescription>Enter column dimensions, loads, and material properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="axialLoad">Axial Load (kN)</Label>
                  <Input
                    id="axialLoad"
                    name="axialLoad"
                    type="number"
                    placeholder="1000"
                    value={inputs.axialLoad}
                    onChange={handleInputChange}
                  />
                </div>

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
              </div>

              <div className="space-y-4">
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
                  <Label htmlFor="minSteelRatio">Min Steel Ratio (decimal)</Label>
                  <Input
                    id="minSteelRatio"
                    name="minSteelRatio"
                    type="number"
                    placeholder="0.01"
                    value={inputs.minSteelRatio}
                    onChange={handleInputChange}
                    step="0.001"
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="maxSteelRatio">Max Steel Ratio (decimal)</Label>
                  <Input
                    id="maxSteelRatio"
                    name="maxSteelRatio"
                    type="number"
                    placeholder="0.08"
                    value={inputs.maxSteelRatio}
                    onChange={handleInputChange}
                    step="0.001"
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
            </div>

            <div className="mt-6">
              <Button 
                onClick={handleCalculate} 
                className="w-full sm:w-auto"
              >
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Reinforcement
              </Button>
            </div>
          </CardContent>
        </Card>

        {isCalculated && results && (
          <Card className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Reinforcement Results</CardTitle>
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
                        Axial load capacity exceeds design load
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
                        Design load exceeds axial load capacity
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {!results.isRatioValid && (
                <div className="mb-4 p-3 rounded-lg border bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30 flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="text-sm">
                    Steel reinforcement ratio is outside recommended range ({formatNumber(inputs.minSteelRatio * 100)}% - {formatNumber(inputs.maxSteelRatio * 100)}%)
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Column Properties</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Axial Load:</span>
                      <span className="font-medium">{formatNumber(inputs.axialLoad)} kN</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Cross-Sectional Area:</span>
                      <span className="font-medium">{formatNumber(results.crossSectionalArea)} mm²</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Axial Load Capacity:</span>
                      <span className="font-medium">{formatNumber(results.axialLoadCapacity)} kN</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Safety Margin:</span>
                      <span className={`font-medium ${results.isSafe ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatNumber((results.axialLoadCapacity / inputs.axialLoad - 1) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Steel Requirements</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Required Steel Area:</span>
                      <span className="font-medium">{formatNumber(results.requiredSteelArea || 0)} mm²</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Steel Area Provided:</span>
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
                      <span className="text-muted-foreground">Recommended Bar Size:</span>
                      <span className="font-medium">{results.recommendedBarSize} mm</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Number of Bars:</span>
                      <span className="font-medium">{results.numberOfBars}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Area per Bar:</span>
                      <span className="font-medium">{formatNumber(results.areaOfBar)} mm²</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Bar Arrangement:</span>
                      <span className="font-medium">{results.barArrangement}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-sm mb-2">Tie Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Max Tie Spacing:</span>
                      <span className="font-medium">{formatNumber(results.maxTieSpacing || 0)} mm</span>
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
                      <h4 className="font-medium text-sm text-primary mb-2">Step 1: Calculate Cross-Sectional Area</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Cross-Sectional Area = Length × Width</p>
                        <p>Cross-Sectional Area = {inputs.length} × {inputs.width}</p>
                        <p>Cross-Sectional Area = {formatNumber(results.crossSectionalArea)} mm²</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 2: Required Steel Area Based on Axial Load</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Equation: P<sub>u</sub> = φ × [0.85 × f'c × (Ag - Ast) + fy × Ast]</p>
                        <p>Rearranging for Ast:</p>
                        <p>Ast = (P<sub>u</sub>/φ - 0.85 × f'c × Ag) / (fy - 0.85 × f'c)</p>
                        <p>Ast = ({inputs.axialLoad} × 1000 / 0.65 - 0.85 × {inputs.fc} × {formatNumber(results.crossSectionalArea)}) / ({inputs.fy} - 0.85 × {inputs.fc})</p>
                        <p>Ast = ({formatNumber(inputs.axialLoad * 1000 / 0.65)} - {formatNumber(0.85 * inputs.fc * results.crossSectionalArea)}) / ({inputs.fy} - {0.85 * inputs.fc})</p>
                        <p>Ast = {formatNumber(inputs.axialLoad * 1000 / 0.65 - 0.85 * inputs.fc * results.crossSectionalArea)} / {formatNumber(inputs.fy - 0.85 * inputs.fc)}</p>
                        <p>Initial Ast = {formatNumber((inputs.axialLoad * 1000 / 0.65 - 0.85 * inputs.fc * results.crossSectionalArea) / (inputs.fy - 0.85 * inputs.fc))} mm²</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 3: Check Minimum Steel Ratio</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Minimum Steel Area = Ag × minimum steel ratio</p>
                        <p>Minimum Steel Area = {formatNumber(results.crossSectionalArea)} × {inputs.minSteelRatio}</p>
                        <p>Minimum Steel Area = {formatNumber(results.crossSectionalArea * inputs.minSteelRatio)} mm²</p>
                        <p>Required Steel Area = max(Initial Ast, Minimum Steel Area)</p>
                        <p>Required Steel Area = max({formatNumber((inputs.axialLoad * 1000 / 0.65 - 0.85 * inputs.fc * results.crossSectionalArea) / (inputs.fy - 0.85 * inputs.fc))}, {formatNumber(results.crossSectionalArea * inputs.minSteelRatio)})</p>
                        <p>Required Steel Area = {formatNumber(results.requiredSteelArea || 0)} mm²</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 4: Ensure Maximum Steel Ratio</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Maximum Steel Area = Ag × maximum steel ratio</p>
                        <p>Maximum Steel Area = {formatNumber(results.crossSectionalArea)} × {inputs.maxSteelRatio}</p>
                        <p>Maximum Steel Area = {formatNumber(results.crossSectionalArea * inputs.maxSteelRatio)} mm²</p>
                        <p>Capped Steel Area = min(Required Steel Area, Maximum Steel Area)</p>
                        <p>Capped Steel Area = min({formatNumber(results.requiredSteelArea || 0)}, {formatNumber(results.crossSectionalArea * inputs.maxSteelRatio)})</p>
                        <p>Capped Steel Area = {formatNumber(Math.min(results.requiredSteelArea || 0, results.crossSectionalArea * inputs.maxSteelRatio))} mm²</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 5: Determine Bar Size and Count</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Selected Bar Size = {results.recommendedBarSize} mm</p>
                        <p>Area of One Bar = π × (Bar Diameter / 2)²</p>
                        <p>Area of One Bar = π × ({results.recommendedBarSize} / 2)²</p>
                        <p>Area of One Bar = {formatNumber(results.areaOfBar)} mm²</p>
                        <p>Number of Bars Needed = Capped Steel Area / Area of One Bar</p>
                        <p>Number of Bars Needed = {formatNumber(Math.min(results.requiredSteelArea || 0, results.crossSectionalArea * inputs.maxSteelRatio))} / {formatNumber(results.areaOfBar)}</p>
                        <p>Number of Bars Needed = {formatNumber(Math.min(results.requiredSteelArea || 0, results.crossSectionalArea * inputs.maxSteelRatio) / results.areaOfBar, 2)}</p>
                        <p>Rounded to {results.numberOfBars} bars (minimum 4, even number)</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 6: Calculate Actual Steel Area</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Actual Steel Area = Number of Bars × Area of One Bar</p>
                        <p>Actual Steel Area = {results.numberOfBars} × {formatNumber(results.areaOfBar)}</p>
                        <p>Actual Steel Area = {formatNumber(results.steelArea)} mm²</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 7: Calculate Steel Ratio</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Steel Ratio = Actual Steel Area / Cross-Sectional Area</p>
                        <p>Steel Ratio = {formatNumber(results.steelArea)} / {formatNumber(results.crossSectionalArea)}</p>
                        <p>Steel Ratio = {formatNumber(results.steelRatio || 0, 4)}</p>
                        <p>Steel Ratio = {formatNumber((results.steelRatio || 0) * 100, 2)}%</p>
                        <p>Is {formatNumber(inputs.minSteelRatio * 100)}% ≤ {formatNumber((results.steelRatio || 0) * 100, 2)}% ≤ {formatNumber(inputs.maxSteelRatio * 100)}%?</p>
                        <p>The steel ratio is {results.isRatioValid ? 'VALID' : 'INVALID'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 8: Calculate Tie Spacing</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Maximum tie spacing is the smallest of:</p>
                        <p>16 × longitudinal bar diameter = 16 × {results.recommendedBarSize} = {16 * results.recommendedBarSize} mm</p>
                        <p>48 × tie diameter = 48 × {inputs.tieDiameter} = {48 * inputs.tieDiameter} mm</p>
                        <p>Least column dimension = min({inputs.length}, {inputs.width}) = {Math.min(inputs.length || 0, inputs.width || 0)} mm</p>
                        <p>Therefore, tie spacing = {formatNumber(results.maxTieSpacing || 0)} mm</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 9: Calculate Axial Load Capacity</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Axial Load Capacity = φ × [0.85 × f'c × (Ag - As) + fy × As]</p>
                        <p>= 0.65 × [0.85 × {inputs.fc} × ({formatNumber(results.crossSectionalArea)} - {formatNumber(results.steelArea)}) + {inputs.fy} × {formatNumber(results.steelArea)}]</p>
                        <p>= 0.65 × [0.85 × {inputs.fc} × {formatNumber(results.crossSectionalArea - results.steelArea)} + {inputs.fy} × {formatNumber(results.steelArea)}]</p>
                        <p>= 0.65 × [{formatNumber(0.85 * inputs.fc * (results.crossSectionalArea - results.steelArea))} + {formatNumber(inputs.fy * results.steelArea)}]</p>
                        <p>= 0.65 × {formatNumber(0.85 * inputs.fc * (results.crossSectionalArea - results.steelArea) + inputs.fy * results.steelArea)} N</p>
                        <p>= {formatNumber(results.axialLoadCapacity * 1000)} N</p>
                        <p>= {formatNumber(results.axialLoadCapacity)} kN</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 10: Verify Design Safety</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Axial Load (P<sub>u</sub>) = {formatNumber(inputs.axialLoad)} kN</p>
                        <p>Axial Load Capacity (φP<sub>n</sub>) = {formatNumber(results.axialLoadCapacity)} kN</p>
                        <p>Safety Margin = (φP<sub>n</sub> / P<sub>u</sub> - 1) × 100% = {formatNumber((results.axialLoadCapacity / inputs.axialLoad - 1) * 100)}%</p>
                        <p>Is {formatNumber(results.axialLoadCapacity)} kN ≥ {formatNumber(inputs.axialLoad)} kN?</p>
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
