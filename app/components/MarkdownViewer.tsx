"use client";

import { useState, useEffect } from 'react';
import { Download, AlertCircle, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MarkdownViewerProps {
  fileUrl: string;
  fileName: string;
  fileSize?: number;
}

export default function MarkdownViewer({ fileUrl, fileName, fileSize = 0 }: MarkdownViewerProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'rendered' | 'source'>('rendered');

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Error al cargar el archivo: ${response.status}`);
        }
        
        const text = await response.text();
        setContent(text);
      } catch (err) {
        console.error('Error fetching markdown:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkdown();
  }, [fileUrl]);

  const handleDownload = () => {
    const link = window.document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando documento Markdown...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error al cargar</h3>
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Controles */}
      <div className="bg-gray-100 dark:bg-gray-800 p-2 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
          {/* Información del archivo */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="bg-green-100 dark:bg-green-900/50 p-1.5 sm:p-2 rounded-lg">
              <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                {fileName}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Documento Markdown{fileSize ? ` • ${(fileSize / 1024).toFixed(1)} KB` : ''}
              </p>
            </div>
          </div>

          {/* Controles de vista - Diferentes para móvil y desktop */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Controles desktop */}
            <div className="hidden sm:flex space-x-2">
              <button
                onClick={() => setViewMode('rendered')}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  viewMode === 'rendered'
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Renderizado
              </button>
              
              <button
                onClick={() => setViewMode('source')}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  viewMode === 'source'
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                Código
              </button>
            </div>

            {/* Controles móvil */}
            <div className="flex sm:hidden space-x-1">
              <button
                onClick={() => setViewMode('rendered')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'rendered'
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                }`}
                title="Vista renderizada"
              >
                <span className="text-xs">📄</span>
              </button>
              
              <button
                onClick={() => setViewMode('source')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'source'
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                }`}
                title="Código fuente"
              >
                <span className="text-xs">💻</span>
              </button>
            </div>

            {/* Botón de descarga */}
            <button
              onClick={handleDownload}
              className="flex items-center px-2 py-1.5 sm:px-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
              title="Descargar archivo"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline sm:ml-1">Descargar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido del documento */}
      <div className="flex-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-auto">
        <div className="p-3 sm:p-6 h-full">
          {viewMode === 'rendered' ? (
            <div className="prose prose-sm sm:prose max-w-none dark:prose-invert">
              <ReactMarkdown 
                components={{
                  h1: ({node, ...props}) => <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-base sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-900 dark:text-white" {...props} />,
                  p: ({node, ...props}) => <p className="mb-3 sm:mb-4 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1 sm:space-y-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-4 sm:pl-6 mb-3 sm:mb-4 space-y-1 sm:space-y-2" {...props} />,
                  li: ({node, ...props}) => <li className="text-sm sm:text-base text-gray-700 dark:text-gray-300" {...props} />,
                  code: ({node, ...props}) => 
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs sm:text-sm font-mono" {...props} />,
                  pre: ({node, ...props}) => 
                    <pre className="bg-gray-100 dark:bg-gray-800 p-2 sm:p-4 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-3 sm:pl-4 italic my-3 sm:my-4 text-gray-600 dark:text-gray-400" {...props} />,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 overflow-auto">
              {content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}