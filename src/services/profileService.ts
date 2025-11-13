// Serviço de gerenciamento de perfil
// Utiliza localStorage como mock, mas pode ser facilmente adaptado para Supabase

export interface UserProfile {
  name: string;
  email: string;
  photoUrl: string | null;
  has10x?: boolean;
}

const PROFILE_KEY = 'user_profile';

/**
 * Retorna o perfil do usuário do localStorage
 */
export function getProfile(): UserProfile {
  const stored = localStorage.getItem(PROFILE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Retorna perfil padrão se não existir
  return {
    name: 'Utilisateur',
    email: localStorage.getItem('user_email') || 'user@example.com',
    photoUrl: null
  };
}

/**
 * Atualiza o perfil do usuário no localStorage
 */
export function updateProfile(updates: { name?: string; photo?: File | null; has10x?: boolean }): Promise<UserProfile> {
  return new Promise((resolve, reject) => {
    try {
      const currentProfile = getProfile();
      
      // Atualiza o nome se fornecido
      if (updates.name !== undefined) {
        currentProfile.name = updates.name;
      }
      
      // Atualiza has10x se fornecido
      if (updates.has10x !== undefined) {
        currentProfile.has10x = updates.has10x;
      }
      
      // Processa a foto se fornecida
      if (updates.photo) {
        // Valida o tamanho (máx 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB em bytes
        if (updates.photo.size > maxSize) {
          reject(new Error('La photo ne doit pas dépasser 2 Mo'));
          return;
        }
        
        // Valida o tipo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(updates.photo.type)) {
          reject(new Error('Formats acceptés : .jpg, .jpeg, .png'));
          return;
        }
        
        // Converte para base64 e salva
        const reader = new FileReader();
        reader.onload = (e) => {
          currentProfile.photoUrl = e.target?.result as string;
          localStorage.setItem(PROFILE_KEY, JSON.stringify(currentProfile));
          resolve(currentProfile);
        };
        reader.onerror = () => {
          reject(new Error('Erreur lors du chargement de la photo'));
        };
        reader.readAsDataURL(updates.photo);
        return;
      }
      
      // Se não houver foto para processar, salva imediatamente
      localStorage.setItem(PROFILE_KEY, JSON.stringify(currentProfile));
      resolve(currentProfile);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Mock de requisição de reembolso
 */
export interface RefundRequest {
  reason: string;
  email: string;
}

export function requestRefund(data: RefundRequest): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    // Simula delay de rede
    setTimeout(() => {
      // Mock POST para /support/refund-request
      console.log('POST /support/refund-request:', data);
      
      resolve({
        success: true,
        message: 'Demande envoyée !'
      });
    }, 1000);
  });
}


