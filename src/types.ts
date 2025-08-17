export interface ProjectForm {
  source: string;
  workType: string;
  elementsCount: number;
  isUrgent: boolean;
  urgencyDays: number;
  region: string;
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
  { value: 'fiverr', label: 'Fiverr (+20%)' },
  { value: 'upwork', label: 'Upwork (+20%)' },
  { value: 'freelancer', label: 'Freelancer (+20%)' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'internal', label: 'Internal' },
  { value: 'other', label: 'Other' }
];

export const WORK_TYPE_OPTIONS: Option[] = [
  { value: 'presentation', label: 'Presentation' },
  { value: 'template', label: 'Template (Presentation)' },
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
  { value: 'north_america', label: 'North America (+10%)' },
  { value: 'europe', label: 'Europe (+8%)' },
  { value: 'asia', label: 'Asia (+6%)' },
  { value: 'cis', label: 'CIS (+2%)' },
  { value: 'middle_east', label: 'Middle East (+7%)' },
  { value: 'africa', label: 'Africa (+4%)' },
  { value: 'south_america', label: 'South America (+5%)' },
  { value: 'australia_oceania', label: 'Australia & Oceania (+9%)' }
];



export const URGENCY_DAYS_OPTIONS: Option[] = [
  { value: '1', label: '1 Day (+50%)' },
  { value: '2', label: '2 Days (+30%)' }
];

// Function to get dynamic label for elements count based on work type
export const getElementsLabel = (workType: string): string => {
  switch (workType) {
    case 'presentation':
      return 'Number of Slides';
    case 'template':
      return 'Number of Pages';
    case 'website_design':
    case 'landing_page':
    case 'web_development':
      return 'Number of Screens';
    case 'social_media':
      return 'Number of Posts';
    case 'print':
      return 'Number of Items';
    case 'illustration':
      return 'Number of Illustrations';
    case 'ui_ux':
      return 'Number of Hours';
    case 'delegated_support':
      return 'Number of Tasks';
    case 'logo':
      return 'Number of Options';
    case 'branding':
    default:
      return 'Number of Design Elements';
  }
};
