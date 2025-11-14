import { X, HelpCircle, MessageCircle, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Comment fonctionne LOTTO APP ?",
    answer: "LOTTO APP vous permet de suivre en temps réel les résultats des principales loteries. Vous recevez des notifications instantanées lors des tirages et pouvez vérifier vos numéros automatiquement."
  },
  {
    question: "Comment recevoir les notifications de tirages ?",
    answer: "Les notifications sont activées automatiquement. Vous recevrez une alerte dès qu'un nouveau résultat est disponible. Vérifiez que les notifications sont autorisées dans votre navigateur."
  },
  {
    question: "Puis-je vérifier mes anciens billets ?",
    answer: "Oui ! Accédez à la section 'Bonus' pour scanner vos billets ou saisir manuellement vos numéros. L'application comparera automatiquement avec les résultats historiques."
  },
  {
    question: "Les résultats sont-ils officiels ?",
    answer: "Oui, tous les résultats affichés proviennent des sources officielles et sont mis à jour en temps réel. Nous garantissons l'exactitude des informations."
  },
  {
    question: "Comment fonctionne l'IA de prédiction ?",
    answer: "Notre IA analyse les tendances historiques des tirages pour suggérer des combinaisons. Attention : il s'agit d'une aide statistique, les loteries restent des jeux de hasard."
  },
  {
    question: "Mon accès est-il vraiment à vie ?",
    answer: "Oui ! Une fois enregistré, votre accès est permanent et sans frais additionnels. Profitez de toutes les fonctionnalités sans limite de temps."
  },
  {
    question: "Comment puis-je modifier mes informations de profil ?",
    answer: "Allez dans votre profil, cliquez sur votre nom pour le modifier et sur l'icône de caméra pour changer votre photo. Toutes les modifications sont sauvegardées automatiquement."
  },
  {
    question: "Puis-je utiliser l'application sur plusieurs appareils ?",
    answer: "Oui, connectez-vous avec le même email sur différents appareils. Vos préférences et historique seront synchronisés."
  },
  {
    question: "Quelles loteries sont disponibles ?",
    answer: "LOTTO APP couvre les principales loteries : Mega Sena, Quina, Lotofácil, Lotomania, Dupla Sena, et bien d'autres. De nouvelles loteries sont ajoutées régulièrement."
  },
  {
    question: "L'application fonctionne-t-elle hors ligne ?",
    answer: "Certaines fonctionnalités sont disponibles hors ligne, comme la consultation de l'historique. Pour les résultats en temps réel, une connexion internet est nécessaire."
  }
];

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const contactMethods = [
    {
      icon: Mail,
      label: "Email",
      value: "lfhealthlabs@gmail.com",
      href: "mailto:support@lottoapp.com",
      color: "from-blue-500 to-blue-600"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col relative animate-scaleIn shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#18A238] to-[#0B5F21] rounded-xl flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Centre d'aide</h2>
              <p className="text-sm text-gray-500">Questions fréquentes et support</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Seção de Contato */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📞 Contactez-nous</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <a
                    key={index}
                    href={method.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="interactive block bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-2xl p-4 hover:border-[#18A238] hover:shadow-lg transition-all group"
                  >
                    <div className={`w-10 h-10 bg-gradient-to-br ${method.color} rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">{method.label}</p>
                    <p className="text-sm font-bold text-gray-800 break-all">{method.value}</p>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Divisor */}
          <div className="border-t border-gray-200"></div>

          {/* FAQ */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800 mb-4">❓ Questions fréquentes (FAQ)</h3>
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-100 rounded-xl overflow-hidden hover:border-[#18A238]/30 transition-colors"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className="font-semibold text-gray-800 pr-4">
                      {faq.question}
                    </span>
                    {expandedIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-[#18A238] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  
                  {expandedIndex === index && (
                    <div className="px-4 py-3 bg-gradient-to-br from-[#18A238]/5 to-[#F7D25F]/5 border-t border-gray-100 animate-fadeIn">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gradient-to-br from-[#18A238]/5 to-[#F7D25F]/5 rounded-b-3xl">
          <p className="text-sm text-gray-600 text-center">
            💡 <span className="font-semibold">Besoin d'aide ?</span> Notre équipe est disponible 7j/7 pour vous assister
          </p>
        </div>
      </div>
    </div>
  );
}


