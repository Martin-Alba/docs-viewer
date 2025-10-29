import { NextRequest, NextResponse } from 'next/server';
import { getAllDocuments, scanLocalDocuments } from '@/lib/documents';

export async function GET() {
  try {
    // Scan local documents directory to ensure they're in the database
    await scanLocalDocuments();
    
    // Get all documents from database
    const allDocs = await getAllDocuments();
    
    // Transform to expected format
    const documents = allDocs.map(doc => ({
      name: doc.fileName,
      size: 0, // We don't store size in metadata (can add if needed)
      extension: doc.fileName.split('.').pop()?.toLowerCase() || '',
      lastModified: doc.uploadedAt,
      url: doc.blobUrl,
      id: doc.id, // Add the actual ID for linking
      isLocal: doc.isLocal // Whether it's a local file or blob storage
    }));
    
    // Sort by upload date (most recent first)
    documents.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
    
    return NextResponse.json({ 
      success: true, 
      documents,
      total: documents.length 
    });
    
  } catch (error) {
    console.error('Error reading documents:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener la lista de documentos' 
      }, 
      { status: 500 }
    );
  }
}