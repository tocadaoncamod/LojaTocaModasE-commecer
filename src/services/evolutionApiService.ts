import { supabase } from '../lib/supabase';

export interface EvolutionMessage {
  remoteJid: string;
  fromMe: boolean;
  messageTimestamp: number;
  pushName?: string;
  message: {
    conversation?: string;
    extendedTextMessage?: {
      text: string;
    };
  };
}

export interface SendMessagePayload {
  number: string;
  text: string;
  delay?: number;
}

export interface InstanceInfo {
  instance: {
    instanceName: string;
    status: string;
  };
  qrcode?: {
    code: string;
    base64: string;
  };
}

export class EvolutionApiService {
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly instanceName: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_EVOLUTION_API_URL || '';
    this.apiKey = import.meta.env.VITE_EVOLUTION_API_KEY || '';
    this.instanceName = import.meta.env.VITE_EVOLUTION_INSTANCE_NAME || '';
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'apikey': this.apiKey
    };
  }

  async sendTextMessage(number: string, text: string): Promise<any> {
    try {
      const payload: SendMessagePayload = {
        number: this.formatPhoneNumber(number),
        text
      };

      const response = await fetch(
        `${this.apiUrl}/message/sendText/${this.instanceName}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const result = await response.json();

      await this.saveMessageToDatabase({
        to_number: number,
        from_number: this.instanceName,
        message_type: 'text',
        content: text,
        status: 'sent',
        sent_at: new Date()
      });

      return result;
    } catch (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
  }

  async sendMediaMessage(
    number: string,
    mediaUrl: string,
    caption?: string,
    mediaType: 'image' | 'video' | 'document' = 'image'
  ): Promise<any> {
    try {
      const payload = {
        number: this.formatPhoneNumber(number),
        mediaUrl,
        caption
      };

      const response = await fetch(
        `${this.apiUrl}/message/send${this.capitalize(mediaType)}/${this.instanceName}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send media: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending media message:', error);
      throw error;
    }
  }

  async getInstanceInfo(): Promise<InstanceInfo> {
    try {
      const response = await fetch(
        `${this.apiUrl}/instance/connect/${this.instanceName}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get instance info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting instance info:', error);
      throw error;
    }
  }

  async getQRCode(): Promise<string | null> {
    try {
      const info = await this.getInstanceInfo();
      return info.qrcode?.base64 || null;
    } catch (error) {
      console.error('Error getting QR code:', error);
      return null;
    }
  }

  async getInstanceStatus(): Promise<string> {
    try {
      const info = await this.getInstanceInfo();
      return info.instance.status;
    } catch (error) {
      console.error('Error getting instance status:', error);
      return 'disconnected';
    }
  }

  async fetchMessages(): Promise<EvolutionMessage[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/chat/findMessages/${this.instanceName}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  async sendOrderConfirmation(orderId: string, customerPhone: string): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();

      if (!order) return;

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

      await this.sendTextMessage(customerPhone, message);
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      throw error;
    }
  }

  async sendPromotionMessage(customerPhone: string, promotion: {
    title: string;
    discount: number;
    details: string;
  }): Promise<void> {
    try {
      const message = `
🎁 *${promotion.title}*

Aproveite *${promotion.discount}% de desconto*!

${promotion.details}

Acesse agora: ${window.location.origin}

Não perca! 🏃‍♀️💨
      `.trim();

      await this.sendTextMessage(customerPhone, message);
    } catch (error) {
      console.error('Error sending promotion message:', error);
      throw error;
    }
  }

  async sendBulkMessages(
    phoneNumbers: string[],
    message: string,
    delay: number = 2000
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const phone of phoneNumbers) {
      try {
        await this.sendTextMessage(phone, message);
        success++;
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (error) {
        failed++;
      }
    }

    return { success, failed };
  }

  async setWebhook(webhookUrl: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiUrl}/webhook/set/${this.instanceName}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            url: webhookUrl,
            enabled: true,
            events: [
              'messages.upsert',
              'messages.update',
              'connection.update'
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to set webhook: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error setting webhook:', error);
      throw error;
    }
  }

  async getWebhookInfo(): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiUrl}/webhook/find/${this.instanceName}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get webhook info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting webhook info:', error);
      throw error;
    }
  }

  private formatPhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');

    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }

    return cleaned;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private async saveMessageToDatabase(message: any): Promise<void> {
    try {
      await supabase
        .from('whatsapp_messages')
        .insert(message);
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  }

  isConfigured(): boolean {
    return !!(this.apiUrl && this.apiKey && this.instanceName);
  }
}

export const evolutionApiService = new EvolutionApiService();
