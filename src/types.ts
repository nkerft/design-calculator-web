export interface ProjectForm {
  source: string;
  workType: string;
  elementsCount: number;
  isUrgent: boolean;
  urgencyDays: number;
  region: string;
  discount: number;
}

export interface CalculationResult {
  clientPrice: number;
  designerPrice: number;
  estimatedHours: {
    min: number;
    max: number;
  };
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
  { value: 'presentation_design', label: 'Presentation Design' },
  { value: 'presentation_format', label: 'Presentation Format' },
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
  { value: 'europe', label: 'Europe (+0%)' },
  { value: 'asia', label: 'Asia (+10%)' },
  { value: 'cis', label: 'CIS (+0%)' },
  { value: 'middle_east', label: 'Middle East (+7%)' },
  { value: 'africa', label: 'Africa (-10%)' },
  { value: 'south_america', label: 'South America (+0%)' },
  { value: 'australia_oceania', label: 'Australia & Oceania (+10%)' }
];



export const URGENCY_DAYS_OPTIONS: Option[] = [
  { value: '1', label: '1 Day (+50%)' },
  { value: '3', label: '3 Days (+30%)' }
];

export const URGENCY_BUTTON_OPTIONS: Option[] = [
  { value: '1', label: '1 Day (+50%)' },
  { value: '3', label: '3 Days (+30%)' }
];

export const DISCOUNT_OPTIONS: Option[] = [
  { value: '5', label: '5%' },
  { value: '10', label: '10%' },
  { value: '15', label: '15%' }
];

// Function to get dynamic label for elements count based on work type
export const getElementsLabel = (workType: string): string => {
  switch (workType) {
    case 'presentation_design':
    case 'presentation_format':
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
    case 'delegated_support':
      return 'Number of Hours';
    case 'logo':
      return 'Number of Options';
    case 'branding':
    default:
      return 'Number of Design Elements';
  }
};
