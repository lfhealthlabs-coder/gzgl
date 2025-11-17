import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Header from '../components/Header';
import {
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Send,
  Filter,
  Trophy,
  Newspaper,
  Loader2,
  Trash2,
  X,
  ChevronRight,
  ChevronDown,
  Flag,
} from 'lucide-react';
import {
  fetchFeed,
  hasReaction,
  FeedItem,
  FeedSource,
  ReactionType,
  createCommunityPost,
  saveReactionToDatabase,
  createComment,
  fetchComments,
  deleteCommunityPost,
  reportPost,
  fetchUserPostsByStatus,
  Comment,
  isModerator,
} from '../services/feedService';
import { getProfile, updateProfile } from '../services/profileService';
import Toast, { ToastType } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

export default function CommunautePage() {
  // ---- config do "usuário atual" do composer ----
  const userDisplayName = 'Utilisateur';
  const userInitial = 'U';

  // ---- Estado do popup de nome ----
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempName, setTempName] = useState('');
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; photoUrl?: string | null } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [commentsData, setCommentsData] = useState<{ [key: string]: Comment[] }>({});
  const [loadingComments, setLoadingComments] = useState<Set<string>>(new Set());
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [commentReactions, setCommentReactions] = useState<{ [key: string]: { like: number; userReactions: ReactionType[] } }>({});
  const [isPublishingComment, setIsPublishingComment] = useState<{ [key: string]: boolean }>({});
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
    show: false,
    message: '',
    type: 'info',
  });
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // ---- topo: membros ativos (bubbles) ----
  const members = useMemo(() => ['Marie L.', 'Jean P.', 'Sophie M.', 'Pierre D.'], []);
  const [extraActive, setExtraActive] = useState<number>(17);

  useEffect(() => {
    const updateRandom = () => setExtraActive(Math.floor(Math.random() * (43 - 3 + 1)) + 3);
    updateRandom();
    const interval = setInterval(updateRandom, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ---- Feed state ----
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSource, setSelectedSource] = useState<FeedSource | undefined>();
  const [selectedLottery] = useState<string | undefined>();
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentTexts, setCommentTexts] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState<'feed' | 'my-posts'>('feed');
  const [myPosts, setMyPosts] = useState<{ pending: any[]; approved: any[]; rejected: any[] }>({
    pending: [],
    approved: [],
    rejected: [],
  });
  const [loadingMyPosts, setLoadingMyPosts] = useState(false);
  const [isCurrentUserModerator, setIsCurrentUserModerator] = useState(false);

  // Verificar se o usuário atual é moderador
  useEffect(() => {
    const checkModerator = async () => {
      const isMod = await isModerator();
      setIsCurrentUserModerator(isMod);
    };
    checkModerator();
  }, []);

  // ---- helpers ----
  const initialOf = (name: string) => (name?.trim()?.[0] ?? '?').toUpperCase();
  const pastelFromString = (s: string) => {
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h}deg 55% 80%)`;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;

    const pad = (n: number) => String(n).padStart(2, '0');
    const mois = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
    return `${pad(date.getDate())} ${mois[date.getMonth()]} à ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  // ---- Carregar feed ----
  const loadFeed = useCallback(
    async (reset: boolean = false, currentCursor?: string) => {
      if (reset) {
        setLoading(true);
        setFeedItems([]);
        setNextCursor(undefined);
      } else {
        setLoadingMore(true);
      }

      try {
        const response = await fetchFeed(
          {
            source: selectedSource,
            lotteryId: selectedLottery,
          },
          {
            cursor: reset ? undefined : currentCursor,
            limit: 20,
          }
        );

        if (reset) {
          setFeedItems(response.items);
        } else {
          setFeedItems(prev => [...prev, ...response.items]);
        }

        setNextCursor(response.nextCursor);
        setHasMore(response.hasMore);
      } catch (error) {
        console.error('Erro ao carregar feed:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [selectedSource, selectedLottery]
  );

  // Carregar feed inicial
  useEffect(() => {
    loadFeed(true);
  }, [selectedSource, selectedLottery, loadFeed]);

  // Carregar posts do usuário
  const loadMyPosts = useCallback(async () => {
    setLoadingMyPosts(true);
    try {
      const [pending, approved, rejected] = await Promise.all([
        fetchUserPostsByStatus('pending'),
        fetchUserPostsByStatus('approved'),
        fetchUserPostsByStatus('rejected'),
      ]);
      setMyPosts({ pending, approved, rejected });
    } catch (error) {
      console.error('Erro ao carregar posts do usuário:', error);
    } finally {
      setLoadingMyPosts(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'my-posts') {
      loadMyPosts();
    }
  }, [activeTab, loadMyPosts]);

  // Verificar se precisa mostrar popup de nome e carregar perfil
  useEffect(() => {
    const loadUserProfile = async () => {
      const profile = await getProfile();
      setUserProfile({ name: profile.name, email: profile.email, photoUrl: profile.photoUrl });
      if (profile.name === 'Utilisateur') {
        setShowNameModal(true);
        setTempName('');
      }
    };
    loadUserProfile();
  }, []);

  // Salvar nome do usuário
  const handleSaveName = async () => {
    if (!tempName.trim()) {
      setToast({ show: true, message: 'Veuillez saisir un nom', type: 'error' });
      return;
    }

    const email = localStorage.getItem('user_email');
    if (!email) return;

    try {
      const updatedProfile = await updateProfile({ name: tempName.trim() });
      setUserProfile({ name: updatedProfile.name, email: updatedProfile.email, photoUrl: updatedProfile.photoUrl });
      setShowNameModal(false);
      setTempName('');
      setToast({ show: true, message: 'Nom enregistré avec succès !', type: 'success' });
      
      // Recarregar feed para atualizar nomes nos posts e comentários
      // O trigger SQL já atualiza automaticamente, mas recarregamos para ver as mudanças
      loadFeed(true);
    } catch (error) {
      console.error('Erro ao salvar nome:', error);
      setToast({ show: true, message: 'Erreur lors de l\'enregistrement du nom. Veuillez réessayer.', type: 'error' });
    }
  };

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ show: true, message, type });
  };

  // ---- Reações ----
  const handleReaction = async (itemId: string, source: FeedSource, reactionType: ReactionType) => {
    const userEmail = localStorage.getItem('user_email') || '';
    if (!userEmail) return;

    // Salvar no banco de dados
    const success = await saveReactionToDatabase(itemId, source, reactionType, userEmail);

    if (success) {
      // Atualizar estado local
      setFeedItems(prev =>
        prev.map(item => {
          if (item.id !== itemId) return item;
          const currentReactions = item.userReactions || [];
          const hasReaction = currentReactions.includes(reactionType);
          const newReactions = hasReaction
            ? currentReactions.filter(r => r !== reactionType)
            : [...currentReactions, reactionType];

          return {
            ...item,
            userReactions: newReactions,
            reactions: {
              like: (item.reactions?.like || 0) + (reactionType === 'like' ? (hasReaction ? -1 : 1) : 0),
            },
          };
        })
      );
    }
  };

  // ---- Composer (novo post) ----
  const [composerText, setComposerText] = useState('');
  const [composerImage, setComposerImage] = useState<string | undefined>(undefined);

  const handlePickImage: React.ChangeEventHandler<HTMLInputElement> = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setComposerImage(url);
    // Limpar o input para permitir selecionar a mesma imagem novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const publishComposer = async () => {
    if (isPublishing) return; // Prevenir múltiplas publicações
    if (!composerText.trim() && !composerImage) return;

    const userEmail = localStorage.getItem('user_email') || '';
    if (!userEmail) {
      showToast('Vous devez être connecté pour publier', 'error');
      return;
    }

    // Verificar se o nome foi definido
    if (userProfile?.name === 'Utilisateur') {
      setShowNameModal(true);
      return;
    }

    setIsPublishing(true);

    try {
      // Buscar perfil do usuário
      const profile = await getProfile();

      // Salvar no Supabase
      const newPost = await createCommunityPost({
        content: composerText.trim(),
        imageUrl: composerImage,
        userEmail: userEmail,
        userName: profile.name || userDisplayName,
      });

      if (newPost) {
        // Não adicionar ao feed otimisticamente, pois está pendente
        setComposerText('');
        setComposerImage(undefined);
        showToast('Publication soumise pour modération. Elle apparaîtra après approbation.', 'success');
        // Recarregar feed em background (mas o post não aparecerá até ser aprovado)
        setTimeout(() => {
          loadFeed(true);
          if (activeTab === 'my-posts') {
            loadMyPosts();
          }
        }, 500);
      } else {
        showToast('Erreur lors de la publication. Veuillez réessayer.', 'error');
      }
    } finally {
      // Delay de 2 segundos antes de permitir nova publicação
      setTimeout(() => {
        setIsPublishing(false);
      }, 2000);
    }
  };

  // ---- Comentários ----
  const toggleCommentBox = async (itemId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
        // Remover comentários do estado quando fechar
        setCommentsData(prev => {
          const newData = { ...prev };
          delete newData[itemId];
          return newData;
        });
      } else {
        newSet.add(itemId);
        // Carregar comentários quando abrir
        loadComments(itemId);
      }
      return newSet;
    });
  };

  const loadComments = async (itemId: string) => {
    if (loadingComments.has(itemId)) return;

    setLoadingComments(prev => new Set(prev).add(itemId));
    try {
      const comments = await fetchComments(itemId);
      setCommentsData(prev => ({ ...prev, [itemId]: comments }));

      // Carregar reações de todos os comentários
      const reactionsPromises: Promise<void>[] = [];
      const loadReactionsRecursive = (comms: Comment[]) => {
        comms.forEach(comment => {
          reactionsPromises.push(
            fetchCommentReactions(comment.id).then(reactions => {
              setCommentReactions(prev => ({ ...prev, [comment.id]: reactions }));
            })
          );
          if (comment.replies && comment.replies.length > 0) {
            loadReactionsRecursive(comment.replies);
          }
        });
      };
      loadReactionsRecursive(comments);
      await Promise.all(reactionsPromises);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    } finally {
      setLoadingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const publishComment = async (itemId: string, source: FeedSource, parentCommentId?: string) => {
    const commentKey = parentCommentId ? `${itemId}_${parentCommentId}` : itemId;
    const comment = parentCommentId ? replyTexts[commentKey] : commentTexts[itemId];
    if (!comment?.trim()) return;

    // Prevenir múltiplas publicações
    if (isPublishingComment[commentKey]) return;

    const userEmail = localStorage.getItem('user_email') || '';
    if (!userEmail) {
      showToast('Vous devez être connecté pour commenter', 'error');
      return;
    }

    // Verificar se o nome foi definido
    if (userProfile?.name === 'Utilisateur') {
      setShowNameModal(true);
      return;
    }

    setIsPublishingComment(prev => ({ ...prev, [commentKey]: true }));

    try {
      // Buscar perfil do usuário
      const profile = await getProfile();

      // Atualização otimista: adicionar comentário localmente
      const tempComment: Comment = {
        id: `temp_${Date.now()}`,
        userName: profile.name || userDisplayName,
        userEmail: userEmail,
        userPhotoUrl: profile.photoUrl || null,
        content: comment.trim(),
        createdAt: new Date(),
        parentCommentId: parentCommentId,
      likes: 0,
        replies: [],
      };

      // Adicionar comentário otimista
      setCommentsData(prev => {
        const current = prev[itemId] || [];
        if (parentCommentId) {
          // Adicionar como resposta
          const updated = current.map(c => {
            if (c.id === parentCommentId) {
              return { ...c, replies: [...(c.replies || []), tempComment] };
            }
            // Buscar recursivamente
            const updateReplies = (comms: Comment[]): Comment[] => {
              return comms.map(comm => {
                if (comm.id === parentCommentId) {
                  return { ...comm, replies: [...(comm.replies || []), tempComment] };
                }
                if (comm.replies && comm.replies.length > 0) {
                  return { ...comm, replies: updateReplies(comm.replies) };
                }
                return comm;
              });
            };
            if (c.replies && c.replies.length > 0) {
              return { ...c, replies: updateReplies(c.replies) };
            }
            return c;
          });
          return { ...prev, [itemId]: updated };
        } else {
          // Adicionar como comentário principal
          return { ...prev, [itemId]: [...current, tempComment] };
        }
      });

      // Limpar campo imediatamente
      if (parentCommentId) {
        setReplyTexts(prev => {
          const newTexts = { ...prev };
          delete newTexts[commentKey];
          return newTexts;
        });
      } else {
        setCommentTexts(prev => {
          const newTexts = { ...prev };
          delete newTexts[itemId];
          return newTexts;
        });
      }

      // Salvar comentário no Supabase
      const success = await createComment({
        feedItemId: itemId,
        feedSource: source,
        content: comment.trim(),
        userEmail: userEmail,
        userName: profile.name || userDisplayName,
        parentCommentId: parentCommentId,
      });

      if (success) {
        // Recarregar comentários do banco para pegar o ID real
        await loadComments(itemId);
        // Atualizar contador de comentários no feed
        setFeedItems(prev =>
          prev.map(item => {
            if (item.id === itemId) {
              return { ...item, comments: (item.comments || 0) + 1 };
            }
            return item;
          })
        );
        showToast('Commentaire publié avec succès !', 'success');
      } else {
        // Reverter atualização otimista em caso de erro
        setCommentsData(prev => {
          const current = prev[itemId] || [];
          if (parentCommentId) {
            const updated = current.map(c => {
              if (c.id === parentCommentId) {
                return { ...c, replies: (c.replies || []).filter(r => r.id !== tempComment.id) };
              }
              const updateReplies = (comms: Comment[]): Comment[] => {
                return comms.map(comm => {
                  if (comm.id === parentCommentId) {
                    return { ...comm, replies: (comm.replies || []).filter(r => r.id !== tempComment.id) };
                  }
                  if (comm.replies && comm.replies.length > 0) {
                    return { ...comm, replies: updateReplies(comm.replies) };
                  }
                  return comm;
                });
              };
              if (c.replies && c.replies.length > 0) {
                return { ...c, replies: updateReplies(c.replies) };
              }
              return c;
            });
            return { ...prev, [itemId]: updated };
          } else {
            return { ...prev, [itemId]: current.filter(c => c.id !== tempComment.id) };
          }
        });
        showToast('Erreur lors de la publication du commentaire. Veuillez réessayer.', 'error');
      }
    } finally {
      // Delay de 1 segundo antes de permitir nova publicação
      setTimeout(() => {
        setIsPublishingComment(prev => {
          const newState = { ...prev };
          delete newState[commentKey];
          return newState;
        });
      }, 1000);
    }
  };

  const handleCommentReaction = async (commentId: string, reactionType: ReactionType) => {
    const userEmail = localStorage.getItem('user_email') || '';
    if (!userEmail) return;

    const success = await saveCommentReaction(commentId, reactionType, userEmail);
    if (success) {
      // Recarregar reações do comentário
      const reactions = await fetchCommentReactions(commentId);
      setCommentReactions(prev => ({ ...prev, [commentId]: reactions }));
    }
  };

  // Função recursiva para renderizar comentários com setinhas
  const renderComment = (comment: Comment, itemId: string, depth: number = 0): React.ReactNode => {
    const reactions = commentReactions[comment.id] || { like: 0, userReactions: [] };
    const hasLike = reactions.userReactions.includes('like');
    const showReplies = expandedReplies.has(comment.id);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const commentKey = `${itemId}_${comment.id}`;
    const isPublishing = isPublishingComment[commentKey] || false;

    return (
      <div key={comment.id} className="space-y-2">
        {/* Comentário */}
        <div className="flex gap-2">
          {/* Setinha indicando resposta (se for resposta) */}
          {depth > 0 && (
            <div className="flex-shrink-0 w-6 flex items-start justify-center pt-2">
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          )}
          
          {/* Avatar */}
          {comment.userPhotoUrl ? (
            <img
              src={comment.userPhotoUrl}
              alt={comment.userName}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-800 text-xs flex-shrink-0"
              style={{ background: pastelFromString(comment.userName) }}
            >
              {initialOf(comment.userName)}
            </div>
          )}
          
          {/* Conteúdo do comentário */}
          <div className="flex-1 bg-gray-50 rounded-2xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-gray-900">{comment.userName}</span>
              {comment.isModerator && (
                <span className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full font-semibold flex items-center gap-1">
                  <span>👑</span>
                  Admin
                </span>
              )}
              <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line mb-2">{comment.content}</p>

            {/* Reações do comentário */}
            <div className="flex items-center gap-3 text-xs text-gray-600 mt-2 flex-wrap">
              <button
                onClick={() => handleCommentReaction(comment.id, 'like')}
                className={`flex items-center gap-1 transition-colors ${hasLike ? 'text-[#18A238]' : 'hover:text-[#18A238]'}`}
              >
                <Heart className={`w-3.5 h-3.5 ${hasLike ? 'fill-current' : ''}`} />
                <span>{reactions.like || 0}</span>
              </button>
              
              {/* Botão para ver/esconder respostas */}
              {hasReplies && (
                <button
                  onClick={() => {
                    setExpandedReplies(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(comment.id)) {
                        newSet.delete(comment.id);
                      } else {
                        newSet.add(comment.id);
                      }
                      return newSet;
                    });
                  }}
                  className="flex items-center gap-1 text-xs hover:text-[#18A238] transition-colors"
                >
                  {showReplies ? (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      <span>Masquer {comment.replies.length} {comment.replies.length === 1 ? 'réponse' : 'réponses'}</span>
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-3 h-3" />
                      <span>Voir {comment.replies.length} {comment.replies.length === 1 ? 'réponse' : 'réponses'}</span>
                    </>
                  )}
                </button>
              )}
              
              {/* Botão responder */}
              <button
                onClick={() => {
                  setExpandedReplies(prev => {
                    const newSet = new Set(prev);
                    newSet.add(comment.id);
                    return newSet;
                  });
                }}
                className="text-xs hover:text-[#18A238] transition-colors"
              >
                Répondre
              </button>
            </div>
          </div>
        </div>

        {/* Respostas (ocultas por padrão, mostradas quando expandidas) */}
        {showReplies && (
          <div className="ml-10 space-y-2">
            {/* Lista de respostas */}
            {hasReplies && (
              <div className="space-y-2">
                {comment.replies.map(reply => renderComment(reply, itemId, depth + 1))}
              </div>
            )}

            {/* Caixa de resposta */}
            <div className="flex gap-2">
              <div className="w-6 h-6 flex-shrink-0" />
              <div className="flex-1">
                <textarea
                  value={replyTexts[commentKey] || ''}
                  onChange={e => setReplyTexts(prev => ({ ...prev, [commentKey]: e.target.value }))}
                  placeholder="Écrivez une réponse…"
                  className="w-full rounded-xl border border-gray-200 focus:border-[#18A238] focus:ring-2 focus:ring-[#18A238]/20 outline-none p-2 text-xs"
                  rows={2}
                />
                <div className="mt-1 flex justify-end">
                  <button
                    onClick={() => publishComment(itemId, 'community', comment.id)}
                    disabled={isPublishing}
                    className="px-3 py-1 rounded-lg bg-[#18A238] text-white text-xs font-medium hover:bg-[#147c2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Publication...
                      </>
                    ) : (
                      'Publier'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Reportar post
  const handleReportPost = async (itemId: string) => {
    setConfirmModal({
      show: true,
      title: 'Signaler ce post',
      message: 'Voulez-vous signaler ce post pour modération ?',
      onConfirm: async () => {
        const success = await reportPost(itemId);
        if (success) {
          showToast('Post signalé avec succès', 'success');
        } else {
          showToast('Erreur lors du signalement. Veuillez réessayer.', 'error');
        }
        setConfirmModal({ show: false, title: '', message: '', onConfirm: () => {} });
      },
    });
  };

  // Deletar post
  const handleDeletePost = (itemId: string) => {
    setConfirmModal({
      show: true,
      title: 'Supprimer la publication',
      message: 'Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible.',
      onConfirm: async () => {
        // Permitir que moderadores deletem qualquer post
        const success = await deleteCommunityPost(itemId, isCurrentUserModerator);
        if (success) {
          // Atualização otimista: remover post do feed imediatamente
          setFeedItems(prev => prev.filter(item => item.id !== itemId));
          showToast('Publication supprimée avec succès', 'success');
          // Recarregar feed em background para garantir sincronização
          setTimeout(() => loadFeed(true), 500);
        } else {
          showToast('Erreur lors de la suppression. Veuillez réessayer.', 'error');
        }
        setConfirmModal({ show: false, title: '', message: '', onConfirm: () => {} });
      },
    });
  };

  // ---- Renderizar item do feed ----
  const renderFeedItem = (item: FeedItem) => {
    const isCommunity = item.source === 'community';
    const isDaily = item.source === 'daily';
    const isJackpot = item.source === 'jackpot';

    const hasLike = hasReaction(item.id, 'like');

    // Verificar se o post é do usuário atual ou se é moderador
    const userEmail = localStorage.getItem('user_email') || '';
    const canDelete = isCommunity && (item.userEmail === userEmail || isCurrentUserModerator);
    const canReport = isCommunity && item.userEmail !== userEmail && !isCurrentUserModerator;

    return (
      <article
        key={item.id}
        className="bg-white rounded-3xl shadow-lg p-5 interactive hover:shadow-xl transition-all duration-300"
      >
        {/* Header do item */}
        <header className="flex items-center gap-3 mb-3">
          {isCommunity && (
            <>
              {item.userPhotoUrl ? (
                <img
                  src={item.userPhotoUrl}
                  alt={item.name || 'U'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-800"
                  style={{ background: pastelFromString(item.name || 'U') }}
                >
                  {initialOf(item.name || 'U')}
                </div>
              )}
            </>
          )}
          {isDaily && (
            <div className="w-10 h-10 bg-gradient-to-br from-[#18A238] to-[#0B5F21] rounded-xl flex items-center justify-center flex-shrink-0">
              <Newspaper className="w-5 h-5 text-white" />
            </div>
          )}
          {isJackpot && (
            <div className="w-10 h-10 bg-gradient-to-br from-[#F7D25F] to-[#E6B800] rounded-xl flex items-center justify-center flex-shrink-0">
              <Trophy className="w-5 h-5 text-white" />
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isCommunity && (
                <>
                  <span className="font-bold text-gray-900">{item.name}</span>
                  {item.isModerator && (
                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full font-semibold flex items-center gap-1">
                      <span>👑</span>
                      Admin
                    </span>
                  )}
                </>
              )}
              {isDaily && <span className="font-bold text-gray-900">{item.title}</span>}
              {isJackpot && (
                <span className="font-bold text-gray-900">
                  {item.loterie}
                  {item.pays && ` (${item.pays})`}
                </span>
              )}
              {isDaily && (
                <span className="text-xs px-2 py-1 bg-[#18A238]/10 text-[#18A238] rounded-full">Mise à jour</span>
              )}
              {isJackpot && (
                <span className="text-xs px-2 py-1 bg-[#F7D25F]/20 text-[#E6B800] rounded-full">Jackpot</span>
              )}
              <div className="ml-auto flex items-center gap-2">
                {canReport && (
                  <button
                    onClick={() => handleReportPost(item.id)}
                    className="text-orange-500 hover:text-orange-700 transition-colors p-1"
                    aria-label="Signaler"
                    title="Signaler ce post"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDeletePost(item.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
          </div>
        </header>

        {/* Conteúdo */}
        {isCommunity && item.text && (
          <p className="text-gray-800 text-[14px] leading-snug whitespace-pre-line mb-3">{item.text}</p>
        )}
        {isDaily && item.excerpt && (
          <p className="text-gray-600 text-[13px] leading-tight whitespace-pre-line mb-3">{item.excerpt}</p>
        )}
        {isJackpot && (
          <div className="mb-3 space-y-2">
            {/* Valor do Jackpot */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#E6B800]">
                {item.valeur?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
              </span>
            </div>
            
            {/* Próxima data de sorteio */}
            {item.next_draw_date && (
              <p className="text-gray-700 text-[13px] font-medium">
                🗓️ Prochain tirage: {new Date(item.next_draw_date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            )}
            
            {/* Frequência e dias */}
            {item.draw_frequency && (
              <p className="text-gray-600 text-[12px]">
                📅 {item.draw_frequency}
                {item.draw_days && ` - ${item.draw_days}`}
              </p>
            )}
            
            {/* Formato dos números */}
            {item.number_format && (
              <p className="text-gray-600 text-[12px]">
                🎲 Format: {item.number_format}
              </p>
            )}
            
            {/* Valor do prêmio (faixa) */}
            {item.prize_value && (
              <p className="text-gray-600 text-[12px]">
                💰 {item.prize_value}
              </p>
            )}
            
            {/* Descrição */}
            {item.description && (
              <p className="text-gray-700 text-[13px] leading-relaxed mt-2">
                {item.description}
              </p>
            )}
          </div>
        )}

        {/* Imagem */}
        {item.image && (
          <div className="w-full rounded-2xl overflow-hidden mb-3">
            <img src={item.image} alt="" className="w-full object-cover" />
          </div>
        )}

        {/* Reações e ações */}
        <div className="flex items-center gap-4 text-sm text-gray-600 font-medium flex-wrap">
          {/* Like */}
          <button
            onClick={() => handleReaction(item.id, item.source, 'like')}
            className={`flex items-center gap-2 transition-colors ${
              hasLike ? 'text-[#18A238]' : 'hover:text-[#18A238]'
            }`}
            aria-label="J'aime"
          >
            <Heart className={`w-5 h-5 ${hasLike ? 'fill-current' : ''}`} />
            <span>{item.reactions?.like || 0}</span>
          </button>

          {/* Comentários (apenas para community) */}
          {isCommunity && (
            <button
              onClick={() => toggleCommentBox(item.id)}
              className="flex items-center gap-2 hover:text-[#18A238] transition-colors"
              aria-label="Commenter"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{item.comments || 0} commentaires</span>
            </button>
          )}
        </div>

        {/* Comentários */}
        {isCommunity && expandedComments.has(item.id) && (
          <div className="mt-4 space-y-4">
            {/* Lista de comentários */}
            {loadingComments.has(item.id) ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-[#18A238]" />
              </div>
            ) : commentsData[item.id] && commentsData[item.id].length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {commentsData[item.id].map(comment => {
                  return renderComment(comment, item.id, 0);
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-2">Aucun commentaire pour le moment</p>
            )}

            {/* Caixa de comentário principal */}
            <div>
              <textarea
                value={commentTexts[item.id] || ''}
                onChange={e => setCommentTexts(prev => ({ ...prev, [item.id]: e.target.value }))}
                placeholder="Écrivez votre réponse…"
                className="w-full rounded-2xl border border-gray-200 focus:border-[#18A238] focus:ring-2 focus:ring-[#18A238]/20 outline-none p-3 text-sm"
                rows={3}
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => publishComment(item.id, item.source)}
                  disabled={isPublishingComment[item.id] || false}
                  className="px-4 py-2 rounded-xl bg-[#18A238] text-white font-medium hover:bg-[#147c2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isPublishingComment[item.id] ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publication...
                    </>
                  ) : (
                    'Publier'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </article>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2BC047]/10 via-white to-[#F7D25F]/10 pb-24">
      <Header />

      {/* Toast */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Modal de confirmação */}
      <ConfirmModal
        isOpen={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => {
          setConfirmModal({ show: false, title: '', message: '', onConfirm: () => {} });
        }}
      />

      {/* Modal de nome obrigatório */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Définir votre nom</h2>
              <button
                onClick={() => {}}
                className="text-gray-400 hover:text-gray-600"
                disabled
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Pour participer à la communauté, veuillez définir votre nom d'affichage.
            </p>
            <input
              type="text"
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              placeholder="Votre nom"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#18A238] focus:ring-2 focus:ring-[#18A238]/20 outline-none mb-4"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleSaveName();
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveName}
                disabled={!tempName.trim()}
                className="flex-1 px-4 py-3 bg-[#18A238] text-white font-semibold rounded-xl hover:bg-[#147c2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-screen-xl mx-auto px-4 pt-20">
        {/* --- BARRA DE MEMBROS ATIVOS --- */}
        <section className="flex items-center gap-4 mb-6">
          <div className="flex -space-x-2">
            {members.map((m, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-gray-800 border-2 border-white"
                style={{ background: pastelFromString(m) }}
              >
                {initialOf(m)}
              </div>
            ))}
            <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-800 text-xs flex items-center justify-center border-2 border-white">
              +{extraActive}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-none">Communauté active</p>
            <p className="text-xs text-gray-500 leading-none">En ligne maintenant</p>
          </div>
        </section>

        {/* --- ABAS --- */}
        <section className="mb-6">
          <div className="flex gap-3 bg-white rounded-2xl shadow-md p-2">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === 'feed'
                  ? 'bg-[#18A238] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('my-posts')}
              className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === 'my-posts'
                  ? 'bg-[#18A238] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Mes publications
            </button>
          </div>
        </section>

        {/* --- FILTROS (apenas no feed) --- */}
        {activeTab === 'feed' && (
        <section className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-medium text-gray-700"
          >
            <Filter className="w-4 h-4" />
            Filtres
          </button>

          {showFilters && (
            <div className="mt-3 bg-white rounded-2xl shadow-md p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Source</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedSource(undefined)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      !selectedSource
                        ? 'bg-[#18A238] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tous
                  </button>
                  <button
                    onClick={() => setSelectedSource('community')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedSource === 'community'
                        ? 'bg-[#18A238] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Communauté
                  </button>
                  <button
                    onClick={() => setSelectedSource('daily')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedSource === 'daily'
                        ? 'bg-[#18A238] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Mises à jour
                  </button>
                  <button
                    onClick={() => setSelectedSource('jackpot')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedSource === 'jackpot'
                        ? 'bg-[#18A238] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Jackpots
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
        )}

        {/* --- COMPOSER (À quoi pensez-vous ?) --- */}
        <section className="bg-white rounded-3xl shadow-md p-4 mb-6">
          <div className="flex items-start gap-3">
            {userProfile?.photoUrl ? (
              <img
                src={userProfile.photoUrl}
                alt={userProfile.name || 'U'}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-800"
                style={{ background: pastelFromString(userProfile?.name || userDisplayName) }}
                aria-label={`Avatar ${userProfile?.name || userDisplayName}`}
            >
                {initialOf(userProfile?.name || userDisplayName)}
            </div>
            )}

            <div className="flex-1">
              <textarea
                value={composerText}
                onChange={e => setComposerText(e.target.value)}
                placeholder="À quoi pensez-vous ?"
                className="w-full rounded-2xl border border-gray-200 focus:border-[#18A238] focus:ring-2 focus:ring-[#18A238]/20 outline-none p-3 text-sm"
                rows={3}
              />

              {composerImage && (
                <div className="mt-3 rounded-2xl overflow-hidden relative">
                  <img src={composerImage} alt="aperçu" className="w-full object-cover" />
                  <button
                    onClick={() => {
                      setComposerImage(undefined);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    aria-label="Supprimer l'image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-gray-600 hover:text-[#18A238] cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePickImage}
                  />
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-sm">Ajouter une image</span>
                </label>

                <button
                  onClick={publishComposer}
                  disabled={isPublishing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7180ff] text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publication...
                    </>
                  ) : (
                    <>
                  <Send className="w-4 h-4" />
                  Publier
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- CONTEÚDO DAS ABAS --- */}
        {activeTab === 'feed' ? (
          <section className="space-y-6">
            {loading && feedItems.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#18A238]" />
              </div>
            ) : feedItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Aucun contenu à afficher</p>
              </div>
            ) : (
              <>
                {feedItems.map(renderFeedItem)}

                {/* Botão carregar mais */}
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => loadFeed(false, nextCursor)}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Chargement...
                        </>
                      ) : (
                        'Charger plus'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        ) : (
          <section className="space-y-6">
            {loadingMyPosts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#18A238]" />
              </div>
            ) : (
              <>
                {/* Posts Pendentes */}
                {myPosts.pending.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        En attente ({myPosts.pending.length})
                      </span>
                    </h3>
                    <div className="space-y-4">
                      {myPosts.pending.map((post: any) => (
                        <div key={post.id} className="bg-white rounded-3xl shadow-md p-5">
                          <div className="flex items-start gap-3 mb-3">
                            {(post.user_profiles?.photo_url || post.fake_user_profiles?.photo_url) ? (
                              <img
                                src={post.user_profiles?.photo_url || post.fake_user_profiles?.photo_url}
                                alt={post.user_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-800"
                                style={{ background: pastelFromString(post.user_name || 'U') }}
                              >
                                {initialOf(post.user_name || 'U')}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{post.user_name}</span>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                  En attente de modération
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">{formatDate(new Date(post.created_at))}</span>
                            </div>
                          </div>
                          {post.content && (
                            <p className="text-gray-800 whitespace-pre-line mb-3">{post.content}</p>
                          )}
                          {post.image_url && (
                            <div className="rounded-2xl overflow-hidden mb-3">
                              <img src={post.image_url} alt="" className="w-full object-cover" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Posts Aprovados */}
                {myPosts.approved.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Approuvés ({myPosts.approved.length})
                      </span>
                    </h3>
                    <div className="space-y-4">
                      {myPosts.approved.map((post: any) => {
                        const feedItem: FeedItem = {
                          id: `community_${post.id}`,
                          source: 'community',
                          createdAt: new Date(post.created_at),
                          name: post.user_name,
                          text: post.content,
                          image: post.image_url,
                          likes: post.likes_count || 0,
                          comments: post.comments_count || 0,
                          userEmail: post.user_email,
                          userPhotoUrl: post.user_profiles?.photo_url || post.fake_user_profiles?.photo_url || null,
                        };
                        return renderFeedItem(feedItem);
                      })}
                    </div>
                  </div>
                )}

                {/* Posts Rejeitados */}
                {myPosts.rejected.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        Rejetés ({myPosts.rejected.length})
                      </span>
                    </h3>
                    <div className="space-y-4">
                      {myPosts.rejected.map((post: any) => (
                        <div key={post.id} className="bg-white rounded-3xl shadow-md p-5">
                          <div className="flex items-start gap-3 mb-3">
                            {(post.user_profiles?.photo_url || post.fake_user_profiles?.photo_url) ? (
                              <img
                                src={post.user_profiles?.photo_url || post.fake_user_profiles?.photo_url}
                                alt={post.user_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-800"
                                style={{ background: pastelFromString(post.user_name || 'U') }}
                              >
                                {initialOf(post.user_name || 'U')}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{post.user_name}</span>
                                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                  Rejeté par la modération
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">{formatDate(new Date(post.created_at))}</span>
                            </div>
                          </div>
                          {post.content && (
                            <p className="text-gray-800 whitespace-pre-line mb-3">{post.content}</p>
                          )}
                          {post.image_url && (
                            <div className="rounded-2xl overflow-hidden mb-3">
                              <img src={post.image_url} alt="" className="w-full object-cover" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {myPosts.pending.length === 0 && myPosts.approved.length === 0 && myPosts.rejected.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <p>Vous n'avez pas encore de publications</p>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
