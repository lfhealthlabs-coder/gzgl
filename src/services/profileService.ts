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
    console.log('Nenhum email encontrado no localStorage');
    return {
      name: 'Utilisateur',
      email: 'user@example.com',
      photoUrl: null
    };
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle(); // Usar maybeSingle() para não lançar erro se não encontrar

    if (error) {
      console.error('Erro ao buscar perfil:', error);
    }

    if (!data) {
      // Se não encontrar, cria um perfil padrão
      console.log('Perfil não encontrado, criando novo para:', email);
      
      const defaultProfile = {
        name: 'Utilisateur',
        email,
        photo_url: null,
        last_login_at: new Date().toISOString()
      };

      const { data: insertedData, error: insertError } = await supabase
        .from('user_profiles')
        .insert(defaultProfile)
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao criar perfil:', insertError);
        
        // Se for erro de duplicata, busca novamente
        if (insertError.code === '23505') {
          const { data: retryData } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', email)
            .single();
          
          if (retryData) {
            return {
              name: retryData.name,
              email: retryData.email,
              photoUrl: retryData.photo_url
            };
          }
        }
        
        // Retorna perfil padrão mesmo com erro
        return {
          name: defaultProfile.name,
          email: defaultProfile.email,
          photoUrl: defaultProfile.photo_url
        };
      }

      console.log('Perfil criado com sucesso:', insertedData);

      return {
        name: insertedData.name,
        email: insertedData.email,
        photoUrl: insertedData.photo_url
      };
    }

    // Perfil encontrado, atualizar último acesso
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('email', email);

    if (updateError) {
      console.error('Erro ao atualizar último acesso:', updateError);
    }

    return {
      name: data.name,
      email: data.email,
      photoUrl: data.photo_url
    };
  } catch (error) {
    console.error('Erro crítico no getProfile:', error);
    
    // Retorna dados básicos em caso de erro
    return {
      name: 'Utilisateur',
      email,
      photoUrl: null
    };
  }
}

/**
 * Cria ou atualiza o perfil do usuário ao fazer login
 */
export async function loginUser(email: string): Promise<UserProfile> {
  console.log('🚀 [loginUser] INICIANDO para email:', email);
  
  try {
    // Verificar se o perfil já existe
    console.log('🔍 [loginUser] Buscando perfil existente...');
    const { data: existingProfile, error: selectError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (selectError) {
      console.error('❌ [loginUser] Erro ao buscar perfil:', selectError);
    }

    // Se encontrou o perfil existente, atualiza último acesso
    if (existingProfile && !selectError) {
      console.log('✅ [loginUser] Perfil existente encontrado:', existingProfile);
      console.log('🔄 [loginUser] Atualizando last_login_at...');
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ last_login_at: new Date().toISOString() })
        .eq('email', email);

      if (updateError) {
        console.error('❌ [loginUser] Erro ao atualizar last_login_at:', updateError);
        throw updateError;
      }

      console.log('✅ [loginUser] last_login_at atualizado com sucesso!');
      
      return {
        name: existingProfile.name,
        email: existingProfile.email,
        photoUrl: existingProfile.photo_url
      };
    }

    // Criar novo perfil se não existir
    console.log('🆕 [loginUser] Criando novo perfil para:', email);
    
    const newProfile = {
      name: 'Utilisateur',
      email,
      photo_url: null,
      last_login_at: new Date().toISOString()
    };
    
    console.log('📤 [loginUser] Dados a inserir:', newProfile);

    console.log('📤 [loginUser] Inserindo no Supabase...');
    const { data: insertedData, error: insertError } = await supabase
      .from('user_profiles')
      .insert(newProfile)
      .select()
      .single();

    if (insertError) {
      console.error('❌ [loginUser] ERRO ao inserir perfil:', insertError);
      console.error('❌ [loginUser] Código do erro:', insertError.code);
      console.error('❌ [loginUser] Mensagem:', insertError.message);
      console.error('❌ [loginUser] Detalhes:', insertError.details);
      console.error('❌ [loginUser] Hint:', insertError.hint);
      
      // Se o erro for de chave duplicada (perfil já existe), tenta buscar novamente
      if (insertError.code === '23505') {
        console.log('⚠️ [loginUser] Perfil já existe (duplicata), buscando novamente...');
        const { data: retryData, error: retryError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', email)
          .single();
        
        if (retryData && !retryError) {
          console.log('✅ [loginUser] Perfil encontrado após erro de duplicata:', retryData);
          return {
            name: retryData.name,
            email: retryData.email,
            photoUrl: retryData.photo_url
          };
        }
      }
      
      throw insertError;
    }

    console.log('✅✅✅ [loginUser] PERFIL CRIADO COM SUCESSO NO BANCO!');
    console.log('✅ [loginUser] Dados inseridos:', insertedData);

    return {
      name: insertedData.name,
      email: insertedData.email,
      photoUrl: insertedData.photo_url
    };
  } catch (error) {
    console.error('Erro crítico no loginUser:', error);
    
    // Retorna dados básicos mesmo em caso de erro
    return {
      name: 'Utilisateur',
      email,
      photoUrl: null
    };
  }
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



