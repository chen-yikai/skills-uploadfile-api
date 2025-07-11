import { OpenAPIHono } from '@hono/zod-openapi';
import { z } from 'zod';

const FileResponseSchema = z.object({
  success: z.boolean(),
  file: z.object({
    name: z.string(),
    url: z.string(),
    size: z.number(),
    type: z.string()
  })
});

const FileListResponseSchema = z.object({
  success: z.boolean(),
  files: z.array(z.object({
    name: z.string(),
    url: z.string()
  }))
});

const ErrorResponseSchema = z.object({
  error: z.string()
});

const DeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

export const openApiSchema = {
  openapi: '3.0.0',
  info: {
    title: 'File Upload API',
    version: '1.0.0',
    description: 'API for uploading and managing files'
  },
  paths: {
    '/api/upload': {
      post: {
        summary: 'Upload a file',
        description: 'Upload any file to the server. Maximum file size: 10GB',
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to upload (any file type)'
                  }
                },
                required: ['file']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'File uploaded successfully',
            content: {
              'application/json': {
                schema: FileResponseSchema
              }
            }
          },
          '400': {
            description: 'Bad request',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          }
        }
      }
    },
    '/api/files': {
      get: {
        summary: 'Get all files',
        description: 'Retrieve a list of all uploaded files',
        responses: {
          '200': {
            description: 'List of files retrieved successfully',
            content: {
              'application/json': {
                schema: FileListResponseSchema
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          }
        }
      }
    },
    '/api/files/{filename}': {
      delete: {
        summary: 'Delete a file',
        description: 'Delete a specific file from the server',
        parameters: [
          {
            name: 'filename',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            },
            description: 'Name of the file to delete'
          }
        ],
        responses: {
          '200': {
            description: 'File deleted successfully',
            content: {
              'application/json': {
                schema: DeleteResponseSchema
              }
            }
          },
          '404': {
            description: 'File not found',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: ErrorResponseSchema
              }
            }
          }
        }
      }
    }
  }
}; 