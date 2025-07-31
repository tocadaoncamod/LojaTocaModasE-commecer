const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push("Senha muito curta. Mínimo 12 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Adicione pelo menos uma letra maiúscula");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Adicione pelo menos uma letra minúscula");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Adicione pelo menos um número");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|]/.test(password)) {
    errors.push("Adicione pelo menos um símbolo especial (!@#$%^&*)");
  }

  // Verificar padrões comuns fracos
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i,
    /monkey/i,
    /dragon/i
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push("Senha contém padrão muito comum. Escolha algo mais único");
      break;
    }
  }

  // Verificar sequências
  if (/(.)\1{2,}/.test(password)) {
    errors.push("Evite repetir o mesmo caractere 3 vezes seguidas");
  }

  return errors;
}

function calculatePasswordStrength(password: string): {
  score: number;
  level: 'muito-fraca' | 'fraca' | 'media' | 'forte' | 'muito-forte';
  feedback: string[];
} {
  let score = 0;
  const feedback: string[] = [];

  // Comprimento
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  else feedback.push("Aumente o comprimento da senha");

  // Maiúsculas
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Adicione letras maiúsculas");

  // Minúsculas
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Adicione letras minúsculas");

  // Números
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push("Adicione números");

  // Símbolos
  if (/[!@#$%^&*()_+\-=\[\]{};:'",.<>?/\\|]/.test(password)) score += 2;
  else feedback.push("Adicione símbolos especiais");

  // Variedade de caracteres
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score += 1;

  let level: 'muito-fraca' | 'fraca' | 'media' | 'forte' | 'muito-forte';
  if (score <= 2) level = 'muito-fraca';
  else if (score <= 4) level = 'fraca';
  else if (score <= 6) level = 'media';
  else if (score <= 7) level = 'forte';
  else level = 'muito-forte';

  return { score, level, feedback };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'Método não permitido'
    }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { password, action = 'validate' } = await req.json();

    if (!password) {
      return new Response(JSON.stringify({
        valid: false,
        errors: ["Senha é obrigatória"]
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'strength') {
      const strength = calculatePasswordStrength(password);
      return new Response(JSON.stringify({
        valid: strength.score >= 6,
        strength
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const errors = validatePassword(password);

    if (errors.length > 0) {
      return new Response(JSON.stringify({
        valid: false,
        errors: errors
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      valid: true,
      message: "Senha válida e segura!"
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro na validação de senha:', error);
    return new Response(JSON.stringify({
      valid: false,
      errors: ["Erro interno de validação"]
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});