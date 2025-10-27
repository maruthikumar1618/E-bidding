import { Request, Response, NextFunction } from 'express';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);

  // Prisma errors
  if (error.code === 'P2002') {
    return res.status(400).json({
      message: 'Duplicate entry. This record already exists.',
      field: error.meta?.target
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      message: 'Record not found'
    });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.errors
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired'
    });
  }

  // Multer errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'File too large. Maximum size is 5MB.'
    });
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      message: 'Too many files. Maximum is 5 files.'
    });
  }

  // Default error
  res.status(500).json({
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
};
