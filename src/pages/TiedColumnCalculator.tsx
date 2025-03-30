import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CalculationInputs, CalculationResult, useProjects } from "@/context/ProjectContext";
import { Check, Save, AlertTriangle, Calculator, Info, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { calculateTiedColumn, formatNumber } from "@/utils/calculations";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function TiedColumnCalculator() {
  const { saveProject } = useProjects();
  const [projectName, setProjectName] = useState("Tied Column Design");
  const [inputs, setInputs] = useState<CalculationInputs>({
    deadLoad: 100,
    liveLoad: 50,
    fc: 21,
    fy: 415,
    barDiameter: 16,
    tieDiameter: 10,
    columnHeight: 3,
    numberOfBars: 8,
    steelRatio: 0.02, // 2%
    concretecover: 40,
  });
  
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
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
      const calculationResults = calculateTiedColumn(inputs);
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
      type: "tied",
      inputs,
      results,
    });
    
    toast.success("Project saved successfully");
  };

  return (
    <PageContainer title="Tied Column Calculator">
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Column Properties</CardTitle>
              <CardDescription>Enter column dimensions and material properties</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowFormula(!showFormula)}
              className="ml-2"
            >
              <Info className="h-4 w-4" />
              <span className="sr-only">Show formula information</span>
            </Button>
          </CardHeader>
          {showFormula && (
            <div className="px-6 pb-2">
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-medium mb-2">Axial Load Capacity Formula</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  This pertains to the design and analysis of a square tied column. The formula to calculate the axial load capacity (P<sub>u</sub>) is:
                </p>
                <div className="bg-white dark:bg-gray-800 p-3 rounded border text-center mb-2">
                  <p>P<sub>u</sub> = 0.65 × 0.80 [0.85 f'<sub>c</sub> (A<sub>g</sub> - ρA<sub>g</sub>) + f<sub>y</sub> (ρA<sub>g</sub>)]</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  where:<br />
                  - P<sub>u</sub> = Ultimate axial load capacity<br />
                  - f'<sub>c</sub> = Compressive strength of concrete<br />
                  - A<sub>g</sub> = Gross cross-sectional area of the column<br />
                  - f<sub>y</sub> = Yield strength of the steel reinforcement<br />
                  - ρ = Steel reinforcement ratio (in decimal)
                </p>
              </div>
            </div>
          )}
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
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
                  <Label htmlFor="steelRatio">Steel Ratio (decimal)</Label>
                  <Input
                    id="steelRatio"
                    name="steelRatio"
                    type="number"
                    placeholder="0.02"
                    value={inputs.steelRatio}
                    onChange={handleInputChange}
                    step="0.001"
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
                      <span className="text-muted-foreground">Column Side Length:</span>
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
                  <h3 className="font-semibold text-sm mb-2">Tie Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Tie Spacing:</span>
                      <span className="font-medium">{formatNumber(results.tieSpacing || 0)} mm</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Tie Diameter:</span>
                      <span className="font-medium">{inputs.tieDiameter} mm</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">β1 Value:</span>
                      <span className="font-medium">{formatNumber(results.beta1 || 0.85, 2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Final Design</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Column Size:</span> {formatNumber(results.columnDimension || 0)} mm × {formatNumber(results.columnDimension || 0)} mm</p>
                  <p><span className="font-medium">Main Bars:</span> {results.numberOfBars} - {inputs.barDiameter}mm Ø bars</p>
                  <p><span className="font-medium">Lateral Tie:</span> {inputs.tieDiameter}mm Ø @ {formatNumber(results.tieSpacing || 0)} mm spacing</p>
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
                      <h4 className="font-medium text-sm text-primary mb-2">Step 2: Calculate Required Gross Area</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Axial capacity (ϕP<sub>n</sub>) = 0.65 × 0.80 × [(0.85 × f'<sub>c</sub> × (A<sub>g</sub> - ρA<sub>g</sub>)) + (f<sub>y</sub> × ρA<sub>g</sub>)]</p>
                        <p>= 0.65 × 0.80 × [(0.85 × {inputs.fc} × (A<sub>g</sub> - {inputs.steelRatio} × A<sub>g</sub>)) + ({inputs.fy} × {inputs.steelRatio} × A<sub>g</sub>)]</p>
                        <p>= 0.65 × 0.80 × [(0.85 × {inputs.fc} × A<sub>g</sub> × (1 - {inputs.steelRatio})) + ({inputs.fy} × {inputs.steelRatio} × A<sub>g</sub>)]</p>
                        <p>= 0.65 × 0.80 × A<sub>g</sub> × [(0.85 × {inputs.fc} × (1 - {inputs.steelRatio})) + ({inputs.fy} × {inputs.steelRatio})]</p>
                        <p>For P<sub>u</sub> = {formatNumber(results.factoredLoad)} kN, solve for A<sub>g</sub></p>
                        <p>A<sub>g</sub> = {formatNumber(results.factoredLoad)} × 1000 ÷ [0.65 × 0.80 × ((0.85 × {inputs.fc} × (1 - {inputs.steelRatio})) + ({inputs.fy} × {inputs.steelRatio}))]</p>
                        <p>A<sub>g</sub> = {formatNumber(results.crossSectionalArea)} mm²</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 3: Determine Column Dimensions</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>For a square column, side length = √A<sub>g</sub></p>
                        <p>Side length = √{formatNumber(results.crossSectionalArea)}</p>
                        <p>Side length = {formatNumber(Math.sqrt(results.crossSectionalArea))} mm</p>
                        <p>Rounded to nearest 5 mm = {formatNumber(results.columnDimension || 0)} mm</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 4: Calculate Steel Area</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Steel Area = ρ × A<sub>g</sub></p>
                        <p>Steel Area = {inputs.steelRatio} × {formatNumber(results.crossSectionalArea)}</p>
                        <p>Steel Area = {formatNumber(results.steelArea)} mm²</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 5: Calculate Number of Bars</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Area of one {inputs.barDiameter}mm bar = π × ({inputs.barDiameter}/2)²</p>
                        <p>Area of one bar = {formatNumber(results.areaOfBar)} mm²</p>
                        <p>Number of bars = Steel Area ÷ Area of one bar</p>
                        <p>Number of bars = {formatNumber(results.steelArea)} ÷ {formatNumber(results.areaOfBar)}</p>
                        <p>Number of bars = {formatNumber(results.steelArea / results.areaOfBar)}</p>
                        <p>Rounded to {results.numberOfBars} bars</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 6: Calculate Tie Spacing</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Tie spacing is the smallest of:</p>
                        <p>16 × longitudinal bar diameter = 16 × {inputs.barDiameter} = {16 * inputs.barDiameter} mm</p>
                        <p>48 × tie diameter = 48 × {inputs.tieDiameter} = {48 * inputs.tieDiameter} mm</p>
                        <p>Least column dimension = {formatNumber(results.columnDimension || 0)} mm</p>
                        <p>Therefore, tie spacing = {formatNumber(results.tieSpacing || 0)} mm</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 7: Check Steel Ratio Requirements</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Minimum steel ratio = 1.4 ÷ f<sub>y</sub> = 1.4 ÷ {inputs.fy} = {formatNumber(results.minSteelRatio || 0, 4)}</p>
                        <p>Maximum steel ratio = 0.75 × [(0.85 × f'<sub>c</sub> × β<sub>1</sub> × 600) ÷ (f<sub>y</sub> × (600 + 228))]</p>
                        <p>β<sub>1</sub> = {results.beta1?.toFixed(2) || 0.85} (for f'<sub>c</sub> = {inputs.fc} MPa)</p>
                        <p>Maximum steel ratio = {formatNumber(results.maxSteelRatio || 0, 4)}</p>
                        <p>Actual steel ratio = {formatNumber(results.steelRatio || 0, 4)}</p>
                        <p>
                          Steel ratio is {results.isRatioValid ? 'within' : 'outside'} the acceptable range of {formatNumber(results.minSteelRatio! * 100, 2)}% - {formatNumber(results.maxSteelRatio! * 100, 2)}%
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 8: Calculate Axial Load Capacity</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Axial capacity (ϕP<sub>n</sub>) = 0.65 × 0.80 × [(0.85 × f'<sub>c</sub> × (A<sub>g</sub> - A<sub>st</sub>)) + (f<sub>y</sub> × A<sub>st</sub>)]</p>
                        <p>= 0.65 × 0.80 × [(0.85 × {inputs.fc} × ({formatNumber(results.crossSectionalArea)} - {formatNumber(results.steelArea)})) + ({inputs.fy} × {formatNumber(results.steelArea)})]</p>
                        <p>= 0.65 × 0.80 × [(0.85 × {inputs.fc} × {formatNumber(results.crossSectionalArea - results.steelArea)}) + ({inputs.fy} × {formatNumber(results.steelArea)})]</p>
                        <p>= 0.65 × 0.80 × [{formatNumber(0.85 * inputs.fc * (results.crossSectionalArea - results.steelArea))} + {formatNumber(inputs.fy * results.steelArea)}]</p>
                        <p>= 0.65 × 0.80 × {formatNumber(0.85 * inputs.fc * (results.crossSectionalArea - results.steelArea) + inputs.fy * results.steelArea)}</p>
                        <p>= {formatNumber(0.65 * 0.80 * (0.85 * inputs.fc * (results.crossSectionalArea - results.steelArea) + inputs.fy * results.steelArea))} N</p>
                        <p>= {formatNumber(results.axialLoadCapacity)} kN</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 9: Check Design Adequacy</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Factored Load (P<sub>u</sub>) = {formatNumber(results.factoredLoad)} kN</p>
                        <p>Axial Load Capacity (ϕP<sub>n</sub>) = {formatNumber(results.axialLoadCapacity)} kN</p>
                        <p>Safety Margin = (ϕP<sub>n</sub> / P<sub>u</sub> - 1) × 100% = {formatNumber((results.axialLoadCapacity / results.factoredLoad - 1) * 100)}%</p>
                        <p>Design is {results.isSafe ? 'SAFE' : 'NOT SAFE'}</p>
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
