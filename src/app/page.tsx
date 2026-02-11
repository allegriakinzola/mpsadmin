import Link from "next/link";
import { BookOpen, Users, GraduationCap, Calendar, ChevronRight, Shield, BarChart3, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative z-10 px-4 max-w-6xl mx-auto py-20">
          <div className="text-center text-white">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/30">
                🎓 Plateforme de gestion pédagogique
              </span>
              
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              MPS Admin
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 mb-4 font-light">
              Gestion des Cours & Formations
            </p>
            
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Plateforme complète pour gérer vos sessions de formation, inscriptions des étudiants et évaluations. Simplifiez votre administration pédagogique.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
              <Link 
                href="/login" 
                className="px-8 py-4 bg-white text-red-700 hover:bg-gray-100 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Se connecter
              </Link>
              <Link 
                href="/signup" 
                className="px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30 rounded-xl font-semibold text-lg transition-all"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium mb-4">
              Fonctionnalités
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">Tout ce dont vous avez besoin</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-400 mx-auto mb-8 rounded-full"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une suite complète d'outils pour gérer efficacement vos formations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative bg-white p-8 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-red-200 hover:scale-105 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-red-600 transition-colors">Sessions</h3>
                <p className="text-gray-500 group-hover:text-gray-600 transition-colors">
                  Créez et gérez vos sessions de formation avec des dates de début et fin.
                </p>
              </div>
            </div>

            <div className="group relative bg-white p-8 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-red-200 hover:scale-105 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-red-600 transition-colors">Cours</h3>
                <p className="text-gray-500 group-hover:text-gray-600 transition-colors">
                  Organisez vos cours par session avec horaires et salles.
                </p>
              </div>
            </div>

            <div className="group relative bg-white p-8 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-red-200 hover:scale-105 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-red-600 transition-colors">Coachs</h3>
                <p className="text-gray-500 group-hover:text-gray-600 transition-colors">
                  Affectez des coachs qualifiés à chaque cours.
                </p>
              </div>
            </div>

            <div className="group relative bg-white p-8 rounded-2xl hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-red-200 hover:scale-105 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                  <GraduationCap className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-red-600 transition-colors">Étudiants</h3>
                <p className="text-gray-500 group-hover:text-gray-600 transition-colors">
                  Inscrivez les étudiants et suivez leurs évaluations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium mb-4">
                Pourquoi nous choisir
              </span>
              <h2 className="text-4xl font-bold mb-6 text-gray-800">Une gestion simplifiée</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-400 mb-8 rounded-full"></div>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Sécurisé</h3>
                    <p className="text-gray-600">Authentification sécurisée et protection des données.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Suivi complet</h3>
                    <p className="text-gray-600">Tableau de bord avec statistiques et calendrier.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Gain de temps</h3>
                    <p className="text-gray-600">Interface intuitive pour une gestion rapide.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-red-200/50 to-red-100/50 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Commencez maintenant</h3>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <ChevronRight className="h-5 w-5 text-red-300" />
                    <span>Créez votre compte administrateur</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <ChevronRight className="h-5 w-5 text-red-300" />
                    <span>Configurez vos sessions et cours</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <ChevronRight className="h-5 w-5 text-red-300" />
                    <span>Ajoutez coachs et étudiants</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <ChevronRight className="h-5 w-5 text-red-300" />
                    <span>Gérez les inscriptions et évaluations</span>
                  </li>
                </ul>
                <Link 
                  href="/signup" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-700 hover:bg-gray-100 rounded-xl font-semibold transition-all hover:scale-105"
                >
                  Créer un compte
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden bg-gradient-to-br from-red-600 via-red-700 to-red-800">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-4xl mx-auto text-center text-white">
          <div className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-medium mb-6 border border-white/30">
            🚀 Prêt à commencer ?
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Simplifiez votre gestion pédagogique
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Rejoignez MPS Admin et gérez efficacement vos formations, coachs et étudiants en un seul endroit.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/signup" 
              className="px-8 py-4 bg-white text-red-700 hover:bg-gray-100 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg"
            >
              Commencer gratuitement
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/30 rounded-xl font-semibold text-lg transition-all"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">© 2024 MPS Admin - Gestion des Cours. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
