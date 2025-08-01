import React, { useState } from 'react';
import { Mail, Lock, Phone, Eye, EyeOff, Store, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import CpfCnpjInput from '../components/CpfCnpjInput';

const RegisterSeller: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    whatsapp: '',
    storeName: '',
    cpfCnpj: ''
  });
  const [isCpfCnpjValid, setIsCpfCnpjValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatWhatsApp = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (11) 99999-9999
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleCpfCnpjChange = (value: string, isValid: boolean) => {
    setFormData(prev => ({ ...prev, cpfCnpj: value }));
    setIsCpfCnpjValid(isValid);
    // Limpar erro quando usuário começar a digitar
    if (errors.cpfCnpj) {
      setErrors(prev => ({ ...prev, cpfCnpj: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar email
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar senha
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validar confirmação de senha
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    // Validar WhatsApp
    if (!formData.whatsapp) {
      newErrors.whatsapp = 'WhatsApp é obrigatório';
    } else if (formData.whatsapp.replace(/\D/g, '').length < 10) {
      newErrors.whatsapp = 'WhatsApp deve ter pelo menos 10 dígitos';
    }

    // Validar nome da loja
    if (!formData.storeName) {
      newErrors.storeName = 'Nome da loja é obrigatório';
    } else if (formData.storeName.length < 3) {
      newErrors.storeName = 'Nome da loja deve ter pelo menos 3 caracteres';
    }

    // Validar CPF/CNPJ
    if (!formData.cpfCnpj) {
      newErrors.cpfCnpj = 'CPF ou CNPJ é obrigatório';
    } else if (!isCpfCnpjValid) {
      newErrors.cpfCnpj = 'CPF ou CNPJ inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Registrar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'seller'
          }
        }
      });

      if (authError) {
        console.error('Erro no registro de usuário:', authError);
        alert('Erro ao criar conta: ' + authError.message);
        return;
      }

      if (authData.user) {
        // 2. Inserir dados do vendedor na tabela sellers
        const { data: sellerData, error: sellerError } = await supabase
          .from('sellers')
          .insert([
            {
              user_id: authData.user.id,
              store_name: formData.storeName,
              cpf_cnpj: formData.cpfCnpj,
              whatsapp: formData.whatsapp
            }
          ])
          .select();

        if (sellerError) {
          console.error('Erro ao salvar dados do vendedor:', sellerError);
          alert('Conta criada, mas houve erro ao salvar dados da loja: ' + sellerError.message);
          return;
        }

        console.log('Vendedor registrado com sucesso:', sellerData);
        alert('Conta de vendedor criada com sucesso! Verifique seu email para confirmar a conta.');
        
        // Limpar formulário após sucesso
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          whatsapp: '',
          storeName: '',
          cpfCnpj: ''
        });
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
      alert('Erro inesperado ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-4">
            <span className="text-3xl">🐆</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Registrar como Vendedor
          </h1>
          <p className="text-gray-600">Venda seus produtos na Toca da Onça</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Digite seu email"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Store Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Loja *
            </label>
            <div className="relative">
              <Store className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.storeName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome da sua loja"
              />
            </div>
            {errors.storeName && (
              <p className="text-red-500 text-xs mt-1">{errors.storeName}</p>
            )}
          </div>

          {/* CPF/CNPJ Field */}
          <div>
            <CpfCnpjInput
              value={formData.cpfCnpj}
              onChange={handleCpfCnpjChange}
              label="CPF ou CNPJ *"
              required
              showValidation
            />
            {errors.cpfCnpj && (
              <p className="text-red-500 text-xs mt-1">{errors.cpfCnpj}</p>
            )}
          </div>

          {/* WhatsApp Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', formatWhatsApp(e.target.value))}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.whatsapp ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="(11) 99999-9999"
                maxLength={15}
              />
            </div>
            {errors.whatsapp && (
              <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Senha *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirme sua senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
              Eu concordo com os{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                Termos de Uso para Vendedores
              </a>{' '}
              e{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                Política de Privacidade
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-lg transition-colors duration-300 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Criar Conta de Vendedor'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Já tem uma conta?{' '}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Faça login aqui
            </a>
          </p>
          <p className="text-gray-600 mt-2">
            Quer comprar produtos?{' '}
            <a
              href="#"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Registre-se como comprador
            </a>
          </p>
        </div>

        {/* Divider */}
        <div className="mt-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">ou</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Social Register */}
        <div className="mt-6 space-y-3">
          <button 
            onClick={async () => {
              try {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: window.location.origin
                  }
                });
                if (error) {
                  alert('Erro no registro com Google: ' + error.message);
                }
              } catch (error) {
                alert('Erro inesperado no registro com Google');
              }
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Registrar como Vendedor com Google
          </button>
          <button className="w-full bg-blue-800 hover:bg-blue-900 text-white font-medium py-3 rounded-lg transition-colors duration-300">
            Registrar com Facebook
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterSeller;