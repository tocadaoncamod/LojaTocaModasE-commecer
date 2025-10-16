import { supabase } from '../lib/supabase';
import { whatsappService } from './social/whatsappService';

export interface Notification {
  id: string;
  type: 'order' | 'payment' | 'shipping' | 'promotion' | 'system';
  title: string;
  message: string;
  userId?: string;
  orderId?: string;
  channels: Array<'email' | 'whatsapp' | 'push' | 'sms'>;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  metadata?: Record<string, any>;
}

export class NotificationService {
  async sendOrderConfirmation(orderId: string): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('*, customers(*)')
        .eq('id', orderId)
        .single();

      if (!order) return;

      const notification: Partial<Notification> = {
        type: 'order',
        title: 'Pedido Confirmado',
        message: `Seu pedido #${order.order_number} foi confirmado!`,
        userId: order.customer_id,
        orderId: order.id,
        channels: ['email', 'whatsapp'],
        status: 'pending'
      };

      await this.sendNotification(notification);

      const whatsappAccount = await this.getWhatsAppAccount();
      if (whatsappAccount && order.customer_phone) {
        await whatsappService.sendOrderConfirmation(
          orderId,
          order.customer_phone,
          whatsappAccount.id
        );
      }
    } catch (error) {
      console.error('Error sending order confirmation:', error);
    }
  }

  async sendOrderStatusUpdate(orderId: string, newStatus: string): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (!order) return;

      const statusMessages: Record<string, string> = {
        'confirmed': 'Seu pedido foi confirmado!',
        'processing': 'Seu pedido está sendo preparado!',
        'shipped': 'Seu pedido foi enviado!',
        'delivered': 'Seu pedido foi entregue!'
      };

      const notification: Partial<Notification> = {
        type: 'shipping',
        title: 'Atualização do Pedido',
        message: statusMessages[newStatus] || 'Status do pedido atualizado',
        userId: order.customer_id,
        orderId: order.id,
        channels: ['whatsapp'],
        status: 'pending'
      };

      await this.sendNotification(notification);

      const whatsappAccount = await this.getWhatsAppAccount();
      if (whatsappAccount && order.customer_phone) {
        await whatsappService.sendOrderStatusUpdate(
          orderId,
          newStatus,
          whatsappAccount.id
        );
      }
    } catch (error) {
      console.error('Error sending order status update:', error);
    }
  }

  async sendPromotionNotification(
    customerIds: string[],
    promotion: {
      title: string;
      message: string;
      discount: number;
      products: string[];
    }
  ): Promise<void> {
    try {
      const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .in('id', customerIds);

      if (!customers) return;

      const whatsappAccount = await this.getWhatsAppAccount();

      for (const customer of customers) {
        const notification: Partial<Notification> = {
          type: 'promotion',
          title: promotion.title,
          message: promotion.message,
          userId: customer.id,
          channels: ['whatsapp', 'email'],
          status: 'pending',
          metadata: { discount: promotion.discount }
        };

        await this.sendNotification(notification);

        if (whatsappAccount && customer.phone) {
          await whatsappService.sendPromotionNotification(
            customer.phone,
            {
              title: promotion.title,
              discount: promotion.discount,
              products: promotion.products
            },
            whatsappAccount.id
          );
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Error sending promotion notifications:', error);
    }
  }

  async sendAbandonedCartReminder(customerId: string): Promise<void> {
    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (!customer) return;

      const notification: Partial<Notification> = {
        type: 'system',
        title: 'Carrinho Abandonado',
        message: 'Você esqueceu algo no carrinho! Complete sua compra.',
        userId: customer.id,
        channels: ['whatsapp'],
        status: 'pending'
      };

      await this.sendNotification(notification);

      const whatsappAccount = await this.getWhatsAppAccount();
      if (whatsappAccount) {
        await whatsappService.sendAbandonedCartReminder(
          customerId,
          whatsappAccount.id
        );
      }
    } catch (error) {
      console.error('Error sending abandoned cart reminder:', error);
    }
  }

  async sendProductRecommendation(
    customerId: string,
    productIds: string[]
  ): Promise<void> {
    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (!customer || !customer.phone) return;

      const whatsappAccount = await this.getWhatsAppAccount();
      if (!whatsappAccount) return;

      await whatsappService.sendProductRecommendation(
        customer.phone,
        productIds,
        whatsappAccount.id
      );

      const notification: Partial<Notification> = {
        type: 'system',
        title: 'Recomendação de Produtos',
        message: 'Produtos que você vai adorar!',
        userId: customer.id,
        channels: ['whatsapp'],
        status: 'sent',
        metadata: { productIds }
      };

      await this.sendNotification(notification);
    } catch (error) {
      console.error('Error sending product recommendation:', error);
    }
  }

  async sendPaymentConfirmation(orderId: string): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (!order) return;

      const notification: Partial<Notification> = {
        type: 'payment',
        title: 'Pagamento Confirmado',
        message: `Pagamento do pedido #${order.order_number} confirmado!`,
        userId: order.customer_id,
        orderId: order.id,
        channels: ['email', 'whatsapp'],
        status: 'pending'
      };

      await this.sendNotification(notification);
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
    }
  }

  async broadcastNotification(
    title: string,
    message: string,
    channels: Notification['channels'],
    targetAudience: 'all' | 'active' | 'vip' = 'all'
  ): Promise<{ sent: number; failed: number }> {
    try {
      let query = supabase
        .from('customers')
        .select('*');

      if (targetAudience === 'active') {
        query = query.gt('last_purchase_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());
      } else if (targetAudience === 'vip') {
        query = query.gt('total_spent', 1000);
      }

      const { data: customers } = await query;

      if (!customers) return { sent: 0, failed: 0 };

      let sent = 0;
      let failed = 0;

      for (const customer of customers) {
        try {
          const notification: Partial<Notification> = {
            type: 'system',
            title,
            message,
            userId: customer.id,
            channels,
            status: 'pending'
          };

          await this.sendNotification(notification);
          sent++;
        } catch (error) {
          failed++;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return { sent, failed };
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      return { sent: 0, failed: 0 };
    }
  }

  private async sendNotification(notification: Partial<Notification>): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .insert({
          ...notification,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  private async getWhatsAppAccount(): Promise<any> {
    try {
      const { data } = await supabase
        .from('social_media_accounts')
        .select('*')
        .eq('platform', 'whatsapp')
        .eq('is_connected', true)
        .single();

      return data;
    } catch (error) {
      return null;
    }
  }

  async getNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      return data || [];
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }
}

export const notificationService = new NotificationService();
