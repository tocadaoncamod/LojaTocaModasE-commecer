import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { CpfCnpjValidator, ValidationResult } from '../services/cpfCnpjValidator';

interface CpfCnpjInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string;
  showValidation?: boolean;
}

const CpfCnpjInput: React.FC<CpfCnpjInputProps> = ({
  value,
  onChange,
  placeholder = "000.000.000-00 ou 00.000.000/0000-00",
  required = false,
  className = "",
  label = "CPF ou CNPJ",
  showValidation = true
}) => {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const validateDocument = () => {
      if (!value || value.length < 11) {
        setValidation(null);
        onChange(value, false);
        return;
      }

      setIsValidating(true);
      
      // Debounce validation
      const timer = setTimeout(() => {
        const result = CpfCnpjValidator.validate(value);
        setValidation(result);
        onChange(result.formatted, result.isValid);
        setIsValidating(false);
      }, 300);

      return () => clearTimeout(timer);
    };

    validateDocument();
  }, [value, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = CpfCnpjValidator.formatDocument(inputValue);
    onChange(formatted, false); // Will be validated in useEffect
  };

  const getValidationIcon = () => {
    if (isValidating) {
      return <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
    
    if (!validation) {
      return null;
    }

    return validation.isValid ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getInputBorderClass = () => {
    if (!showValidation || !validation) {
      return 'border-gray-300 focus:border-blue-500';
    }

    return validation.isValid 
      ? 'border-green-300 focus:border-green-500' 
      : 'border-red-300 focus:border-red-500';
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          className={`
            w-full pl-10 pr-10 py-3 border rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            transition-colors duration-200
            ${getInputBorderClass()}
            ${className}
          `}
          placeholder={placeholder}
          maxLength={18} // Max length for formatted CNPJ
          required={required}
        />
        
        {showValidation && (
          <div className="absolute right-3 top-3">
            {getValidationIcon()}
          </div>
        )}
      </div>

      {/* Validation Messages */}
      {showValidation && validation && (
        <div className="space-y-1">
          {validation.isValid ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>
                {validation.type.toUpperCase()} válido: {validation.formatted}
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Document Type Indicator */}
      {validation && validation.isValid && (
        <div className="text-xs text-gray-500">
          Tipo: {validation.type === 'cpf' ? 'Pessoa Física (CPF)' : 'Pessoa Jurídica (CNPJ)'}
        </div>
      )}
    </div>
  );
};

export default CpfCnpjInput;