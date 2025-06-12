import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serveStatic } from 'hono/bun';
import { randomUUID } from 'crypto';
import { mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { swaggerUI } from '@hono/swagger-ui';
import { openApiSchema } from './openapi';

const app = new Hono();
const UPLOAD_DIR = './uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024; 

await mkdir(UPLOAD_DIR, { recursive: true });

app.use('*', cors());


app.get('/', swaggerUI({ url: '/api-docs' }));
app.get('/api-docs', (c) => c.json(openApiSchema));
app.use('/uploads/*', serveStatic({ root: './' }));

app.post('/api/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return c.json({ error: 'File too large' }, 400);
    }


    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type' }, 400);
    }

    const fileExtension = file.name.split('.').pop();
    const newFilename = `${randomUUID()}.${fileExtension}`;
    const filePath = join(UPLOAD_DIR, newFilename);

    const arrayBuffer = await file.arrayBuffer();
    await Bun.write(filePath, new Uint8Array(arrayBuffer));

    const fileUrl = `${c.req.url.split('/api')[0]}/uploads/${newFilename}`;
    
    return c.json({
      success: true,
      file: {
        name: newFilename,
        url: fileUrl,
        size: file.size,
        type: file.type
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/files', async (c) => {
  try {
    const files = await readdir(UPLOAD_DIR);
    const fileList = files.map(file => ({
      name: file,
      url: `${c.req.url.split('/api')[0]}/uploads/${file}`
    }));

    return c.json({
      success: true,
      files: fileList
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default {
  port: 3000,
  fetch: app.fetch,
};