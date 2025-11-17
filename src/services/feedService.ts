import { supabase } from '../lib/supabase';

export type FeedSource = 'daily' | 'jackpot' | 'community';

export type ReactionType = 'like';

export interface FeedItem {
  id: string;
  source: FeedSource;
  createdAt: Date;
  // Community post fields
  name?: string;
  text?: string;
  image?: string;
  likes?: number;
  comments?: number;
  userEmail?: string; // Email do usuário que criou o post
  userPhotoUrl?: string; // Foto de perfil do usuário
  // Daily update fields
  title?: string;
  excerpt?: string;
  icon?: string;
  // Jackpot fields
  loterie?: string;
  lotteryId?: string;
  valeur?: number;
  date_tirage?: string;
  next_draw_date?: Date;
  draw_frequency?: string;
  draw_days?: string;
  prize_value?: string;
  number_format?: string;
  description?: string;
  region?: string;
  pays?: string;
  // Moderator badge
  isModerator?: boolean;
  // Reactions (local)
  reactions?: {
    like?: number;
  };
  userReactions?: ReactionType[];
}

export interface Comment {
  id: string;
  userName: string;
  userEmail: string;
  userPhotoUrl?: string;
  content: string;
  createdAt: Date;
  parentCommentId?: string;
  likes: number;
  isModerator?: boolean;
  replies: Comment[];
}

interface FeedFilters {
  source?: FeedSource;
  lotteryId?: string;
}

interface FeedPagination {
  cursor?: string; // ID do último item carregado
  limit?: number;
}

interface FeedResponse {
  items: FeedItem[];
  nextCursor?: string;
  hasMore: boolean;
}

const REACTIONS_STORAGE_KEY = 'feed_reactions';
const ITEMS_PER_PAGE = 20;

/**
 * Adiciona reações fake aos posts existentes
 */
async function addFakeReactionsToExistingPosts(): Promise<void> {
  try {
    const { data: existingPosts } = await supabase
      .from('community_posts')
      .select('id, user_email')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!existingPosts || existingPosts.length === 0) return;

    // Buscar perfis dos usuários mockados
    const mockUserEmails = ['marie@example.com', 'jean@example.com', 'sophie@example.com', 'pierre@example.com', 'louis@example.com', 'sylvie@example.com'];
    const userProfileMap: { [email: string]: string } = {};
    
    for (const email of mockUserEmails) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (profile) {
        userProfileMap[email] = profile.id;
      } else {
        // Criar perfil se não existir
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({
            email: email,
            name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          })
          .select('id')
          .single();

        if (newProfile) {
          userProfileMap[email] = newProfile.id;
        }
      }
    }

    await addFakeReactionsAndComments(existingPosts, userProfileMap);
  } catch (error) {
    console.error('Erro ao adicionar reações fake:', error);
  }
}

/**
 * Adiciona reações fake e comentários fake aos posts
 */
async function addFakeReactionsAndComments(
  posts: Array<{ id: string }>,
  userProfileMap: { [email: string]: string }
): Promise<void> {
  try {
    const fakeReactions: any[] = [];
    const fakeComments: any[] = [];

    // Reações e comentários para cada post
    posts.forEach((post, index) => {
      const postId = `community_${post.id}`;
      
      if (index === 0) {
        // Primeiro post (Sylvie)
        fakeReactions.push(
          { feed_item_id: postId, feed_source: 'community', user_email: 'marie@example.com', reaction_type: 'like' },
          { feed_item_id: postId, feed_source: 'community', user_email: 'jean@example.com', reaction_type: 'like' },
          { feed_item_id: postId, feed_source: 'community', user_email: 'sophie@example.com', reaction_type: 'like' }
        );
        // Comentário fake
        fakeComments.push({
          feed_item_id: postId,
          feed_source: 'community',
          user_email: 'marie@example.com',
          user_name: 'Marie',
          user_profile_id: userProfileMap['marie@example.com'] || null,
          content: 'Excellente question ! Je me demande aussi.',
          parent_comment_id: null,
        });
      } else if (index === 2) {
        // Terceiro post (Antoine - Mercedes)
        fakeReactions.push(
          { feed_item_id: postId, feed_source: 'community', user_email: 'marie@example.com', reaction_type: 'like' },
          { feed_item_id: postId, feed_source: 'community', user_email: 'jean@example.com', reaction_type: 'like' },
          { feed_item_id: postId, feed_source: 'community', user_email: 'sophie@example.com', reaction_type: 'like' },
          { feed_item_id: postId, feed_source: 'community', user_email: 'pierre@example.com', reaction_type: 'like' },
          { feed_item_id: postId, feed_source: 'community', user_email: 'louis@example.com', reaction_type: 'like' },
          { feed_item_id: postId, feed_source: 'community', user_email: 'sylvie@example.com', reaction_type: 'like' }
        );
        // Comentários fake
        fakeComments.push(
          {
            feed_item_id: postId,
            feed_source: 'community',
            user_email: 'marie@example.com',
            user_name: 'Marie',
            user_profile_id: userProfileMap['marie@example.com'] || null,
            content: 'Félicitations ! C\'est incroyable ! 🎉',
            parent_comment_id: null,
          },
          {
            feed_item_id: postId,
            feed_source: 'community',
            user_email: 'jean@example.com',
            user_name: 'Jean',
            user_profile_id: userProfileMap['jean@example.com'] || null,
            content: 'J\'espère avoir la même chance !',
            parent_comment_id: null,
          }
        );
      } else if (index === 3) {
        // Quarto post (Jean)
        fakeReactions.push(
          { feed_item_id: postId, feed_source: 'community', user_email: 'marie@example.com', reaction_type: 'like' }
        );
        fakeComments.push({
          feed_item_id: postId,
          feed_source: 'community',
          user_email: 'sophie@example.com',
          user_name: 'Sophie',
          user_profile_id: userProfileMap['sophie@example.com'] || null,
          content: 'Bonne chance ! 🍀',
          parent_comment_id: null,
        });
      } else if (index === 4) {
        // Quinto post (Louis)
        fakeReactions.push(
          { feed_item_id: postId, feed_source: 'community', user_email: 'marie@example.com', reaction_type: 'like' }
        );
      } else if (index === 5) {
        // Sexto post (Pierre)
        fakeReactions.push(
          { feed_item_id: postId, feed_source: 'community', user_email: 'marie@example.com', reaction_type: 'like' },
          { feed_item_id: postId, feed_source: 'community', user_email: 'jean@example.com', reaction_type: 'like' },
          { feed_item_id: postId, feed_source: 'community', user_email: 'sophie@example.com', reaction_type: 'like' }
        );
        fakeComments.push({
          feed_item_id: postId,
          feed_source: 'community',
          user_email: 'marie@example.com',
          user_name: 'Marie',
          user_profile_id: userProfileMap['marie@example.com'] || null,
          content: 'Félicitations ! Votre fille va être ravie ! 🎁',
          parent_comment_id: null,
        });
      }
    });

    // Inserir reações
    if (fakeReactions.length > 0) {
      await supabase.from('feed_reactions').insert(fakeReactions);
    }

    // Inserir comentários
    if (fakeComments.length > 0) {
      await supabase.from('feed_comments').insert(fakeComments);
    }

    // Atualizar contadores de likes e comentários nos posts
    for (const post of posts) {
      const reactionsForPost = fakeReactions.filter(r => r.feed_item_id === `community_${post.id}`);
      const commentsForPost = fakeComments.filter(c => c.feed_item_id === `community_${post.id}`);
      const totalReactions = reactionsForPost.length;
      const totalComments = commentsForPost.length;

      if (totalReactions > 0 || totalComments > 0) {
        await supabase
          .from('community_posts')
          .update({ 
            likes_count: totalReactions,
            comments_count: totalComments,
          })
          .eq('id', post.id);
      }
    }
  } catch (error) {
    console.error('Erro ao adicionar reações e comentários fake:', error);
  }
}

