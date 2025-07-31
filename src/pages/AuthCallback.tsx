import React, { useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthCallback: React.FC = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processando callback de autenticação...');
        console.log('📍 URL atual:', window.location.href);
        
        // 1. Verificar se há parâmetros de erro na URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlError = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        if (urlError) {
          console.error('❌ Erro no callback:', urlError, errorDescription);
          
          // Tratar erros específicos
          if (urlError === 'access_denied') {
            console.log('ℹ️ Usuário cancelou o login');
          } else {
            alert('Erro na autenticação: ' + (errorDescription || urlError));
          }
          
          window.location.href = '/';
          return;
        }
        
        // 2. Processar hash fragment se existir
        if (window.location.hash) {
          console.log('🔗 Hash fragment detectado:', window.location.hash);
        }
        
        // 3. Tentar obter a sessão atual
        console.log('🔍 Verificando sessão...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Erro ao obter sessão:', sessionError);
          alert('Erro ao obter sessão: ' + sessionError.message);
          window.location.href = '/';
          return;
        }

        // 4. Verificar se a sessão existe
        if (sessionData.session && sessionData.session.user) {
          console.log('✅ Login realizado com sucesso:', sessionData.session.user.email);
          
          // Salvar dados do usuário no localStorage se necessário
          localStorage.setItem('user_logged_in', 'true');
          localStorage.setItem('user_email', sessionData.session.user.email || '');
          
          // Mostrar feedback de sucesso
          const userName = sessionData.session.user.user_metadata?.name || 
                          sessionData.session.user.user_metadata?.full_name ||
                          sessionData.session.user.email?.split('@')[0] ||
                          'Usuário';
          
          alert(`✅ Login realizado com sucesso!\nBem-vindo, ${userName}!`);
          
          // Redirecionar para a página principal
          window.location.href = '/';
        } else {
          console.log('⚠️ Nenhuma sessão encontrada após callback');
          
          // Tentar processar tokens da URL manualmente
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken) {
            console.log('🔑 Tokens encontrados na URL, processando...');
            
            try {
              const { data: userResponse, error: userError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
              });
              
              if (userError) {
                throw userError;
              }
              
              if (userResponse.session) {
                console.log('✅ Sessão criada com sucesso');
                alert('Login realizado com sucesso!');
                window.location.href = '/';
                return;
              }
            } catch (tokenError) {
              console.error('❌ Erro ao processar tokens:', tokenError);
            }
          }
          
          console.log('ℹ️ Redirecionando para página inicial...');
          window.location.href = '/';
        }
      } catch (error) {
        console.error('❌ Erro inesperado no callback:', error);
        
        // Não mostrar alert para erros de rede/conexão
        if (error instanceof Error && !error.message.includes('fetch')) {
          alert('Erro inesperado: ' + error.message);
        }
        
        window.location.href = '/';
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-4">
          <span className="text-3xl">🐆</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Processando Login...
        </h1>
        <p className="text-gray-600 mb-6">
          Aguarde enquanto finalizamos seu login
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;