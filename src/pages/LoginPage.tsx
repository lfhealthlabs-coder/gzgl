import { useState, useEffect } from 'react';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstall(true);
    }, 3000); // abre após 3 segundos

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes('@')) {
      setError("Veuillez fournir un email valide contenant '@'.");
      return;
    }

    setError('');
    onLogin();
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-no-repeat bg-[length:100%_100%]"
        style={{ backgroundImage: 'url("/imageback.png")' }}
      />

      {/* POPUP */}
      {showInstall && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl w-full max-w-[260px] p-4 space-y-2 relative">
            <button
              onClick={() => setShowInstall(false)}
              className="absolute top-1 right-2 text-gray-500 text-xl"
            >
              ×
            </button>

            <h2 className="text-lg font-bold text-gray-900 text-center leading-tight">
              Comment installer l'app sur votre iPhone
            </h2>

            <ol className="text-gray-700 space-y-1 text-[13px] leading-snug">
              <li><b>1.</b> Touche l’icône Partager (carré + flèche).</li>
              <li><b>2.</b> Sélectionne « Ajouter à l'écran d'accueil ».</li>
              <li><b>3.</b> Puis « Ajouter » en haut à droite.</li>
            </ol>

            <img
              src="/INSTALAPP.gif"
              alt="Instruction"
              className="rounded-xl w-full"
            />
          </div>
        </div>
      )}

      {/* BOX PRINCIPAL */}
      <div className="w-full max-w-md relative z-10">
        <div className="backdrop-blur-xl bg-white/70 border border-white/60 rounded-3xl shadow-2xl p-8 space-y-8">
          {/* BOTÃO INSTALAR */}
          <button
            onClick={() => setShowInstall(true)}
            className="interactive block w-[70%] mx-auto bg-black hover:bg-black text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm"
            type="button"
          >
            Installer l’app
          </button>

          {/* LOGO */}
          <div className="flex justify-center">
            <img
              src="/logoltapp.png"
              alt="LOTTO APP"
              className="w-32 h-32 object-contain drop-shadow-xl"
            />
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-gray-700 font-semibold text-sm">
                Email
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-[#18A238] focus:outline-none transition-colors duration-200"
                placeholder="votre@email.com"
              />
              {error && (
                <p className="text-red-500 text-sm mt-2 animate-pulse">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="interactive w-full bg-gradient-to-r from-[#18A238] to-[#0B5F21] hover:from-[#0B5F21] hover:to-[#0B5F21] text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Entrer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
