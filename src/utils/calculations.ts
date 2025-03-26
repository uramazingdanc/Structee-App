
import { CalculationInputs, CalculationResult } from "@/context/ProjectContext";

export function calculateAxialLoad(inputs: CalculationInputs): CalculationResult {
  const {
    deadLoad,
    liveLoad,
    numberOfBars,
    tieDiameter,
    barDiameter,
    columnHeight,
    length,
    width,
    fc,
    fy,
  } = inputs;

  // Calculate factored load (Pu)
  const factoredLoad = 1.2 * deadLoad + 1.6 * liveLoad;

  // Calculate cross-sectional area (mm²)
  const crossSectionalArea = length * width;

  // Calculate area of a single bar (mm²)
  const areaOfBar = Math.PI * Math.pow(barDiameter / 2, 2);

  // Calculate total steel area (mm²)
  const steelArea = numberOfBars * areaOfBar;

  // Calculate steel reinforcement ratio
  const steelRatio = steelArea / crossSectionalArea;
  
  // Check if steel ratio is within acceptable limits
  const rhoMin = 0.01; // 1%
  const rhoMax = 0.08; // 8%
  const isRatioValid = steelRatio >= rhoMin && steelRatio <= rhoMax;

  // Calculate Beta 1 based on concrete strength
  let beta1;
  if (fc < 30) {
    beta1 = 0.85;
  } else {
    beta1 = Math.max(0.65, 0.85 - (0.05 / 7) * (fc - 30));
  }

  // Calculate axial load capacity (NSCP 2015 equation)
  // Pn = 0.85 * f'c * (Ag - Ast) + fy * Ast
  // Design Pu = 0.65 * Pn for tied columns
  const phi = 0.65; // Strength reduction factor for tied columns
  const axialLoadCapacity =
    phi * (0.85 * fc * (crossSectionalArea - steelArea) + fy * steelArea) / 1000; // Convert to kN

  // Check if the design is safe
  const isSafe = axialLoadCapacity > factoredLoad;

  return {
    factoredLoad,
    crossSectionalArea,
    areaOfBar,
    steelArea,
    axialLoadCapacity,
    isSafe,
    isRatioValid,
  };
}

// Function to format numbers with commas and fixed decimal places
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}
