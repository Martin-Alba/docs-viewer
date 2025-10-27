import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    const documentId = decodeURIComponent(params.documentId);
    const documentsPath = join(process.cwd(), 'public', 'documents');
    
    // Leer archivos en el directorio de documentos
    const files = await readdir(documentsPath);
    
    // Filtrar solo archivos soportados
    const supportedExtensions = ['.pdf', '.doc', '.docx', '.md'];
    
    for (const file of files) {
      const filePath = join(documentsPath, file);
      const fileStats = await stat(filePath);
      
      if (fileStats.isFile()) {
        const extension = file.toLowerCase().substring(file.lastIndexOf('.'));
        
        if (supportedExtensions.includes(extension) && 
            (file === documentId || file.replace(/\s+/g, '-').toLowerCase() === documentId.toLowerCase())) {
          
          const document = {
            name: file,
            size: fileStats.size,
            extension: extension.substring(1), // Remover el punto
            lastModified: fileStats.mtime,
            url: `/documents/${file}`, // URL pública para acceder al archivo
          };
          
          return NextResponse.json({ 
            success: true, 
            document 
          });
        }
      }
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