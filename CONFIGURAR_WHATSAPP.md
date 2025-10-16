# 🟢 Como Conectar o WhatsApp

## ⚠️ Status Atual: DESCONECTADO

Para conectar, siga estes 3 passos simples:

---

## 📝 PASSO 1: Editar o arquivo .env

Abra o arquivo `.env` na raiz do projeto e adicione suas credenciais:

```env
VITE_EVOLUTION_API_URL=https://sua-evolution-api.com
VITE_EVOLUTION_API_KEY=seu_token_de_api
VITE_EVOLUTION_INSTANCE_NAME=nome_da_instancia
```

### 🔍 Onde encontrar essas informações?

**No seu Easypanel:**
1. **URL**: Acesse Evolution API → copie a URL da aplicação
2. **API Key**: Vá em Settings/Environment → procure por "API_KEY" ou "AUTHENTICATION_API_KEY"
3. **Instance Name**: Nome que você deu para sua instância WhatsApp

---

## 🔄 PASSO 2: Reiniciar o Servidor

Após salvar o `.env`, execute:

```bash
npm run dev
```

---

## 📱 PASSO 3: Escanear QR Code

1. Acesse o painel admin do seu site
2. Vá em **"WhatsApp (Evolution)"**
3. Um QR Code aparecerá na tela
4. Abra o WhatsApp no celular
5. Vá em **Configurações** → **Aparelhos conectados** → **Conectar um aparelho**
6. Escaneie o QR Code

**Pronto!** O status mudará para "✓ Conectado"

---

## 🆘 Problemas?

### Não sei minhas credenciais
- Entre em contato com quem configurou o Easypanel
- Ou acesse o painel do Easypanel e procure pela aplicação Evolution API

### QR Code não aparece
- Verifique se as credenciais no `.env` estão corretas
- Clique em "Atualizar" no painel
- Verifique se a URL da Evolution API está acessível

### Status continua desconectado
- Reinicie o servidor (`npm run dev`)
- Verifique os logs do console (F12 no navegador)
- Teste a URL da API no navegador: `https://sua-api.com/instance/fetchInstances`

---

## ✅ Exemplo Real

Se suas credenciais fossem:
- URL: `https://evolution.minhaempresa.com`
- API Key: `ABC123XYZ789`
- Instance: `loja_whatsapp`

O `.env` ficaria:

```env
VITE_EVOLUTION_API_URL=https://evolution.minhaempresa.com
VITE_EVOLUTION_API_KEY=ABC123XYZ789
VITE_EVOLUTION_INSTANCE_NAME=loja_whatsapp
```

---

**Precisa de mais ajuda?** Consulte `EVOLUTION_API_SETUP.md` para instruções detalhadas.
