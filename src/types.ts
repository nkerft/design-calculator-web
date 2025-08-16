export interface ProjectForm {
  source: string;
  workType: string;
  elementsCount: number;
  isUrgent: boolean;
  urgencyDays: number;
  region: string;
  designer: string;
}

export interface CalculationResult {
  clientPrice: number;
  designerPrice: number;
}

export interface Option {
  value: string;
  label: string;
}

export const SOURCE_OPTIONS: Option[] = [
  { value: 'fiverr', label: 'Fiverr' },
  { value: 'upwork', label: 'Upwork' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'internal', label: 'Internal' },
  { value: 'other', label: 'Other' }
];

export const WORK_TYPE_OPTIONS: Option[] = [
  { value: 'presentation', label: 'Presentation' },
  { value: 'website_design', label: 'Website Design' },
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'logo', label: 'Logo' },
  { value: 'branding', label: 'Logo+Brandbook+Aidentities' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'print', label: 'Print' },
  { value: 'illustration', label: 'Illustration' },
  { value: 'ui_ux', label: 'UI/UX Hourly Rate' },
  { value: 'delegated_support', label: 'Delegated Support' },
  { value: 'web_development', label: 'Web Page Development' }
];

export const REGION_OPTIONS: Option[] = [
  { value: 'north_america', label: 'North America' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia', label: 'Asia' },
  { value: 'cis', label: 'CIS' },
  { value: 'middle_east', label: 'Middle East' },
  { value: 'africa', label: 'Africa' },
  { value: 'south_america', label: 'South America' },
  { value: 'australia_oceania', label: 'Australia & Oceania' }
];

export const DESIGNER_OPTIONS: Option[] = [
  { value: 'alex', label: 'Alex' },
  { value: 'maria', label: 'Maria' },
  { value: 'dmitry', label: 'Dmitry' },
  { value: 'anna', label: 'Anna' },
  { value: 'sergey', label: 'Sergey' },
  { value: 'elena', label: 'Elena' },
  { value: 'andrey', label: 'Andrey' },
  { value: 'natalia', label: 'Natalia' }
];

export const URGENCY_DAYS_OPTIONS: Option[] = [
  { value: '1', label: '1 Day (30% extra)' },
  { value: '2', label: '2 Days (20% extra)' },
  { value: '3', label: '3 Days (10% extra)' }
];
