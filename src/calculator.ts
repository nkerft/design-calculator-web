import { ProjectForm, CalculationResult } from './types';

// Configuration object
const CONFIG = {
  workTypes: {
    presentation_format: { base: 0.5, min: 0.17, breakpoint: 150, type_adj_pp: -4 }, // 0.5 hours per page
    presentation_design: { base: 1.0, min: 0.33, breakpoint: 150, type_adj_pp: 0 }, // 1 hour per page
    template: { base: 6.67, min: 1.0, breakpoint: 1, type_adj_pp: 0 }, // 6.67 hours for 5 pages
    website_design: { base: 6.67, min: 2.67, breakpoint: 50, type_adj_pp: 0 }, // 6.67 hours per screen
    landing_page: { base: 5.33, min: 2.0, breakpoint: 30, type_adj_pp: 0 }, // 5.33 hours per screen
    logo: { base: 3.67, min: 1.33, breakpoint: 20, type_adj_pp: 0 }, // 3.67 hours per option
    branding: { base: 11.67, min: 4.0, breakpoint: 25, type_adj_pp: 0 }, // 11.67 hours per element
    social_media: { base: 1.33, min: 0.5, breakpoint: 50, type_adj_pp: 0 }, // 1.33 hours per post
    print: { base: 1.83, min: 0.67, breakpoint: 40, type_adj_pp: 0 }, // 1.83 hours per item
    illustration: { base: 2.67, min: 1.0, breakpoint: 30, type_adj_pp: 0 }, // 2.67 hours per illustration
    hourly_rate: { base: 1.0, min: 0.83, breakpoint: 80, type_adj_pp: 0 }, // 1 hour per hour
    web_development: { base: 13.33, min: 5.0, breakpoint: 20, type_adj_pp: 0 } // 13.33 hours per screen
  },
  multipliers: {
    source: { fiverr: 1.0, upwork: 1.0, freelancer: 1.0, telegram: 0.8 },
    urgency: { 1: 1.5, 3: 1.3, normal: 1.0 },
    region: { 
      north_america: 0.10, europe: 0.0, asia: 0.10, cis: 0.0, 
      middle_east: 0.07, africa: -0.10, south_america: 0.0, australia_oceania: 0.10 
    }
  },
  designerShare: {
    base_pp: 34,
    volume: { from_pp: 1, to_pp: -2, breakpoint: 150 },
    urgency_adj_pp: { 1: 5, 3: 2, normal: 0 },
    min_pp: 26,
    max_pp: 45
  },
  discount: { appliesTo: "designer" },
  rounding: { usd: 1, rub: 10 }
};

// Current exchange rate (USD to RUB)
const USD_TO_RUB_RATE = 95.5;

// Utility function to clamp value between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Calculate price per unit using linear model
function pricePerUnit(n: number, base: number, min: number, breakpoint: number): number {
  const progress = clamp((n - 1) / breakpoint, 0, 1);
  const result = base - (base - min) * progress;
  console.log(`pricePerUnit: n=${n}, base=${base}, min=${min}, breakpoint=${breakpoint}, progress=${progress}, result=${result}`);
  return result;
}

