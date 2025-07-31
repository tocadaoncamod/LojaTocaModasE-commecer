import React, { useState } from 'react';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Camera,
  Lock,
  Mail,
  Store,
  Phone
} from 'lucide-react';
import { SellerUser } from '../../hooks/useSeller';

interface SellerProfileProps {
  seller: SellerUser;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedSeller: Partial<SellerUser>) => Promise<boolean>;
}

interface ProfileFormData {
  username: string;
  displayName: string;
  email: string;
  storeName: string;
  whatsapp: string;
  profileImage: string;
}

const SellerProfile: React.FC<SellerProfileProps> = ({ 
  seller, 
  isOpen, 
  onClose, 
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    username: seller.username,
    displayName: seller.displayName || seller.username,
    email: seller.email || `${seller.username}@tocadaonca.com`,
    storeName: seller.storeName,
    whatsapp: seller.whatsapp,
    profileImage: seller.profileImage || ''
  });
  const [formErrors, setFormErrors] = useState<Partial<ProfileFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro quando usuário começar a digitar
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<ProfileFormData> = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Nome de usuário é obrigatório';
    }
    
    if (!formData.displayName.trim()) {
      errors.displayName = 'Nome de exibição é obrigatório';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    
    if (!formData.storeName.trim()) {
      errors.storeName = 'Nome da loja é obrigatório';
    }
    
    if (!formData.whatsapp.trim()) {
      errors.whatsapp = 'WhatsApp é obrigatório';
    }
    
    if (formData.profileImage && formData.profileImage.trim()) {
      try {
        new URL(formData.profileImage);
      } catch (_) {
        errors.profileImage = 'URL da imagem inválida';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const updatedSeller: Partial<SellerUser> = {
        username: formData.username,
        displayName: formData.displayName,
        email: formData.email,
        storeName: formData.storeName,
        whatsapp: formData.whatsapp,
        profileImage: formData.profileImage
      };
      
      const success = await onUpdate(updatedSeller);
      
      if (success) {
        setIsEditing(false);
        alert('Perfil atualizado com sucesso!');
      } else {
        alert('Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro inesperado ao salvar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: seller.username,
      displayName: seller.displayName || seller.username,
      email: seller.email || `${seller.username}@tocadaonca.com`,
      storeName: seller.storeName,
      whatsapp: seller.whatsapp,
      profileImage: seller.profileImage || ''
    });
    setFormErrors({});
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              {isEditing ? 'Editar Perfil' : 'Perfil do Vendedor'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {formData.profileImage ? (
                <img
                  src={formData.profileImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center border-4 border-blue-200">
                  <span className="text-blue-600 font-bold text-xl">
                    {getInitials(formData.displayName || formData.username)}
                  </span>
                </div>
              )}
              
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {isEditing && (
              <div className="mt-3 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Foto
                </label>
                <input
                  type="url"
                  value={formData.profileImage}
                  onChange={(e) => handleInputChange('profileImage', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    formErrors.profileImage ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://exemplo.com/foto.jpg"
                />
                {formErrors.profileImage && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.profileImage}</p>
                )}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Nome da Loja */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Store className="h-4 w-4 inline mr-1" />
                Nome da Loja
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => handleInputChange('storeName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.storeName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nome da sua loja"
                />
              ) : (
                <p className="text-gray-900 py-2">{formData.storeName}</p>
              )}
              {formErrors.storeName && (
                <p className="text-red-500 text-xs mt-1">{formErrors.storeName}</p>
              )}
            </div>

            {/* Nome de Exibição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome de Exibição
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.displayName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Seu nome completo"
                />
              ) : (
                <p className="text-gray-900 py-2">{formData.displayName}</p>
              )}
              {formErrors.displayName && (
                <p className="text-red-500 text-xs mt-1">{formErrors.displayName}</p>
              )}
            </div>

            {/* Nome de Usuário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome de Usuário
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nome de usuário para login"
                />
              ) : (
                <p className="text-gray-900 py-2">{formData.username}</p>
              )}
              {formErrors.username && (
                <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="h-4 w-4 inline mr-1" />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="seu@email.com"
                />
              ) : (
                <p className="text-gray-900 py-2">{formData.email}</p>
              )}
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="h-4 w-4 inline mr-1" />
                WhatsApp
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.whatsapp ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(11) 99999-9999"
                />
              ) : (
                <p className="text-gray-900 py-2">{formData.whatsapp}</p>
              )}
              {formErrors.whatsapp && (
                <p className="text-red-500 text-xs mt-1">{formErrors.whatsapp}</p>
              )}
            </div>

            {/* Cargo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo
              </label>
              <p className="text-gray-900 py-2 capitalize">Vendedor</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          {isEditing ? (
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Alterações
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar Perfil
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerProfile;