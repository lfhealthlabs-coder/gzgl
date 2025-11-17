import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Flag,
  RefreshCw,
  Trash2,
  Users,
  FileText,
  BarChart3,
  Settings,
  Shield,
  Search,
  Filter,
  Calendar,
  Download,
  UserX,
  TrendingUp,
  Clock,
  X
} from 'lucide-react';
import Header from '../components/Header';
import { 
  fetchPendingPosts, 
  fetchModerationQueue, 
  approvePost, 
  rejectPost,
  isModerator,
  deleteCommunityPost,
  fetchAllPostsByStatus,
  fetchDeletedPosts,
  fetchUsersWithPosts,
  fetchPostsByUser
} from '../services/feedService';
import Toast, { ToastType } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'reports' | 'stats' | 'all-posts' | 'deleted' | 'users'>('pending');
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [moderationQueue, setModerationQueue] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [deletedPosts, setDeletedPosts] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<Array<{ email: string; name: string; postsCount: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
    show: false,
    message: '',
    type: 'success',
  });

  // Filtros
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Modal de rejeição
  const [rejectModal, setRejectModal] = useState<{
    show: boolean;
    postId: string | null;
    reason: string;
  }>({
    show: false,
    postId: null,
    reason: '',
  });

  // Estatísticas
  const [stats, setStats] = useState({
    totalPosts: 0,
    pendingPosts: 0,
    approvedPosts: 0,
    rejectedPosts: 0,
    deletedPosts: 0,
    totalReports: 0,
    pendingReports: 0,
    totalUsers: 0,
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const checkAuthorization = async () => {
    const authorized = await isModerator();
    setIsAuthorized(authorized);
    if (!authorized) {
      showToast('Você não está autorizado a acessar esta página', 'error');
    }
    return authorized;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const authorized = await checkAuthorization();
      if (!authorized) {
        setLoading(false);
        return;
      }

      const [pending, reports, approved, rejected, deleted, users] = await Promise.all([
        fetchPendingPosts(),
        fetchModerationQueue(),
        fetchAllPostsByStatus('approved'),
        fetchAllPostsByStatus('rejected'),
        fetchDeletedPosts(),
        fetchUsersWithPosts(),
      ]);
      
      setPendingPosts(pending);
      setModerationQueue(reports);
      setDeletedPosts(deleted);
      setUsersList(users);
      
      // Combinar todos os posts para visualização (sem os deletados)
      setAllPosts([...pending, ...approved, ...rejected].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));

      // Atualizar estatísticas
      setStats({
        totalPosts: pending.length + approved.length + rejected.length,
        pendingPosts: pending.length,
        approvedPosts: approved.length,
        rejectedPosts: rejected.length,
        deletedPosts: deleted.length,
        totalReports: reports.length,
        pendingReports: reports.filter((r: any) => r.status === 'pending').length,
        totalUsers: users.length,
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar os dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (postId: string) => {
    setProcessing(prev => new Set(prev).add(postId));
    try {
      const success = await approvePost(`community_${postId}`);
      if (success) {
        showToast('Post aprovado com sucesso', 'success');
        await loadData();
      } else {
        showToast('Erro ao aprovar o post', 'error');
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      showToast('Erro ao aprovar o post', 'error');
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleRejectClick = (postId: string) => {
    setRejectModal({
      show: true,
      postId,
      reason: '',
    });
  };

  const handleRejectConfirm = async () => {
    if (!rejectModal.postId) return;

    const postId = rejectModal.postId;
    setProcessing(prev => new Set(prev).add(postId));
    setRejectModal({ show: false, postId: null, reason: '' });

    try {
      const reason = rejectModal.reason.trim() || undefined;
      const success = await rejectPost(`community_${postId}`, reason);
      if (success) {
        showToast('Post rejeitado com sucesso', 'success');
        await loadData();
      } else {
        showToast('Erro ao rejeitar o post', 'error');
      }
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      showToast('Erro ao rejeitar o post', 'error');
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleDelete = async (postId: string) => {
    setProcessing(prev => new Set(prev).add(postId));
    try {
      const success = await deleteCommunityPost(`community_${postId}`, true);
      if (success) {
        showToast('Post excluído com sucesso', 'success');
        await loadData();
      } else {
        showToast('Erro ao excluir o post', 'error');
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      showToast('Erro ao excluir o post', 'error');
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `Há ${minutes} min`;
    if (hours < 24) return `Há ${hours}h`;
    if (days < 7) return `Há ${days}d`;

    const pad = (n: number) => String(n).padStart(2, '0');
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return `${pad(date.getDate())} ${meses[date.getMonth()]} às ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  // Filtrar posts
  const getFilteredPosts = (posts: any[]) => {
    let filtered = [...posts];

    // Filtro por texto
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(post => 
        post.content?.toLowerCase().includes(searchLower) ||
        post.user_name?.toLowerCase().includes(searchLower) ||
        post.user_email?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por usuário
    if (selectedUser) {
      filtered = filtered.filter(post => post.user_email === selectedUser);
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    // Filtro por data
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(post => {
        const postDate = new Date(post.created_at);
        return postDate >= filterDate;
      });
    }

    return filtered;
  };

  const renderPost = (post: any) => {
    const isProcessing = processing.has(post.id);
    const isDeleted = !!post.deleted_at;
    const deletedByUser = post.deleted_by_type === 'user';
    
    const statusColor = 
      isDeleted ? 'bg-gray-100 text-gray-800' :
      post.status === 'approved' ? 'bg-green-100 text-green-800' :
      post.status === 'rejected' ? 'bg-red-100 text-red-800' :
      'bg-yellow-100 text-yellow-800';
    
    const statusText = 
      isDeleted ? (deletedByUser ? 'Excluído pelo usuário' : 'Excluído por admin') :
      post.status === 'approved' ? 'Aprovado' :
      post.status === 'rejected' ? 'Rejeitado' :
      'Pendente';

    return (
      <div key={post.id} className={`bg-white rounded-3xl shadow-md p-5 mb-4 ${isDeleted ? 'opacity-75 border-2 border-gray-300' : ''}`}>
        <div className="flex items-start gap-3 mb-3">
          {(post.user_profiles?.photo_url || post.fake_user_profiles?.photo_url) ? (
            <img
              src={post.user_profiles?.photo_url || post.fake_user_profiles?.photo_url}
              alt={post.user_name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-800">
              {post.user_name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-bold text-gray-900">{post.user_name}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                {statusText}
              </span>
              {isDeleted && deletedByUser && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                  <UserX className="w-3 h-3" />
                  Auto-excluído
                </span>
              )}
              {isDeleted && !deletedByUser && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Excluído por admin
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">
              Criado: {formatDate(new Date(post.created_at))}
            </span>
            {isDeleted && post.deleted_at && (
              <span className="text-xs text-gray-400 ml-2">
                • Excluído: {formatDate(new Date(post.deleted_at))}
              </span>
            )}
            <p className="text-xs text-gray-500 mt-1">{post.user_email}</p>
          </div>
        </div>
        
        {post.content && (
          <p className="text-gray-800 whitespace-pre-line mb-3">{post.content}</p>
        )}
        
        {post.image_url && (
          <div className="rounded-2xl overflow-hidden mb-3">
            <img src={post.image_url} alt="" className="w-full object-cover max-h-64" />
          </div>
        )}

        {!isDeleted && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
            {post.status === 'pending' && (
              <>
                <button
                  onClick={() => handleApprove(post.id)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Aprovar
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleRejectClick(post.id)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Rejeitar
                    </>
                  )}
                </button>
              </>
            )}
            <button
              onClick={() => handleDelete(post.id)}
              disabled={isProcessing}
              className="px-4 py-2 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  if (isAuthorized === null || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2BC047]/10 via-white to-[#F7D25F]/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#18A238]" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2BC047]/10 via-white to-[#F7D25F]/10 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso não autorizado</h2>
          <p className="text-gray-600">Você não tem as permissões necessárias para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2BC047]/10 via-white to-[#F7D25F]/10 pb-24">
      <Header />
      
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      {/* Modal de rejeição */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Rejeitar publicação</h3>
            <p className="text-gray-600 mb-4">
              Deseja rejeitar esta publicação? Você pode adicionar um motivo opcional que será enviado ao usuário.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Motivo da rejeição (opcional)
              </label>
              <textarea
                value={rejectModal.reason}
                onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                placeholder="Ex: Conteúdo inadequado, viola as regras da comunidade..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1">
                {rejectModal.reason.length}/500 caracteres
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal({ show: false, postId: null, reason: '' })}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Rejeitar
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-screen-xl mx-auto px-4 pt-20">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-600" />
            Painel de Administração
          </h1>
          <p className="text-gray-600">Gerencie as publicações e a moderação da comunidade</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Pendentes</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingPosts}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Aprovados</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.approvedPosts}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-gray-600">Rejeitados</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.rejectedPosts}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex items-center gap-3 mb-2">
              <Flag className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-gray-600">Denúncias</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.pendingReports}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Total denúncias</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.totalReports}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por texto, nome ou email..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {/* Filtro por usuário */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Usuário</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm"
                >
                  <option value="">Todos os usuários</option>
                  {usersList.map((user) => (
                    <option key={user.email} value={user.email}>
                      {user.name} ({user.postsCount} posts)
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por status */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="pending">Pendentes</option>
                  <option value="approved">Aprovados</option>
                  <option value="rejected">Rejeitados</option>
                </select>
              </div>

              {/* Filtro por data */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Período</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm"
                >
                  <option value="all">Todo o período</option>
                  <option value="today">Hoje</option>
                  <option value="week">Últimos 7 dias</option>
                  <option value="month">Último mês</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Abas */}
        <div className="bg-white rounded-2xl shadow-md p-2 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                activeTab === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Pendentes ({stats.pendingPosts})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                activeTab === 'reports'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Flag className="w-4 h-4 inline mr-2" />
              Denúncias ({stats.pendingReports})
            </button>
            <button
              onClick={() => setActiveTab('all-posts')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                activeTab === 'all-posts'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Todos os posts ({stats.totalPosts})
            </button>
            <button
              onClick={() => setActiveTab('deleted')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                activeTab === 'deleted'
                  ? 'bg-gray-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Excluídos ({stats.deletedPosts})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Usuários ({stats.totalUsers})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Estatísticas
            </button>
          </div>
        </div>

        {/* Conteúdo das abas */}
        {activeTab === 'pending' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Posts pendentes de moderação
              {getFilteredPosts(pendingPosts).length !== pendingPosts.length && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({getFilteredPosts(pendingPosts).length} de {pendingPosts.length})
                </span>
              )}
            </h2>
            {getFilteredPosts(pendingPosts).length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">
                  {pendingPosts.length === 0 
                    ? 'Nenhum post pendente de moderação' 
                    : 'Nenhum post encontrado com os filtros aplicados'}
                </p>
              </div>
            ) : (
              <div>
                {getFilteredPosts(pendingPosts).map(renderPost)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Denúncias</h2>
            {moderationQueue.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <Flag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma denúncia pendente</p>
              </div>
            ) : (
              <div>
                {moderationQueue.map((report: any) => {
                  const post = report.community_posts;
                  if (!post) return null;

                  return (
                    <div key={report.id} className="bg-white rounded-3xl shadow-md p-5 mb-4">
                      <div className="mb-4 p-3 bg-orange-50 rounded-xl border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Flag className="w-4 h-4 text-orange-500" />
                          <span className="font-semibold text-orange-900">Denunciado por: {report.reported_by_name}</span>
                        </div>
                        {report.reason && (
                          <p className="text-sm text-orange-800">Motivo: {report.reason}</p>
                        )}
                        <p className="text-xs text-orange-600 mt-1">
                          {formatDate(new Date(report.created_at))}
                        </p>
                      </div>
                      {renderPost(post)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'all-posts' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Todos os posts
              {getFilteredPosts(allPosts).length !== allPosts.length && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({getFilteredPosts(allPosts).length} de {allPosts.length})
                </span>
              )}
            </h2>
            {getFilteredPosts(allPosts).length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {allPosts.length === 0 
                    ? 'Nenhum post encontrado' 
                    : 'Nenhum post encontrado com os filtros aplicados'}
                </p>
              </div>
            ) : (
              <div>
                {getFilteredPosts(allPosts).map(renderPost)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'deleted' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Posts excluídos
              {getFilteredPosts(deletedPosts).length !== deletedPosts.length && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({getFilteredPosts(deletedPosts).length} de {deletedPosts.length})
                </span>
              )}
            </h2>
            {getFilteredPosts(deletedPosts).length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <Trash2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {deletedPosts.length === 0 
                    ? 'Nenhum post excluído' 
                    : 'Nenhum post encontrado com os filtros aplicados'}
                </p>
              </div>
            ) : (
              <div>
                {getFilteredPosts(deletedPosts).map(renderPost)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Usuários da comunidade</h2>
            {usersList.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum usuário encontrado</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {usersList.map((user) => (
                  <div
                    key={user.email}
                    className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedUser(user.email);
                      setActiveTab('all-posts');
                      setShowFilters(true);
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Posts</span>
                      <span className="text-lg font-bold text-purple-600">{user.postsCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Estatísticas detalhadas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Distribuição dos posts</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Aprovados</span>
                      <span className="font-bold text-green-600">{stats.approvedPosts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Pendentes</span>
                      <span className="font-bold text-yellow-600">{stats.pendingPosts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rejeitados</span>
                      <span className="font-bold text-red-600">{stats.rejectedPosts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Excluídos</span>
                      <span className="font-bold text-gray-600">{stats.deletedPosts}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Denúncias e Usuários</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Denúncias pendentes</span>
                      <span className="font-bold text-orange-600">{stats.pendingReports}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total denúncias</span>
                      <span className="font-bold text-gray-900">{stats.totalReports}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total usuários</span>
                      <span className="font-bold text-indigo-600">{stats.totalUsers}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top usuários */}
            {usersList.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Top usuários por posts
                </h3>
                <div className="space-y-3">
                  {usersList.slice(0, 10).map((user, index) => (
                    <div
                      key={user.email}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedUser(user.email);
                        setActiveTab('all-posts');
                        setShowFilters(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="font-bold text-purple-600">{user.postsCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estatísticas de exclusão */}
            {deletedPosts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-gray-600" />
                  Estatísticas de exclusão
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <UserX className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-700">Excluídos pelo usuário</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {deletedPosts.filter((p: any) => p.deleted_by_type === 'user').length}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-gray-700">Excluídos por admin</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {deletedPosts.filter((p: any) => p.deleted_by_type === 'admin').length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