/**
 * Insere posts mockados iniciais se a tabela estiver vazia
 */
async function initializeMockPosts(): Promise<void> {
  try {
    // Verificar se já existem posts
    const { count } = await supabase
      .from('community_posts')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      // Verificar se já existem reações fake
      const { count: reactionsCount } = await supabase
        .from('feed_reactions')
        .select('*', { count: 'exact', head: true });
      
      // Se não houver reações, adicionar reações fake aos posts existentes
      if (!reactionsCount || reactionsCount === 0) {
        await addFakeReactionsToExistingPosts();
      }
      return; // Já existem posts
    }

    // Inserir posts mockados (com status approved para aparecer no feed)
    const mockPosts = [
      {
        user_email: 'sylvie@example.com',
        user_name: 'Sylvie Beaudoin',
        content: 'Est-ce que ce programme n\'est que pour les européens ou du Canada on peut y avoir accès',
        image_url: null,
        likes_count: 3,
        comments_count: 1,
        status: 'approved',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        user_email: 'lutgarde@example.com',
        user_name: 'Lutgarde JAMAER',
        content: 'Belgique',
        image_url: null,
        likes_count: 0,
        comments_count: 0,
        status: 'approved',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        user_email: 'antoine@example.com',
        user_name: 'Antoine Dupont',
        content: 'Je me suis inscrit sur LotoGains sans imaginer ce qui allait se passer… Quelques semaines plus tard, mes gains ont été si élevés que j\'ai réalisé un rêve de longue date : conduire ma propre Mercedes-Benz Classe S. Si j\'ai pu le faire, vous le pouvez aussi !',
        image_url: '/image13.jpg',
        likes_count: 6,
        comments_count: 0,
        status: 'approved',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        user_email: 'jean@example.com',
        user_name: 'Jean Dupont',
        content: 'Je viens juste d\'entrer sur LotoGains. Je fais mes paris en ce moment même, souhaitez-moi bonne chance !',
        image_url: null,
        likes_count: 1,
        comments_count: 0,
        status: 'approved',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        user_email: 'louis@example.com',
        user_name: 'Louis Fontaine',
        content: 'Me mes premiers 7000 euros sont déjà partis. J\'ai acheté l\'accès à LotoGains il y a seulement 7 jours.',
        image_url: '/image14.jpg',
        likes_count: 1,
        comments_count: 0,
        status: 'approved',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        user_email: 'pierre@example.com',
        user_name: 'Pierre Dubois',
        content: 'ENFIN!\n\nAprès 5 jours d\'essai, j\'ai réussi. Mon premier prix à la loterie. J\'ai hâte d\'offrir un nouveau téléphone portable à ma fille.',
        image_url: '/image14.jpg',
        likes_count: 3,
        comments_count: 0,
        status: 'approved',
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Buscar ou criar perfis fake (usando tabela fake_user_profiles)
    const mockUserEmails = [
      { email: 'sylvie@example.com', name: 'Sylvie Beaudoin' },
      { email: 'lutgarde@example.com', name: 'Lutgarde JAMAER' },
      { email: 'antoine@example.com', name: 'Antoine Dupont' },
      { email: 'jean@example.com', name: 'Jean Dupont' },
      { email: 'louis@example.com', name: 'Louis Fontaine' },
      { email: 'pierre@example.com', name: 'Pierre Dubois' },
      { email: 'marie@example.com', name: 'Marie' },
      { email: 'sophie@example.com', name: 'Sophie' },
    ];

    const userProfileMap: { [email: string]: string } = {};
    
    for (const user of mockUserEmails) {
      const { data: existingProfile } = await supabase
        .from('fake_user_profiles')
        .select('id')
        .eq('email', user.email)
        .maybeSingle();

      if (existingProfile) {
        userProfileMap[user.email] = existingProfile.id;
      } else {
        const { data: newProfile } = await supabase
          .from('fake_user_profiles')
          .insert({
            email: user.email,
            name: user.name,
          })
          .select('id')
          .single();

        if (newProfile) {
          userProfileMap[user.email] = newProfile.id;
        }
      }
    }

    // Inserir posts com user_profile_id
    const postsWithProfileId = mockPosts.map(post => ({
      ...post,
      user_profile_id: userProfileMap[post.user_email] || null,
    }));

    const { data: insertedPosts, error: insertError } = await supabase
      .from('community_posts')
      .insert(postsWithProfileId)
      .select('id');

    if (insertError) {
      console.error('Erro ao inserir posts mockados:', insertError);
      return;
    }

    // Adicionar reações fake e comentários fake
    if (insertedPosts && insertedPosts.length > 0) {
      await addFakeReactionsAndComments(insertedPosts, userProfileMap);
    }

    console.log('Posts mockados, reações e comentários fake inseridos com sucesso');
  } catch (error) {
    console.error('Erro ao inserir posts mockados:', error);
  }
}

/**
 * Busca posts da comunidade (do Supabase)
 */
async function fetchCommunityPosts(): Promise<FeedItem[]> {
  try {
    // Inicializar posts mockados se necessário
    await initializeMockPosts();

    // Buscar do Supabase (apenas posts aprovados e não deletados aparecem no feed)
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('status', 'approved') // Apenas posts aprovados
      .is('deleted_at', null) // Excluir posts deletados
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data && data.length > 0) {
      // Buscar fotos de perfil de ambas as tabelas
      const userIds = [...new Set(data.map((p: any) => p.user_profile_id).filter(Boolean))];
      const photoMap: { [key: string]: string | null } = {};
      
      if (userIds.length > 0) {
        // Buscar de user_profiles
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, photo_url')
          .in('id', userIds);
        
        if (profiles) {
          profiles.forEach((p: any) => {
            photoMap[p.id] = p.photo_url;
          });
        }

        // Buscar de fake_user_profiles
        const { data: fakeProfiles } = await supabase
          .from('fake_user_profiles')
          .select('id, photo_url')
          .in('id', userIds);
        
        if (fakeProfiles) {
          fakeProfiles.forEach((p: any) => {
            photoMap[p.id] = p.photo_url;
          });
        }
      }

      // Verificar quais emails são moderadores
      const userEmails = [...new Set(data.map((p: any) => p.user_email))];
      const moderatorEmails = new Set<string>();
      
      // Verificar moderadores em paralelo
      await Promise.all(
        userEmails.map(async (email: string) => {
          const isMod = await isEmailModerator(email);
          if (isMod) moderatorEmails.add(email);
        })
      );

      return data.map((post: any) => ({
        id: `community_${post.id}`,
        source: 'community' as FeedSource,
        createdAt: new Date(post.created_at),
        name: post.user_name,
        text: post.content,
        image: post.image_url,
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        userEmail: post.user_email,
        // Buscar foto de perfil de user_profiles ou fake_user_profiles
        userPhotoUrl: post.user_profile_id ? (photoMap[post.user_profile_id] || null) : null,
        isModerator: moderatorEmails.has(post.user_email),
      }));
    }
  } catch (error) {
    console.error('Erro ao buscar posts da comunidade:', error);
  }

  return [];
}

