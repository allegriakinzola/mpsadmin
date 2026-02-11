import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 flex items-center justify-center">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      
      <div className="relative z-10 px-4 max-w-4xl mx-auto text-center">
        <div className="text-white">
          <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-white/30">
            🎓 Plateforme de gestion pédagogique
          </span>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            MPS Admin
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-4 font-light">
            Gestion des Cours & Formations
          </p>
          
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
            Plateforme complète pour gérer vos sessions de formation, inscriptions des étudiants et évaluations.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              href="/login" 
              className="px-10 py-4 bg-white text-red-700 hover:bg-gray-100 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Se connecter
            </Link>
            <Link 
              href="/signup" 
              className="px-10 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30 rounded-xl font-semibold text-lg transition-all"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
      
      <footer className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-sm">
        © 2026 MPS Admin - Tous droits réservés
      </footer>
    </div>
  );
}
