import React, { useState, useEffect, useRef } from 'react';
import { ProjectForm, CalculationResult } from './types';
import { SOURCE_OPTIONS, WORK_TYPE_OPTIONS, REGION_OPTIONS, DESIGNER_OPTIONS, URGENCY_DAYS_OPTIONS } from './types';
import { calculateProjectCost, formatPriceUSD, formatPriceRUB, getPriceValues } from './calculator';

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
    onChange(optionValue);
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

// Simple number input with plus/minus buttons
const NumberInput: React.FC<{ value: number; onChange: (value: number) => void; label: string }> = ({ value, onChange, label }) => {
  const handleIncrement = () => {
    if (value < 50) onChange(value + 1);
  };

  const handleDecrement = () => {
    if (value > 1) onChange(value - 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 1;
    if (newValue >= 1 && newValue <= 50) {
      onChange(newValue);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="number-input-container">
        <input
          type="number"
          className="number-input-field"
          min="1"
          max="50"
          value={value}
          onChange={handleInputChange}
        />
        <div className="number-controls">
          <button 
            className="number-control-btn number-control-up"
            onClick={handleIncrement}
            disabled={value >= 50}
            title="Increase"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
          </button>
          <button 
            className="number-control-btn number-control-down"
            onClick={handleDecrement}
            disabled={value <= 1}
            title="Decrease"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 9l6 6 6-6"/>
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
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ label, price }) => {
  const [copied, setCopied] = useState(false);
  const [copyType, setCopyType] = useState<'usd' | 'rub' | null>(null);
  const priceValues = getPriceValues(price);

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

const App: React.FC = () => {
  const [form, setForm] = useState<ProjectForm>({
    source: '',
    workType: '',
    elementsCount: 10,
    isUrgent: false,
    urgencyDays: 0,
    region: '',
    designer: ''
  });

  const [results, setResults] = useState<CalculationResult | null>(null);

  // Calculate results after any field change
  useEffect(() => {
    const calculatedResults = calculateProjectCost(form);
    setResults(calculatedResults);
  }, [form]);

  const handleInputChange = (field: keyof ProjectForm, value: string | number | boolean) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReset = () => {
    setForm({
      source: '',
      workType: '',
      elementsCount: 10,
      isUrgent: false,
      urgencyDays: 0,
      region: '',
      designer: ''
    });
    setResults(null);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Design Calculator</h1>
        <p>Project cost calculator for WeTrio coordinators</p>
      </div>

      <div className="main-content">
        <div className="form-section">
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
            label="Number of Design Elements"
          />

          <div className="form-group">
            <label className="form-label">Project Urgency</label>
            <div className="toggle-group">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={form.isUrgent}
                  onChange={(e) => handleInputChange('isUrgent', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <span className="toggle-label">Urgent project</span>
            </div>
          </div>

          {form.isUrgent && (
            <CustomSelect
              value={form.urgencyDays.toString()}
              onChange={(value) => handleInputChange('urgencyDays', parseInt(value))}
              options={URGENCY_DAYS_OPTIONS}
              placeholder="Select urgency level"
              label="Urgency Level"
            />
          )}

          <CustomSelect
            value={form.region}
            onChange={(value) => handleInputChange('region', value)}
            options={REGION_OPTIONS}
            placeholder="Select region"
            label="Project Region"
          />

          <CustomSelect
            value={form.designer}
            onChange={(value) => handleInputChange('designer', value)}
            options={DESIGNER_OPTIONS}
            placeholder="Select designer"
            label="Assigned Designer"
          />

          <div className="button-group">
            <button 
              className="btn btn-secondary" 
              onClick={handleReset}
              title="Reset all fields"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
              Reset Form
            </button>
          </div>
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
              </>
            ) : (
              <div className="empty-state">
                <h3>Start filling the form</h3>
                <p>Select options to see calculated prices</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
