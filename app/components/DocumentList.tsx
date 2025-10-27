"use client";

import { useState, useEffect } from 'react';
import { FileText, AlertCircle, ChevronRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Document {
  name: string;
  size: number;
  extension: string;
  lastModified: string;
  url: string;
}

interface DocumentListProps {
  onDocumentSelect?: (document: Document) => void;
}

export default function DocumentList({ onDocumentSelect }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('Error al cargar los documentos');
      }
      
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const getFileIcon = (extension: string) => {
    const iconClass = "h-6 w-6 sm:h-8 sm:w-8";
    
    switch (extension.toLowerCase()) {
      case 'pdf':
        return <FileText className={`${iconClass} text-red-600`} />;
      case 'doc':
      case 'docx':
        return <FileText className={`${iconClass} text-blue-600`} />;
      case 'md':
        return <FileText className={`${iconClass} text-green-600`} />;
      default:
        return <FileText className={`${iconClass} text-gray-600`} />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            📁 Documentos Disponibles
          </h2>
        </div>
        <div className="p-6 sm:p-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Cargando documentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            📁 Documentos Disponibles
          </h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-lg flex-shrink-0">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-red-800 dark:text-red-200">Error</h3>
                <p className="text-sm sm:text-base text-red-600 dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            📁 Documentos Disponibles
          </h2>
        </div>
        <div className="p-6 sm:p-8 text-center">
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 sm:p-6">
            <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay documentos
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4">
              Agrega archivos a la carpeta public/documents para comenzar
            </p>
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>Formatos soportados:</p>
              <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mt-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">PDF</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">DOCX</span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">DOC</span>
                <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs">MD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
              📁 Documentos Disponibles
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              {documents.length} documento{documents.length !== 1 ? 's' : ''} disponible{documents.length !== 1 ? 's' : ''} para visualizar
            </p>
          </div>
          <button
            onClick={fetchDocuments}
            disabled={loading}
            className="flex items-center justify-center px-3 py-2 sm:px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-xs sm:text-sm self-start sm:self-auto min-w-[100px] sm:min-w-auto"
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      <div className="max-h-96 sm:max-h-[500px] overflow-y-auto">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {documents.map((document, index) => {
            // Si se proporciona onDocumentSelect, usar un botón; si no, usar Link
            if (onDocumentSelect) {
              return (
                <button
                  key={index}
                  onClick={() => onDocumentSelect(document)}
                  className="w-full text-left p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700/50"
                >
                  <DocumentItem document={document} />
                </button>
              );
            }

            return (
              <Link
                key={index}
                href={`/document/${encodeURIComponent(document.name)}`}
                className="block p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
              >
                <DocumentItem document={document} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Componente separado para el contenido del documento
function DocumentItem({ document }: { document: Document }) {
  const getFileIcon = (extension: string) => {
    const iconClass = "h-6 w-6 sm:h-8 sm:w-8";
    
    switch (extension.toLowerCase()) {
      case 'pdf':
        return <FileText className={`${iconClass} text-red-600`} />;
      case 'doc':
      case 'docx':
        return <FileText className={`${iconClass} text-blue-600`} />;
      case 'md':
        return <FileText className={`${iconClass} text-green-600`} />;
      default:
        return <FileText className={`${iconClass} text-gray-600`} />;
    }
  };

  return (
    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
      {/* Icono del tipo de archivo */}
      <div className="flex-shrink-0 mt-0.5 sm:mt-0">
        {getFileIcon(document.extension)}
      </div>
      
      {/* Información del archivo */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
              {document.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <span>{(document.size / 1024 / 1024).toFixed(2)} MB</span>
              <span className="hidden sm:inline">•</span>
              <span className="uppercase font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                {document.extension}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="text-xs">
                {new Date(document.lastModified).toLocaleDateString('es-ES')}
              </span>
            </div>
          </div>
          
          {/* Botón de acción - Solo visible en hover en desktop */}
          <div className="hidden sm:flex sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
}