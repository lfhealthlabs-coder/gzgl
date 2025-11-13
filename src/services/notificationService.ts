// Serviço de gerenciamento de notificações

export type NotificationType = 'jackpot' | 'info' | 'warning' | 'success';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  lotteryName?: string;
  jackpotAmount?: string;
}

const NOTIFICATIONS_KEY = 'app_notifications';

/**
 * Gera notificações mockadas de jackpots sorteados
 */
function generateMockNotifications(): Notification[] {
  const now = new Date();
  
  return [
    {
      id: '1',
      type: 'jackpot',
      title: '🎰 Jackpot Mega Sena Tiré !',
      message: 'Le tirage de Mega Sena a été effectué ! Vérifiez vos numéros maintenant.',
      timestamp: new Date(now.getTime() - 5 * 60000), // 5 minutos atrás
      read: false,
      lotteryName: 'Mega Sena',
      jackpotAmount: '45.000.000 €'
    },
    {
      id: '2',
      type: 'jackpot',
      title: '🎰 Nouveau Résultat - Quina',
      message: 'Le tirage de Quina vient d\'avoir lieu ! Vérifiez si vous êtes le chanceux.',
      timestamp: new Date(now.getTime() - 2 * 60 * 60000), // 2 horas atrás
      read: false,
      lotteryName: 'Quina',
      jackpotAmount: '8.500.000 €'
    },
    {
      id: '3',
      type: 'info',
      title: '📢 Bienvenue sur LOTTO APP',
      message: 'Configurez vos notifications pour recevoir des alertes de tirages en temps réel.',
      timestamp: new Date(now.getTime() - 24 * 60 * 60000), // 1 dia atrás
      read: true
    },
    {
      id: '4',
      type: 'jackpot',
      title: '🎰 Lotofácil - Résultat Disponible',
      message: 'Le résultat de Lotofácil est disponible. Vérifiez vos billets !',
      timestamp: new Date(now.getTime() - 5 * 60 * 60000), // 5 horas atrás
      read: false,
      lotteryName: 'Lotofácil',
      jackpotAmount: '1.200.000 €'
    }
  ];
}

/**
 * Retorna todas as notificações
 */
export function getNotifications(): Notification[] {
  const stored = localStorage.getItem(NOTIFICATIONS_KEY);
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      
      // Verifica se há notificações em português (versão antiga)
      const hasPortugueseNotifications = parsed.some((n: any) => 
        n.message?.includes('Verifique seus números') || 
        n.title?.includes('Sorteado') ||
        n.message?.includes('foi o sortudo')
      );
      
      // Se encontrar notificações antigas em português, regenera em francês
      if (hasPortugueseNotifications) {
        const mockNotifications = generateMockNotifications();
        saveNotifications(mockNotifications);
        return mockNotifications;
      }
      
      // Converte strings de data de volta para objetos Date
      return parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    } catch {
      // Se houver erro ao parsear, regenera
      const mockNotifications = generateMockNotifications();
      saveNotifications(mockNotifications);
      return mockNotifications;
    }
  }
  
  // Se não houver notificações salvas, cria as mockadas
  const mockNotifications = generateMockNotifications();
  saveNotifications(mockNotifications);
  return mockNotifications;
}

/**
 * Salva notificações no localStorage
 */
function saveNotifications(notifications: Notification[]): void {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

/**
 * Marca uma notificação como lida
 */
export function markAsRead(notificationId: string): void {
  const notifications = getNotifications();
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  saveNotifications(updated);
}

/**
 * Marca todas as notificações como lidas
 */
export function markAllAsRead(): void {
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
}

/**
 * Retorna o número de notificações não lidas
 */
export function getUnreadCount(): number {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
}

/**
 * Adiciona uma nova notificação (para uso futuro)
 */
export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
  const notifications = getNotifications();
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    timestamp: new Date(),
    read: false
  };
  
  notifications.unshift(newNotification); // Adiciona no início
  saveNotifications(notifications);
}

/**
 * Remove uma notificação
 */
export function deleteNotification(notificationId: string): void {
  const notifications = getNotifications();
  const updated = notifications.filter(n => n.id !== notificationId);
  saveNotifications(updated);
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

