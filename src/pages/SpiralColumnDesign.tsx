
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
import { formatNumber } from "@/utils/calculations";

export default function SpiralColumnDesign() {
  const { saveProject } = useProjects();
  const [projectName, setProjectName] = useState("Spiral Column Design");
  const [inputs, setInputs] = useState<CalculationInputs>({
    deadLoad: 500,
    liveLoad: 300,
    fc: 21,
    fy: 415,
    barDiameter: 16,
    spiralBarDiameter: 10,
    steelRatio: 0.02, // 2%
    concretecover: 40,
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
    try {
      // Calculate factored load
      const factoredLoad = 1.2 * inputs.deadLoad + 1.6 * inputs.liveLoad;
      
      // Calculate required gross area
      const steelRatio = inputs.steelRatio || 0.02;
      const factor = 0.75 * 0.85 * ((0.85 * inputs.fc * (1 - steelRatio)) + (inputs.fy * steelRatio));
      const requiredGrossArea = (factoredLoad * 1000) / factor;
      
      // Calculate column diameter
      let columnDiameter = Math.sqrt((4 * requiredGrossArea) / Math.PI);
      // Round up to nearest 5mm
      columnDiameter = Math.ceil(columnDiameter / 5) * 5;
      
      // Recalculate actual gross area
      const grossArea = Math.PI * Math.pow(columnDiameter / 2, 2);
      
      // Calculate steel area
      const steelArea = steelRatio * grossArea;
      
      // Calculate area of a bar
      const areaOfBar = Math.PI * Math.pow(inputs.barDiameter / 2, 2);
      
      // Calculate number of bars
      let numberOfBars = Math.ceil(steelArea / areaOfBar);
      // Ensure minimum of 6 bars for circular columns
      numberOfBars = Math.max(6, numberOfBars);
      
      // Recalculate actual steel area and ratio
      const actualSteelArea = numberOfBars * areaOfBar;
      const actualSteelRatio = actualSteelArea / grossArea;
      
      // Calculate core diameter and area
      const coreDiameter = columnDiameter - 2 * inputs.concretecover;
      const coreArea = Math.PI * Math.pow(coreDiameter / 2, 2);
      
      // Calculate minimum spiral ratio
      const minSpiralRatio = 0.45 * ((grossArea / coreArea) - 1) * (inputs.fc / inputs.fy);
      
      // Calculate area of spiral bar
      const spiralBarArea = Math.PI * Math.pow(inputs.spiralBarDiameter / 2, 2);
      
      // Calculate spiral spacing
      const spiralSpacing = (4 * spiralBarArea * (coreDiameter - inputs.spiralBarDiameter)) / 
                           (minSpiralRatio * Math.pow(coreDiameter, 2));
      
      // Calculate clear spacing
      const clearSpacing = spiralSpacing - inputs.spiralBarDiameter;
      
      // Check if clear spacing is within limits
      const isSpacingValid = clearSpacing >= 25 && clearSpacing <= 75;
      
      // Calculate axial load capacity with the actual parameters
      const axialLoadCapacity = 
        0.75 * 0.85 * (0.85 * inputs.fc * (grossArea - actualSteelArea) + inputs.fy * actualSteelArea) / 1000; // Convert to kN
      
      // Check if design is safe
      const isSafe = axialLoadCapacity >= factoredLoad;

      // Beta1 calculation
      const beta1 = inputs.fc < 30 ? 0.85 : Math.max(0.65, 0.85 - (0.05 / 7) * (inputs.fc - 30));
      
      // Calculate minimum and maximum steel ratios
      const rhoMin = 1.4 / inputs.fy;
      const rhoMax = 0.75 * (0.85 * inputs.fc * beta1 * 600) / (inputs.fy * (600 + 228));
      
      // Check if steel ratio is valid
      const isRatioValid = actualSteelRatio >= rhoMin && actualSteelRatio <= rhoMax;
      
      const calculationResults: CalculationResult = {
        factoredLoad,
        crossSectionalArea: grossArea,
        areaOfBar,
        steelArea: actualSteelArea,
        axialLoadCapacity,
        isSafe,
        isRatioValid,
        steelRatio: actualSteelRatio,
        columnDimension: columnDiameter,
        numberOfBars,
        spiralSpacing,
        spiralRatio: minSpiralRatio,
        clearSpacing,
        isSpacingValid,
        requiredGrossArea,
        coreDiameter,
        coreArea,
        minSteelRatio: rhoMin,
        maxSteelRatio: rhoMax,
        beta1,
      };
      
      setResults(calculationResults);
      setIsCalculated(true);
      
      toast.success("Design calculation completed successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error in calculation. Please check your inputs.");
    }
  };

  const handleSave = () => {
    if (!results) return;
    
    saveProject({
      name: projectName,
      type: "spiral-design",
      inputs,
      results,
    });
    
    toast.success("Project saved successfully");
  };

  return (
    <PageContainer title="Spiral Column Design">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Enter a name for your design calculation</CardDescription>
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
            <CardTitle>Design Inputs</CardTitle>
            <CardDescription>Enter loads and material properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="deadLoad">Dead Load (kN)</Label>
                  <Input
                    id="deadLoad"
                    name="deadLoad"
                    type="number"
                    placeholder="500"
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
                    placeholder="300"
                    value={inputs.liveLoad}
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
                Design Column
              </Button>
            </div>
          </CardContent>
        </Card>

        {isCalculated && results && (
          <Card className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Design Results</CardTitle>
                <Button variant="outline" size="sm" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Design
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

              {results.isSpacingValid === false && (
                <div className="mb-4 p-3 rounded-lg border bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30 flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                  <AlertTriangle className="h-5 w-5" />
                  <p className="text-sm">
                    Spiral clear spacing is outside recommended range (25mm - 75mm)
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
                  <h3 className="font-semibold text-sm mb-2">Column Sizing</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Required Gross Area:</span>
                      <span className="font-medium">{formatNumber(results.requiredGrossArea || 0)} mm²</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Actual Gross Area:</span>
                      <span className="font-medium">{formatNumber(results.crossSectionalArea)} mm²</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Column Diameter:</span>
                      <span className="font-medium">{formatNumber(results.columnDimension || 0)} mm</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Core Diameter:</span>
                      <span className="font-medium">{formatNumber(results.coreDiameter || 0)} mm</span>
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
                      <span className="text-muted-foreground">Steel Ratio:</span>
                      <span className={`font-medium ${results.isRatioValid ? '' : 'text-yellow-600 dark:text-yellow-400'}`}>
                        {formatNumber(results.steelRatio! * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Steel Area Required:</span>
                      <span className="font-medium">{formatNumber(results.steelArea)} mm²</span>
                    </div>
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
                      <span className={`font-medium ${!results.isSpacingValid ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
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
                <h3 className="font-semibold mb-3">FINAL DESIGN</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">COLUMN SIZE:</span> {formatNumber(results.columnDimension || 0)} mm diameter</p>
                  <p><span className="font-medium">MAIN BARS:</span> {results.numberOfBars} - {inputs.barDiameter}mm Ø bars</p>
                  <p><span className="font-medium">SPIRAL:</span> {inputs.spiralBarDiameter}mm Ø @ {formatNumber(results.spiralSpacing || 0)} mm pitch</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
