
import { CalculationInputs, CalculationResult } from "@/context/ProjectContext";

// Calculate Beta 1 based on concrete strength
export function calculateBeta1(fc: number): number {
  if (fc < 30) {
    return 0.85;
  } else {
    return Math.max(0.65, 0.85 - (0.05 / 7) * (fc - 30));
  }
}

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
  const crossSectionalArea = length! * width!;

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
  const beta1 = calculateBeta1(fc);

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

export function calculateEccentricLoad(inputs: CalculationInputs): CalculationResult {
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
    eccentricityX = 0,
    eccentricityY = 0,
  } = inputs;

  // Calculate factored load (Pu)
  const factoredLoad = 1.2 * deadLoad + 1.6 * liveLoad;

  // Calculate cross-sectional area (mm²)
  const crossSectionalArea = length! * width!;

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

  // Calculate moments due to eccentricity
  const momentX = factoredLoad * eccentricityX / 1000; // kN·m
  const momentY = factoredLoad * eccentricityY / 1000; // kN·m

  // Calculate Beta 1 based on concrete strength
  const beta1 = calculateBeta1(fc);

  // Calculate axial load capacity (simplified for eccentric loading)
  // For eccentric loading, we use a simplified approach
  // Actual interaction diagrams would be more accurate
  const phi = 0.65; // Strength reduction factor for tied columns
  
  // Simplified reduction for eccentricity
  // This is a simplified approach - in a real app, would use interaction diagrams
  const eccentricityRatio = Math.sqrt(Math.pow(eccentricityX, 2) + Math.pow(eccentricityY, 2)) / Math.min(length!, width!);
  const eccentricReduction = Math.max(0.2, 1 - 0.5 * eccentricityRatio);
  
  const axialLoadCapacity =
    phi * eccentricReduction * (0.85 * fc * (crossSectionalArea - steelArea) + fy * steelArea) / 1000; // Convert to kN

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
    momentX,
    momentY,
    steelRatio,
  };
}

export function calculateReinforcement(inputs: CalculationInputs): CalculationResult {
  const {
    axialLoad = 0,
    length,
    width,
    fc,
    fy,
    minSteelRatio = 0.01,
    maxSteelRatio = 0.08,
    tieDiameter = 10,
    concretecover = 40,
  } = inputs;

  // Factor of safety
  const phi = 0.65; // Strength reduction factor for tied columns
  
  // Column cross-sectional area
  const crossSectionalArea = length! * width!;
  
  // Calculate factored load
  const factoredLoad = axialLoad;
  
  // Calculate required steel area based on axial load
  // Pu = 0.85 * f'c * (Ag - Ast) + fy * Ast
  // Solve for Ast (required steel area)
  const requiredSteelArea = Math.max(
    (factoredLoad * 1000 / phi - 0.85 * fc * crossSectionalArea) / (fy - 0.85 * fc),
    minSteelRatio * crossSectionalArea // Ensure minimum steel ratio
  );
  
  // Limit to maximum steel ratio
  const cappedSteelArea = Math.min(requiredSteelArea, maxSteelRatio * crossSectionalArea);
  
  // Calculate steel ratio
  const steelRatio = cappedSteelArea / crossSectionalArea;
  
  // Determine appropriate bar size
  // Standard bar sizes in mm
  const standardBarSizes = [10, 12, 16, 20, 25, 32, 40];
  
  let recommendedBarSize = standardBarSizes[0];
  let numberOfBars = 4; // Minimum number
  
  // Find the appropriate bar size and number of bars
  for (const barSize of standardBarSizes) {
    const areaPerBar = Math.PI * Math.pow(barSize / 2, 2);
    const barsNeeded = Math.ceil(cappedSteelArea / areaPerBar);
    
    // Check if we can use this bar size with 4 or more bars
    // and making sure it's an even number
    const adjustedBarsCount = Math.max(4, barsNeeded % 2 === 0 ? barsNeeded : barsNeeded + 1);
    
    if (adjustedBarsCount * areaPerBar >= cappedSteelArea) {
      recommendedBarSize = barSize;
      numberOfBars = adjustedBarsCount;
      break;
    }
  }
  
  // Calculate actual steel area with the selected bars
  const areaOfBar = Math.PI * Math.pow(recommendedBarSize / 2, 2);
  const steelArea = numberOfBars * areaOfBar;
  
  // Calculate maximum tie spacing
  // As per code, the smaller of:
  // 1. 16 × longitudinal bar diameter
  // 2. 48 × tie diameter
  // 3. Least column dimension
  const maxTieSpacing = Math.min(
    16 * recommendedBarSize,
    48 * tieDiameter,
    Math.min(length!, width!)
  );
  
  // Determine bar arrangement
  let barArrangement = "";
  if (length === width) {
    // Square column
    const barsPerSide = Math.floor(numberOfBars / 4);
    const extras = numberOfBars - (barsPerSide * 4);
    barArrangement = `${barsPerSide} bars per side${extras > 0 ? ` + ${extras} extra` : ''}`;
  } else {
    // Rectangular column
    const longerSide = Math.max(length!, width!);
    const shorterSide = Math.min(length!, width!);
    const ratio = Math.round(longerSide / shorterSide);
    
    const barsOnLongSide = Math.ceil(numberOfBars / (2 * (ratio + 1))) * ratio;
    const barsOnShortSide = (numberOfBars - (2 * barsOnLongSide)) / 2;
    
    barArrangement = `${barsOnLongSide} on long sides, ${barsOnShortSide} on short sides`;
  }
  
  // Check if the design is valid and safe
  const isRatioValid = steelRatio >= minSteelRatio && steelRatio <= maxSteelRatio;
  
  // Calculate axial load capacity with the selected reinforcement
  const axialLoadCapacity = 
    phi * (0.85 * fc * (crossSectionalArea - steelArea) + fy * steelArea) / 1000; // Convert to kN
  
  // Check if design is safe
  const isSafe = axialLoadCapacity >= factoredLoad;

  return {
    factoredLoad,
    crossSectionalArea,
    areaOfBar,
    steelArea,
    axialLoadCapacity,
    isSafe,
    isRatioValid,
    requiredSteelArea: cappedSteelArea,
    recommendedBarSize,
    numberOfBars,
    barArrangement,
    maxTieSpacing,
    steelRatio,
  };
}

