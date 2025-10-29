"use client";

import { useState, useRef } from 'react';
import { Upload, X, FileText, Download } from 'lucide-react';
import QRCode from 'qrcode';

interface UploadedDocument {
  name: string;
  url: string;
  qrCode: string;
}

export default function FileUploader({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocument | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de archivo no soportado. Solo se permiten PDF, DOC, DOCX, TXT y MD.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Tamaño máximo: 10MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Error en el servidor. Por favor, intenta de nuevo.');
      }

      const data = await response.json();

      if (response.ok) {
        const documentUrl = `${window.location.origin}${data.documentUrl}`;
        const qrCodeDataUrl = await QRCode.toDataURL(documentUrl, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });

        setUploadedDoc({
          name: data.fileName,
          url: documentUrl,
          qrCode: qrCodeDataUrl,
        });

        if (onUploadSuccess) {
          onUploadSuccess();
        }
      } else {
        setError(data.error || 'Error al cargar el archivo');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión al cargar el archivo');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadQR = () => {
    if (!uploadedDoc) return;

    const link = document.createElement('a');
    link.href = uploadedDoc.qrCode;
    link.download = `QR-${uploadedDoc.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setIsOpen(false);
    setUploadedDoc(null);
    setError('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 space-x-2"
      >
        <Upload className="h-5 w-5" />
        <span>Cargar Documento</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {uploadedDoc ? 'Documento Cargado' : 'Cargar Documento'}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {!uploadedDoc ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Selecciona un archivo para cargar
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                      Formatos soportados: PDF, DOC, DOCX, TXT, MD (Máx. 10MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.txt,.md"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg cursor-pointer transition-colors duration-200 space-x-2"
                    >
                      <Upload className="h-5 w-5" />
                      <span>Seleccionar Archivo</span>
                    </label>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                    </div>
                  )}

                  {uploading && (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-400">Cargando archivo...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      ✓ Archivo cargado exitosamente
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Documento:
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 break-all">
                      {uploadedDoc.name}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      URL del Documento:
                    </h3>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={uploadedDoc.url}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(uploadedDoc.url);
                        }}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Código QR:
                    </h3>
                    <div className="inline-block bg-white p-4 rounded-lg shadow-sm">
                      <img
                        src={uploadedDoc.qrCode}
                        alt="QR Code"
                        className="w-64 h-64 mx-auto"
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                      Escanea este código QR para acceder directamente al documento
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleDownloadQR}
                      className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 space-x-2"
                    >
                      <Download className="h-5 w-5" />
                      <span>Descargar QR</span>
                    </button>
                    <a
                      href={uploadedDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 space-x-2"
                    >
                      <FileText className="h-5 w-5" />
                      <span>Ver Documento</span>
                    </a>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
