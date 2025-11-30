# medlaunch-concepts-challenge
Code for the backend coding challenge

## File Upload System

This application includes a comprehensive file upload system with the following features:

### Features

- ✅ **Multipart file upload** support via `POST /reports/:reportId/attachment`
- ✅ **File type and size restrictions** (configurable)
- ✅ **Abstracted file storage layer** (local disk, ready for cloud storage)
- ✅ **Secure download access** via signed tokens with expiration
- ✅ **Token-based authentication** for file downloads
- ✅ **Complete CRUD operations** for attachments

### API Endpoints

#### Upload File
```bash
POST /reports/:reportId/attachment
Content-Type: multipart/form-data

# Form field: 'file' (the file to upload)
# Optional: 'reportEntryId' (if attachment is tied to a specific entry)
```

**Example:**
```bash
curl -X POST http://localhost:3000/reports/{reportId}/attachment \
  -F "file=@/path/to/file.pdf" \
  -F "reportEntryId=optional-entry-id"
```

#### List Attachments for a Report
```bash
GET /reports/:reportId/attachments
```

#### Get Download Token
```bash
GET /reports/:reportId/attachments/:attachmentId/token?expires=60
# expires: optional, token expiration in minutes (default: 60)
```

**Response:**
```json
{
  "token": "base64-encoded-token",
  "expiresIn": 60,
  "downloadUrl": "/reports/{reportId}/attachments/{attachmentId}/download?token=..."
}
```

#### Download File (with token)
```bash
GET /reports/:reportId/attachments/:attachmentId/download?token={token}
```

#### Delete Attachment
```bash
DELETE /reports/:reportId/attachments/:attachmentId
```

### Configuration

Environment variables (optional):
- `STORAGE_TYPE`: Storage backend type (default: 'local')
- `STORAGE_PATH`: Local storage path (default: './uploads')
- `TOKEN_SECRET`: Secret key for token signing (default: auto-generated, change in production!)

### File Restrictions

Default configuration:
- **Max file size**: 10MB
- **Allowed types**: Images (jpg, png, gif), PDF, Documents (doc, docx, xls, xlsx), Text files

To customize, modify `DEFAULT_FILE_CONFIG` in `src/utils/FileValidator.ts`.

### Security Features

1. **File Validation**: Type, size, and extension validation before storage
2. **Signed Tokens**: HMAC-signed tokens with expiration for secure downloads
3. **Token Validation**: Tokens are validated on each download request
4. **Secure Storage**: Files stored with unique names to prevent collisions
5. **Access Control**: Tokens are tied to specific attachments and reports

### Storage Architecture

The system uses an abstracted storage layer (`IFileStorage` interface) that supports:
- **Local storage** (current implementation)
- **Cloud storage** (ready for S3, Azure Blob, etc.)

To add cloud storage, implement the `IFileStorage` interface and update `FileStorageFactory`.

### Malware Scanning

See `MALWARE_SCANNING.md` for detailed information on integrating malware/virus scanning in production.

### Example Usage Flow

1. **Upload a file:**
   ```bash
   POST /reports/abc123/attachment
   # Returns: { attachmentId: "...", ... }
   ```

2. **Get download token:**
   ```bash
   GET /reports/abc123/attachments/{attachmentId}/token
   # Returns: { token: "...", downloadUrl: "..." }
   ```

3. **Download file:**
   ```bash
   GET /reports/abc123/attachments/{attachmentId}/download?token={token}
   # Returns: File download
   ```

### Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start server
npm start
```
