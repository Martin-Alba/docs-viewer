"use client";

import { useState, useEffect } from 'react';
import { FileText, AlertCircle, ChevronRight, RefreshCw, QrCode, Download, X, Trash2 } from 'lucide-react';
import Link from 'next/link';
import QRCodeLib from 'qrcode';

interface Document {
  name: string;
  size: number;
  extension: string;
  lastModified: string;
  url: string;
  id?: string; // The actual document ID for linking
  isLocal?: boolean; // Whether it's a local file or blob storage
}

interface DocumentListProps {
  onDocumentSelect?: (document: Document) => void;
}

export default function DocumentList({ onDocumentSelect }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocForQR, setSelectedDocForQR] = useState<Document | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/documents');
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La respuesta no es JSON válido');
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

  const handleShowQR = async (document: Document) => {
    const documentId = document.id || document.name;
    const documentUrl = `${window.location.origin}/document/${encodeURIComponent(documentId)}`;
    
    try {
      const qrDataUrl = await QRCodeLib.toDataURL(documentUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      
      setQrCodeUrl(qrDataUrl);
      setSelectedDocForQR(document);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl || !selectedDocForQR) return;

    const link = window.document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `QR-${selectedDocForQR.name}.png`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handleCloseQRModal = () => {
    setSelectedDocForQR(null);
    setQrCodeUrl('');
  };

  const handleDelete = async (document: Document) => {
    const documentId = document.id || document.name;
    
    setDeletingId(documentId);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/documents/${encodeURIComponent(documentId)}/delete`, {
        method: 'DELETE',
      });

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La respuesta no es JSON válido');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar el documento');
      }

      // Refresh the document list
      await fetchDocuments();
      
      // Close modal
      setDocumentToDelete(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      setDeleteError(error instanceof Error ? error.message : 'Error al eliminar el documento');
    } finally {
      setDeletingId(null);
    }
  };

  const handleShowDeleteModal = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteError(null);
  };

  const handleCloseDeleteModal = () => {
    if (deletingId) return; // Don't close while deleting
    setDocumentToDelete(null);
    setDeleteError(null);
  };

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
                <div key={index} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <button
                      onClick={() => onDocumentSelect(document)}
                      className="flex-1 min-w-0 text-left focus:outline-none"
                    >
                      <DocumentItem document={document} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowQR(document);
                      }}
                      className="flex-shrink-0 p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Ver código QR"
                      aria-label="Ver código QR"
                    >
                      <QrCode className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                    {!document.isLocal && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowDeleteModal(document);
                        }}
                        disabled={deletingId === (document.id || document.name)}
                        className="flex-shrink-0 p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="Eliminar documento"
                        aria-label="Eliminar documento"
                      >
                        <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div key={index} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Link
                    href={`/document/${encodeURIComponent(document.id || document.name)}`}
                    className="flex-1 min-w-0"
                  >
                    <DocumentItem document={document} />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleShowQR(document);
                    }}
                    className="flex-shrink-0 p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Ver código QR"
                    aria-label="Ver código QR"
                  >
                    <QrCode className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                  {!document.isLocal && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleShowDeleteModal(document);
                      }}
                      disabled={deletingId === (document.id || document.name)}
                      className="flex-shrink-0 p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar documento"
                      aria-label="Eliminar documento"
                    >
                      <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QR Code Modal */}
      {selectedDocForQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleCloseQRModal}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Código QR
              </h3>
              <button
                onClick={handleCloseQRModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                  Documento:
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm break-all">
                  {selectedDocForQR.name}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-center">
                <div className="inline-block bg-white p-4 rounded-lg shadow-sm">
                  {qrCodeUrl && (
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-64 h-64 mx-auto"
                    />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                  Escanea este código QR para acceder directamente al documento
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadQR}
                  className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 space-x-2"
                >
                  <Download className="h-5 w-5" />
                  <span>Descargar QR</span>
                </button>
                <button
                  onClick={handleCloseQRModal}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {documentToDelete && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" 
          onClick={handleCloseDeleteModal}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  Eliminar Documento
                </h3>
              </div>
              <button
                onClick={handleCloseDeleteModal}
                disabled={!!deletingId}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                aria-label="Cerrar"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                ¿Estás seguro de que quieres eliminar este documento?
              </p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
                  {documentToDelete.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {documentToDelete.extension.toUpperCase()} • {new Date(documentToDelete.lastModified).toLocaleDateString('es-ES')}
                </p>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-3 font-medium">
                Esta acción no se puede deshacer.
              </p>
            </div>

            {/* Error Message */}
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {deleteError}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseDeleteModal}
                disabled={!!deletingId}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => documentToDelete && handleDelete(documentToDelete)}
                disabled={!!deletingId}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deletingId ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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
    <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full">
      {/* Icono del tipo de archivo */}
      <div className="flex-shrink-0">
        {getFileIcon(document.extension)}
      </div>
      
      {/* Información del archivo - con overflow controlado */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
          {document.name}
        </h3>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <span className="whitespace-nowrap">{(document.size / 1024 / 1024).toFixed(2)} MB</span>
          <span className="hidden sm:inline">•</span>
          <span className="uppercase font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs whitespace-nowrap">
            {document.extension}
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="text-xs whitespace-nowrap">
            {new Date(document.lastModified).toLocaleDateString('es-ES')}
          </span>
        </div>
      </div>
      
      {/* Botón de acción - Solo visible en hover en desktop */}
      <div className="hidden sm:flex sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
      </div>
    </div>
  );
}