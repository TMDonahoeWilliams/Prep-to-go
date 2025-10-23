import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

// Request validation middleware
export function validateRequest(schema: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      next(error);
    }
  };
}

// Error handling middleware
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Default error
  let status = 500;
  let message = 'Internal Server Error';

  // Handle specific error types
  if (err.status || err.statusCode) {
    status = err.status || err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    status = 400;
    message = 'Validation Error';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    message = 'File too large';
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'Invalid JSON format';
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && status === 500) {
    message = 'Internal Server Error';
  }

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

// Async route wrapper to handle promise rejections
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    // Only log API routes
    if (req.url.startsWith('/api')) {
      console.log('Request:', logData);
    }
  });
  
  next();
}