// New function for Spiral Column Design
export function calculateSpiralColumn(inputs: CalculationInputs): CalculationResult {
  const {
    deadLoad,
    liveLoad,
    columnDiameter,
    fc,
    fy,
    barDiameter,
    spiralBarDiameter = 10,
    concretecover = 40,
    steelRatio = 0.02, // Default to 2%
  } = inputs;

  // Calculate factored load (Pu)
  const factoredLoad = 1.2 * deadLoad + 1.6 * liveLoad;

  // Calculate cross-sectional area (mm²)
  const crossSectionalArea = Math.PI * Math.pow(columnDiameter! / 2, 2);
  
  // Calculate Beta 1 based on concrete strength
  const beta1 = calculateBeta1(fc);

  // Calculate minimum steel ratio
  const rhoMin = 1.4 / fy;
  
  // Calculate maximum steel ratio
  // ρmax = (0.75)[(0.85)(f'c)(β1)(600)]/[(fy)(600+228)]
  const rhoMax = 0.75 * (0.85 * fc * beta1 * 600) / (fy * (600 + 228));
  
  // Determine if the steel ratio is valid
  const isRatioValid = steelRatio >= rhoMin && steelRatio <= rhoMax;
  
  // Calculate steel area
  const steelArea = steelRatio * crossSectionalArea;

  // Calculate area of a single bar (mm²)
  const areaOfBar = Math.PI * Math.pow(barDiameter / 2, 2);
  
  // Calculate number of bars needed
  const calculatedNumberOfBars = steelArea / areaOfBar;
  
  // Round up to nearest whole number
  const numberOfBars = Math.max(6, Math.ceil(calculatedNumberOfBars));

  // Recalculate actual steel area with the rounded number of bars
  const actualSteelArea = numberOfBars * areaOfBar;
  const actualSteelRatio = actualSteelArea / crossSectionalArea;

  // Calculate axial load capacity for spiral columns
  // Design Pu = (0.75)(0.85)[(0.85)(f'c)(Ag-Ast)+(fy)(Ast)]
  const phi = 0.75; // Strength reduction factor for spiral columns
  const axialLoadCapacity =
    phi * 0.85 * (0.85 * fc * (crossSectionalArea - actualSteelArea) + fy * actualSteelArea) / 1000; // Convert to kN
  
  // Check if the design is safe
  const isSafe = axialLoadCapacity > factoredLoad;
  
  // Calculate spiral spacing
  // Core dimensions
  const coreDiameter = columnDiameter! - 2 * concretecover!; // Dc
  const coreArea = Math.PI * Math.pow(coreDiameter / 2, 2); // Ach
  
  // Spiral reinforcement ratio
  // Minimum Spiral Ratio = (0.45)[(Ag/Ach)-1](f'c/fyh)
  const spiralRatio = 0.45 * ((crossSectionalArea / coreArea) - 1) * (fc / fy);
  
  // Area of spiral bar
  const spiralBarArea = Math.PI * Math.pow(spiralBarDiameter! / 2, 2);
  
  // Spacing calculation
  // s = [(4)(Asp)(Dc-Spiral Bar Diameter)]/[(Min. Spiral Ratio)(Dc^2)]
  const spiralSpacing = (4 * spiralBarArea * (coreDiameter - spiralBarDiameter!)) / (spiralRatio * Math.pow(coreDiameter, 2));
  
  // Clear spacing
  const clearSpacing = spiralSpacing - spiralBarDiameter!;

  return {
    factoredLoad,
    crossSectionalArea,
    areaOfBar,
    steelArea: actualSteelArea,
    axialLoadCapacity,
    isSafe,
    isRatioValid,
    steelRatio: actualSteelRatio,
    columnDimension: columnDiameter,
    numberOfBars,
    spiralSpacing,
    spiralRatio,
    clearSpacing,
    minSteelRatio: rhoMin,
    maxSteelRatio: rhoMax,
    beta1,
  };
}

