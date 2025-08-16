import { ProjectForm, CalculationResult } from './types';

// Base price per element for different work types (in dollars)
const BASE_PRICE_PER_ELEMENT = 30;

// Element types for different work types
const ELEMENT_TYPES = {
  presentation: 'slides',           // Количество слайдов
  website_design: 'pages',          // Количество страниц
  landing_page: 'sections',         // Количество секций
  logo: 'variations',               // Количество вариаций логотипа
  branding: 'elements',             // Количество элементов брендинга
  social_media: 'posts',            // Количество постов
  print: 'items',                   // Количество печатных элементов
  illustration: 'illustrations',    // Количество иллюстраций
  ui_ux: 'screens',                 // Количество экранов
  delegated_support: 'hours',       // Количество часов
  web_development: 'pages'          // Количество страниц
};

// Multipliers for specific designers
const DESIGNER_MULTIPLIERS = {
  alex: 1.4,      // Alex - experienced designer
  maria: 1.2,     // Maria - mid-level
  dmitry: 1.6,    // Dmitry - high level
  anna: 1.1,      // Anna - beginner
  sergey: 1.3,    // Sergey - experienced
  elena: 1.0,     // Elena - basic level
  andrey: 1.5,    // Andrey - high level
  natalia: 1.2    // Natalia - mid-level
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

// Multipliers for sources
const SOURCE_MULTIPLIERS = {
  fiverr: 0.9,
  upwork: 1.0,
  freelancer: 0.95,
  telegram: 1.1,
  internal: 1.2,
  other: 1.0
};

// Urgency multipliers based on days
const URGENCY_MULTIPLIERS = {
  1: 1.3,  // 1 day - 30% extra
  2: 1.2,  // 2 days - 20% extra
  3: 1.1   // 3 days - 10% extra
};



// Company margin (multiplier)
const COMPANY_MARGIN = 1.4;

// Current exchange rate (USD to RUB) - you can update this or fetch from API
const USD_TO_RUB_RATE = 95.5;

export function calculateProjectCost(form: ProjectForm): CalculationResult | null {
  // Calculate based on available fields
  let designerMultiplier = 1.0;
  let regionMultiplier = 1.0;
  let sourceMultiplier = 1.0;
  let urgencyMultiplier = 1.0;

  // Check if we have required fields
  if (!form.workType || !form.elementsCount) {
    return null;
  }

  // Designer multiplier
  if (form.designer) {
    designerMultiplier = DESIGNER_MULTIPLIERS[form.designer as keyof typeof DESIGNER_MULTIPLIERS] || 1.0;
  }

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

  // Calculate base price (30$ per element)
  const basePrice = form.elementsCount * BASE_PRICE_PER_ELEMENT;

  // Calculate designer price
  const designerPrice = Math.round(
    basePrice * 
    designerMultiplier * 
    regionMultiplier * 
    sourceMultiplier * 
    urgencyMultiplier
  );
  
  // Calculate client price (with company margin)
  const clientPrice = Math.round(designerPrice * COMPANY_MARGIN);

  return {
    clientPrice,
    designerPrice
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
  const rubPrice = Math.round(price * USD_TO_RUB_RATE);
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(rubPrice);
}

// Function to get raw price values for copying
export function getPriceValues(price: number) {
  return {
    usd: price,
    rub: Math.round(price * USD_TO_RUB_RATE)
  };
}
