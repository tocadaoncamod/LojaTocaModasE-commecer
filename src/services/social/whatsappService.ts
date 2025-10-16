import { supabase } from '../../lib/supabase';
import { WhatsAppMessage, WhatsAppTemplate, WhatsAppConversation, SocialMediaAccount } from '../../types/social';

export class WhatsAppService {
  private readonly apiUrl = 'https://graph.facebook.com/v18.0';

  async connectAccount(
    phoneNumberId: string,
    accessToken: string,
    businessAccountId: string
  ): Promise<SocialMediaAccount> {
    try {
      const account: Partial<SocialMediaAccount> = {
        platform: 'whatsapp',
        accountId: phoneNumberId,
        accountName: 'WhatsApp Business',
        accessToken,
        isConnected: true,
        lastSync: new Date(),
        settings: {
          phoneNumberId,
          businessAccountId
        }
      };

      const { data: savedAccount, error } = await supabase
        .from('social_media_accounts')
        .upsert(account)
        .select()
        .single();

      if (error) throw error;

      return savedAccount;
    } catch (error) {
      console.error('Error connecting WhatsApp account:', error);
      throw error;
    }
  }

  async sendTextMessage(to: string, message: string, accountId: string): Promise<WhatsAppMessage> {
    try {
      const { data: account } = await supabase
        .from('social_media_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('platform', 'whatsapp')
        .single();

      if (!account || !account.access_token) {
        throw new Error('WhatsApp account not connected');
      }

      const response = await fetch(
        `${this.apiUrl}/${account.settings.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${account.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            type: 'text',
            text: { body: message }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send WhatsApp message');
      }

      const result = await response.json();

      const whatsappMessage: Partial<WhatsAppMessage> = {
        to,
        type: 'text',
        content: message,
        status: 'sent',
        sentAt: new Date()
      };

      const { data: savedMessage, error } = await supabase
        .from('whatsapp_messages')
        .insert(whatsappMessage)
        .select()
        .single();

      if (error) throw error;

      return savedMessage;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    variables: string[],
    accountId: string
  ): Promise<WhatsAppMessage> {
    try {
      const { data: account } = await supabase
        .from('social_media_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('platform', 'whatsapp')
        .single();

      if (!account || !account.access_token) {
        throw new Error('WhatsApp account not connected');
      }

      const components = variables.map((value, index) => ({
        type: 'body',
        parameters: [{ type: 'text', text: value }]
      }));

      const response = await fetch(
        `${this.apiUrl}/${account.settings.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${account.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            type: 'template',
            template: {
              name: templateName,
              language: { code: 'pt_BR' },
              components
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send template message');
      }

      const whatsappMessage: Partial<WhatsAppMessage> = {
        to,
        type: 'template',
        content: `Template: ${templateName}`,
        templateName,
        status: 'sent',
        sentAt: new Date()
      };

      const { data: savedMessage, error } = await supabase
        .from('whatsapp_messages')
        .insert(whatsappMessage)
        .select()
        .single();

      if (error) throw error;

      return savedMessage;
    } catch (error) {
      console.error('Error sending template message:', error);
      throw error;
    }
  }

  async sendOrderConfirmation(orderId: string, customerPhone: string, accountId: string): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();

      if (!order) {
        throw new Error('Order not found');
      }

      const message = `
🎉 *Pedido Confirmado!*

Número do pedido: *${order.order_number}*
Total: *R$ ${order.total.toFixed(2)}*

Itens:
${order.order_items.map((item: any) => `• ${item.quantity}x ${item.product_name}`).join('\n')}

Status: ${order.status}

Acompanhe seu pedido: ${window.location.origin}/order-confirmation/${order.order_number}

Obrigado pela sua compra! 🛍️
      `.trim();

      await this.sendTextMessage(customerPhone, message, accountId);
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      throw error;
    }
  }

  async sendOrderStatusUpdate(orderId: string, newStatus: string, accountId: string): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (!order) {
        throw new Error('Order not found');
      }

      const statusMessages: Record<string, string> = {
        'confirmed': '✅ Seu pedido foi confirmado!',
        'processing': '📦 Seu pedido está sendo preparado!',
        'shipped': '🚚 Seu pedido foi enviado!',
        'delivered': '🎉 Seu pedido foi entregue!'
      };

      const message = `
${statusMessages[newStatus] || 'Atualização do pedido'}

Pedido: *${order.order_number}*
Status: *${newStatus}*

Acompanhe: ${window.location.origin}/order-confirmation/${order.order_number}
      `.trim();

      await this.sendTextMessage(order.customer_phone, message, accountId);
    } catch (error) {
      console.error('Error sending order status update:', error);
      throw error;
    }
  }

