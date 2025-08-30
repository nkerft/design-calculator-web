import React, { useState, useEffect, useRef } from 'react';
import { ProjectForm, CalculationResult } from './types';
import { SOURCE_OPTIONS, WORK_TYPE_OPTIONS, REGION_OPTIONS, URGENCY_BUTTON_OPTIONS, DISCOUNT_OPTIONS, getElementsLabel } from './types';
import { calculateProjectCost, formatPriceUSD, formatPriceRUB, setUsdToRubRate } from './calculator';
import { getUsdToRubRate, getCachedUsdToRubRate } from './exchangeRate';
import VersionInfo from './components/VersionInfo';

// Custom dropdown component
interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  label: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedOption = options.find(option => option.value === value);
    setSelectedLabel(selectedOption ? selectedOption.label : '');
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    // Если нажимаем на уже выбранный элемент, сбрасываем значение
    if (value === optionValue) {
      onChange('');
    } else {
      onChange(optionValue);
    }
    setIsOpen(false);
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="custom-select" ref={dropdownRef}>
        <div 
          className={`custom-select__header ${isOpen ? 'custom-select__header--open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="custom-select__value">
            {selectedLabel || placeholder}
          </span>
          <svg 
            className={`custom-select__arrow ${isOpen ? 'custom-select__arrow--open' : ''}`}
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5"
          >
            <path d="M7 10l5 5 5-5"/>
          </svg>
        </div>
        {isOpen && (
          <div className="custom-select__dropdown">
            {options.map((option) => (
              <div
                key={option.value}
                className={`custom-select__option ${value === option.value ? 'custom-select__option--selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <svg className="custom-select__check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Number input with horizontal plus/minus buttons
const NumberInput: React.FC<{ value: number; onChange: (value: number) => void; label: string; workType?: string }> = ({ value, onChange, label, workType }) => {
  const [inputValue, setInputValue] = useState(value.toString());

  // Determine minimum value based on work type
  const getMinValue = () => {
    if (workType === 'template') return 5;
    if (workType === 'logo') return 3;
    return 1;
  };

  const minValue = getMinValue();

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleIncrement = () => {
    const newValue = Math.min(value + 1, 99999);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - 1, minValue);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    setInputValue(inputVal);
    
    // Allow empty input for better UX
    if (inputVal === '') {
      return;
    }
    
    const newValue = parseInt(inputVal);
    if (!isNaN(newValue) && newValue >= minValue && newValue <= 99999) {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    // If input is empty or invalid, reset to current value
    const numValue = parseInt(inputValue);
    if (isNaN(numValue) || numValue < minValue || numValue > 99999) {
      setInputValue(value.toString());
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="number-input-container">
        <input
          type="number"
          className="number-input-field"
          min={minValue}
          max="99999"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
        />
        <div className="number-controls-horizontal">
          <button 
            className="number-control-btn-horizontal"
            onClick={handleDecrement}
            disabled={value <= minValue}
            title="Decrease"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14"/>
            </svg>
          </button>
          <button 
            className="number-control-btn-horizontal"
            onClick={handleIncrement}
            disabled={value >= 99999}
            title="Increase"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Price display component with copy functionality
interface PriceDisplayProps {
  label: string;
  price: number;
  subtitle?: string;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ label, price, subtitle }) => {
  const [copied, setCopied] = useState(false);
  const [copyType, setCopyType] = useState<'usd' | 'rub' | null>(null);

  const copyToClipboard = async (value: string, type: 'usd' | 'rub') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyType(type);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setCopyType(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="result-item">
      <span className="result-label">{label}</span>
      {subtitle && <span className="result-subtitle">{subtitle}</span>}
      <div className="result-prices">
        <div className="price-item">
          <span className="price-value">{formatPriceUSD(price)}</span>
          <button 
            className="copy-button"
            onClick={() => copyToClipboard(formatPriceUSD(price), 'usd')}
            title="Copy USD price"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
          </button>
        </div>
        <div className="price-item">
          <span className="price-value">{formatPriceRUB(price)}</span>
          <button 
            className="copy-button"
            onClick={() => copyToClipboard(formatPriceRUB(price), 'rub')}
            title="Copy RUB price"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            </svg>
          </button>
        </div>
      </div>
      {copied && (
        <div className={`copy-notification ${copyType}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
          <span>Copied!</span>
        </div>
      )}
    </div>
  );
};

// Urgency buttons component
interface UrgencyButtonsProps {
  isUrgent: boolean;
  urgencyDays: number;
  onUrgentChange: (isUrgent: boolean) => void;
  onUrgencyDaysChange: (days: number) => void;
}

const UrgencyButtons: React.FC<UrgencyButtonsProps> = ({ isUrgent, urgencyDays, onUrgentChange, onUrgencyDaysChange }) => {
  return (
    <div className="form-group">
      <label className="form-label">Project Urgency</label>
      <div className="toggle-group">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={isUrgent}
            onChange={(e) => onUrgentChange(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
        <span className="toggle-label">Urgent project</span>
      </div>
      
      {isUrgent && (
        <div className="urgency-buttons">
          {URGENCY_BUTTON_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`urgency-button ${urgencyDays === parseInt(option.value) ? 'urgency-button--active' : ''}`}
              onClick={() => onUrgencyDaysChange(parseInt(option.value))}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Discount buttons component
interface DiscountButtonsProps {
  value: number;
  onChange: (value: number) => void;
}

const DiscountButtons: React.FC<DiscountButtonsProps> = ({ value, onChange }) => {
  return (
    <div className="form-group">
      <label className="form-label">Discount</label>
      <div className="toggle-group">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={value > 0}
            onChange={(e) => onChange(e.target.checked ? 10 : 0)}
          />
          <span className="toggle-slider"></span>
        </label>
        <span className="toggle-label">Apply discount</span>
      </div>
      
      {value > 0 && (
        <div className="discount-buttons">
          {DISCOUNT_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`discount-button ${value === parseInt(option.value) ? 'discount-button--active' : ''}`}
              onClick={() => onChange(parseInt(option.value))}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

    </div>
  );
};

const App: React.FC = () => {
  const [form, setForm] = useState<ProjectForm>({
    hourlyRate: 30,
    source: '',
    workType: '',
    elementsCount: 10,
    isUrgent: false,
    urgencyDays: 0,
    region: '',
    discount: 0
  });

  const [results, setResults] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usdRub, setUsdRub] = useState<number | null>(getCachedUsdToRubRate());

  // Эффект для загрузки страницы
  useEffect(() => {
    // Принудительно прокручиваем страницу в начало
    window.scrollTo(0, 0);
    
    // Добавляем класс loading к body
    document.body.classList.add('loading');
    
         // Скрываем экран загрузки через 1.5 секунды
     const timer = setTimeout(() => {
       setIsLoading(false);
       // Убираем класс loading с body
       document.body.classList.remove('loading');
       // Еще раз убеждаемся, что страница в начале
       window.scrollTo(0, 0);
     }, 1500);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove('loading');
    };
  }, []);

  // Инициализация курса USD/RUB один раз в начале дня
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getUsdToRubRate();
        if (!cancelled) {
          setUsdToRubRate(data.rate);
          setUsdRub(data.rate);
          // Пересчитать результаты с актуальным курсом
          setResults(calculateProjectCost(form));
        }
      } catch (e) {
        // Если сеть недоступна — остаётся кэш или дефолтный курс из calculator.ts
        console.error('Failed to init USD/RUB rate', e);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate results after any field change
  useEffect(() => {
    const calculatedResults = calculateProjectCost(form);
    setResults(calculatedResults);
  }, [form]);

  // Update elementsCount when workType changes
  useEffect(() => {
    if (form.workType === 'template' && form.elementsCount < 5) {
      setForm(prev => ({ ...prev, elementsCount: 5 }));
    } else if (form.workType === 'logo' && form.elementsCount < 3) {
      setForm(prev => ({ ...prev, elementsCount: 3 }));
    } else if (form.workType !== 'template' && form.workType !== 'logo' && form.elementsCount < 1) {
      setForm(prev => ({ ...prev, elementsCount: 1 }));
    }
  }, [form.workType, form.elementsCount]);



  const handleInputChange = (field: keyof ProjectForm, value: string | number | boolean) => {
    setForm(prev => {
      // Если отключаем Project Urgency, сбрасываем urgencyDays
      if (field === 'isUrgent' && value === false) {
        return {
          ...prev,
          [field]: value,
          urgencyDays: 0
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleReset = () => {
    // Прокручиваем страницу вверх на мобильных устройствах
    if (window.innerWidth <= 768) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
    
    setForm({
      hourlyRate: 30,
      source: '',
      workType: '',
      elementsCount: 10,
      isUrgent: false,
      urgencyDays: 0,
      region: '',
      discount: 0
    });
    setResults(null);
  };

  return (
    <>
             {/* Экран загрузки */}
       {isLoading && (
         <div className="loading-overlay">
           <div className="loading-progress">
             <div className="loading-progress-bar"></div>
           </div>
         </div>
       )}
      
      <div className="page-wrapper">
        <div className="container">
                   <div className="header">
             <h1>Design Calculator</h1>
             <p>Cost Estimation Tool for WeTrio</p>
           </div>

        <div className="main-content">
          <div className="form-section">
            
                         <div className="form-group">
               <label className="form-label">Cost per Hour</label>
               <div className="hourly-rate-input-container">
                 <span className="hourly-rate-currency">$</span>
                 <input
                   type="number"
                   className="hourly-rate-input"
                   min="1"
                   max="999"
                   value={form.hourlyRate}
                   onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value) || 30)}
                   placeholder="30"
                 />
                 <div className="hourly-rate-controls-horizontal">
                   <button 
                     className="hourly-rate-control-btn"
                     onClick={() => handleInputChange('hourlyRate', Math.max(form.hourlyRate - 1, 1))}
                     disabled={form.hourlyRate <= 1}
                     title="Decrease"
                   >
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                       <path d="M5 12h14"/>
                     </svg>
                   </button>
                   <button 
                     className="hourly-rate-control-btn"
                     onClick={() => handleInputChange('hourlyRate', Math.min(form.hourlyRate + 1, 999))}
                     disabled={form.hourlyRate >= 999}
                     title="Increase"
                   >
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                       <path d="M12 5v14M5 12h14"/>
                     </svg>
                   </button>
                 </div>
               </div>
             </div>

            <CustomSelect
              value={form.source}
              onChange={(value) => handleInputChange('source', value)}
              options={SOURCE_OPTIONS}
              placeholder="Select source"
              label="Work Source"
            />

            <CustomSelect
              value={form.workType}
              onChange={(value) => handleInputChange('workType', value)}
              options={WORK_TYPE_OPTIONS}
              placeholder="Select work type"
              label="Work Type"
            />

            <NumberInput
              value={form.elementsCount}
              onChange={(value) => handleInputChange('elementsCount', value)}
              label={getElementsLabel(form.workType)}
              workType={form.workType}
            />

            <UrgencyButtons
              isUrgent={form.isUrgent}
              urgencyDays={form.urgencyDays}
              onUrgentChange={(isUrgent) => handleInputChange('isUrgent', isUrgent)}
              onUrgencyDaysChange={(days) => handleInputChange('urgencyDays', days)}
            />

            <CustomSelect
              value={form.region}
              onChange={(value) => handleInputChange('region', value)}
              options={REGION_OPTIONS}
              placeholder="Select region"
              label="Project Region"
            />

            <DiscountButtons
              value={form.discount}
              onChange={(value) => handleInputChange('discount', value)}
            />

          </div>

          <div className="results-section">
            <div className="results">
              {results ? (
                <>
                  <PriceDisplay 
                    label="Project Cost for WeTrio" 
                    price={results.clientPrice} 
                  />
                  <PriceDisplay 
                    label="Designer Work Cost" 
                    price={results.designerPrice}
                  />
                  <div className="estimated-hours">
                    <span className="estimated-hours-label">Estimated hours:</span>
                    <span className="estimated-hours-value">
                      {results.estimatedHours.min === results.estimatedHours.max 
                        ? `${results.estimatedHours.min}h` 
                        : `${results.estimatedHours.min}–${results.estimatedHours.max}h`}
                    </span>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <h3>Start filling the form</h3>
                  <p>Select options to see calculated prices</p>
                </div>
              )}
            </div>
            
            <button 
              className="reset-button" 
              onClick={handleReset}
              title="Reset all fields"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
              <span>Reset</span>
            </button>
          </div>
        </div>
             </div>
       
       {/* Плавающая кнопка Reset для мобильной версии */}
       <button 
         className="floating-reset-button" 
         onClick={handleReset}
         title="Reset all fields"
       >
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
           <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
           <path d="M21 3v5h-5"/>
           <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
           <path d="M3 21v-5h5"/>
         </svg>
         <span>Reset</span>
       </button>
       
               <VersionInfo />
      </div>
      {/* Нижняя подложка цвета футера для безопасной области iOS */}
      <div className="footer-extension" />
    </>
  );
};

export default App;
