import { ProjectForm, CalculationResult } from './types';

// Pricing configuration for different work types
const PRICING_CONFIG = {
  presentation: {
    basePrice: 28,        // Starting price per slide
    minPrice: 7,         // Minimum price per slide
    breakpoint: 150,      // At this quantity, price becomes minimum
    name: 'slide'
  },
  template: {
    basePrice: 30,        // Starting price per page
    minPrice: 10,         // Minimum price per page
    breakpoint: 100,      // At this quantity, price becomes minimum
    name: 'page'
  },
  website_design: {
    basePrice: 200,       // Starting price per screen
    minPrice: 80,         // Minimum price per screen
    breakpoint: 50,       // At this quantity, price becomes minimum
    name: 'screen'
  },
  landing_page: {
    basePrice: 160,       // Starting price per screen
    minPrice: 60,         // Minimum price per screen
    breakpoint: 30,       // At this quantity, price becomes minimum
    name: 'screen'
  },
  logo: {
    basePrice: 110,       // Starting price per option
    minPrice: 40,         // Minimum price per option
    breakpoint: 20,       // At this quantity, price becomes minimum
    name: 'option'
  },
  branding: {
    basePrice: 350,       // Starting price per element
    minPrice: 120,        // Minimum price per element
    breakpoint: 25,       // At this quantity, price becomes minimum
    name: 'element'
  },
  social_media: {
    basePrice: 40,        // Starting price per post
    minPrice: 15,         // Minimum price per post
    breakpoint: 50,       // At this quantity, price becomes minimum
    name: 'post'
  },
  print: {
    basePrice: 55,        // Starting price per item
    minPrice: 20,         // Minimum price per item
    breakpoint: 40,       // At this quantity, price becomes minimum
    name: 'item'
  },
  illustration: {
    basePrice: 80,        // Starting price per illustration
    minPrice: 30,         // Minimum price per illustration
    breakpoint: 30,       // At this quantity, price becomes minimum
    name: 'illustration'
  },
  ui_ux: {
    basePrice: 280,       // Starting price per hour
    minPrice: 100,        // Minimum price per hour
    breakpoint: 40,       // At this quantity, price becomes minimum
    name: 'hour'
  },
  delegated_support: {
    basePrice: 25,        // Starting price per task
    minPrice: 10,         // Minimum price per task
    breakpoint: 100,      // At this quantity, price becomes minimum
    name: 'task'
  },
  web_development: {
    basePrice: 400,       // Starting price per page
    minPrice: 150,        // Minimum price per page
    breakpoint: 20,       // At this quantity, price becomes minimum
    name: 'page'
  }
};

// Region percentage additions (not multipliers)
const REGION_PERCENTAGES = {
  north_america: 10,     // North America - +10%
  europe: 0,             // Europe - +0%
  asia: 10,              // Asia - +10%
  middle_east: 7,        // Middle East - +7%
  africa: -10,           // Africa - -10%
  south_america: 0,      // South America - +0%
  australia_oceania: 10, // Australia & Oceania - +10%
  cis: 0                 // CIS - +0%
};

// Multipliers for sources (freelance platforms get +20%)
const SOURCE_MULTIPLIERS = {
  fiverr: 1.2,      // +20% for freelance platforms
  upwork: 1.2,      // +20% for freelance platforms
  freelancer: 1.2,  // +20% for freelance platforms
  telegram: 1.0,    // No additional cost
  internal: 1.0,    // No additional cost
  other: 1.0        // No additional cost
};

// Urgency multipliers based on days
const URGENCY_MULTIPLIERS = {
  1: 1.5,  // 1 day - 50% extra
  2: 1.3   // 2 days - 30% extra
};

// Current exchange rate (USD to RUB) - you can update this or fetch from API
const USD_TO_RUB_RATE = 95.5;

export function calculateProjectCost(form: ProjectForm): CalculationResult | null {
  // Check if we have required fields
  if (!form.workType || !form.elementsCount) {
    return null;
  }

  let basePrice = 0;

  // Calculate base price based on work type
  basePrice = calculateDynamicPrice(form.workType, form.elementsCount);

  // Apply multipliers and additions
  let sourceMultiplier = 1.0;
  let urgencyMultiplier = 1.0;
  let regionPercentage = 0;

  // Region percentage addition
  if (form.region) {
    regionPercentage = REGION_PERCENTAGES[form.region as keyof typeof REGION_PERCENTAGES] || 0;
  }

  // Source multiplier
  if (form.source) {
    sourceMultiplier = SOURCE_MULTIPLIERS[form.source as keyof typeof SOURCE_MULTIPLIERS] || 1.0;
  }

  // Urgency multiplier
  if (form.isUrgent && form.urgencyDays) {
    urgencyMultiplier = URGENCY_MULTIPLIERS[form.urgencyDays as keyof typeof URGENCY_MULTIPLIERS] || 1.0;
  }

  // Calculate final client price
  const clientPrice = Math.round(
    basePrice * 
    sourceMultiplier * 
    urgencyMultiplier * 
    (1 + regionPercentage / 100)
  );
  
  // Designer price is 35% of client price
  const designerPrice = Math.round(clientPrice * 0.35);

  return {
    clientPrice,
    designerPrice
  };
}

// Function to calculate dynamic price based on quantity
function calculateDynamicPrice(workType: string, quantity: number): number {
  const config = PRICING_CONFIG[workType as keyof typeof PRICING_CONFIG];
  
  if (!config) {
    // Fallback for unknown work types
    return quantity * 30;
  }
  
  // Calculate price per unit using smooth decrease
  let pricePerUnit = config.basePrice;
  
  if (quantity > 1) {
    // Calculate the reduction factor based on quantity
    const reductionFactor = Math.min(quantity / config.breakpoint, 1);
    const priceReduction = (config.basePrice - config.minPrice) * reductionFactor;
    pricePerUnit = config.basePrice - priceReduction;
  }
  
  return Math.round(quantity * pricePerUnit);
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
  const rubPrice = Math.round(price * USD_TO_RUB_RATE);
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(rubPrice);
}