// Calculate base sum for all units
function calcBaseSum(n: number, workType: string, hourlyRate: number): number {
  const config = CONFIG.workTypes[workType as keyof typeof CONFIG.workTypes];
  if (!config) {
    return n * hourlyRate; // fallback
  }
  
  // Special logic for template
  if (workType === 'template') {
    if (n <= 5) {
      const hours = 6.67; // Fixed hours for 5 pages
      const totalCost = hours * hourlyRate;
      console.log(`calcBaseSum: workType=${workType}, n=${n}, template logic: 5 pages = ${hours}h × $${hourlyRate}/h = $${totalCost}`);
      return totalCost;
    } else {
      const baseHours = 6.67; // Hours for first 5 pages
      const additionalPages = n - 5;
      const additionalHours = additionalPages * 1.0; // 1 hour per additional page
      const totalHours = baseHours + additionalHours;
      const totalCost = totalHours * hourlyRate;
      console.log(`calcBaseSum: workType=${workType}, n=${n}, template logic: ${baseHours}h for 5 pages + ${additionalHours}h for ${additionalPages} additional pages = ${totalHours}h × $${hourlyRate}/h = $${totalCost}`);
      return totalCost;
    }
  }
  
  // Special logic for logo
  if (workType === 'logo') {
    if (n <= 3) {
      const hours = 6.67; // 6.67 hours for 3 options (200/30 = 6.67 hours)
      const totalCost = hours * hourlyRate;
      console.log(`calcBaseSum: workType=${workType}, n=${n}, logo logic: 3 options = ${hours}h × $${hourlyRate}/h = $${totalCost}`);
      return totalCost;
    } else {
      const baseHours = 6.67; // Hours for first 3 options
      const additionalOptions = n - 3;
      const additionalHours = additionalOptions * 1.0; // 1 hour per additional option (30/30 = 1 hour)
      const totalHours = baseHours + additionalHours;
      const totalCost = totalHours * hourlyRate;
      console.log(`calcBaseSum: workType=${workType}, n=${n}, logo logic: ${baseHours}h for 3 options + ${additionalHours}h for ${additionalOptions} additional options = ${totalHours}h × $${hourlyRate}/h = $${totalCost}`);
      return totalCost;
    }
  }
  
  // Special logic for landing page
  if (workType === 'landing_page') {
    if (n <= 1) {
      const hours = 10.0; // 10 hours for 1 screen (300/30 = 10 hours)
      const totalCost = hours * hourlyRate;
      console.log(`calcBaseSum: workType=${workType}, n=${n}, landing page logic: 1 screen = ${hours}h × $${hourlyRate}/h = $${totalCost}`);
      return totalCost;
    } else {
      const baseHours = 10.0; // Hours for first screen
      const additionalScreens = n - 1;
      const additionalHours = additionalScreens * 5.33; // 5.33 hours per additional screen
      const totalHours = baseHours + additionalHours;
      const totalCost = totalHours * hourlyRate;
      console.log(`calcBaseSum: workType=${workType}, n=${n}, landing page logic: ${baseHours}h for 1 screen + ${additionalHours}h for ${additionalScreens} additional screens = ${totalHours}h × $${hourlyRate}/h = $${totalCost}`);
      return totalCost;
    }
  }
  
  const hoursPerUnit = pricePerUnit(n, config.base, config.min, config.breakpoint);
  const totalHours = hoursPerUnit * n;
  const totalCost = totalHours * hourlyRate;
  console.log(`calcBaseSum: workType=${workType}, n=${n}, base=${config.base}h, min=${config.min}h, hoursPerUnit=${hoursPerUnit}h, totalHours=${totalHours}h, hourlyRate=$${hourlyRate}/h, total=$${totalCost}`);
  return totalCost;
}

// Calculate project cost for client
function calcProjectCost(baseSum: number, source: string, urgency: number, region: string): number {
  const sourceMul = CONFIG.multipliers.source[source as keyof typeof CONFIG.multipliers.source] || 1.0;
  const urgencyMul = urgency ? CONFIG.multipliers.urgency[urgency as keyof typeof CONFIG.multipliers.urgency] || 1.0 : 1.0;
  const regionPct = CONFIG.multipliers.region[region as keyof typeof CONFIG.multipliers.region] || 0;
  
  return baseSum * sourceMul * urgencyMul * (1 + regionPct);
}

// Calculate designer share percentage points
function calcDesignerSharePP(n: number, workType: string, urgency: number): number {
  const config = CONFIG.workTypes[workType as keyof typeof CONFIG.workTypes];
  if (!config) {
    return CONFIG.designerShare.base_pp;
  }
  
  const typeAdjPP = config.type_adj_pp;
  const volAdjPP = CONFIG.designerShare.volume.from_pp - 
    (CONFIG.designerShare.volume.from_pp - CONFIG.designerShare.volume.to_pp) * 
    clamp((n - 1) / CONFIG.designerShare.volume.breakpoint, 0, 1);
  
  const urgencyAdjPP = urgency ? 
    CONFIG.designerShare.urgency_adj_pp[urgency as keyof typeof CONFIG.designerShare.urgency_adj_pp] || 0 : 0;
  
  let sharePP = CONFIG.designerShare.base_pp + typeAdjPP + volAdjPP + urgencyAdjPP;
  return clamp(sharePP, CONFIG.designerShare.min_pp, CONFIG.designerShare.max_pp);
}

