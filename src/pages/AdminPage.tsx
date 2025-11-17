import React, { useEffect, useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Flag,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { 
  fetchPendingPosts, 
  fetchModerationQueue, 
  approvePost, 
  rejectPost,
  isModerator
} from '../services/feedService';
import Toast, { ToastType } from '../components/Toast';

export default function AdminPage({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'pending' | 'reports'>('pending');
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [moderationQueue, setModerationQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ show: boolean; message: string; type: ToastType }>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

  const checkAuthorization = async () => {
    const authorized = await isModerator();
    setIsAuthorized(authorized);
    if (!authorized) {
      showToast('Vous n\'êtes pas autorisé à accéder à cette page', 'error');
      setTimeout(() => {
        onBack();
      }, 2000);
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

      const [pending, reports] = await Promise.all([
        fetchPendingPosts(),
        fetchModerationQueue(),
      ]);
      setPendingPosts(pending);
      setModerationQueue(reports);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erreur lors du chargement des données', 'error');
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
        showToast('Post approuvé avec succès', 'success');
        await loadData();
      } else {
        showToast('Erreur lors de l\'approbation', 'error');
      }
    } catch (error) {
      console.error('Erro ao aprovar:', error);
      showToast('Erreur lors de l\'approbation', 'error');
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const handleReject = async (postId: string) => {
    setProcessing(prev => new Set(prev).add(postId));
    try {
      const success = await rejectPost(`community_${postId}`);
      if (success) {
        showToast('Post rejeté avec succès', 'success');
        await loadData();
      } else {
        showToast('Erreur lors du rejet', 'error');
      }
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
      showToast('Erreur lors du rejet', 'error');
    } finally {
      setProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2BC047]/10 via-white to-[#F7D25F]/10 pb-24">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Modération</h1>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-screen-xl mx-auto px-4 pt-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-[#18A238] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Posts en attente ({pendingPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'reports'
                ? 'bg-[#18A238] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Signalements ({moderationQueue.length})
          </button>
        </div>

        {/* Toast */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}

        {/* Content */}
        {loading || isAuthorized === null ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#18A238]" />
          </div>
        ) : !isAuthorized ? (
          <div className="text-center py-12 bg-white rounded-3xl shadow-md">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Accès non autorisé</p>
            <p className="text-sm text-gray-500 mt-2">Vous n'êtes pas autorisé à accéder à cette page.</p>
          </div>
        ) : activeTab === 'pending' ? (
          <div className="space-y-4">
            {pendingPosts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl shadow-md">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Aucun post en attente</p>
              </div>
            ) : (
              pendingPosts.map((post: any) => (
                <div
                  key={post.id}
                  className="bg-white rounded-3xl shadow-md p-6 space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {(post.user_profiles?.photo_url || post.fake_user_profiles?.photo_url) ? (
                        <img
                          src={post.user_profiles?.photo_url || post.fake_user_profiles?.photo_url}
                          alt={post.user_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                          {post.user_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900">{post.user_name}</p>
                        <p className="text-xs text-gray-400">{formatDate(post.created_at)}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      En attente
                    </span>
                  </div>

                  {/* Content */}
                  {post.content && (
                    <p className="text-gray-800 whitespace-pre-line">{post.content}</p>
                  )}
                  {post.image_url && (
                    <div className="rounded-2xl overflow-hidden">
                      <img src={post.image_url} alt="" className="w-full object-cover" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleApprove(post.id)}
                      disabled={processing.has(post.id)}
                      className="flex-1 px-4 py-2 bg-[#18A238] text-white rounded-xl font-medium hover:bg-[#147c2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processing.has(post.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approuver
                    </button>
                    <button
                      onClick={() => handleReject(post.id)}
                      disabled={processing.has(post.id)}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processing.has(post.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Rejeter
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {moderationQueue.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl shadow-md">
                <Flag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Aucun signalement</p>
              </div>
            ) : (
              moderationQueue.map((report: any) => (
                <div
                  key={report.id}
                  className="bg-white rounded-3xl shadow-md p-6 space-y-4"
                >
                  {/* Report Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Flag className="w-4 h-4 text-red-500" />
                        <p className="font-semibold text-gray-900">
                          Signalé par {report.reported_by_name}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">{formatDate(report.created_at)}</p>
                      {report.reason && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Raison:</span> {report.reason}
                        </p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      Signalement
                    </span>
                  </div>

                  {/* Post Content */}
                  {report.community_posts && (
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">
                          {report.community_posts.user_name}
                        </p>
                        <span className="text-xs text-gray-400">
                          {formatDate(report.community_posts.created_at)}
                        </span>
                      </div>
                      {report.community_posts.content && (
                        <p className="text-gray-800 whitespace-pre-line">
                          {report.community_posts.content}
                        </p>
                      )}
                      {report.community_posts.image_url && (
                        <div className="rounded-xl overflow-hidden">
                          <img
                            src={report.community_posts.image_url}
                            alt=""
                            className="w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleApprove(report.post_id)}
                      disabled={processing.has(report.post_id)}
                      className="flex-1 px-4 py-2 bg-[#18A238] text-white rounded-xl font-medium hover:bg-[#147c2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processing.has(report.post_id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approuver
                    </button>
                    <button
                      onClick={() => handleReject(report.post_id)}
                      disabled={processing.has(report.post_id)}
                      className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processing.has(report.post_id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Rejeter
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

