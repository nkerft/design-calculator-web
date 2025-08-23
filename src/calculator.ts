import { ProjectForm, CalculationResult } from './types';

// Configuration object
const CONFIG = {
  workTypes: {
    presentationFormat: { base: 15, min: 5, breakpoint: 150, type_adj_pp: -4 },
    presentationDesign: { base: 30, min: 10, breakpoint: 150, type_adj_pp: 0 },
    template: { base: 30, min: 10, breakpoint: 100, type_adj_pp: 0 },
    website_design: { base: 200, min: 80, breakpoint: 50, type_adj_pp: 0 },
    landing_page: { base: 160, min: 60, breakpoint: 30, type_adj_pp: 0 },
    logo: { base: 110, min: 40, breakpoint: 20, type_adj_pp: 0 },
    branding: { base: 350, min: 120, breakpoint: 25, type_adj_pp: 0 },
    social_media: { base: 40, min: 15, breakpoint: 50, type_adj_pp: 0 },
    print: { base: 55, min: 20, breakpoint: 40, type_adj_pp: 0 },
    illustration: { base: 80, min: 30, breakpoint: 30, type_adj_pp: 0 },
    ui_ux: { base: 40, min: 25, breakpoint: 80, type_adj_pp: 0 },
    delegated_support: { base: 40, min: 25, breakpoint: 80, type_adj_pp: 0 },
    web_development: { base: 400, min: 150, breakpoint: 20, type_adj_pp: 0 }
  },
  multipliers: {
    source: { fiverr: 1.2, upwork: 1.2, freelancer: 1.2, telegram: 1.0, internal: 1.0, other: 1.0 },
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
  return base - (base - min) * progress;
}

// Calculate base sum for all units
function calcBaseSum(n: number, workType: string): number {
  const config = CONFIG.workTypes[workType as keyof typeof CONFIG.workTypes];
  if (!config) {
    return n * 30; // fallback
  }
  
  const pricePerUnitValue = pricePerUnit(n, config.base, config.min, config.breakpoint);
  return pricePerUnitValue * n;
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
    presentationDesign: { min: 0.8, max: 1.2 },
    presentationFormat: { min: 0.4, max: 0.6 },
    template: { min: 1.0, max: 1.5 },
    website_design: { min: 4.0, max: 6.0 },
    landing_page: { min: 3.0, max: 4.5 },
    logo: { min: 2.0, max: 3.0 },
    branding: { min: 6.0, max: 9.0 },
    social_media: { min: 0.5, max: 0.8 },
    print: { min: 1.0, max: 1.5 },
    illustration: { min: 2.0, max: 3.0 },
    ui_ux: { min: 1.0, max: 1.0 },
    delegated_support: { min: 1.0, max: 1.0 },
    web_development: { min: 8.0, max: 12.0 }
  };
  
  const config = hoursConfig[workType as keyof typeof hoursConfig];
  if (!config) {
    return { min: quantity * 1, max: quantity * 1.5 };
  }
  
  const minHours = Math.round(quantity * config.min * 10) / 10;
  const maxHours = Math.round(quantity * config.max * 10) / 10;
  
  return { min: minHours, max: maxHours };
}

export function calculateProjectCost(form: ProjectForm): CalculationResult | null {
  // Check if we have required fields
  if (!form.workType || !form.elementsCount) {
    return null;
  }

  // Calculate base sum
  const baseSum = calcBaseSum(form.elementsCount, form.workType);
  
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


