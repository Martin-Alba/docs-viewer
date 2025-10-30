import { notFound } from 'next/navigation';
import DocumentPageClient from './DocumentPageClient';
import { getDocument, scanLocalDocuments, syncBlobDocuments, addDocument } from '@/lib/documents';
import { head } from '@vercel/blob';

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
    
    // Sync blob storage documents
    await syncBlobDocuments();
    
    // Get document metadata from database
    let docMetadata = await getDocument(documentId);
    
    // If not found, try to fetch from Blob Storage (in case DB was reset)
    if (!docMetadata && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        // Try to construct blob URL and verify it exists
        const blobUrl = `https://brd3wa1rkfcahrds.public.blob.vercel-storage.com/${documentId}`;
        const blobInfo = await head(blobUrl);
        
        if (blobInfo) {
          // Extract filename from blob metadata or use documentId
          const fileName = blobInfo.pathname?.split('/').pop() || documentId;
          
          // Add to database for next time
          await addDocument({
            id: documentId,
            fileName: fileName,
            blobUrl: blobUrl,
            uploadedAt: blobInfo.uploadedAt?.toISOString() || new Date().toISOString(),
            isLocal: false
          });
          
          // Retry getting the document
          docMetadata = await getDocument(documentId);
        }
      } catch (blobError) {
        console.error('Error fetching from blob:', blobError);
      }
    }
    
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