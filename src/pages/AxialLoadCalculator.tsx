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
import { formatNumber } from "@/utils/calculations";

export default function AxialLoadCalculator() {
  const { saveProject } = useProjects();
  const [projectName, setProjectName] = useState("Axial Load Analysis");
  const [inputs, setInputs] = useState<CalculationInputs>({
    deadLoad: 200,
    liveLoad: 100,
    fc: 28,
    fy: 420,
    steelRatio: 0.02,
    columnWidth: 400,
    columnHeight: 400,
    barDiameter: 25,
    numberOfBars: 8,
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
    if (inputs.columnWidth <= 0 || inputs.columnHeight <= 0) {
      toast.error("Column dimensions must be greater than 0");
      return;
    }

    try {
      // 1. Factored Axial Load (Pu)
      const factoredLoad = 1.2 * inputs.deadLoad + 1.6 * inputs.liveLoad;

      // 2. Gross Area of the Column (Ag)
      const grossArea = inputs.columnWidth * inputs.columnHeight;

      // 3. Area of Steel Reinforcement (Ast)
      const steelArea = inputs.steelRatio * grossArea;

      // 4. Concrete Area (Ac)
      const concreteArea = grossArea - steelArea;

      // 5. Axial Load Capacity (Pn)
      const axialLoadCapacity = 0.80 * (0.85 * inputs.fc * concreteArea + inputs.fy * steelArea) / 1000;

      // 6. Check if the column is adequate (Pu <= Pn)
      const isSafe = factoredLoad <= axialLoadCapacity;

      // 7. Calculate Beta1 (β₁) Value
      const beta1 = inputs.fc <= 30 ? 0.85 : Math.max(0.65, 0.85 - (0.05 / 7) * (inputs.fc - 30));

      // 8. Calculate minimum and maximum steel ratios
      const rhoMin = 0.01; // Minimum steel ratio for columns
      const rhoMax = 0.08; // Maximum steel ratio for columns

      // 9. Check if steel ratio is valid
      const isRatioValid = inputs.steelRatio >= rhoMin && inputs.steelRatio <= rhoMax;

      // 10. Calculate area of one reinforcing bar
      const areaOfBar = Math.PI * Math.pow(inputs.barDiameter / 2, 2);

      const calculationResults: CalculationResult = {
        factoredLoad,
        grossArea,
        steelArea,
        axialLoadCapacity,
        isSafe,
        beta1,
        minSteelRatio: rhoMin,
        maxSteelRatio: rhoMax,
        isRatioValid,
        areaOfBar,
        numberOfBars: inputs.numberOfBars,
        columnWidth: inputs.columnWidth,
        columnHeight: inputs.columnHeight,
      };

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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Analysis of Axial Load</CardTitle>
                <CardDescription>Review the formulas and computation process</CardDescription>
              </div>
            </div>
          </CardHeader>
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
                  <Label htmlFor="columnWidth">Column Width (mm)</Label>
                  <Input
                    id="columnWidth"
                    name="columnWidth"
                    type="number"
                    placeholder="400"
                    value={inputs.columnWidth}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="columnHeight">Column Height (mm)</Label>
                  <Input
                    id="columnHeight"
                    name="columnHeight"
                    type="number"
                    placeholder="400"
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
                    placeholder="28"
                    value={inputs.fc}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="barDiameter">Bar Diameter (mm)</Label>
                  <Input
                    id="barDiameter"
                    name="barDiameter"
                    type="number"
                    placeholder="25"
                    value={inputs.barDiameter}
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
                    placeholder="200"
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
                    placeholder="100"
                    value={inputs.liveLoad}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="fy">fy (MPa)</Label>
                  <Input
                    id="fy"
                    name="fy"
                    type="number"
                    placeholder="420"
                    value={inputs.fy}
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
                      <span className="text-muted-foreground">Gross Area:</span>
                      <span className="font-medium">{formatNumber(results.grossArea)} mm²</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Steel Ratio:</span>
                      <span className={`font-medium ${results.isRatioValid ? '' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        {formatNumber(inputs.steelRatio * 100)}%
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
                  <h3 className="font-semibold text-sm mb-2">Material Properties</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Beta1 (β₁) Value:</span>
                      <span className="font-medium">{formatNumber(results.beta1 || 0.85, 2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Concrete Strength (f'c):</span>
                      <span className="font-medium">{inputs.fc} MPa</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Steel Yield Strength (fy):</span>
                      <span className="font-medium">{inputs.fy} MPa</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Final Design</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Column Size:</span> {inputs.columnWidth}mm x {inputs.columnHeight}mm</p>
                  <p><span className="font-medium">Main Bars:</span> {results.numberOfBars} - {inputs.barDiameter}mm Ø bars</p>
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
                      <h4 className="font-medium text-sm text-primary mb-2">Step 1: Calculate Factored Axial Load (Pu)</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>P<sub>u</sub> = 1.2 × D + 1.6 × L</p>
                        <p>P<sub>u</sub> = 1.2 × {inputs.deadLoad} + 1.6 × {inputs.liveLoad}</p>
                        <p>P<sub>u</sub> = {1.2 * inputs.deadLoad} + {1.6 * inputs.liveLoad}</p>
                        <p>P<sub>u</sub> = {formatNumber(results.factoredLoad)} kN</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 2: Calculate Gross Area of the Column (Ag)</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>A<sub>g</sub> = Column Width × Column Height</p>
                        <p>A<sub>g</sub> = {inputs.columnWidth} mm × {inputs.columnHeight} mm</p>
                        <p>A<sub>g</sub> = {formatNumber(results.grossArea)} mm²</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 3: Calculate Beta1 (β₁) Value</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        {inputs.fc <= 30 ? (
                          <>
                            <p>For f'c ≤ 30 MPa, β₁ = 0.85</p>
                            <p>Since f'c = {inputs.fc} MPa ≤ 30 MPa</p>
                            <p>β₁ = 0.85</p>
                          </>
                        ) : (
                          <>
                            <p>For f'c {`>`} 30 MPa, β₁ = 0.85 - (0.05/7)(f'c - 30)</p>
                            <p>β₁ = 0.85 - (0.05/7)({inputs.fc} - 30)</p>
                            <p>β₁ = 0.85 - (0.05/7)({inputs.fc - 30})</p>
                            <p>β₁ = 0.85 - {(0.05/7) * (inputs.fc - 30)}</p>
                            <p>β₁ = {formatNumber(results.beta1 || 0.85, 3)}</p>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 4: Calculate Area of Steel Reinforcement (Ast)</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>A<sub>st</sub> = Steel Ratio × Gross Area</p>
                        <p>A<sub>st</sub> = {inputs.steelRatio} × {formatNumber(results.grossArea)} mm²</p>
                        <p>A<sub>st</sub> = {formatNumber(results.steelArea)} mm²</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 5: Calculate Concrete Area (Ac)</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>A<sub>c</sub> = Gross Area - Steel Area</p>
                        <p>A<sub>c</sub> = {formatNumber(results.grossArea)} mm² - {formatNumber(results.steelArea)} mm²</p>
                        <p>A<sub>c</sub> = {formatNumber(results.grossArea - results.steelArea)} mm²</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 6: Calculate Axial Load Capacity (Pn)</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>P<sub>n</sub> = 0.80 × [0.85 × f'c × Ac + fy × Ast]</p>
                        <p>P<sub>n</sub> = 0.80 × [0.85 × {inputs.fc} MPa × {formatNumber(results.grossArea - results.steelArea)} mm² + {inputs.fy} MPa × {formatNumber(results.steelArea)} mm²]</p>
                        <p>P<sub>n</sub> = {formatNumber(results.axialLoadCapacity)} kN</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-primary mb-2">Step 7: Check if the Column is Adequate</h4>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border text-sm">
                        <p>Factored Axial Load (Pu) = {formatNumber(results.factoredLoad)} kN</p>
                        <p>Axial Load Capacity (Pn) = {formatNumber(results.axialLoadCapacity)} kN</p>
                        <p>Is P<sub>u</sub> ≤ P<sub>n</sub>?</p>
                        <p>The column is {results.isSafe ? 'SAFE' : 'NOT SAFE'}</p>
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
