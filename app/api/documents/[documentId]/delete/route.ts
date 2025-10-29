import { NextRequest, NextResponse } from 'next/server';
import { getDocument, deleteDocument } from '@/lib/documents';
import { del } from '@vercel/blob';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId: rawDocumentId } = await params;
    const documentId = decodeURIComponent(rawDocumentId);
    
    // Get document metadata
    const docMetadata = await getDocument(documentId);
    
    if (!docMetadata) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    // Check if it's a local file (cannot be deleted)
    if (docMetadata.isLocal) {
      return NextResponse.json(
        { error: 'No se pueden eliminar archivos locales' },
        { status: 403 }
      );
    }

    // Delete from Blob Storage
    try {
      await del(docMetadata.blobUrl);
    } catch (error) {
      console.error('Error deleting from Blob:', error);
      // Continue anyway to remove from database
    }

    // Delete from database
    await deleteDocument(documentId);

    return NextResponse.json({
      success: true,
      message: 'Documento eliminado exitosamente'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el documento' },
      { status: 500 }
    );
  }
}
