# Testing Guide

This guide walks you through testing the file attachment endpoints using Postman.

## Prerequisites

1. **Start your server:**
   ```bash
   npm run build
   npm start
   ```
   Default port is `8080` (you can update in your `.env`)

2. **Create a report first** (you need a valid `reportId`):
   ```http
   POST http://localhost:8080/report
   Content-Type: application/json
   
   {
     "description": "Test Report for attachment"
   }
   ```
   Save the `reportId` from the response.

## Step-by-Step Testing

### Step 1: Upload a File Attachment

**Request Setup:**
- **Method:** `POST`
- **URL:** `http://localhost:8080/report/{reportId}/attachment`
  - Replace `{reportId}` with an actual report ID from Step 0

**In Postman:**
1. Select **POST** method
2. Enter URL: `http://localhost:8080/report/YOUR_REPORT_ID/attachment`
3. Go to **Body** tab
4. Select **form-data** (NOT raw or x-www-form-urlencoded)
5. Add a key named `file`
6. **Important:** Change the type from "Text" to **"File"** (dropdown on the right)
7. Click **Select Files** and choose a file (PDF, image, etc.)
8. (Optional) Add another key `reportEntryId` with type "Text" if you want to tie it to a report entry

**Example:**
```
Key: file          | Type: File    | Value: [Select File]
Key: reportEntryId | Type: Text    | Value: (optional)
```

**Expected Response (201 Created):**
```json
{
  "attachmentId": "abc123def456...",
  "reportId": "your-report-id",
  "reportEntryId": "",
  "attachmentUrl": "your-report-id/unique-filename.pdf",
  "attachmentType": "application/pdf",
  "attachmentName": "your-file.pdf",
  "attachmentize": 12345,
  "createdAt": "2025-11-29T12:00:00.000Z"
}
```

**Save the `attachmentId` for next steps!**

---

### Step 2: List All attachment for a Report

**Request Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:8080/report/{reportId}/attachment`

**In Postman:**
1. Select **GET** method
2. Enter URL: `http://localhost:8080/report/YOUR_REPORT_ID/attachment`
3. No body needed

**Expected Response (200 OK):**
```json
{
  "attachment": [
    {
      "attachmentId": "abc123...",
      "reportId": "your-report-id",
      "attachmentName": "file.pdf",
      "attachmentize": 12345,
      "attachmentType": "application/pdf",
      "createdAt": "2025-11-29T12:00:00.000Z"
    }
  ]
}
```

---

### Step 3: Generate Download Token

**Request Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:8080/report/{reportId}/attachment/{attachmentId}/token?expires=60`
  - `expires` is optional (default: 60 minutes)

**In Postman:**
1. Select **GET** method
2. Enter URL: `http://localhost:8080/report/YOUR_REPORT_ID/attachment/YOUR_ATTACHMENT_ID/token`
3. (Optional) Add query parameter:
   - Key: `expires`
   - Value: `60` (minutes)

**Expected Response (200 OK):**
```json
{
  "token": "eyJwYXlsb2FkIjp7ImF0dGFjaG1lbnRJZCI6ImFiYzEyMy4uLiIsInJlcG9ydElkIjoieW91ci1yZXBvcnQtaWQiLCJleHBpcmVzQXQiOjE3MzI4OTYwMDB9LCJzaWduYXR1cmUiOiIuLi4ifQ",
  "expiresIn": 60,
  "downloadUrl": "/report/your-report-id/attachment/your-attachment-id/download?token=..."
}
```

**Copy the `token` value for the next step!**

---

### Step 4: Download File (Using Token)

**Request Setup:**
- **Method:** `GET`
- **URL:** `http://localhost:8080/report/{reportId}/attachment/{attachmentId}/download?token={token}`

**In Postman:**
1. Select **GET** method
2. Enter URL: `http://localhost:8080/report/YOUR_REPORT_ID/attachment/YOUR_ATTACHMENT_ID/download`
3. Add query parameter:
   - Key: `token`
   - Value: `[paste the token from Step 3]`

**Expected Response:**
- **Status:** 200 OK
- **Content-Type:** The file's MIME type (e.g., `application/pdf`)
- **Body:** Binary file content (you can save it in Postman)

**To save the file in Postman:**
- Click **Send and Download** button (next to Send)
- Or use **Send** and then click **Save Response** → **Save to a file**

---

### Step 5: Delete Attachment

**Request Setup:**
- **Method:** `DELETE`
- **URL:** `http://localhost:8080/report/{reportId}/attachment/{attachmentId}`

**In Postman:**
1. Select **DELETE** method
2. Enter URL: `http://localhost:8080/report/YOUR_REPORT_ID/attachment/YOUR_ATTACHMENT_ID`
3. No body needed

**Expected Response (200 OK):**
```json
{
  "message": "Attachment deleted successfully"
}
```

---

## Complete Test Flow Example

Here's a complete sequence you can follow:

### 1. Create a Report
```http
POST http://localhost:8080/report
Content-Type: application/json

{
  "description": "Test Report"
}
```
**Response:** Save `reportId` (e.g., `"75f8ef8e9b1a3d2621b403767aff7f81"`)

### 2. Upload File
```http
POST http://localhost:8080/report/75f8ef8e9b1a3d2621b403767aff7f81/attachment
Content-Type: multipart/form-data

file: [Select a PDF or image file]
```
**Response:** Save `attachmentId`

