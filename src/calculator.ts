import { ProjectForm, CalculationResult } from './types';

// Presentation pricing tiers (per slide)
const PRESENTATION_PRICES = {
  small: { min: 1, max: 14, price: 30 },      // <15 slides: $30 per slide
  medium: { min: 15, max: 30, price: 25 },    // 15-30 slides: $25 per slide
  large: { min: 31, max: 50, price: 20 },     // 31-50 slides: $20 per slide
  xlarge: { min: 51, max: 999, price: 15 }    // >50 slides: $15 per slide
};

// Template pricing
const TEMPLATE_PRICES = {
  basic: { maxSlides: 10, price: 300 },       // Basic template up to 10 slides: $300
  extended: { baseSlides: 20, basePrice: 500, additionalPrice: 10 } // Extended template: $500 for 20 slides + $10 per additional slide
};

// Multipliers for world regions
const REGION_MULTIPLIERS = {
  north_america: 1.8,    // North America - high rates
  europe: 1.5,           // Europe - high rates
  asia: 1.2,             // Asia - medium rates
  middle_east: 1.4,      // Middle East - above average
  africa: 0.8,           // Africa - below average
  south_america: 1.0,    // South America - medium rates
  australia_oceania: 1.6, // Australia & Oceania - high rates
  cis: 1.1               // CIS - slightly above average
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
  1: 1.3,  // 1 day - 30% extra
  2: 1.3,  // 2 days - 30% extra (changed from 20%)
  3: 1.1   // 3 days - 10% extra
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
  if (form.workType === 'presentation') {
    basePrice = calculatePresentationPrice(form.elementsCount, false);
  } else if (form.workType === 'template') {
    basePrice = calculatePresentationPrice(form.elementsCount, true);
  } else {
    // For other work types, use default pricing (we'll update this later)
    basePrice = form.elementsCount * 30;
  }

  // Apply multipliers
  let regionMultiplier = 1.0;
  let sourceMultiplier = 1.0;
  let urgencyMultiplier = 1.0;

  // Region multiplier
  if (form.region) {
    regionMultiplier = REGION_MULTIPLIERS[form.region as keyof typeof REGION_MULTIPLIERS] || 1.0;
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
    regionMultiplier * 
    sourceMultiplier * 
    urgencyMultiplier
  );
  
  // Designer price is 35% of client price
  const designerPrice = Math.round(clientPrice * 0.35);

  return {
    clientPrice,
    designerPrice
  };
}

// Function to calculate presentation price based on slide count and template type
function calculatePresentationPrice(slideCount: number, isTemplate: boolean): number {
  if (isTemplate) {
    // Template pricing
    if (slideCount <= TEMPLATE_PRICES.basic.maxSlides) {
      return TEMPLATE_PRICES.basic.price;
    } else {
      // Extended template pricing
      const basePrice = TEMPLATE_PRICES.extended.basePrice;
      const additionalSlides = Math.max(0, slideCount - TEMPLATE_PRICES.extended.baseSlides);
      const additionalPrice = additionalSlides * TEMPLATE_PRICES.extended.additionalPrice;
      return basePrice + additionalPrice;
    }
  } else {
    // Regular presentation pricing based on slide count
    if (slideCount <= PRESENTATION_PRICES.small.max) {
      return slideCount * PRESENTATION_PRICES.small.price;
    } else if (slideCount <= PRESENTATION_PRICES.medium.max) {
      return slideCount * PRESENTATION_PRICES.medium.price;
    } else if (slideCount <= PRESENTATION_PRICES.large.max) {
      return slideCount * PRESENTATION_PRICES.large.price;
    } else {
      return slideCount * PRESENTATION_PRICES.xlarge.price;
    }
  }
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


