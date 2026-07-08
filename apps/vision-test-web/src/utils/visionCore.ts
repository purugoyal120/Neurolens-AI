export interface VisionReport {
  deficiency_type: string;
  severity: string;
  clinical_diagnosis: string;
  accuracy: number;
}

export const calculateColorMatrix = (report: VisionReport | null): string => {
  if (!report) return "1,0,0,0,0 0,1,0,0,0 0,0,1,0,0 0,0,0,1,0"; // Standard

  const deficiency = (report.deficiency_type || report.clinical_diagnosis || "").toLowerCase();
  
  // These are DALTONIZATION correction matrices (shifting invisible colors to visible ones)
  if (deficiency.includes("protan")) {
    // Protanopia: Red deficiency. Shift Red into Blue and Green so they can differentiate it.
    return "1, 0, 0, 0, 0,  0.5, 1, 0, 0, 0,  0.5, 0, 1, 0, 0,  0, 0, 0, 1, 0";
  } else if (deficiency.includes("deutan")) {
    // Deuteranopia: Green deficiency. Shift Green into Red and Blue.
    return "1, 0.5, 0, 0, 0,  0, 1, 0, 0, 0,  0, 0.5, 1, 0, 0,  0, 0, 0, 1, 0";
  } else if (deficiency.includes("tritan")) {
    // Tritanopia: Blue deficiency. Shift Blue into Red and Green.
    return "1, 0, 0.5, 0, 0,  0, 1, 0.5, 0, 0,  0, 0, 1, 0, 0,  0, 0, 0, 1, 0";
  }
  
  return "1,0,0,0,0 0,1,0,0,0 0,0,1,0,0 0,0,0,1,0";
};

export const calculateSimulationMatrix = (report: VisionReport | null): string => {
  if (!report) return "1,0,0,0,0 0,1,0,0,0 0,0,1,0,0 0,0,0,1,0"; // Standard

  const deficiency = (report.deficiency_type || report.clinical_diagnosis || "").toLowerCase();
  
  // These are standard simulation matrices (how the person sees the world)
  if (deficiency.includes("protan")) {
    return "0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0";
  } else if (deficiency.includes("deutan")) {
    return "0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0";
  } else if (deficiency.includes("tritan")) {
    return "0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0";
  }
  
  return "1,0,0,0,0 0,1,0,0,0 0,0,1,0,0 0,0,0,1,0";
};

export const generateCssFilter = (matrix: string, filterId: string = "nl-dalton"): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg"><filter id="${filterId}"><feColorMatrix type="matrix" values="${matrix}"/></filter></svg>`;
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}#${filterId}`;
  return `url("${dataUri}")`;
};