// New function for Tied Column Design
export function calculateTiedColumn(inputs: CalculationInputs): CalculationResult {
  const {
    deadLoad,
    liveLoad,
    fc,
    fy,
    barDiameter,
    tieDiameter,
    steelRatio = 0.02, // Default to 2%
    concretecover = 40,
  } = inputs;

  // Calculate factored load (Pu)
  const factoredLoad = 1.2 * deadLoad + 1.6 * liveLoad;
  
  // Calculate Beta 1 based on concrete strength
  const beta1 = calculateBeta1(fc);

  // Calculate minimum steel ratio
  const rhoMin = 1.4 / fy;
  
  // Calculate maximum steel ratio
  // ρmax = (0.75)[(0.85)(f'c)(β1)(600)]/[(fy)(600+228)]
  const rhoMax = 0.75 * (0.85 * fc * beta1 * 600) / (fy * (600 + 228));
  
  // Determine if the steel ratio is valid
  const isRatioValid = steelRatio >= rhoMin && steelRatio <= rhoMax;

  // Calculate required gross area from factored load
  // Pu = phi * 0.85 * [(0.85 * f'c * (Ag - steelRatio * Ag) + fy * steelRatio * Ag)]
  // Solve for Ag
  const phi = 0.75; // Phi for tied column
  const grossAreaRequired = factoredLoad * 1000 / 
    (phi * 0.85 * ((0.85 * fc * (1 - steelRatio)) + (fy * steelRatio)));
  
  // Calculate required column dimension (assuming square column)
  let sideDimension = Math.sqrt(grossAreaRequired);
  
  // Round up to nearest 5mm
  sideDimension = Math.ceil(sideDimension / 5) * 5;
  
  // Recalculate actual gross area
  const crossSectionalArea = sideDimension * sideDimension;
  
  // Calculate steel area
  const steelArea = steelRatio * crossSectionalArea;
  
  // Calculate area of a single bar (mm²)
  const areaOfBar = Math.PI * Math.pow(barDiameter / 2, 2);
  
  // Calculate number of bars needed
  const calculatedNumberOfBars = steelArea / areaOfBar;
  
  // Round up to nearest even number (minimum 4)
  const numberOfBars = Math.max(4, Math.ceil(calculatedNumberOfBars / 2) * 2);
  
  // Recalculate actual steel area with the rounded number of bars
  const actualSteelArea = numberOfBars * areaOfBar;
  const actualSteelRatio = actualSteelArea / crossSectionalArea;
  
  // Calculate axial load capacity with actual steel ratio
  const axialLoadCapacity =
    phi * 0.85 * (0.85 * fc * (crossSectionalArea - actualSteelArea) + fy * actualSteelArea) / 1000; // Convert to kN
  
  // Check if the design is safe
  const isSafe = axialLoadCapacity >= factoredLoad;
  
  // Calculate tie spacing
  // The smaller of:
  // 1. 16 * bar diameter
  // 2. 48 * tie diameter
  // 3. Least dimension of the column
  const tieSpacing = Math.min(
    16 * barDiameter,
    48 * tieDiameter,
    sideDimension
  );

  return {
    factoredLoad,
    crossSectionalArea,
    areaOfBar,
    steelArea: actualSteelArea,
    axialLoadCapacity,
    isSafe,
    isRatioValid,
    steelRatio: actualSteelRatio,
    columnDimension: sideDimension,
    numberOfBars,
    tieSpacing,
    minSteelRatio: rhoMin,
    maxSteelRatio: rhoMax,
    beta1,
  };
}

// Function to format numbers with commas and fixed decimal places
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}
