import { notFound } from 'next/navigation';
import { join } from 'path';
import { promises as fs } from 'fs';
import DocumentPageClient from './DocumentPageClient';

// Force dynamic rendering for document pages
export const dynamic = 'force-dynamic';

interface Document {
  name: string;
  size: number;
  extension: string;
  lastModified: string;
  url: string;
}

export default async function DocumentPage({
  params
}: {
  params: Promise<{ documentId: string }>
}) {
  const { documentId: rawDocumentId } = await params;
  const documentId = decodeURIComponent(rawDocumentId);
  
  try {
    const documentsPath = join(process.cwd(), 'public', 'documents');
    const filePath = join(documentsPath, documentId);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      notFound();
    }
    
    const stats = await fs.stat(filePath);
    const extension = documentId.split('.').pop()?.toLowerCase() || '';
    
    const document: Document = {
      name: documentId,
      size: stats.size,
      extension: extension,
      lastModified: stats.mtime.toISOString(),
      url: `/documents/${encodeURIComponent(documentId)}`
    };

    return <DocumentPageClient document={document} />;
  } catch (error) {
    console.error('Error loading document:', error);
    notFound();
  }
}