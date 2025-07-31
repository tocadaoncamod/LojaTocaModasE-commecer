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
  Mail
} from 'lucide-react';
import { AdminUser } from '../../types/admin';
import { supabase } from '../../lib/supabase';

interface AdminProfileProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedUser: Partial<AdminUser>) => Promise<boolean>;
  onUpdatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

interface ProfileFormData {
  username: string;
  displayName: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  profileImage: string;
}

const AdminProfile: React.FC<AdminProfileProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onUpdate,
  onUpdatePassword
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    username: user.username,
    displayName: user.displayName || user.username,
    email: user.email || `${user.username}@tocadaonca.com`,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profileImage: user.profileImage || ''
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
    
    // Validação de senha apenas se estiver tentando alterar
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        errors.currentPassword = 'Senha atual é obrigatória para alterar senha';
      }
      
      if (formData.newPassword.length < 6) {
        errors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Confirmação de senha não confere';
      }
    } else {
      const hasProfileChanges = 
        formData.username !== user.username ||
        formData.displayName !== (user.displayName || user.username) ||
        formData.email !== (user.email || `${user.username}@tocadaonca.com`) ||
        formData.profileImage !== (user.profileImage || '');
      
      if (hasProfileChanges && !formData.currentPassword) {
        errors.currentPassword = 'Senha atual é obrigatória para alterar dados do perfil';
      }
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
      const { data: currentUser, error: fetchError } = await supabase
        .from('admin_users')
        .select('id, username, password')
        .eq('id', user.id)
        .single();

      if (fetchError || !currentUser) {
        setFormErrors({ currentPassword: 'Erro ao verificar usuário' });
        return;
      }

      if (formData.currentPassword !== currentUser.password) {
        setFormErrors({ currentPassword: 'Senha atual incorreta' });
        return;
      }

      const updateData: any = {};
      
      if (formData.username !== user.username) {
        updateData.username = formData.username;
      }
      if (formData.displayName !== (user.displayName || user.username)) {
        updateData.display_name = formData.displayName;
      }
      if (formData.email !== (user.email || `${user.username}@tocadaonca.com`)) {
        updateData.email = formData.email;
      }
      if (formData.profileImage !== (user.profileImage || '')) {
        updateData.profile_image = formData.profileImage || null;
      }
      if (formData.newPassword && formData.currentPassword) {
        updateData.password = formData.newPassword;
      }

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        return;
      }

      const { data, error } = await supabase
        .from('admin_users')
        .update(updateData)
        .eq('id', user.id)
        .select();

      if (error) {
        console.error('❌ DIRECT: Supabase error:', error);
        setFormErrors({ displayName: 'Erro ao atualizar perfil' });
        return;
      }

      const updatedUser: Partial<AdminUser> = {
        username: formData.username,
        displayName: formData.displayName,
        email: formData.email,
        profileImage: formData.profileImage
      };
      
      await onUpdate(updatedUser);
      
      setIsEditing(false);
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (error) {
      console.error('❌ DIRECT: Unexpected error:', error);
      setFormErrors({ displayName: 'Erro inesperado ao salvar' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: user.username,
      displayName: user.displayName || user.username,
      email: user.email || `${user.username}@tocadaonca.com`,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      profileImage: user.profileImage || ''
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
              {isEditing ? 'Editar Perfil' : 'Perfil do Admin'}
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

            {/* Cargo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cargo
              </label>
              <p className="text-gray-900 py-2 capitalize">{user.role}</p>
            </div>

            {/* Alterar Senha - apenas no modo de edição */}
            {isEditing && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Alterar Senha
                </h4>
                
                {/* Senha Atual */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha Atual
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Digite sua senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formErrors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.currentPassword}</p>
                  )}
                </div>

                {/* Nova Senha */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Digite a nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formErrors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirme a nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
            )}
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

export default AdminProfile;