// Calculate designer payment
function calcDesignerPay(baseSum: number, urgency: number, sharePP: number, discount: number): { gross: number; net: number } {
  const share = sharePP / 100;
  const urgencyMul = urgency ? CONFIG.multipliers.urgency[urgency as keyof typeof CONFIG.multipliers.urgency] || 1.0 : 1.0;
  
  const gross = baseSum * urgencyMul * share;
  // Designer gets half the discount
  const net = gross * (1 - (discount / 2) / 100);
  
  return { gross, net };
}

// Calculate estimated hours
function calculateEstimatedHours(workType: string, quantity: number): { min: number; max: number } {
  const hoursConfig = {
    presentation_design: { min: 1.0, max: 1.0 }, // 1 hour per page
    presentation_format: { min: 0.5, max: 0.5 }, // 0.5 hours per page
    template: { min: 1.33, max: 1.33 }, // 1.33 hours per page (6.67/5)
    website_design: { min: 6.67, max: 6.67 }, // 6.67 hours per screen
    landing_page: { min: 10.0, max: 10.0 }, // 10 hours for 1 screen (300/30 = 10 hours)
    logo: { min: 2.22, max: 2.22 }, // 2.22 hours per option (6.67 hours for 3 options)
    branding: { min: 11.67, max: 11.67 }, // 11.67 hours per element
    social_media: { min: 1.33, max: 1.33 }, // 1.33 hours per post
    print: { min: 1.83, max: 1.83 }, // 1.83 hours per item
    illustration: { min: 2.67, max: 2.67 }, // 2.67 hours per illustration
    hourly_rate: { min: 1.0, max: 1.0 }, // 1 hour per hour
    web_development: { min: 13.33, max: 13.33 } // 13.33 hours per screen
  };
  
  const config = hoursConfig[workType as keyof typeof hoursConfig];
  if (!config) {
    return { min: Math.round(quantity * 1), max: Math.round(quantity * 1) };
  }
  
  const minHours = Math.round(quantity * config.min);
  const maxHours = Math.round(quantity * config.max);
  
  return { min: minHours, max: maxHours };
}

export function calculateProjectCost(form: ProjectForm): CalculationResult | null {
  // Check if we have required fields
  if (!form.workType || !form.elementsCount || !form.hourlyRate) {
    return null;
  }

  console.log(`=== DEBUG START ===`);
  console.log(`calculateProjectCost: workType=${form.workType}, elementsCount=${form.elementsCount}, hourlyRate=$${form.hourlyRate}/h`);
  
  // Calculate base sum
  const baseSum = calcBaseSum(form.elementsCount, form.workType, form.hourlyRate);
  
  // Calculate project cost for client (before discount)
  const clientPriceBeforeDiscount = calcProjectCost(baseSum, form.source, form.urgencyDays, form.region);
  
  // Apply discount to client price
  const clientPrice = form.discount > 0 ? 
    clientPriceBeforeDiscount * (1 - form.discount / 100) : 
    clientPriceBeforeDiscount;
  
  // Calculate designer share percentage
  const designerSharePP = calcDesignerSharePP(form.elementsCount, form.workType, form.urgencyDays);
  
  // Calculate designer payment
  const { net: designerNet } = calcDesignerPay(
    baseSum, 
    form.urgencyDays, 
    designerSharePP, 
    form.discount
  );
  
  // Calculate estimated hours
  const estimatedHours = calculateEstimatedHours(form.workType, form.elementsCount);

  return {
    clientPrice: Math.round(clientPrice),
    designerPrice: Math.round(designerNet),
    estimatedHours
  };
}

// Function for formatting price in dollars
export function formatPriceUSD(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

// Function for formatting price in rubles
export function formatPriceRUB(price: number): string {
  const rubPrice = Math.round(price * USD_TO_RUB_RATE / 10) * 10; // Round to nearest 10 RUB
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(rubPrice);
}


