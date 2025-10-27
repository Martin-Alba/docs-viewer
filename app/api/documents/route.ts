import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const documentsPath = join(process.cwd(), 'public', 'documents');
    
    // Leer archivos en el directorio de documentos
    const files = await readdir(documentsPath);
    
    // Filtrar solo archivos soportados y obtener información adicional
    const supportedExtensions = ['.pdf', '.doc', '.docx', '.md'];
    const documents = [];
    
    for (const file of files) {
      const filePath = join(documentsPath, file);
      const fileStats = await stat(filePath);
      
      if (fileStats.isFile()) {
        const extension = file.toLowerCase().substring(file.lastIndexOf('.'));
        
        if (supportedExtensions.includes(extension)) {
          documents.push({
            name: file,
            size: fileStats.size,
            extension: extension.substring(1), // Remover el punto
            lastModified: fileStats.mtime,
            url: `/documents/${file}`, // URL pública para acceder al archivo
          });
        }
      }
    }
    
    // Ordenar por fecha de modificación (más reciente primero)
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