
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/Card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useProjects } from "@/context/ProjectContext";
import { formatNumber } from "@/utils/calculations";
import { useCallback, useState } from "react";

// Define the form schema for reinforcement calculator
const formSchema = z.object({
  axialLoad: z.coerce.number().min(0, "Load must be positive"),
  length: z.coerce.number().min(100, "Length must be at least 100mm"),
  width: z.coerce.number().min(100, "Width must be at least 100mm"),
  fc: z.coerce.number().min(17, "f'c must be at least 17 MPa"),
  fy: z.coerce.number().min(275, "fy must be at least 275 MPa"),
  minSteelRatio: z.coerce.number().min(0.01, "Min steel ratio must be at least 0.01").max(0.08, "Max steel ratio must not exceed 0.08"),
  maxSteelRatio: z.coerce.number().min(0.01, "Min steel ratio must be at least 0.01").max(0.08, "Max steel ratio must not exceed 0.08"),
  concretecover: z.coerce.number().min(25, "Concrete cover must be at least 25mm"),
  tieDiameter: z.coerce.number().min(6, "Tie diameter must be at least 6mm")
});

type ReinforcementInputs = z.infer<typeof formSchema>;

type ReinforcementResults = {
  requiredSteelArea: number;
  recommendedBarSize: number;
  recommendedBarCount: number;
  isSafe: boolean;
};

export default function ReinforcementCalculator() {
  const { toast } = useToast();
  const { addProject } = useProjects();
  const [results, setResults] = useState<ReinforcementResults | null>(null);

  const form = useForm<ReinforcementInputs>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      axialLoad: 1000,
      length: 300,
      width: 300,
      fc: 21,
      fy: 415,
      minSteelRatio: 0.01,
      maxSteelRatio: 0.04,
      concretecover: 40,
      tieDiameter: 10
    },
  });

  const calculateReinforcement = useCallback((data: ReinforcementInputs): ReinforcementResults => {
    // Calculate gross area
    const grossArea = data.length * data.width;
    
    // Calculate required steel area based on inputs
    const requiredSteelArea = data.minSteelRatio * grossArea;
    
    // Determine recommended bar size based on column dimensions
    let recommendedBarSize = 16; // Default starting point
    if (data.length > 500 || data.width > 500) recommendedBarSize = 20;
    if (data.length > 700 || data.width > 700) recommendedBarSize = 25;
    
    // Calculate approximate number of bars needed
    const barArea = Math.PI * Math.pow(recommendedBarSize / 2, 2);
    const recommendedBarCount = Math.ceil(requiredSteelArea / barArea);
    
    // Ensure safe recommendation
    const isSafe = requiredSteelArea <= (data.maxSteelRatio * grossArea);
    
    return {
      requiredSteelArea,
      recommendedBarSize,
      recommendedBarCount: Math.max(6, recommendedBarCount), // Minimum 6 bars for structural integrity
      isSafe
    };
  }, []);

  const onSubmit = useCallback((data: ReinforcementInputs) => {
    try {
      const calculationResults = calculateReinforcement(data);
      setResults(calculationResults);
      
      // Add to projects
      addProject({
        id: Date.now().toString(),
        name: `Reinforcement Design (${data.length}×${data.width})`,
        date: new Date().toISOString(),
        type: "reinforcement",
        inputs: data,
        results: calculationResults
      });
      
      toast({
        title: "Calculation completed",
        description: "Reinforcement design calculation has been processed successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Calculation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    }
  }, [toast, addProject, calculateReinforcement]);

  return (
    <PageContainer title="Reinforcement Sizing">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="axialLoad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Axial Load (kN)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Length (mm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="width"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Width (mm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>f'c (MPa)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>fy (MPa)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minSteelRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Steel Ratio</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxSteelRatio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Steel Ratio</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="concretecover"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concrete Cover (mm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tieDiameter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tie Diameter (mm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-6">
                <Button type="submit" className="w-full">Calculate Reinforcement</Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>

      {results && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Calculation Results</h2>
            <Separator className="mb-4" />
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Required Steel Area</p>
                <p className="text-lg font-medium">{formatNumber(results.requiredSteelArea)} mm²</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Recommended Bar Size</p>
                <p className="text-lg font-medium">Ø{results.recommendedBarSize} mm</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Recommended Bar Count</p>
                <p className="text-lg font-medium">{results.recommendedBarCount} bars</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Design Status</p>
                <p className={`text-lg font-medium ${results.isSafe ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {results.isSafe ? "SAFE" : "NOT SAFE"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
