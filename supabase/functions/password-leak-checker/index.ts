const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface PasswordCheckRequest {
  password: string;
  email?: string;
}

interface PasswordCheckResponse {
  isLeaked: boolean;
  count?: number;
  message: string;
  severity: 'safe' | 'low' | 'medium' | 'high' | 'critical';
}

// Função para gerar hash SHA-1 seguro
async function generateSHA1Hash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Função para verificar vazamento na API HaveIBeenPwned
async function checkPasswordLeak(password: string): Promise<{ isLeaked: boolean; count: number }> {
  try {
    // Gerar hash SHA-1 da senha
    const fullHash = await generateSHA1Hash(password);
    
    // Usar k-anonymity: enviar apenas os primeiros 5 caracteres
    const prefix = fullHash.substring(0, 5);
    const suffix = fullHash.substring(5);
    
    console.log(`🔍 Verificando hash prefix: ${prefix}`);
    
    // Fazer requisição para a API HaveIBeenPwned
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Toca-da-Onca-Password-Checker/1.0',
        'Add-Padding': 'true' // Adiciona padding para melhor privacidade
      }
    });
    
    if (!response.ok) {
      console.error(`❌ API HaveIBeenPwned retornou status: ${response.status}`);
      throw new Error(`API HaveIBeenPwned indisponível: ${response.status}`);
    }
    
    const responseText = await response.text();
    console.log(`📊 Resposta recebida: ${responseText.split('\n').length} hashes`);
    
    // Procurar o sufixo na resposta
    const lines = responseText.split('\n');
    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix === suffix) {
        const count = parseInt(countStr.trim(), 10);
        console.log(`⚠️ Senha encontrada em vazamentos: ${count} vezes`);
        return { isLeaked: true, count };
      }
    }
    
    console.log(`✅ Senha não encontrada em vazamentos`);
    return { isLeaked: false, count: 0 };
    
  } catch (error) {
    console.error('❌ Erro na verificação de vazamento:', error);
    throw error;
  }
}

// Função para determinar severidade baseada no número de vazamentos
function getSeverity(count: number): 'safe' | 'low' | 'medium' | 'high' | 'critical' {
  if (count === 0) return 'safe';
  if (count <= 10) return 'low';
  if (count <= 100) return 'medium';
  if (count <= 1000) return 'high';
  return 'critical';
}

// Função para gerar mensagem baseada na severidade
function getMessage(isLeaked: boolean, count: number, severity: string): string {
  if (!isLeaked) {
    return '✅ Senha segura! Não foi encontrada em vazamentos conhecidos.';
  }
  
  switch (severity) {
    case 'low':
      return `⚠️ Senha encontrada em ${count} vazamento(s). Considere alterá-la por segurança.`;
    case 'medium':
      return `🔶 Senha encontrada em ${count} vazamentos. Recomendamos fortemente alterá-la.`;
    case 'high':
      return `🔴 Senha encontrada em ${count} vazamentos. É essencial alterá-la imediatamente.`;
    case 'critical':
      return `🚨 CRÍTICO: Senha encontrada em ${count}+ vazamentos. Altere IMEDIATAMENTE!`;
    default:
      return `⚠️ Senha encontrada em vazamentos de dados (${count} vezes).`;
  }
}

// Handler principal da Edge Function
Deno.serve(async (req: Request) => {
  // Tratar requisições OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Aceitar apenas POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Método não permitido. Use POST.',
      isLeaked: false,
      message: 'Erro de método HTTP'
    }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('🔍 Iniciando verificação de vazamento de senha...');
    
    // Parse do body da requisição
    const body: PasswordCheckRequest = await req.json();
    const { password, email } = body;
    
    // Validar entrada
    if (!password) {
      return new Response(JSON.stringify({
        error: 'Senha é obrigatória',
        isLeaked: false,
        message: 'Parâmetro senha não fornecido'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (typeof password !== 'string') {
      return new Response(JSON.stringify({
        error: 'Senha deve ser uma string',
        isLeaked: false,
        message: 'Tipo de dados inválido'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Validar comprimento mínimo
    if (password.length < 4) {
      return new Response(JSON.stringify({
        error: 'Senha muito curta para verificação',
        isLeaked: false,
        message: 'Senha deve ter pelo menos 4 caracteres'
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log(`📧 Verificando senha para: ${email || 'usuário anônimo'}`);
    
    // Verificar vazamento
    const { isLeaked, count } = await checkPasswordLeak(password);
    const severity = getSeverity(count);
    const message = getMessage(isLeaked, count, severity);
    
    // Preparar resposta
    const response: PasswordCheckResponse = {
      isLeaked,
      count: isLeaked ? count : undefined,
      message,
      severity
    };
    
    // Log do resultado
    if (isLeaked) {
      console.log(`⚠️ VAZAMENTO DETECTADO: ${count} vezes, severidade: ${severity}`);
    } else {
      console.log(`✅ Senha segura verificada`);
    }
    
    // Retornar resposta
    const statusCode = isLeaked && severity === 'critical' ? 400 : 200;
    
    return new Response(JSON.stringify(response), { 
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro na Edge Function:', error);
    
    // Determinar tipo de erro
    let errorMessage = 'Erro interno na verificação de vazamento';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('API HaveIBeenPwned indisponível')) {
        errorMessage = 'Serviço de verificação temporariamente indisponível';
        statusCode = 503;
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Erro de conectividade com serviço de verificação';
        statusCode = 503;
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(JSON.stringify({
      error: errorMessage,
      isLeaked: false, // Em caso de erro, assumir que não foi vazada
      message: '⚠️ Não foi possível verificar vazamento. Senha pode ser usada.',
      severity: 'safe'
    }), { 
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});