/**
 * Busca atualizações diárias (Mises à jour quotidiennes)
 */
async function fetchDailyUpdates(): Promise<FeedItem[]> {
  try {
    // Buscar do Supabase
    const { data, error } = await supabase
      .from('daily_updates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data && data.length > 0) {
      return data.map((update: any) => ({
        id: `daily_${update.id}`,
        source: 'daily' as FeedSource,
        createdAt: new Date(update.created_at),
        title: update.title,
        excerpt: update.excerpt || update.content,
        icon: update.icon,
        image: update.image_url,
        lotteryId: update.lottery_id,
      }));
    }
  } catch (error) {
    console.error('Erro ao buscar atualizações diárias:', error);
  }

  return [];
}

/**
 * Busca jackpots do banco de dados
 */
async function fetchJackpots(): Promise<FeedItem[]> {
  try {
    const { data, error } = await supabase
      .from('jackpots')
      .select(`
        *,
        lotteries (
          id,
          name,
          region,
          pays,
          draw_days,
          draw_frequency,
          prize_value,
          number_format,
          description,
          next_draw_date
        )
      `)
      .eq('is_past', false)
      .order('valeur', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Erro ao buscar jackpots:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    return data.map((jackpot: any) => ({
      id: `jackpot_${jackpot.id}`,
      source: 'jackpot' as FeedSource,
      createdAt: new Date(jackpot.date_tirage),
      loterie: jackpot.lotteries?.name || 'Loterie',
      lotteryId: jackpot.lottery_id,
      valeur: parseFloat(jackpot.valeur),
      date_tirage: jackpot.date_tirage ? new Date(jackpot.date_tirage).toLocaleDateString('fr-FR') : undefined,
      next_draw_date: jackpot.lotteries?.next_draw_date ? new Date(jackpot.lotteries.next_draw_date) : undefined,
      draw_frequency: jackpot.lotteries?.draw_frequency,
      draw_days: jackpot.lotteries?.draw_days,
      prize_value: jackpot.lotteries?.prize_value,
      number_format: jackpot.lotteries?.number_format,
      description: jackpot.lotteries?.description,
      region: jackpot.lotteries?.region,
      pays: jackpot.lotteries?.pays,
    }));
  } catch (error) {
    console.error('Erro ao buscar jackpots:', error);
    return [];
  }
}

/**
 * Parse de data em formato francês ou ISO
 */
function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();

  // Tentar ISO string primeiro
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Tentar parsear formato francês "10 nov à 18:33"
  const frenchMonths: { [key: string]: number } = {
    janv: 0, févr: 1, mars: 2, avr: 3, mai: 4, juin: 5,
    juil: 6, août: 7, sept: 8, oct: 9, nov: 10, déc: 11,
  };

  const match = dateStr.match(/(\d+)\s+(\w+)\s+à\s+(\d+):(\d+)/);
  if (match) {
    const day = parseInt(match[1]);
    const month = frenchMonths[match[2].toLowerCase()] ?? new Date().getMonth();
    const hours = parseInt(match[3]);
    const minutes = parseInt(match[4]);
    const year = new Date().getFullYear();
    return new Date(year, month, day, hours, minutes);
  }

  // Fallback: data atual
  return new Date();
}

