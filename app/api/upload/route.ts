import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
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

    // Create documents directory if it doesn't exist
    const documentsPath = join(process.cwd(), 'public', 'documents');
    if (!existsSync(documentsPath)) {
      await mkdir(documentsPath, { recursive: true });
    }

    // Get file extension and create unique filename if needed
    const fileName = file.name;
    let finalFileName = fileName;
    let filePath = join(documentsPath, finalFileName);
    
    // Check if file already exists, if so, add a number suffix
    let counter = 1;
    while (existsSync(filePath)) {
      const nameParts = fileName.split('.');
      const extension = nameParts.pop();
      const baseName = nameParts.join('.');
      finalFileName = `${baseName}-${counter}.${extension}`;
      filePath = join(documentsPath, finalFileName);
      counter++;
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate document URL
    const documentUrl = `/document/${encodeURIComponent(finalFileName)}`;

    return NextResponse.json({
      success: true,
      fileName: finalFileName,
      documentUrl: documentUrl,
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
