"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PDFViewer from '../../components/PDFViewer';
import OfficeViewer from '../../components/OfficeViewer';
import MarkdownViewer from '../../components/MarkdownViewer';
import { FileText, Download } from 'lucide-react';

interface Document {
  name: string;
  size: number;
  extension: string;
  lastModified: string;
  url: string;
}

export default function DocumentPage() {
  const params = useParams();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const documentId = params.documentId as string;

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      
      // Obtener lista completa de documentos
      const response = await fetch('/api/documents');
      const data = await response.json();
      
      if (data.success) {
        // Buscar el documento específico por nombre
        const decodedDocumentId = decodeURIComponent(documentId);
        const foundDocument = data.documents.find((doc: Document) => 
          doc.name === decodedDocumentId ||
          doc.name.replace(/\s+/g, '-').toLowerCase() === decodedDocumentId.toLowerCase()
        );
        
        if (foundDocument) {
          setDocument(foundDocument);
        } else {
          setError('Documento no encontrado');
        }
      } else {
        setError(data.error || 'Error al cargar el documento');
      }
    } catch (err) {
      setError('Error de conexión al cargar el documento');
      console.error('Error fetching document:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (document) {
      const link = window.document.createElement('a');
      link.href = document.url;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const renderDocumentViewer = () => {
    if (!document) return null;

    const extension = document.extension.toLowerCase();

    if (extension === 'pdf') {
      return (
        <PDFViewer 
          fileUrl={document.url} 
          fileName={document.name}
        />
      );
    } else if (['doc', 'docx'].includes(extension)) {
      return (
        <OfficeViewer 
          fileUrl={document.url} 
          fileName={document.name}
          fileSize={document.size}
        />
      );
    } else if (extension === 'md') {
      return (
        <MarkdownViewer
          fileUrl={document.url}
          fileName={document.name}
          fileSize={document.size}
        />
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Cargando documento...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
              <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
                Documento no encontrado
              </h1>
              <p className="text-red-600 dark:text-red-300 mb-6">
                {error || 'El documento solicitado no existe o ha sido movido.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 font-sans">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Document Info Header */}
        <div className="max-w-7xl mx-auto mb-4 sm:mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 min-w-0">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                    {document.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <span>{(document.size / 1024 / 1024).toFixed(2)} MB</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="uppercase font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      {document.extension}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-xs">
                      {new Date(document.lastModified).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center px-3 py-2 sm:px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </button>
            </div>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="h-[calc(100vh-280px)] sm:h-[calc(100vh-250px)] min-h-[400px] overflow-auto">
              {renderDocumentViewer()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}