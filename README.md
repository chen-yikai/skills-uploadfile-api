# MP4 File Upload API

A simple API built with Bun and Hono for uploading MP4 files.

## Prerequisites

- [Bun](https://bun.sh/) installed on your system

## Setup

1. Install dependencies:
```bash
bun install
```

2. Start the development server:
```bash
bun run dev
```

The server will start on port 3000 by default. You can change this by setting the `PORT` environment variable.

## API Endpoints

### Upload MP4 File
- **POST** `/upload`
- **Content-Type**: `multipart/form-data`
- **Body**: 
  - `file`: MP4 file to upload

**Response**:
```json
{
  "success": true,
  "filename": "timestamp-filename.mp4",
  "url": "/uploads/timestamp-filename.mp4"
}
```

### Health Check
- **GET** `/`
- Returns `{ "status": "ok" }`

## Example Usage

Using curl:
```bash
curl -X POST -F "file=@video.mp4" http://localhost:3000/upload
```

Using JavaScript fetch:
```javascript
const formData = new FormData();
formData.append('file', videoFile);

const response = await fetch('http://localhost:3000/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
``` 