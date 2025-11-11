import Header from '../components/Header';
import { Newspaper } from 'lucide-react';

export default function ActualitePage() {
  const news = [
    {
      id: 1,
      title: 'Découvrez le LotoGains 10X',
      excerpt: `Vous connaissez déjà la puissance de LotoGains… mais imaginez maintenant obtenir des résultats 10 fois plus rapides et multiplier vos chances de décrocher un jackpot millionnaire.


Avec LotoGains 10X, vous accédez à la version la plus avancée de notre intelligence artificielle, capable d’analyser 10 fois plus de schémas et de vous livrer des combinaisons encore plus précises pour transformer vos mises en gains réels.


🎯 Ce que vous gagnez avec le 10X :

Des résultats 10X plus rapides ⚡
Plus de chances de décrocher le jackpot 💰
Des stratégies exclusives et personnalisées 🤖
Un accompagnement et des tutoriels pour jouer en toute sécurité et confiance


💬 « J’utilisais déjà LotoGains et j’aimais beaucoup, mais quand j’ai testé le 10X j’ai été impressionné. En 3 jours, j’ai trouvé 5 numéros à la Mega Sena ! Je n’avais jamais été aussi proche d’un grand gain. » – Marcos A.


👉 Prêt à accélérer vos résultats et à entrer définitivement dans le jeu avec intelligence ?


Ne laissez pas passer cette opportunité :


🔗 Cliquez ici pour en savoir plus sur LotoGains 10X


Équipe LotoGains ✨`,
      date: '2 heures',
      image: '/image9.jpg',
      icon: Newspaper,
    },
    {
      id: 2,
      title: 'Attention, famille LotoGains !',
      excerpt: `Nous venons de franchir une nouvelle étape importante pour rendre notre plateforme encore plus complète : vous pouvez désormais sélectionner le Canada 🇨🇦, la Suisse 🇨🇭 et la Belgique 🇧🇪 dans la première étape de LotoGains ! 🎉


Mais rassurez-vous… si votre pays n’apparaît pas encore dans la liste, ce n’est absolument pas un problème ! 😉


 👉 Vous n’avez pas besoin d’habiter l’un de ces pays pour utiliser LotoGains. Car aujourd’hui, il est tout à fait possible de jouer à de nombreuses loteries en ligne 💻📱, de manière simple, rapide et sécurisée, depuis n’importe quel endroit dans le monde.


En d’autres termes : la puissance de notre intelligence artificielle est entre vos mains, peu importe où vous vous trouvez 🌍. Il vous suffit d’accéder à la plateforme, de générer vos combinaisons et de placer vos mises en ligne — le 

fonctionnement est exactement le même.


Avec LotoGains, votre prochain grand gain ne connaît pas de frontières. ✨


Équipe LotoGains`,
      date: '5 heures',
      image: '/image10.jpg',
      icon: Newspaper,
    },
    {
      id: 3,
      title: 'Bonjour famille LotoGains ! ✨',
      excerpt: `Nous sommes dans le compte à rebours pour le prochain tirage de l’EuroMillions, qui a lieu AUJOURD’HUI, vendredi 22 août 2025 — et devinez quoi ? Le jackpot redémarre à pas moins de 17 millions d’euros en jeu ! 💸🎯


Oui, vous avez bien lu : après le méga gain de 250 millions d’euros remporté le 19 août, une nouvelle chance s’offre déjà à nous, et c’est le moment idéal pour mettre notre intelligence artificielle à l’épreuve.


Imaginez : vous, utilisant LotoGains pour générer vos combinaisons les plus stratégiques et puissantes, au lieu d’attendre comme la plupart des joueurs. Pendant que beaucoup comptent sur le hasard, vous jouez avec méthode, données et confiance 🤖.


🔔 Petit conseil du jour : prenez quelques minutes dès maintenant pour lancer le système, générer vos numéros et placer votre mise en ligne 💻📱 — simple, rapide et sécurisé. N’oubliez pas que la clôture des prises de jeu est fixée à 20h15 (heure française), donc le moment d’agir, c’est maintenant.


La chance peut frapper à votre porte 🍀… mais avec LotoGains, vous construisez le chemin pour qu’elle vienne à vous. Jouez avec intelligence, responsabilité et cette touche d’audace qui fait toute la différence.


Bonne chance, énergie positive et focus total — souvenez-vous : votre nouveau chapitre peut commencer aujourd’hui 🚀.


Équipe LotoGains`,
      date: '1 jour',
      image: '/image11.jpg',
      icon: Newspaper,
    },
    {
      id: 4,
      title: 'Chers membres de la communauté LotoGains',
      excerpt: `Quel moment historique ! Le dernier tirage de l’EuroMillions, qui a eu lieu le mardi 19 août 2025, a fait un gagnant en France 🥳.


Les numéros tirés étaient : 24, 31, 34, 41, 43 et les Étoiles de la Chance : 06 et 08 ✨.


Un joueur français a décroché le jackpot incroyable de 250 millions d’euros 💶, le plus grand gain de l’année !


Ce résultat est une preuve vivante : tout est possible. Et la différence, c’est de jouer avec stratégie. Pendant que des millions de joueurs misent au hasard, vous, grâce à LotoGains, avez la puissance de l’intelligence artificielle 🤖 à vos côtés pour détecter les combinaisons les plus prometteuses.


Imaginez-vous au prochain tirage… votre billet à la main, vos numéros sortant un à un. La victoire n’est pas un rêve lointain, c’est une possibilité réelle — surtout lorsque vous utilisez les bons outils.


Continuez à exploiter la puissance de notre IA chaque jour, car la prochaine grande victoire pourrait bien être la vôtre 🏆.


Ensemble, faisons de vos prochains tirages un moment inoubliable.


Avec enthousiasme,


L’équipe LotoGains 🚀`,
      date: '1 jour',
      image: '/image12.jpg',
      icon: Newspaper,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2BC047]/10 via-white to-[#F7D25F]/10 pb-24">
      <Header />

      <main className="max-w-screen-xl mx-auto px-4 pt-20 pb-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Fil d'actualité</h1>

        <div className="space-y-5">
          {news.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="interactive bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden"
              >
                <div className="w-full h-60 bg-center bg-cover" style={{ backgroundImage: `url(${item.image})` }} />

                <div className="p-5">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#18A238] to-[#0B5F21] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-[15px] font-bold text-gray-800 leading-tight">{item.title}</h3>
                  </div>

                  <p className="text-gray-600 text-[13px] leading-tight whitespace-pre-line mb-2">{item.excerpt}</p>

                  <span className="text-[11px] text-gray-400">Il y a {item.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
