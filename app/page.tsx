"use client";

import DocumentList from './components/DocumentList';

export default function Home() {
  // Página principal solo muestra la lista de documentos
  // Cada documento tiene su propia URL individual
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
            📄 Visor de Documentos
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            Cada documento tiene su propia URL única. Haz clic en cualquier documento para verlo.
          </p>
        </div>

        {/* DocumentList - Solo enlaces a páginas individuales */}
        <div className="max-w-4xl mx-auto">
          <DocumentList />
        </div>

        {/* Features Grid - Responsive */}
        <div className="max-w-6xl mx-auto mt-8 sm:mt-16">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-6 sm:mb-12 text-gray-900 dark:text-white">
            Características
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📊</div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-900 dark:text-white">PDF</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Visualización completa de documentos PDF
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📝</div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-900 dark:text-white">Office</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Soporte para DOC y DOCX con formato preservado
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">💻</div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-900 dark:text-white">Markdown</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Renderizado en tiempo real de archivos MD
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">�</div>
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-gray-900 dark:text-white">URLs Únicas</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Cada documento tiene su propia URL compartible
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}