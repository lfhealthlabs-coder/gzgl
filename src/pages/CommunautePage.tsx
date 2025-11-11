import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import { Users, Heart, MessageCircle, Image as ImageIcon, Send } from 'lucide-react';

type Post = {
  id: number;
  name: string;
  date: string;
  text: string;
  image?: string;
  likes: number;
  comments: number;
  liked?: boolean;
  showComment?: boolean;
  reply?: string;
};

export default function CommunautePage() {
  // ---- config do "usuário atual" do composer ----
  const userDisplayName = 'Utilisateur';
  const userInitial = 'U';

  // ---- topo: membros ativos (bubbles) ----
  const members = useMemo(() => ['Marie L.', 'Jean P.', 'Sophie M.', 'Pierre D.'], []);
  const [extraActive, setExtraActive] = useState<number>(17);

  useEffect(() => {
    const updateRandom = () => setExtraActive(Math.floor(Math.random() * (43 - 3 + 1)) + 3);
    updateRandom();
    const interval = setInterval(updateRandom, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ---- feed de posts (estado) ----
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      name: 'Sylvie Beaudoin',
      date: '10 nov à 18:33',
      text: `Est-ce que ce programme n’est que pour les européens ou du Canada on peut y avoir accès`,
      likes: 3,
      comments: 1,
    },
    {
      id: 2,
      name: 'Lutgarde JAMAER',
      date: '09 nov à 16:59',
      text: `Belgique`,
      likes: 0,
      comments: 0,
    },
    {
      id: 3,
      name: 'Antoine Dupont',
      date: '08 nov à 12:21',
      text: `Je me suis inscrit sur LotoGains sans imaginer ce qui allait se passer… Quelques semaines plus tard, mes gains ont été si élevés que j’ai réalisé un rêve de longue date : conduire ma propre Mercedes-Benz Classe S. Si j’ai pu le faire, vous le pouvez aussi !`,
      image: '/image13.jpg',
      likes: 6,
      comments: 0,
    },
    {
      id: 4,
      name: 'Jean Dupont',
      date: '07 nov à 07:16',
      text: `Je viens juste d’entrer sur LotoGains. Je fais mes paris en ce moment même, souhaitez-moi bonne chance !`,
      likes: 1,
      comments: 0,
    },
    {
      id: 5,
      name: 'Louis Fontaine',
      date: '30 octobre à 14:20',
      text: `Me mes premiers 7000 euros sont déjà partis. J'ai acheté l'accès à LotoGains il y a seulement 7 jours.`,
      image: '/image14.jpg',
      likes: 1,
      comments: 0,
    },
    {
      id: 6,
      name: 'Pierre Dubois',
      date: '28 octobre à 11:02',
      text: `ENFIN!

Après 5 jours d'essai, j'ai réussi. Mon premier prix à la loterie. J'ai hâte d'offrir un nouveau téléphone portable à ma fille.`,
      image: '/image15.png',
      likes: 3,
      comments: 0,
    },
  ]);

  // ---- helpers ----
  const initialOf = (name: string) => (name?.trim()?.[0] ?? '?').toUpperCase();
  const pastelFromString = (s: string) => {
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h}deg 55% 80%)`;
  };

  // ---- ações dos posts ----
  const toggleLike = (id: number) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.likes + (!p.liked ? 1 : -1) }
          : p,
      ),
    );
  };

  const toggleCommentBox = (id: number) => {
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, showComment: !p.showComment } : p)));
  };

  const updateReply = (id: number, value: string) => {
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, reply: value } : p)));
  };

  const publishReply = (id: number) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        if (!p.reply?.trim()) return p;
        return { ...p, comments: p.comments + 1, reply: '' };
      }),
    );
  };

  // ---- composer (novo post) ----
  const [composerText, setComposerText] = useState('');
  const [composerImage, setComposerImage] = useState<string | undefined>(undefined);

  const handlePickImage: React.ChangeEventHandler<HTMLInputElement> = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setComposerImage(url);
  };

  const frenchNow = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const mois = ['janv', 'févr', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
    return `${pad(d.getDate())} ${mois[d.getMonth()]} à ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const publishComposer = () => {
    if (!composerText.trim() && !composerImage) return;
    const nextId = (posts[0]?.id ?? 0) + Math.floor(Math.random() * 1000) + 1;
    const newPost: Post = {
      id: nextId,
      name: userDisplayName,
      date: frenchNow(),
      text: composerText.trim(),
      image: composerImage,
      likes: 0,
      comments: 0,
    };
    setPosts(prev => [newPost, ...prev]); // aparece no topo
    setComposerText('');
    setComposerImage(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2BC047]/10 via-white to-[#F7D25F]/10 pb-24">
      <Header />

      <main className="max-w-screen-xl mx-auto px-4 pt-20">
        {/* --- BARRA DE MEMBROS ATIVOS (aprimorada) --- */}
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

        {/* --- COMPOSER (À quoi pensez-vous ?) --- */}
        <section className="bg-white rounded-3xl shadow-md p-4 mb-6">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-800"
              style={{ background: pastelFromString(userDisplayName) }}
              aria-label={`Avatar ${userDisplayName}`}
            >
              {userInitial}
            </div>

            <div className="flex-1">
              <textarea
                value={composerText}
                onChange={e => setComposerText(e.target.value)}
                placeholder="À quoi pensez-vous ?"
                className="w-full rounded-2xl border border-gray-200 focus:border-[#18A238] focus:ring-2 focus:ring-[#18A238]/20 outline-none p-3 text-sm"
                rows={3}
              />

              {/* preview da imagem escolhida */}
              {composerImage && (
                <div className="mt-3 rounded-2xl overflow-hidden">
                  <img src={composerImage} alt="aperçu" className="w-full object-cover" />
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-gray-600 hover:text-[#18A238] cursor-pointer">
                  <input
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7180ff] text-white font-semibold hover:opacity-90 transition"
                >
                  <Send className="w-4 h-4" />
                  Publier
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- FEED (layout base Facebook) --- */}
        <section className="space-y-6">
          {posts.map(post => (
            <article
              key={post.id}
              className="bg-white rounded-3xl shadow-lg p-5 interactive hover:shadow-xl transition-all duration-300"
            >
              {/* header do post */}
              <header className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-gray-800"
                  style={{ background: pastelFromString(post.name) }}
                  aria-label={`Avatar ${post.name}`}
                >
                  {initialOf(post.name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{post.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{post.date}</span>
                </div>
              </header>

              {/* texto */}
              <p className="text-gray-800 text-[14px] leading-snug whitespace-pre-line mb-3">
                {post.text}
              </p>

              {/* imagem entre texto e ações */}
              {post.image && (
                <div className="w-full rounded-2xl overflow-hidden mb-3">
                  <img src={post.image} alt="" className="w-full object-cover" />
                </div>
              )}

              {/* ações */}
              <div className="flex items-center gap-6 text-sm text-gray-600 font-medium">
                <button
                  onClick={() => toggleLike(post.id)}
                  className="flex items-center gap-2 hover:text-[#18A238] transition-colors"
                  aria-label="J'aime"
                >
                  <Heart
                    className={`w-5 h-5 ${post.liked ? 'text-[#18A238]' : 'text-gray-600'}`}
                    fill={post.liked ? 'currentColor' : 'none'}
                  />
                  <span>{post.likes} likes</span>
                </button>

                <button
                  onClick={() => toggleCommentBox(post.id)}
                  className="flex items-center gap-2 hover:text-[#18A238] transition-colors"
                  aria-label="Commenter"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.comments} commentaires</span>
                </button>
              </div>

              {/* caixa de comentário inline */}
              {post.showComment && (
                <div className="mt-4">
                  <textarea
                    value={post.reply ?? ''}
                    onChange={e => updateReply(post.id, e.target.value)}
                    placeholder="Écrivez votre réponse…"
                    className="w-full rounded-2xl border border-gray-200 focus:border-[#18A238] focus:ring-2 focus:ring-[#18A238]/20 outline-none p-3 text-sm"
                    rows={3}
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => publishReply(post.id)}
                      className="px-4 py-2 rounded-xl bg-[#18A238] text-white font-medium hover:bg-[#147c2b] transition-colors"
                    >
                      Publier
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
