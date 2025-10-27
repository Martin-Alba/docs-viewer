"use client";

import dynamic from 'next/dynamic';
import SimplePDFViewer from './SimplePDFViewer';

interface PDFViewerProps {
  fileUrl: string;
  fileName: string;
}

// Intentar cargar react-pdf dinámicamente, usar SimplePDFViewer como fallback
const PDFViewerComponent = dynamic(
  () => import('./PDFViewerCore').catch(() => {
    console.log('react-pdf no disponible, usando SimplePDFViewer');
    return { default: SimplePDFViewer };
  }),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Inicializando visor PDF...</p>
        </div>
      </div>
    ),
  }
);

export default function PDFViewer({ fileUrl, fileName }: PDFViewerProps) {
  return <PDFViewerComponent fileUrl={fileUrl} fileName={fileName} />;
}