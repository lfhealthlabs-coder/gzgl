// Serviço de gerenciamento de perfil integrado com Supabase
import { supabase } from '../lib/supabase';

export interface UserProfile {
  name: string;
  email: string;
  photoUrl: string | null;
}

/**
 * Retorna o perfil do usuário do Supabase
 */
export async function getProfile(): Promise<UserProfile> {
  const email = localStorage.getItem('user_email');
  
  if (!email) {
    return {
      name: 'Utilisateur',
      email: 'user@example.com',
      photoUrl: null
    };
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    // Se não encontrar, cria um perfil padrão
    const defaultProfile = {
      name: 'Utilisateur',
      email,
      photo_url: null,
      last_login_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert(defaultProfile);

    if (insertError) {
      console.error('Erro ao criar perfil:', insertError);
    }

    return {
      name: defaultProfile.name,
      email: defaultProfile.email,
      photoUrl: defaultProfile.photo_url
    };
  }

  // Atualizar último acesso
  await supabase
    .from('user_profiles')
    .update({ ultimo_acesso: new Date().toISOString() })
    .eq('email', email);

  return {
    name: data.name,
    email: data.email,
    photoUrl: data.photo_url
  };
}

/**
 * Cria ou atualiza o perfil do usuário ao fazer login
 */
export async function loginUser(email: string): Promise<UserProfile> {
  // Verificar se o perfil já existe
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (existingProfile) {
    // Atualizar último acesso
    await supabase
      .from('user_profiles')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('email', email);

    return {
      name: existingProfile.name,
      email: existingProfile.email,
      photoUrl: existingProfile.photo_url
    };
  }

  // Criar novo perfil
  const newProfile = {
    name: 'Utilisateur',
    email,
    photo_url: null,
    ultimo_acesso: new Date().toISOString()
  };

  const { error } = await supabase
    .from('user_profiles')
    .insert(newProfile);

  if (error) {
    console.error('Erro ao criar perfil no login:', error);
  }

  return {
    name: newProfile.name,
    email: newProfile.email,
    photoUrl: newProfile.photo_url
  };
}

/**
 * Atualiza o perfil do usuário no Supabase
 */
export async function updateProfile(updates: { 
  name?: string; 
  photo?: File | null;
}): Promise<UserProfile> {
  const email = localStorage.getItem('user_email');
  
  if (!email) {
    throw new Error('Email não encontrado');
  }

  let photoUrl: string | null = null;

  // Processa upload da foto se fornecida
  if (updates.photo) {
    // Valida o tamanho (máx 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (updates.photo.size > maxSize) {
      throw new Error('La photo ne doit pas dépasser 2 Mo');
    }

    // Valida o tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(updates.photo.type)) {
      throw new Error('Formats acceptés : .jpg, .jpeg, .png');
    }

    // Gera nome único para o arquivo
    const fileExt = updates.photo.name.split('.').pop();
    const fileName = `${email.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.${fileExt}`;

    // Upload para o Supabase Storage
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, updates.photo, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      throw new Error('Erreur lors du téléchargement de la photo');
    }

    // Obtém a URL pública
    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(uploadData.path);

    photoUrl = urlData.publicUrl;
  }

  // Prepara os dados para atualização
  const updateData: any = {};
  if (updates.name !== undefined) {
    updateData.name = updates.name;
  }
  if (photoUrl) {
    updateData.photo_url = photoUrl;
  }

  // Atualiza no banco
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('email', email)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw new Error('Erreur lors de la mise à jour du profil');
  }

  return {
    name: data.name,
    email: data.email,
    photoUrl: data.photo_url
  };
}