  async sendProductRecommendation(
    customerPhone: string,
    productIds: string[],
    accountId: string
  ): Promise<void> {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds)
        .limit(3);

      if (!products || products.length === 0) return;

      const message = `
🌟 *Produtos que você vai adorar!*

${products.map((p: any) =>
  `• *${p.name}*\n  R$ ${p.price.toFixed(2)}\n  ${window.location.origin}/product/${p.id}`
).join('\n\n')}

Confira nossa loja completa: ${window.location.origin}
      `.trim();

      await this.sendTextMessage(customerPhone, message, accountId);
    } catch (error) {
      console.error('Error sending product recommendation:', error);
      throw error;
    }
  }

  async sendPromotionNotification(
    customerPhone: string,
    promotionDetails: {
      title: string;
      discount: number;
      products: string[];
    },
    accountId: string
  ): Promise<void> {
    try {
      const message = `
🎁 *${promotionDetails.title}*

Aproveite *${promotionDetails.discount}% de desconto*!

Válido para produtos selecionados.

Acesse agora: ${window.location.origin}

Não perca! 🏃‍♀️💨
      `.trim();

      await this.sendTextMessage(customerPhone, message, accountId);
    } catch (error) {
      console.error('Error sending promotion notification:', error);
      throw error;
    }
  }

  async sendAbandonedCartReminder(customerId: string, accountId: string): Promise<void> {
    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('*, cart_items(*)')
        .eq('id', customerId)
        .single();

      if (!customer || !customer.cart_items?.length) return;

      const message = `
🛒 *Você esqueceu algo no carrinho!*

Temos ${customer.cart_items.length} produto(s) esperando por você.

Complete sua compra agora e aproveite!

${window.location.origin}/checkout
      `.trim();

      await this.sendTextMessage(customer.phone, message, accountId);
    } catch (error) {
      console.error('Error sending abandoned cart reminder:', error);
      throw error;
    }
  }

  async handleIncomingMessage(
    from: string,
    message: string,
    accountId: string
  ): Promise<void> {
    try {
      await supabase
        .from('whatsapp_messages')
        .insert({
          from,
          to: accountId,
          type: 'text',
          content: message,
          status: 'delivered'
        });

      let { data: conversation } = await supabase
        .from('whatsapp_conversations')
        .select('*')
        .eq('customer_phone', from)
        .single();

      if (!conversation) {
        const { data: newConversation } = await supabase
          .from('whatsapp_conversations')
          .insert({
            customer_phone: from,
            status: 'open',
            last_message_at: new Date(),
            unread_count: 1
          })
          .select()
          .single();

        conversation = newConversation;
      } else {
        await supabase
          .from('whatsapp_conversations')
          .update({
            last_message_at: new Date(),
            unread_count: conversation.unread_count + 1
          })
          .eq('id', conversation.id);
      }

      await this.processAutomatedResponse(from, message, accountId);
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  }

  private async processAutomatedResponse(
    to: string,
    incomingMessage: string,
    accountId: string
  ): Promise<void> {
    const lowerMessage = incomingMessage.toLowerCase();

    if (lowerMessage.includes('ola') || lowerMessage.includes('oi')) {
      await this.sendTextMessage(
        to,
        'Olá! Bem-vindo à nossa loja! Como posso ajudar você hoje?',
        accountId
      );
    } else if (lowerMessage.includes('pedido') || lowerMessage.includes('rastrear')) {
      await this.sendTextMessage(
        to,
        'Para rastrear seu pedido, acesse: ' + window.location.origin + '/orders',
        accountId
      );
    } else if (lowerMessage.includes('catalogo') || lowerMessage.includes('produtos')) {
      await this.sendTextMessage(
        to,
        'Confira nosso catálogo completo em: ' + window.location.origin,
        accountId
      );
    }
  }

  async getConversations(accountId: string): Promise<WhatsAppConversation[]> {
    try {
      const { data: conversations } = await supabase
        .from('whatsapp_conversations')
        .select('*, whatsapp_messages(*)')
        .order('last_message_at', { ascending: false })
        .limit(50);

      return conversations || [];
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      await supabase
        .from('whatsapp_conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }

  async closeConversation(conversationId: string): Promise<void> {
    try {
      await supabase
        .from('whatsapp_conversations')
        .update({ status: 'closed' })
        .eq('id', conversationId);
    } catch (error) {
      console.error('Error closing conversation:', error);
    }
  }

  async broadcastMessage(
    phoneNumbers: string[],
    message: string,
    accountId: string
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const phone of phoneNumbers) {
      try {
        await this.sendTextMessage(phone, message, accountId);
        success++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        failed++;
      }
    }

    return { success, failed };
  }
}

export const whatsappService = new WhatsAppService();
