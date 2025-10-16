# 🚀 Guia de Configuração - Evolution API

## 📋 Pré-requisitos

Você precisa ter:
1. Uma instância da Evolution API rodando no Easypanel
2. Token de autenticação (API Key)
3. Nome da instância criada

## 🔧 Passo a Passo

### 1. Obter as Credenciais da Evolution API

**No seu painel Easypanel:**

1. Acesse sua instância da Evolution API
2. Localize as seguintes informações:
   - **URL da API**: Geralmente algo como `https://evolution.seudominio.com` ou `https://ip:porta`
   - **API Key**: Token de autenticação (geralmente em "Environment Variables" ou "Settings")
   - **Nome da Instância**: Nome que você criou para sua instância WhatsApp

### 2. Configurar as Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto e adicione:

```env
# Evolution API Configuration
VITE_EVOLUTION_API_URL=https://evolution.seudominio.com
VITE_EVOLUTION_API_KEY=sua_api_key_aqui
VITE_EVOLUTION_INSTANCE_NAME=nome_da_sua_instancia
```

**Exemplo real:**
```env
VITE_EVOLUTION_API_URL=https://evolution.easypanel.app
VITE_EVOLUTION_API_KEY=B6D9F2A1C3E7H8K5M9P4R2T6W1Y3Z7
VITE_EVOLUTION_INSTANCE_NAME=minha_loja
```

### 3. Criar uma Instância (se ainda não criou)

**Via API da Evolution:**

```bash
curl -X POST https://evolution.seudominio.com/instance/create \
  -H "apikey: SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "minha_loja",
    "token": "TOKEN_OPCIONAL",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }'
```

**Ou pelo painel da Evolution** (se disponível).

### 4. Conectar o WhatsApp

Depois de configurar o `.env`:

1. **Reinicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Acesse o painel admin:**
   - Login como admin
   - Vá para "WhatsApp (Evolution)"

3. **Escaneie o QR Code:**
   - Se a instância não estiver conectada, um QR Code aparecerá
   - Abra o WhatsApp no celular
   - Vá em Configurações → Aparelhos conectados → Conectar um aparelho
   - Escaneie o QR Code mostrado no painel

4. **Configure o Webhook:**
   - Clique no botão "Configurar Webhook"
   - Isso configurará automaticamente a URL:
     ```
     https://lvadkjctlezztvabgovz.supabase.co/functions/v1/evolution-webhook
     ```

### 5. Testar a Integração

**No site:**
1. Clique no botão verde flutuante "Fale Conosco"
2. Preencha o formulário
3. Envie uma mensagem
4. Você deve receber a mensagem no WhatsApp configurado

**No painel admin:**
1. Vá para "WhatsApp (Evolution)" → aba "Conversas"
2. Você verá as conversas recebidas
3. Clique em uma conversa para responder
4. Teste enviando uma mensagem

## 🔍 Solução de Problemas

### Status: Desconectado

**Causa:** Credenciais não configuradas ou incorretas

**Solução:**
1. Verifique se as variáveis estão corretas no `.env`
2. Verifique se a URL da API está acessível
3. Teste a API manualmente:
   ```bash
   curl -X GET https://evolution.seudominio.com/instance/connect/nome_instancia \
     -H "apikey: SUA_API_KEY"
   ```

### QR Code não aparece

**Causa:** Instância já conectada ou erro na API

**Solução:**
1. Clique em "Atualizar Status"
2. Se já estiver conectada, não precisa de QR Code
3. Se não aparecer, verifique os logs da Evolution API

### Mensagens não são recebidas

**Causa:** Webhook não configurado ou URL incorreta

**Solução:**
1. Configure o webhook pelo painel admin
2. Verifique se a Edge Function está deployada:
   ```
   https://lvadkjctlezztvabgovz.supabase.co/functions/v1/evolution-webhook
   ```
3. Teste o webhook manualmente:
   ```bash
   curl -X POST https://lvadkjctlezztvabgovz.supabase.co/functions/v1/evolution-webhook \
     -H "Content-Type: application/json" \
     -d '{"event":"test"}'
   ```

### Erro de CORS

**Causa:** Configuração de CORS na Evolution API

**Solução:**
1. Verifique as configurações de CORS na Evolution
2. Adicione o domínio do seu site nos allowed origins
3. Se rodando localmente, adicione `http://localhost:5173`

## 📱 Endpoints da Evolution API

### Verificar Status
```
GET /instance/connect/{instanceName}
Headers: apikey: SUA_API_KEY
```

### Enviar Mensagem
```
POST /message/sendText/{instanceName}
Headers: apikey: SUA_API_KEY
Body: {
  "number": "5511999999999",
  "text": "Olá!"
}
```

### Configurar Webhook
```
POST /webhook/set/{instanceName}
Headers: apikey: SUA_API_KEY
Body: {
  "url": "https://lvadkjctlezztvabgovz.supabase.co/functions/v1/evolution-webhook",
  "enabled": true,
  "events": ["messages.upsert", "connection.update"]
}
```

## 📞 Suporte

Se precisar de ajuda:
1. Verifique a documentação da Evolution API
2. Cheque os logs do Supabase Edge Functions
3. Verifique os logs do console do navegador (F12)

## ✅ Checklist de Configuração

- [ ] Evolution API rodando e acessível
- [ ] Variáveis de ambiente configuradas no `.env`
- [ ] Servidor reiniciado após configuração
- [ ] QR Code escaneado (se necessário)
- [ ] Webhook configurado
- [ ] Status mostrando "✓ Conectado"
- [ ] Teste de envio realizado
- [ ] Teste de recebimento realizado

---

**Última atualização:** $(date)
