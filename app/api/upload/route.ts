import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { addDocument } from '@/lib/documents';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no soportado' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'El archivo es demasiado grande. Tamaño máximo: 10MB' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true, // Adds random suffix to avoid duplicates
    });

    // Generate unique document ID from blob URL
    const urlParts = blob.url.split('/');
    const blobFileName = urlParts[urlParts.length - 1];
    const documentId = blobFileName;

    // Store document metadata in database
    await addDocument({
      id: documentId,
      fileName: file.name,
      blobUrl: blob.url,
      uploadedAt: new Date().toISOString(),
      isLocal: false
    });

    // Generate document URL - use the documentId (blob filename)
    const documentUrl = `/document/${encodeURIComponent(documentId)}`;

    return NextResponse.json({
      success: true,
      fileName: file.name,
      documentUrl: documentUrl,
      blobUrl: blob.url, // The actual URL where the file is stored
      message: 'Archivo cargado exitosamente'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Error al procesar el archivo' },
      { status: 500 }
    );
  }
}
