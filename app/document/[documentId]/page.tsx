import { notFound } from 'next/navigation';
import DocumentPageClient from './DocumentPageClient';
import { getDocument, scanLocalDocuments } from '@/lib/documents';

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
    // Scan local documents to ensure they're in the database
    await scanLocalDocuments();
    
    // Get document metadata from database
    const docMetadata = await getDocument(documentId);
    
    if (!docMetadata) {
      notFound();
    }
    
    const document: Document = {
      name: docMetadata.fileName,
      size: 0, // We don't store size (can add if needed)
      extension: docMetadata.fileName.split('.').pop()?.toLowerCase() || '',
      lastModified: docMetadata.uploadedAt,
      url: docMetadata.blobUrl
    };

    return <DocumentPageClient document={document} />;
  } catch (error) {
    console.error('Error loading document:', error);
    notFound();
  }
}