// Serviço de gerenciamento de notificações (integração com Supabase)

import { supabase } from '../lib/supabase';

export type NotificationType = 'comment' | 'reaction' | 'jackpot' | 'info' | 'warning' | 'success' | 'moderation_approved' | 'moderation_rejected';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  lotteryName?: string;
  jackpotAmount?: string;
  feedItemId?: string;
  commentId?: string;
  reactionType?: 'like';
  actorName?: string;
  actorEmail?: string;
  rejectionReason?: string;
}

const NOTIFICATIONS_KEY = 'app_notifications';

/**
 * Busca notificações do banco de dados
 */
export async function getNotifications(): Promise<Notification[]> {
  try {
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) return [];

    // Buscar notificações do feed (comentários e reações)
    const { data: feedNotifications, error: feedError } = await supabase
      .from('feed_notifications')
      .select('*')
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false })
      .limit(50);

    if (feedError) {
      console.error('Erro ao buscar notificações do feed:', feedError);
    }

    // Converter notificações do feed para o formato esperado
    const convertedNotifications: Notification[] = (feedNotifications || []).map((n: any) => {
      let title = '';
      let message = '';

      if (n.notification_type === 'comment') {
        title = '💬 Nouveau commentaire';
        message = `${n.actor_name} a commenté votre publication`;
      } else if (n.notification_type === 'reaction') {
        const reactionEmoji = '❤️';
        title = `${reactionEmoji} Nouvelle réaction`;
        message = `${n.actor_name} a réagi à votre publication`;
      } else if (n.notification_type === 'moderation_approved') {
        title = '✅ Publication approuvée';
        message = 'Votre publication a été approuvée et est maintenant visible dans le fil d\'actualité';
      } else if (n.notification_type === 'moderation_rejected') {
        title = '❌ Publication rejetée';
        // Se houver motivo, incluir na mensagem
        const defaultMessage = 'Votre publication a été rejetée par la modération';
        message = n.rejection_reason 
          ? `Votre publication a été rejetée par la modération. Raison : ${n.rejection_reason}`
          : defaultMessage;
      }

      return {
        id: n.id,
        type: n.notification_type as NotificationType,
        title,
        message,
        timestamp: new Date(n.created_at),
        read: n.is_read || false,
        feedItemId: n.feed_item_id,
        commentId: n.comment_id,
        reactionType: n.reaction_type,
        actorName: n.actor_name,
        actorEmail: n.actor_email,
        rejectionReason: n.rejection_reason,
      };
    });

    // Buscar notificações mockadas antigas do localStorage (jackpots, etc)
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const mockNotifications: Notification[] = parsed
          .filter((n: any) => n.type === 'jackpot' || n.type === 'info' || n.type === 'warning' || n.type === 'success')
          .map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }));

        return [...convertedNotifications, ...mockNotifications].sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );
      } catch {
        // Ignorar erro de parsing
      }
    }

    return convertedNotifications;
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return [];
  }
}

/**
 * Marca uma notificação como lida
 */
export async function markAsRead(notificationId: string): Promise<void> {
  try {
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) return;

    // Atualizar no banco se for notificação do feed
    const { error } = await supabase
      .from('feed_notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_email', userEmail);

    if (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }

    // Atualizar no localStorage se for notificação mockada
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const updated = parsed.map((n: any) =>
          n.id === notificationId ? { ...n, read: true } : n
        );
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      } catch {
        // Ignorar erro
      }
    }
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
  }
}

/**
 * Marca todas as notificações como lidas
 */
export async function markAllAsRead(): Promise<void> {
  try {
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) return;

    // Atualizar todas no banco
    const { error } = await supabase
      .from('feed_notifications')
      .update({ is_read: true })
      .eq('user_email', userEmail)
      .eq('is_read', false);

    if (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }

    // Atualizar no localStorage
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const updated = parsed.map((n: any) => ({ ...n, read: true }));
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      } catch {
        // Ignorar erro
      }
    }
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
  }
}

/**
 * Retorna o número de notificações não lidas
 */
export async function getUnreadCount(): Promise<number> {
  try {
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) return 0;

    // Contar notificações não lidas do feed
    const { count, error } = await supabase
      .from('feed_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_email', userEmail)
      .eq('is_read', false);

    if (error) {
      console.error('Erro ao contar notificações não lidas:', error);
      return 0;
    }

    // Contar notificações mockadas não lidas
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    let mockUnreadCount = 0;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        mockUnreadCount = parsed.filter((n: any) => !n.read).length;
      } catch {
        // Ignorar erro
      }
    }

    return (count || 0) + mockUnreadCount;
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    return 0;
  }
}

/**
 * Remove uma notificação
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) return;

    // Deletar do banco se for notificação do feed
    const { error } = await supabase
      .from('feed_notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_email', userEmail);

    if (error) {
      console.error('Erro ao deletar notificação:', error);
    }

    // Deletar do localStorage se for notificação mockada
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const updated = parsed.filter((n: any) => n.id !== notificationId);
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      } catch {
        // Ignorar erro
      }
    }
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
  }
}

/**
 * Formata o tempo relativo (ex: "há 5 minutos")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;

  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}
