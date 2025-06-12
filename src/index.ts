import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

const app = new OpenAPIHono();

// Swagger UI
app.get('/ui', swaggerUI({ url: '/doc' }));

// OpenAPI documentation
app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    title: 'MP4 File Upload API',
    version: '1.0.0',
    description: 'API for practice uploading files'
  },
});

// Serve static files from the uploads directory
app.use('/uploads/*', serveStatic({ root: './' }));

// Create uploads directory if it doesn't exist
const uploadsDir = join(process.cwd(), 'uploads');
try {
  await mkdir(uploadsDir, { recursive: true });
} catch (error) {
  // Directory might already exist, which is fine
}

// Upload route with OpenAPI documentation
const uploadRoute = createRoute({
  method: 'post',
  path: '/upload',
  tags: ['Files'],
  summary: 'Upload an MP4 file',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            file: z.instanceof(File)
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: 'File uploaded successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            filename: z.string(),
            url: z.string()
          })
        }
      }
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      }
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: z.object({
            error: z.string()
          })
        }
      }
    }
  }
});

app.openapi(uploadRoute, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Check if the file is an MP4
    if (!file.type.includes('video/mp4')) {
      return c.json({ error: 'Only MP4 files are allowed' }, 400);
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = join(uploadsDir, filename);

    // Save the file
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(arrayBuffer));

    return c.json({
      success: true,
      filename,
      url: `/uploads/${filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

// Health check endpoint with OpenAPI documentation
const healthCheckRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Health'],
  summary: 'Health check endpoint',
  responses: {
    200: {
      description: 'Server is healthy',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string()
          })
        }
      }
    }
  }
});

app.openapi(healthCheckRoute, (c) => c.json({ status: 'ok' }));

const port = process.env.PORT || 3000;
console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch
}; 