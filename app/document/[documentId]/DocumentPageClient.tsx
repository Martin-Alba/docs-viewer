"use client";

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

interface DocumentPageClientProps {
  document: Document;
}

export default function DocumentPageClient({ document }: DocumentPageClientProps) {
  const handleDownload = () => {
    const link = window.document.createElement('a');
    link.href = document.url;
    link.download = document.name;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const renderDocumentViewer = () => {
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
                    <span className="hidden sm:inline">
                      {new Date(document.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-shrink-0">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Descargar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="max-w-7xl mx-auto">
          {renderDocumentViewer()}
        </div>
      </div>
    </div>
  );
}