import { promises as fs } from 'fs';
import path from 'path';

// Simple JSON database for document metadata
// In production (Vercel), use /tmp which is writable
const getDBPath = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseDir = isProduction ? '/tmp' : process.cwd();
  return path.join(baseDir, 'data', 'documents.json');
};

const DB_PATH = getDBPath();

export interface DocumentMetadata {
  id: string;
  fileName: string;
  blobUrl: string;
  uploadedAt: string;
  isLocal: boolean; // true if in public/documents, false if in Blob
}

interface DocumentsDB {
  documents: DocumentMetadata[];
}

// Ensure data directory exists
async function ensureDataDir() {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseDir = isProduction ? '/tmp' : process.cwd();
  const dataDir = path.join(baseDir, 'data');
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

// Read database
async function readDB(): Promise<DocumentsDB> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet, return empty
    return { documents: [] };
  }
}

// Write database
async function writeDB(db: DocumentsDB): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

// Add a document
export async function addDocument(metadata: DocumentMetadata): Promise<void> {
  const db = await readDB();
  // Remove existing document with same ID if any
  db.documents = db.documents.filter(doc => doc.id !== metadata.id);
  db.documents.push(metadata);
  await writeDB(db);
}

// Get a document by ID
export async function getDocument(id: string): Promise<DocumentMetadata | null> {
  const db = await readDB();
  return db.documents.find(doc => doc.id === id) || null;
}

// Get all documents
export async function getAllDocuments(): Promise<DocumentMetadata[]> {
  const db = await readDB();
  return db.documents;
}

// Delete a document by ID
export async function deleteDocument(id: string): Promise<boolean> {
  const db = await readDB();
  const initialLength = db.documents.length;
  db.documents = db.documents.filter(doc => doc.id !== id);
  
  if (db.documents.length < initialLength) {
    await writeDB(db);
    return true;
  }
  return false;
}

// Scan local documents directory and add to DB
export async function scanLocalDocuments(): Promise<void> {
  const documentsDir = path.join(process.cwd(), 'public', 'documents');
  try {
    const files = await fs.readdir(documentsDir);
    const db = await readDB();
    
    for (const file of files) {
      const filePath = path.join(documentsDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        // For local files, use the filename as ID to preserve original URLs
        // Check if already in DB (use filename as ID)
        const existing = db.documents.find(doc => doc.id === file);
        
        if (!existing) {
          db.documents.push({
            id: file, // Use filename as ID so URL is /document/archivo.pdf
            fileName: file,
            blobUrl: `/documents/${file}`, // Relative URL for local files
            uploadedAt: stats.mtime.toISOString(),
            isLocal: true
          });
        }
      }
    }
    
    await writeDB(db);
  } catch (error) {
    // Directory doesn't exist or is empty
    console.log('No local documents directory found');
  }
}
