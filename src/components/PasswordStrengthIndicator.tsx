import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, RefreshCw, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { PasswordService, PasswordValidationResult } from '../services/passwordService';

interface PasswordStrengthIndicatorProps {
  password: string;
  onValidationChange: (isValid: boolean, errors?: string[]) => void;
  showStrength?: boolean;
  showGenerator?: boolean;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  onValidationChange,
  showStrength = true,
  showGenerator = false
}) => {
  const [validation, setValidation] = useState<PasswordValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isBreached, setIsBreached] = useState<boolean | null>(null);
  const [checkingBreach, setCheckingBreach] = useState(false);

  useEffect(() => {
    const validatePassword = async () => {
      if (!password) {
        setValidation(null);
        onValidationChange(false);
        return;
      }

      setIsValidating(true);
      
      try {
        // Tentar validação via Edge Function primeiro
        let result = await PasswordService.validatePassword(password);
        
        // Se falhar, usar validação local
        if (!result.valid && result.errors?.includes('Erro de conexão')) {
          result = PasswordService.validatePasswordLocal(password);
        }
        
        // Se mostrar força, buscar dados de força
        if (showStrength && result.valid) {
          const strengthResult = await PasswordService.getPasswordStrength(password);
          if (strengthResult.strength) {
            result.strength = strengthResult.strength;
          }
        }
        
        setValidation(result);
        onValidationChange(result.valid, result.errors);
      } catch (error) {
        console.error('Erro na validação:', error);
        const fallback = PasswordService.validatePasswordLocal(password);
        setValidation(fallback);
        onValidationChange(fallback.valid, fallback.errors);
      } finally {
        setIsValidating(false);
      }
    };

    const debounceTimer = setTimeout(validatePassword, 300);
    return () => clearTimeout(debounceTimer);
  }, [password, onValidationChange, showStrength]);

  // Verificar vazamento de senha
  useEffect(() => {
    const checkBreach = async () => {
      if (!password || password.length < 4) {
        setIsBreached(null);
        return;
      }

      setCheckingBreach(true);
      try {
        const breached = await PasswordService.checkPasswordBreach(password);
        setIsBreached(breached);
      } catch (error) {
        console.error('Erro ao verificar vazamento:', error);
        setIsBreached(null);
      } finally {
        setCheckingBreach(false);
      }
    };

    const debounceTimer = setTimeout(checkBreach, 1500);
    return () => clearTimeout(debounceTimer);
  }, [password]);

  const getStrengthColor = (level: string) => {
    const colors = {
      'muito-fraca': 'bg-red-500',
      'fraca': 'bg-orange-500',
      'media': 'bg-yellow-500',
      'forte': 'bg-blue-500',
      'muito-forte': 'bg-green-500'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-300';
  };

  const getStrengthText = (level: string) => {
    const texts = {
      'muito-fraca': 'Muito Fraca',
      'fraca': 'Fraca',
      'media': 'Média',
      'forte': 'Forte',
      'muito-forte': 'Muito Forte'
    };
    return texts[level as keyof typeof texts] || 'Desconhecida';
  };

  const generatePassword = () => {
    const newPassword = PasswordService.generateSecurePassword(16);
    // Você precisará implementar uma forma de atualizar o campo de senha
    // Por exemplo, através de um callback prop
    console.log('Senha gerada:', newPassword);
    navigator.clipboard.writeText(newPassword);
    alert('Senha segura gerada e copiada para a área de transferência!');
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-3">
      {/* Indicador de Validação */}
      <div className="flex items-center gap-2">
        {isValidating ? (
          <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
        ) : validation?.valid ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-sm font-medium ${
          validation?.valid ? 'text-green-600' : 'text-red-600'
        }`}>
          {isValidating ? 'Validando...' : 
           validation?.valid ? 'Senha válida!' : 'Senha inválida'}
        </span>
      </div>

      {/* Erros de Validação */}
      {validation?.errors && validation.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-red-800 mb-2">Problemas encontrados:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Indicador de Força */}
      {showStrength && validation?.strength && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Força da Senha:</span>
            <span className={`text-sm font-bold ${
              validation.strength.score >= 6 ? 'text-green-600' : 
              validation.strength.score >= 4 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {getStrengthText(validation.strength.level)}
            </span>
          </div>
          
          {/* Barra de Força */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(validation.strength.level)}`}
              style={{ width: `${(validation.strength.score / 8) * 100}%` }}
            ></div>
          </div>
          
          {/* Feedback */}
          {validation.strength.feedback.length > 0 && (
            <div className="text-xs text-gray-600">
              <p className="font-medium mb-1">Sugestões:</p>
              <ul className="space-y-1">
                {validation.strength.feedback.map((feedback, index) => (
                  <li key={index}>• {feedback}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Verificação de Vazamento */}
      {isBreached !== null && (
        <div className={`border rounded-lg p-3 ${
          isBreached ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center gap-2">
            <Shield className={`h-4 w-4 ${isBreached ? 'text-red-500' : 'text-green-500'}`} />
            <span className={`text-sm font-medium ${
              isBreached ? 'text-red-800' : 'text-green-800'
            }`}>
              {isBreached ? 
                '⚠️ Esta senha foi encontrada em vazamentos de dados!' : 
                '✅ Senha não encontrada em vazamentos conhecidos'
              }
            </span>
          </div>
          {isBreached && (
            <p className="text-xs text-red-700 mt-1">
              Recomendamos escolher uma senha diferente por segurança.
            </p>
          )}
        </div>
      )}

      {checkingBreach && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Verificando vazamentos de dados...
        </div>
      )}

      {/* Gerador de Senha */}
      {showGenerator && (
        <button
          type="button"
          onClick={generatePassword}
          className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Gerar Senha Segura
        </button>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;