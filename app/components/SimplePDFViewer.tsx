"use client";

import { useState } from 'react';
import { Download, Maximize2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface SimplePDFViewerProps {
  fileUrl: string;
  fileName: string;
}

export default function SimplePDFViewer({ fileUrl, fileName }: SimplePDFViewerProps) {
  const [scale, setScale] = useState<number>(100);

  const handleDownload = () => {
    const link = window.document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const openInNewTab = () => {
    window.open(fileUrl, '_blank');
  };

  const zoomIn = () => {
    setScale(prev => Math.min(200, prev + 25));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(50, prev - 25));
  };

  const resetZoom = () => {
    setScale(100);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Controles */}
      <div className="bg-gray-100 dark:bg-gray-800 p-2 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-4">
          {/* Información del archivo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-red-100 dark:bg-red-900/50 p-1.5 sm:p-2 rounded-lg">
              <svg className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A3,3 0 0,1 15,5V7H20A2,2 0 0,1 22,9V19A2,2 0 0,1 20,21H4A2,2 0 0,1 2,19V9A2,2 0 0,1 4,7H9V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V7H13V5A1,1 0 0,0 12,4Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-none">
                {fileName}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Documento PDF</p>
            </div>
          </div>

          {/* Controles de zoom - Ocultos en móvil */}
          <div className="hidden sm:flex items-center space-x-2">
            <button
              onClick={zoomOut}
              disabled={scale <= 50}
              className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Alejar"
            >
              <ZoomOut className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
            
            <span className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 min-w-[60px] text-center">
              {scale}%
            </span>
            
            <button
              onClick={zoomIn}
              disabled={scale >= 200}
              className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Acercar"
            >
              <ZoomIn className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
            
            <button
              onClick={resetZoom}
              className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              title="Tamaño original"
            >
              <RotateCcw className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Botones de acción - Más compactos en móvil */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={openInNewTab}
              className="p-1.5 sm:p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Abrir en pestaña nueva"
            >
              <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
            
            <button
              onClick={handleDownload}
              className="p-1.5 sm:p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Descargar"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visor del PDF - Responsive */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 overflow-auto">
        <div className="flex justify-center p-2 sm:p-4 h-full">
          <div 
            style={{ 
              transform: `scale(${scale / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-in-out',
              width: '100%',
              maxWidth: '800px'
            }}
            className="shadow-lg rounded-lg overflow-hidden bg-white h-full"
          >
            <iframe
              src={`${fileUrl}#view=FitH`}
              className="border-0 rounded-lg w-full h-full"
              title={`PDF Viewer - ${fileName}`}
              style={{
                minHeight: '400px',
                width: '100%',
              }}
            />
          </div>
        </div>

        {/* Información adicional - Solo en desktop */}
        <div className="hidden sm:block text-center p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 Para mejor experiencia, haz clic en "Abrir en nueva pestaña" para ver el PDF con todos los controles nativos
          </p>
        </div>
      </div>
    </div>
  );
}