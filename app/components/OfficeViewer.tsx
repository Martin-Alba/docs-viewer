"use client";

import { useState, useEffect } from 'react';
import { Download, AlertCircle, FileText, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import mammoth from 'mammoth';

interface OfficeViewerProps {
  fileUrl: string;
  fileName: string;
  fileSize?: number;
}

export default function OfficeViewer({ fileUrl, fileName, fileSize = 0 }: OfficeViewerProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'converted' | 'google' | 'iframe'>('converted');
  const [zoom, setZoom] = useState<number>(100);

  useEffect(() => {
    const processDocument = async () => {
      setLoading(true);
      setError(null);

      try {
        const extension = fileName.toLowerCase().split('.').pop();

        if (extension === 'docx') {
          // Descargar el archivo del servidor y convertirlo
          const response = await fetch(fileUrl);
          if (!response.ok) {
            throw new Error('Error al descargar el archivo del servidor');
          }
          
          const arrayBuffer = await response.arrayBuffer();
          
          // Configuración mejorada para mammoth con mejor manejo de listas
          const result = await mammoth.convertToHtml({ 
            arrayBuffer 
          }, {
            styleMap: [
              "p[style-name='List Paragraph'] => ul > li:fresh",
              "p[style-name='ListParagraph'] => ul > li:fresh",
              "p[style-name='Bullet List'] => ul > li:fresh",
              "p[style-name='BulletList'] => ul > li:fresh",
              "p[style-name='Numbered List'] => ol > li:fresh",
              "p[style-name='NumberedList'] => ol > li:fresh"
            ],
            includeDefaultStyleMap: true,
            convertImage: mammoth.images.imgElement(function(image) {
              return image.read("base64").then(function(imageBuffer) {
                return {
                  src: "data:" + image.contentType + ";base64," + imageBuffer
                };
              });
            })
          });
          
          if (result.value) {
            let processedHtml = result.value;
            
            // Mejorar el procesamiento de listas con múltiples patrones
            const bulletPatterns = [
              // Bullet points comunes
              /(<p[^>]*>)\s*[•·▪▫‣⁃◦▸▹►▻]\s*(.*?)(<\/p>)/gi,
              // Guiones y asteriscos
              /(<p[^>]*>)\s*[-–—]\s*(.*?)(<\/p>)/gi,
              /(<p[^>]*>)\s*[*]\s*(.*?)(<\/p>)/gi,
              // Círculos y cuadrados
              /(<p[^>]*>)\s*[○●■□▪▫]\s*(.*?)(<\/p>)/gi,
              // Números seguidos de punto o paréntesis
              /(<p[^>]*>)\s*\d+[.)\-]\s*(.*?)(<\/p>)/gi,
              // Letras seguidas de punto o paréntesis
              /(<p[^>]*>)\s*[a-zA-Z][.)\-]\s*(.*?)(<\/p>)/gi
            ];
            
            // Aplicar cada patrón de bullet
            bulletPatterns.forEach(pattern => {
              processedHtml = processedHtml.replace(pattern, '<li class="list-item-custom">$2</li>');
            });
            
            // Detectar listas por indentación también
            const lines = processedHtml.split('\n');
            const processedLines: string[] = [];
            let inList = false;
            let listType = 'ul';
            
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i].trim();
              const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
              
              // Detectar elementos de lista
              if (line.includes('<li class="list-item-custom">')) {
                if (!inList) {
                  // Detectar si es lista numerada basándose en el contenido
                  const isNumbered = /^\d+[.)\-]/.test(line) || /^[a-zA-Z][.)\-]/.test(line);
                  listType = isNumbered ? 'ol' : 'ul';
                  const listClass = listType === 'ul' ? 
                    'list-disc ml-6 space-y-2 my-4' : 
                    'list-decimal ml-6 space-y-2 my-4';
                  processedLines.push(`<${listType} class="${listClass}">`);
                  inList = true;
                }
                processedLines.push('  ' + line.replace('class="list-item-custom"', 'class="text-gray-700 dark:text-gray-300 leading-relaxed"'));
              } else if (line === '' && inList && nextLine.includes('<li class="list-item-custom">')) {
                // Línea vacía entre elementos de lista, mantener la lista abierta
                continue;
              } else {
                if (inList) {
                  processedLines.push(`</${listType}>`);
                  inList = false;
                }
                if (line !== '') {
                  processedLines.push(line);
                }
              }
            }
            
            // Cerrar lista si está abierta al final
            if (inList) {
              processedLines.push(`</${listType}>`);
            }
            
            processedHtml = processedLines.join('\n');
            
            // Mejorar el formato general
            processedHtml = processedHtml
              // Mejorar párrafos
              .replace(/<p>/g, '<p class="mb-3 leading-relaxed">')
              // Mejorar títulos
              .replace(/<h1>/g, '<h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">')
              .replace(/<h2>/g, '<h2 class="text-xl font-semibold mb-3 text-gray-900 dark:text-white">')
              .replace(/<h3>/g, '<h3 class="text-lg font-medium mb-2 text-gray-900 dark:text-white">')
              // Mejorar texto en negrita
              .replace(/<strong>/g, '<strong class="font-semibold text-gray-900 dark:text-white">')
              // Mejorar texto en cursiva
              .replace(/<em>/g, '<em class="italic text-gray-700 dark:text-gray-300">');
            
            setContent(processedHtml);
            setViewMode('converted');
          } else {
            throw new Error('No se pudo extraer el contenido del documento');
          }

          // Mostrar advertencias si las hay
          if (result.messages.length > 0) {
            console.warn('Mammoth warnings:', result.messages);
          }
        } else {
          // Para otros tipos de archivos Office, usar Google Docs Viewer
          setViewMode('google');
        }
      } catch (err) {
        console.error('Error processing document:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        // Fallback a Google Docs Viewer
        setViewMode('google');
      } finally {
        setLoading(false);
      }
    };

    processDocument();
  }, [fileUrl, fileName]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(200, prev + 25));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(50, prev - 25));
  };

  const resetZoom = () => {
    setZoom(100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Procesando documento...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {fileName.endsWith('.docx') ? 'Convirtiendo DOCX a HTML...' : 'Preparando visualización...'}
          </p>
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
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                {fileName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {fileSize ? (fileSize / 1024 / 1024).toFixed(2) + ' MB • ' : ''}Documento {fileName.split('.').pop()?.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Controles - Ajustados para móvil */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap gap-1">
            {viewMode === 'converted' && (
              <>
                <button
                  onClick={zoomOut}
                  disabled={zoom <= 50}
                  className="p-1.5 sm:p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  title="Reducir zoom"
                >
                  <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-300" />
                </button>
                
                <span className="text-xs sm:text-sm font-medium px-1.5 sm:px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md min-w-[40px] sm:min-w-[50px] text-center">
                  {zoom}%
                </span>
                
                <button
                  onClick={zoomIn}
                  disabled={zoom >= 200}
                  className="p-1.5 sm:p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  title="Aumentar zoom"
                >
                  <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-300" />
                </button>
                
                <button
                  onClick={resetZoom}
                  className="p-1.5 sm:p-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  title="Tamaño original"
                >
                  <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-300" />
                </button>
              </>
            )}

            <button
              onClick={handleDownload}
              className="p-1.5 sm:p-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
              title="Descargar archivo"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido del documento */}
      <div className="flex-1 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-auto">
        {error && viewMode === 'converted' && (
          <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-950/20 border-b border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  Error en la conversión
                </p>
                <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {error}. Prueba con el visualizador de Google.
                </p>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'converted' && content && (
          <div 
            className="p-3 sm:p-6 prose prose-sm sm:prose max-w-none dark:prose-invert overflow-auto"
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              width: `${100 / (zoom / 100)}%`
            }}
          >
            <div 
              dangerouslySetInnerHTML={{ __html: content }}
              className="
                [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:space-y-2 [&>ul]:my-4
                [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:space-y-2 [&>ol]:my-4
                [&>ul>li]:text-gray-700 [&>ul>li]:dark:text-gray-300 [&>ul>li]:leading-relaxed
                [&>ol>li]:text-gray-700 [&>ol>li]:dark:text-gray-300 [&>ol>li]:leading-relaxed
                [&>p]:mb-3 [&>p]:leading-relaxed [&>p]:text-gray-700 [&>p]:dark:text-gray-300
                [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:text-gray-900 [&>h1]:dark:text-white
                [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h2]:text-gray-900 [&>h2]:dark:text-white
                [&>h3]:text-lg [&>h3]:font-medium [&>h3]:mb-2 [&>h3]:text-gray-900 [&>h3]:dark:text-white
                [&>strong]:font-semibold [&>strong]:text-gray-900 [&>strong]:dark:text-white
                [&>em]:italic [&>em]:text-gray-700 [&>em]:dark:text-gray-300
              "
            />
          </div>
        )}

        {viewMode === 'google' && (
          <div className="w-full h-full">
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`}
              className="w-full h-full border-0"
              style={{ minHeight: '400px' }}
              title={`Google Docs Viewer - ${fileName}`}
            />
          </div>
        )}

        {viewMode === 'iframe' && (
          <div className="w-full h-full">
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              style={{ minHeight: '400px' }}
              title={`Document Viewer - ${fileName}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}