### 3. List attachment
```http
GET http://localhost:8080/report/75f8ef8e9b1a3d2621b403767aff7f81/attachment
```

### 4. Get Download Token
```http
GET http://localhost:8080/report/75f8ef8e9b1a3d2621b403767aff7f81/attachment/{attachmentId}/token?expires=30
```
**Response:** Save `token`

### 5. Download File
```http
GET http://localhost:8080/report/75f8ef8e9b1a3d2621b403767aff7f81/attachment/{attachmentId}/download?token={token}
```

### 6. Delete Attachment
```http
DELETE http://localhost:8080/report/75f8ef8e9b1a3d2621b403767aff7f81/attachment/{attachmentId}
```

---

## Common Issues & Solutions

### Issue: "No file uploaded" (400 error)
**Solution:** 
- Make sure you selected **form-data** in Body tab
- Change the `file` key type to **"File"** (not "Text")
- Actually select a file using "Select Files"

### Issue: "Report not found" (404 error)
**Solution:**
- Verify the `reportId` exists by calling `GET /report` first
- Check that you're using the correct report ID in the URL

### Issue: "Invalid or expired token" (401 error)
**Solution:**
- Generate a new token (tokens expire after the specified time)
- Make sure you're using the token in the query parameter correctly
- Verify the token matches the attachment and report IDs

### Issue: "File type not allowed" (400 error)
**Solution:**
- Check allowed file types in `src/utils/FileValidator.ts`
- Default allowed: images (jpg, png, gif), PDF, documents (doc, docx, xls, xlsx), text files
- Make sure your file matches one of these types

### Issue: "File size exceeds maximum" (400 error)
**Solution:**
- Default max size is 10MB
- Use a smaller file or increase the limit in `FileValidator.ts`

---

## Postman Collection Setup Tips

1. **Create a Collection:**
   - Create a new collection called "attachment API"
   - Add all requests to this collection

2. **Use Variables:**
   - Set collection variables:
     - `baseUrl`: `http://localhost:8080`
     - `reportId`: (set after creating a report)
     - `attachmentId`: (set after uploading)
     - `token`: (set after generating token)
   
   - Then use in URLs: `{{baseUrl}}/report/{{reportId}}/attachment`

3. **Add Tests (Optional):**
   ```javascript
   // In "Tests" tab for upload request:
   if (pm.response.code === 201) {
       const jsonData = pm.response.json();
       pm.collectionVariables.set("attachmentId", jsonData.attachmentId);
   }
   
   // In "Tests" tab for token request:
   if (pm.response.code === 200) {
       const jsonData = pm.response.json();
       pm.collectionVariables.set("token", jsonData.token);
   }
   ```

4. **Environment Variables:**
   - Create an environment with:
     - `baseUrl`: `http://localhost:8080`
     - `port`: `8080`

---

## Quick Test Checklist

- [ ] Server is running
- [ ] Created a test report and saved `reportId`
- [ ] Uploaded a file successfully (got 201 response)
- [ ] Listed attachment (got array of attachment)
- [ ] Generated download token (got token string)
- [ ] Downloaded file using token (got file content)
- [ ] Verified token expiration (wait and try again - should fail)
- [ ] Deleted attachment (got success message)
- [ ] Verified file is gone (list attachment - should be empty)

---

## Example Postman Collection JSON

You can import this into Postman:

```json
{
  "info": {
    "name": "attachment API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Create Report",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"description\": \"Test Report\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/report",
          "host": ["{{baseUrl}}"],
          "path": ["report"]
        }
      }
    },
    {
      "name": "2. Upload Attachment",
      "request": {
        "method": "POST",
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": []
            }
          ]
        },
        "url": {
          "raw": "{{baseUrl}}/report/{{reportId}}/attachment",
          "host": ["{{baseUrl}}"],
          "path": ["report", "{{reportId}}", "attachment"]
        }
      }
    },
    {
      "name": "3. List attachment",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/report/{{reportId}}/attachment",
          "host": ["{{baseUrl}}"],
          "path": ["report", "{{reportId}}", "attachment"]
        }
      }
    },
    {
      "name": "4. Get Download Token",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/report/{{reportId}}/attachment/{{attachmentId}}/token?expires=60",
          "host": ["{{baseUrl}}"],
          "path": ["report", "{{reportId}}", "attachment", "{{attachmentId}}", "token"],
          "query": [{"key": "expires", "value": "60"}]
        }
      }
    },
    {
      "name": "5. Download File",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/report/{{reportId}}/attachment/{{attachmentId}}/download?token={{token}}",
          "host": ["{{baseUrl}}"],
          "path": ["report", "{{reportId}}", "attachment", "{{attachmentId}}", "download"],
          "query": [{"key": "token", "value": "{{token}}"}]
        }
      }
    },
    {
      "name": "6. Delete Attachment",
      "request": {
        "method": "DELETE",
        "url": {
          "raw": "{{baseUrl}}/report/{{reportId}}/attachment/{{attachmentId}}",
          "host": ["{{baseUrl}}"],
          "path": ["report", "{{reportId}}", "attachment", "{{attachmentId}}"]
        }
      }
    }
  ],
  "variable": [
    {"key": "baseUrl", "value": "http://localhost:8080"},
    {"key": "reportId", "value": ""},
    {"key": "attachmentId", "value": ""},
    {"key": "token", "value": ""}
  ]
}
```

Save this as a `.json` file and import it into Postman!

