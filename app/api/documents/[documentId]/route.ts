import { NextRequest, NextResponse } from 'next/server';
import { getDocument } from '@/lib/documents';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId: rawDocumentId } = await params;
    const documentId = decodeURIComponent(rawDocumentId);
    
    // Try to get document from database
    const docMetadata = await getDocument(documentId);
    
    if (docMetadata) {
      const extension = docMetadata.fileName.toLowerCase().substring(docMetadata.fileName.lastIndexOf('.') + 1);
      
      const document = {
        name: docMetadata.fileName,
        size: 0, // We don't store size in metadata (can add if needed)
        extension: extension,
        lastModified: new Date(docMetadata.uploadedAt),
        url: docMetadata.blobUrl, // Either blob URL or /documents/file.pdf
        isLocal: docMetadata.isLocal
      };
      
      return NextResponse.json({ 
        success: true, 
        document 
      });
    }
    
    // Si no se encuentra el documento
    return NextResponse.json(
      { 
        success: false, 
        error: 'Documento no encontrado' 
      }, 
      { status: 404 }
    );
    
  } catch (error) {
    console.error('Error reading document:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener el documento' 
      }, 
      { status: 500 }
    );
  }
}