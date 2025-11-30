import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Abstract file storage interface
 * Supports local disk storage with easy extension to cloud storage (S3, Azure Blob, etc.)
 */
export interface IFileStorage {
  saveFile(file: Express.Multer.File, reportId: string): Promise<string>;
  getFile(filePath: string): Promise<Buffer>;
  deleteFile(filePath: string): Promise<void>;
  fileExists(filePath: string): Promise<boolean>;
}

/**
 * Local file system storage implementation
 * In production, this could be replaced with S3Storage, AzureBlobStorage, etc.
 */
export class LocalFileStorage implements IFileStorage {
  private storagePath: string;

  constructor(storagePath: string = './uploads') {
    this.storagePath = storagePath;
    this.ensureStorageDirectory();
  }

  private ensureStorageDirectory(): void {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  /**
   * Save file to storage and return the storage path
   */
  async saveFile(file: Express.Multer.File, reportId: string): Promise<string> {
    // Create a unique filename to prevent collisions
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
    const reportDir = path.join(this.storagePath, reportId);
    
    // Ensure report directory exists
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const filePath = path.join(reportDir, uniqueFileName);
    
    // Write file to disk
    await fs.promises.writeFile(filePath, file.buffer);
    
    // Return relative path for storage in database
    return path.relative(this.storagePath, filePath);
  }

  /**
   * Retrieve file from storage
   */
  async getFile(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.storagePath, filePath);
    if (!await this.fileExists(filePath)) {
      throw new Error('File not found');
    }
    return await fs.promises.readFile(fullPath);
  }

  /**
   * Delete file from storage
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.storagePath, filePath);
    if (await this.fileExists(filePath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.storagePath, filePath);
    try {
      await fs.promises.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Factory to get the appropriate storage implementation
 * Can be extended to support cloud storage based on environment variables
 */
export class FileStorageFactory {
  static create(): IFileStorage {
    const storageType = process.env.STORAGE_TYPE || 'local';
    const storagePath = process.env.STORAGE_PATH || './uploads';

    switch (storageType) {
      case 'local':
        return new LocalFileStorage(storagePath);
      // Future implementations:
      // case 's3':
      //   return new S3Storage(process.env.AWS_BUCKET, process.env.AWS_REGION);
      // case 'azure':
      //   return new AzureBlobStorage(process.env.AZURE_CONTAINER);
      default:
        return new LocalFileStorage(storagePath);
    }
  }
}

