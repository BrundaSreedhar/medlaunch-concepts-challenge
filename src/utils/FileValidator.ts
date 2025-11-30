import path from 'path';

/**
 * File validation utilities
 * Enforces file type and size restrictions
 */

export interface FileValidationConfig {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

export const DEFAULT_FILE_CONFIG: FileValidationConfig = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB default
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt', '.doc', '.docx', '.xls', '.xlsx']
};

export class FileValidator {
  private config: FileValidationConfig;

  constructor(config: FileValidationConfig = DEFAULT_FILE_CONFIG) {
    this.config = config;
  }

  /**
   * Validate file size
   */
  validateSize(file: Express.Multer.File): { valid: boolean; error?: string } {
    if (file.size > this.config.maxSizeBytes) {
      const maxSizeMB = this.config.maxSizeBytes / (1024 * 1024);
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`
      };
    }
    return { valid: true };
  }

  /**
   * Validate file type by MIME type
   */
  validateMimeType(file: Express.Multer.File): { valid: boolean; error?: string } {
    if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `File type ${file.mimetype} is not allowed. Allowed types: ${this.config.allowedMimeTypes.join(', ')}`
      };
    }
    return { valid: true };
  }

  /**
   * Validate file type by extension
   */
  validateExtension(file: Express.Multer.File): { valid: boolean; error?: string } {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!this.config.allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `File extension ${ext} is not allowed. Allowed extensions: ${this.config.allowedExtensions.join(', ')}`
      };
    }
    return { valid: true };
  }

  /**
   * Comprehensive file validation
   */
  validate(file: Express.Multer.File): { valid: boolean; error?: string } {
    // Validate size
    const sizeCheck = this.validateSize(file);
    if (!sizeCheck.valid) {
      return sizeCheck;
    }

    // Validate MIME type
    const mimeCheck = this.validateMimeType(file);
    if (!mimeCheck.valid) {
      return mimeCheck;
    }

    // Validate extension
    const extCheck = this.validateExtension(file);
    if (!extCheck.valid) {
      return extCheck;
    }

    return { valid: true };
  }
}