/**
 * Carrega reações do localStorage
 */
function loadReactions(): { [itemId: string]: ReactionType[] } {
  const stored = localStorage.getItem(REACTIONS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Erro ao carregar reações:', e);
    }
  }
  return {};
}

/**
 * Salva reações no localStorage
 */
function saveReactions(reactions: { [itemId: string]: ReactionType[] }): void {
  localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(reactions));
}

/**
 * Busca feed misturado com paginação
 */
export async function fetchFeed(
  filters?: FeedFilters,
  pagination?: FeedPagination
): Promise<FeedResponse> {
  const limit = pagination?.limit || ITEMS_PER_PAGE;
  const cursor = pagination?.cursor;

  // Buscar todas as fontes
  const [communityPosts, dailyUpdates, jackpots] = await Promise.all([
    fetchCommunityPosts(),
    fetchDailyUpdates(),
    fetchJackpots(),
  ]);

  // Misturar todos os itens com prioridade para comunidade
  let allItems: FeedItem[] = [
    ...communityPosts,
    ...dailyUpdates,
    ...jackpots,
  ];

  // Aplicar filtros
  if (filters?.source) {
    allItems = allItems.filter(item => item.source === filters.source);
  }

  if (filters?.lotteryId) {
    allItems = allItems.filter(item => item.lotteryId === filters.lotteryId);
  }

  // Ordenar: primeiro por prioridade (community > daily > jackpot), depois por data decrescente
  const sourcePriority: { [key in FeedSource]: number } = {
    community: 3, // Maior prioridade
    daily: 2,
    jackpot: 1, // Menor prioridade
  };

  allItems.sort((a, b) => {
    // Primeiro ordenar por prioridade da fonte
    const priorityDiff = sourcePriority[b.source] - sourcePriority[a.source];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Se mesma prioridade, ordenar por data decrescente
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  // Carregar reações do banco de dados
  const reactionsPromises = allItems.map(async item => {
    const dbReactions = await fetchReactionsFromDatabase(item.id);
    return {
      ...item,
      userReactions: dbReactions.userReactions,
      reactions: {
        like: dbReactions.like,
      },
    };
  });

  allItems = await Promise.all(reactionsPromises);

  // Aplicar paginação com cursor
  let startIndex = 0;
  if (cursor) {
    const cursorIndex = allItems.findIndex(item => item.id === cursor);
    if (cursorIndex >= 0) {
      startIndex = cursorIndex + 1;
    }
  }

  const paginatedItems = allItems.slice(startIndex, startIndex + limit);
  const nextCursor = paginatedItems.length === limit && startIndex + limit < allItems.length
    ? paginatedItems[paginatedItems.length - 1].id
    : undefined;

  return {
    items: paginatedItems,
    nextCursor,
    hasMore: !!nextCursor,
  };
}

/**
 * Adiciona ou remove uma reação de um item
 */
export function toggleReaction(itemId: string, reactionType: ReactionType): void {
  const reactions = loadReactions();
  const itemReactions = reactions[itemId] || [];

  const index = itemReactions.indexOf(reactionType);
  if (index >= 0) {
    // Remove reação
    itemReactions.splice(index, 1);
  } else {
    // Adiciona reação (remove outras do mesmo tipo se houver)
    itemReactions.push(reactionType);
  }

  reactions[itemId] = itemReactions;
  saveReactions(reactions);
}

/**
 * Verifica se um item tem uma reação específica
 */
export function hasReaction(itemId: string, reactionType: ReactionType): boolean {
  const reactions = loadReactions();
  const itemReactions = reactions[itemId] || [];
  return itemReactions.includes(reactionType);
}

/**
 * Salva um novo post da comunidade no Supabase
 */
export async function createCommunityPost(data: {
  content: string;
  imageUrl?: string;
  userEmail: string;
  userName: string;
}): Promise<FeedItem | null> {
  try {
    // Salvar imagem no Supabase Storage se houver
    let imageUrl: string | null = null;
    if (data.imageUrl && data.imageUrl.startsWith('blob:')) {
      // Converter blob para File
      const response = await fetch(data.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], `post_${Date.now()}.jpg`, { type: blob.type });

      // Upload para Supabase Storage
      const fileName = `${data.userEmail.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.jpg`;
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Erro no upload da imagem:', uploadError);
      } else {
        const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(uploadData.path);
        imageUrl = urlData.publicUrl;
      }
    } else if (data.imageUrl) {
      imageUrl = data.imageUrl;
    }

    // Buscar user_profile_id (sempre buscar do banco para garantir que está atualizado)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, name')
      .eq('email', data.userEmail)
      .maybeSingle();

    // Usar o nome do banco se disponível (mais atualizado)
    const finalUserName = profile?.name || data.userName;

    const { data: post, error } = await supabase
      .from('community_posts')
      .insert({
        user_email: data.userEmail,
        user_name: finalUserName, // Nome sempre do banco
        user_profile_id: profile?.id || null,
        content: data.content,
        image_url: imageUrl,
        likes_count: 0,
        comments_count: 0,
        status: 'pending', // Posts começam como pending
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar post:', error);
      return null;
    }

    return {
      id: `community_${post.id}`,
      source: 'community' as FeedSource,
      createdAt: new Date(post.created_at),
      name: post.user_name,
      text: post.content,
      image: post.image_url,
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
      userEmail: post.user_email,
    };
  } catch (error) {
    console.error('Erro ao criar post da comunidade:', error);
    return null;
  }
}

/**
 * Salva uma reação no Supabase e no localStorage
 */
export async function saveReactionToDatabase(
  itemId: string,
  source: FeedSource,
  reactionType: ReactionType,
  userEmail: string
): Promise<boolean> {
  try {
    // Se for post da comunidade, verificar se está aprovado
    if (source === 'community') {
      const uuid = itemId.replace('community_', '');
      const { data: post } = await supabase
        .from('community_posts')
        .select('status')
        .eq('id', uuid)
        .maybeSingle();

      if (!post || post.status !== 'approved') {
        console.error('Não é possível reagir a posts não aprovados');
        return false;
      }
    }

    // Verificar se já existe a reação
    const { data: existing } = await supabase
      .from('feed_reactions')
      .select('id')
      .eq('feed_item_id', itemId)
      .eq('user_email', userEmail)
      .eq('reaction_type', reactionType)
      .maybeSingle();

    if (existing) {
      // Remover reação
      const { error } = await supabase
        .from('feed_reactions')
        .delete()
        .eq('id', existing.id);

      if (error) {
        console.error('Erro ao remover reação:', error);
        return false;
      }
    } else {
      // Adicionar reação
      const { error } = await supabase
        .from('feed_reactions')
        .insert({
          feed_item_id: itemId,
          feed_source: source,
          user_email: userEmail,
          reaction_type: reactionType,
        });

      if (error) {
        console.error('Erro ao adicionar reação:', error);
        return false;
      }
    }

    // Atualizar localStorage também
    toggleReaction(itemId, reactionType);
    return true;
  } catch (error) {
    console.error('Erro ao salvar reação no banco:', error);
    // Fallback: usar apenas localStorage
    toggleReaction(itemId, reactionType);
    return false;
  }
}

/**
 * Busca reações do banco de dados para um item
 */
export async function fetchReactionsFromDatabase(itemId: string): Promise<{
  like: number;
  userReactions: ReactionType[];
}> {
  try {
    const userEmail = localStorage.getItem('user_email') || '';

    // Buscar todas as reações do item
    const { data: reactions, error } = await supabase
      .from('feed_reactions')
      .select('*')
      .eq('feed_item_id', itemId);

    if (error) {
      console.error('Erro ao buscar reações:', error);
      return { like: 0, userReactions: [] };
    }

    // Contar reações por tipo
    const counts = {
      like: 0,
    };

    const userReactions: ReactionType[] = [];

    reactions?.forEach((reaction: any) => {
      if (reaction.reaction_type === 'like') counts.like++;

      if (reaction.user_email === userEmail) {
        userReactions.push(reaction.reaction_type as ReactionType);
      }
    });

    return { ...counts, userReactions };
  } catch (error) {
    console.error('Erro ao buscar reações do banco:', error);
    return { like: 0, userReactions: [] };
  }
}

/**
 * Salva um comentário no Supabase
 */
export async function createComment(data: {
  feedItemId: string;
  feedSource: FeedSource;
  content: string;
  userEmail: string;
  userName: string;
  parentCommentId?: string;
}): Promise<boolean> {
  try {
    // Se for post da comunidade, verificar se está aprovado
    if (data.feedSource === 'community') {
      const uuid = data.feedItemId.replace('community_', '');
      const { data: post } = await supabase
        .from('community_posts')
        .select('status')
        .eq('id', uuid)
        .maybeSingle();

      if (!post || post.status !== 'approved') {
        console.error('Não é possível comentar em posts não aprovados');
        return false;
      }
    }

    // Buscar user_profile_id (sempre buscar do banco para garantir que está atualizado)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, name')
      .eq('email', data.userEmail)
      .maybeSingle();

    // Usar o nome do banco se disponível (mais atualizado)
    const finalUserName = profile?.name || data.userName;

    const { error } = await supabase
      .from('feed_comments')
      .insert({
        feed_item_id: data.feedItemId,
        feed_source: data.feedSource,
        parent_comment_id: data.parentCommentId || null,
        user_email: data.userEmail,
        user_name: finalUserName, // Nome sempre do banco
        user_profile_id: profile?.id || null,
        content: data.content,
        likes_count: 0,
      });

    if (error) {
      console.error('Erro ao criar comentário:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar comentário:', error);
    return false;
  }
}

/**
 * Busca reações de um comentário
 */
export async function fetchCommentReactions(commentId: string): Promise<{
  like: number;
  userReactions: ReactionType[];
}> {
  try {
    const userEmail = localStorage.getItem('user_email') || '';
    const itemId = `comment_${commentId}`;

    const { data: reactions, error } = await supabase
      .from('feed_reactions')
      .select('*')
      .eq('feed_item_id', itemId);

    if (error) {
      console.error('Erro ao buscar reações do comentário:', error);
      return { like: 0, userReactions: [] };
    }

    const counts = { like: 0 };
    const userReactions: ReactionType[] = [];

    reactions?.forEach((reaction: any) => {
      if (reaction.reaction_type === 'like') counts.like++;

      if (reaction.user_email === userEmail) {
        userReactions.push(reaction.reaction_type as ReactionType);
      }
    });

    return { ...counts, userReactions };
  } catch (error) {
    console.error('Erro ao buscar reações do comentário:', error);
    return { like: 0, userReactions: [] };
  }
}

/**
 * Salva reação em um comentário
 */
export async function saveCommentReaction(
  commentId: string,
  reactionType: ReactionType,
  userEmail: string
): Promise<boolean> {
  try {
    const itemId = `comment_${commentId}`;

    const { data: existing } = await supabase
      .from('feed_reactions')
      .select('id')
      .eq('feed_item_id', itemId)
      .eq('user_email', userEmail)
      .eq('reaction_type', reactionType)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('feed_reactions')
        .delete()
        .eq('id', existing.id);

      if (error) {
        console.error('Erro ao remover reação do comentário:', error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from('feed_reactions')
        .insert({
          feed_item_id: itemId,
          feed_source: 'community',
          user_email: userEmail,
          reaction_type: reactionType,
        });

      if (error) {
        console.error('Erro ao adicionar reação ao comentário:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar reação do comentário:', error);
    return false;
  }
}

/**
 * Busca comentários de um item do feed (com respostas aninhadas)
 */
export async function fetchComments(itemId: string): Promise<Comment[]> {
  try {
    const { data, error } = await supabase
      .from('feed_comments')
      .select('*')
      .eq('feed_item_id', itemId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar comentários:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Buscar fotos de perfil dos comentários (de ambas as tabelas)
    const userIds = [...new Set((data || []).map((c: any) => c.user_profile_id).filter(Boolean))];
    const photoMap: { [key: string]: string | null } = {};
    
    if (userIds.length > 0) {
      // Buscar de user_profiles
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, photo_url')
        .in('id', userIds);
      
      if (profiles) {
        profiles.forEach((p: any) => {
          photoMap[p.id] = p.photo_url;
        });
      }

      // Buscar de fake_user_profiles (para perfis fake)
      const { data: fakeProfiles } = await supabase
        .from('fake_user_profiles')
        .select('id, photo_url')
        .in('id', userIds);
      
      if (fakeProfiles) {
        fakeProfiles.forEach((p: any) => {
          photoMap[p.id] = p.photo_url;
        });
      }
    }

    // Separar comentários principais e respostas
    const allComments = (data || []).map((comment: any) => ({
      id: comment.id,
      userName: comment.user_name,
      content: comment.content,
      createdAt: new Date(comment.created_at),
      parentCommentId: comment.parent_comment_id,
      likes: comment.likes_count || 0,
      userEmail: comment.user_email,
      userPhotoUrl: comment.user_profile_id ? (photoMap[comment.user_profile_id] || null) : null,
      isModerator: false, // Será atualizado depois
      replies: [] as Comment[],
    }));

    // Verificar quais emails são moderadores
    const userEmails = [...new Set(allComments.map(c => c.userEmail))];
    const moderatorEmails = new Set<string>();
    
    // Verificar moderadores em paralelo
    await Promise.all(
      userEmails.map(async (email: string) => {
        const isMod = await isEmailModerator(email);
        if (isMod) moderatorEmails.add(email);
      })
    );

    // Adicionar flag de moderador aos comentários
    allComments.forEach(comment => {
      comment.isModerator = moderatorEmails.has(comment.userEmail);
    });

    // Organizar em árvore (comentários principais e suas respostas)
    const mainComments = allComments.filter(c => !c.parentCommentId);
    const replies = allComments.filter(c => c.parentCommentId);

    // Adicionar respostas aos comentários principais
    mainComments.forEach(comment => {
      comment.replies = replies
        .filter(r => r.parentCommentId === comment.id)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    });

    return mainComments;
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return [];
  }
}

/**
 * Verifica se o usuário atual é moderador
 */
export async function isModerator(): Promise<boolean> {
  try {
    const userEmail = localStorage.getItem('user_email') || '';
    if (!userEmail) return false;

    const { data, error } = await supabase
      .from('moderators')
      .select('email')
      .eq('email', userEmail)
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar moderador:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Erro ao verificar moderador:', error);
    return false;
  }
}

/**
 * Verifica se um email específico é moderador
 */
export async function isEmailModerator(email: string): Promise<boolean> {
  try {
    if (!email) return false;

    const { data, error } = await supabase
      .from('moderators')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar moderador:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Erro ao verificar moderador:', error);
    return false;
  }
}

/**
 * Reporta um post para moderação
 */
export async function reportPost(postId: string, reason?: string): Promise<boolean> {
  try {
    const userEmail = localStorage.getItem('user_email') || '';
    if (!userEmail) return false;

    // Buscar nome do usuário
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('email', userEmail)
      .maybeSingle();

    // Extrair UUID do post (formato: community_UUID)
    const uuid = postId.replace('community_', '');

    const { error } = await supabase
      .from('moderation_queue')
      .insert({
        post_id: uuid,
        reported_by_email: userEmail,
        reported_by_name: profile?.name || userEmail,
        reason: reason || null,
        status: 'pending',
      });

    if (error) {
      console.error('Erro ao reportar post:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao reportar post:', error);
    return false;
  }
}

/**
 * Busca posts pendentes de moderação (para admin)
 */
export async function fetchPendingPosts(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('status', 'pending')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts pendentes:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Buscar fotos de perfil de ambas as tabelas
    const userIds = [...new Set(data.map((p: any) => p.user_profile_id).filter(Boolean))];
    const photoMap: { [key: string]: string | null } = {};
    
    if (userIds.length > 0) {
      // Buscar de user_profiles
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, photo_url')
        .in('id', userIds);
      
      if (profiles) {
        profiles.forEach((p: any) => {
          photoMap[p.id] = p.photo_url;
        });
      }

      // Buscar de fake_user_profiles
      const { data: fakeProfiles } = await supabase
        .from('fake_user_profiles')
        .select('id, photo_url')
        .in('id', userIds);
      
      if (fakeProfiles) {
        fakeProfiles.forEach((p: any) => {
          photoMap[p.id] = p.photo_url;
        });
      }
    }

    // Adicionar fotos de perfil aos posts
    return data.map((post: any) => ({
      ...post,
      user_profiles: post.user_profile_id && photoMap[post.user_profile_id] ? { photo_url: photoMap[post.user_profile_id] } : null,
      fake_user_profiles: post.user_profile_id && photoMap[post.user_profile_id] ? { photo_url: photoMap[post.user_profile_id] } : null,
    }));
  } catch (error) {
    console.error('Erro ao buscar posts pendentes:', error);
    return [];
  }
}

/**
 * Busca todos os posts por status (para admin)
 */
export async function fetchAllPostsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('status', status)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Buscar fotos de perfil de ambas as tabelas
    const userIds = [...new Set(data.map((p: any) => p.user_profile_id).filter(Boolean))];
    const photoMap: { [key: string]: string | null } = {};
    
    if (userIds.length > 0) {
      // Buscar de user_profiles
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, photo_url')
        .in('id', userIds);
      
      if (profiles) {
        profiles.forEach((p: any) => {
          photoMap[p.id] = p.photo_url;
        });
      }

      // Buscar de fake_user_profiles
      const { data: fakeProfiles } = await supabase
        .from('fake_user_profiles')
        .select('id, photo_url')
        .in('id', userIds);
      
      if (fakeProfiles) {
        fakeProfiles.forEach((p: any) => {
          photoMap[p.id] = p.photo_url;
        });
      }
    }

    // Adicionar fotos de perfil aos posts
    return data.map((post: any) => ({
      ...post,
      user_profiles: post.user_profile_id && photoMap[post.user_profile_id] ? { photo_url: photoMap[post.user_profile_id] } : null,
      fake_user_profiles: post.user_profile_id && photoMap[post.user_profile_id] ? { photo_url: photoMap[post.user_profile_id] } : null,
    }));
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return [];
  }
}

/**
 * Busca posts do usuário por status (pending, approved, rejected)
 */
export async function fetchUserPostsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<any[]> {
  try {
    const userEmail = localStorage.getItem('user_email') || '';
    if (!userEmail) return [];

    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('user_email', userEmail)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts do usuário:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Buscar fotos de perfil de ambas as tabelas
    const userIds = [...new Set(data.map((p: any) => p.user_profile_id).filter(Boolean))];
    const photoMap: { [key: string]: string | null } = {};
    
    if (userIds.length > 0) {
      // Buscar de user_profiles
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, photo_url')
        .in('id', userIds);
      
      if (profiles) {
        profiles.forEach((p: any) => {
          photoMap[p.id] = p.photo_url;
        });
      }

      // Buscar de fake_user_profiles
      const { data: fakeProfiles } = await supabase
        .from('fake_user_profiles')
        .select('id, photo_url')
        .in('id', userIds);
      
      if (fakeProfiles) {
        fakeProfiles.forEach((p: any) => {
          photoMap[p.id] = p.photo_url;
        });
      }
    }

    // Adicionar fotos de perfil aos posts
    return data.map((post: any) => ({
      ...post,
      user_profiles: post.user_profile_id && photoMap[post.user_profile_id] ? { photo_url: photoMap[post.user_profile_id] } : null,
      fake_user_profiles: post.user_profile_id && photoMap[post.user_profile_id] ? { photo_url: photoMap[post.user_profile_id] } : null,
    }));
  } catch (error) {
    console.error('Erro ao buscar posts do usuário:', error);
    return [];
  }
}

/**
 * Busca fila de moderação (reportes)
 */
export async function fetchModerationQueue(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('moderation_queue')
      .select(`
        *,
        community_posts!moderation_queue_post_id_fkey (
          id,
          user_name,
          content,
          image_url,
          created_at,
          status
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar fila de moderação:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar fila de moderação:', error);
    return [];
  }
}

/**
 * Aprova um post
 */
export async function approvePost(postId: string): Promise<boolean> {
  try {
    const uuid = postId.replace('community_', '');
    const userEmail = localStorage.getItem('user_email') || '';

    const { error } = await supabase
      .from('community_posts')
      .update({ status: 'approved' })
      .eq('id', uuid);

    if (error) {
      console.error('Erro ao aprovar post:', error);
      return false;
    }

    // Marcar reportes relacionados como resolvidos
    await supabase
      .from('moderation_queue')
      .update({ 
        status: 'resolved',
        reviewed_by_email: userEmail,
        reviewed_at: new Date().toISOString(),
      })
      .eq('post_id', uuid)
      .eq('status', 'pending');

    return true;
  } catch (error) {
    console.error('Erro ao aprovar post:', error);
    return false;
  }
}

/**
 * Rejeita um post
 * @param postId - ID do post (formato: community_UUID)
 * @param reason - Motivo opcional da rejeição
 */
export async function rejectPost(postId: string, reason?: string): Promise<boolean> {
  try {
    const uuid = postId.replace('community_', '');
    const userEmail = localStorage.getItem('user_email') || '';

    const { error } = await supabase
      .from('community_posts')
      .update({ 
        status: 'rejected',
        rejection_reason: reason || null
      })
      .eq('id', uuid);

    if (error) {
      console.error('Erro ao rejeitar post:', error);
      return false;
    }

    // Marcar reportes relacionados como resolvidos
    await supabase
      .from('moderation_queue')
      .update({ 
        status: 'resolved',
        reviewed_by_email: userEmail,
        reviewed_at: new Date().toISOString(),
      })
      .eq('post_id', uuid)
      .eq('status', 'pending');

    return true;
  } catch (error) {
    console.error('Erro ao rejeitar post:', error);
    return false;
  }
}

/**
 * Deleta um post da comunidade
 * Se for admin deletando, faz soft delete (marca como deletado)
 * Se for o próprio usuário, faz hard delete (remove completamente)
 */
export async function deleteCommunityPost(postId: string, allowModerator: boolean = false): Promise<boolean> {
  try {
    // Extrair o UUID do post (formato: community_UUID)
    const uuid = postId.replace('community_', '');
    
    // Verificar se o post existe
    const userEmail = localStorage.getItem('user_email') || '';
    const { data: post, error: checkError } = await supabase
      .from('community_posts')
      .select('id, user_email, deleted_at')
      .eq('id', uuid)
      .maybeSingle();

    if (checkError || !post) {
      console.error('Erro ao verificar post:', checkError);
      return false;
    }

    // Se já está deletado, não fazer nada
    if (post.deleted_at) {
      return true;
    }

    const isOwnPost = post.user_email === userEmail;
    let isMod = false;

    // Verificar permissão: usuário pode deletar seu próprio post, ou moderador pode deletar qualquer post
    if (!isOwnPost) {
      if (allowModerator) {
        // Verificar se o usuário atual é moderador
        isMod = await isModerator();
        if (!isMod) {
          console.error('Apenas moderadores podem deletar posts de outros usuários');
          return false;
        }
      } else {
        console.error('Usuário não tem permissão para deletar este post');
        return false;
      }
    }

    // Se for admin deletando post de outro usuário, fazer soft delete
    if (isMod && !isOwnPost) {
      const { error: softDeleteError } = await supabase
        .from('community_posts')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by_email: userEmail,
          deleted_by_type: 'admin',
        })
        .eq('id', uuid);

      if (softDeleteError) {
        console.error('Erro ao fazer soft delete:', softDeleteError);
        return false;
      }

      return true;
    }

    // Se for o próprio usuário deletando, fazer soft delete também (para rastreamento)
    const { error: softDeleteError } = await supabase
      .from('community_posts')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by_email: userEmail,
        deleted_by_type: 'user',
      })
      .eq('id', uuid);

    if (softDeleteError) {
      console.error('Erro ao fazer soft delete:', softDeleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao deletar post:', error);
    return false;
  }
}

/**
 * Busca posts deletados (apenas para admins)
 */
export async function fetchDeletedPosts(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts deletados:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Buscar fotos de perfil de ambas as tabelas
    const userIds = [...new Set(data.map((p: any) => p.user_profile_id).filter(Boolean))];
    const photoMap: { [key: string]: string | null } = {};
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, photo_url')
        .in('id', userIds);
      
      if (profiles) {
        profiles.forEach((p: any) => {
          photoMap[p.id] = p.photo_url;
        });
      }

      const { data: fakeProfiles } = await supabase
        .from('fake_user_profiles')
        .select('id, photo_url')
        .in('id', userIds);
      
      if (fakeProfiles) {
        fakeProfiles.forEach((p: any) => {
          photoMap[p.id] = p.photo_url;
        });
      }
    }

    return data.map((post: any) => ({
      ...post,
      user_profiles: post.user_profile_id && photoMap[post.user_profile_id] ? { photo_url: photoMap[post.user_profile_id] } : null,
      fake_user_profiles: post.user_profile_id && photoMap[post.user_profile_id] ? { photo_url: photoMap[post.user_profile_id] } : null,
    }));
  } catch (error) {
    console.error('Erro ao buscar posts deletados:', error);
    return [];
  }
}

/**
 * Busca todos os usuários que têm posts
 */
export async function fetchUsersWithPosts(): Promise<Array<{ email: string; name: string; postsCount: number }>> {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('user_email, user_name')
      .is('deleted_at', null);

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Agrupar por email e contar posts
    const userMap = new Map<string, { email: string; name: string; postsCount: number }>();
    
    data.forEach((post: any) => {
      const email = post.user_email;
      if (!userMap.has(email)) {
        userMap.set(email, {
          email,
          name: post.user_name || email,
          postsCount: 0,
        });
      }
      const user = userMap.get(email)!;
      user.postsCount++;
    });

    return Array.from(userMap.values()).sort((a, b) => b.postsCount - a.postsCount);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
}

/**
 * Busca posts por usuário
 */
export async function fetchPostsByUser(userEmail: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('user_email', userEmail)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts do usuário:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Buscar fotos de perfil
    const userIds = [...new Set(data.map((p: any) => p.user_profile_id).filter(Boolean))];
    const photoMap: { [key: string]: string | null } = {};
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, photo_url')
        .in('id', userIds);
      
      if (profiles) {
        profiles.forEach((p: any) => {
          photoMap[p.id] = p.photo_url;
        });
      }

      const { data: fakeProfiles } = await supabase
        .from('fake_user_profiles')
        .select('id, photo_url')
        .in('id', userIds);
      
      if (fakeProfiles) {
        fakeProfiles.forEach((p: any) => {
          photoMap[p.id] = p.photo_url;
        });
      }
    }

    return data.map((post: any) => ({
      ...post,
      user_profiles: post.user_profile_id && photoMap[post.user_profile_id] ? { photo_url: photoMap[post.user_profile_id] } : null,
      fake_user_profiles: post.user_profile_id && photoMap[post.user_profile_id] ? { photo_url: photoMap[post.user_profile_id] } : null,
    }));
  } catch (error) {
    console.error('Erro ao buscar posts do usuário:', error);
    return [];
  }
}

