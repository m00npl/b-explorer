import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { asyncHandler, createApiError } from '../middleware/error-handler';
import { DatabaseClient } from '../database/client';
import { PaginatedResponse, EpochResponse } from '../types/api';

const router = Router();

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(100)
});

const epochParamSchema = Joi.object({
  epochNumber: Joi.number().integer().min(0).required()
});

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = querySchema.validate(req.query);
  if (error) {
    throw createApiError(error.details[0].message, 400);
  }

  const { page, limit } = value;
  const offset = (page - 1) * limit;

  const db: DatabaseClient = req.app.locals.db;

  const [epochs, totalCount] = await Promise.all([
    db.getEpochs(limit, offset),
    db.getTotalCount('epochs')
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const response: PaginatedResponse<EpochResponse> = {
    data: epochs,
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: totalPages
    }
  };

  res.json({
    success: true,
    data: response,
    timestamp: new Date().toISOString()
  });
}));

router.get('/:epochNumber', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = epochParamSchema.validate(req.params);
  if (error) {
    throw createApiError(error.details[0].message, 400);
  }

  const { epochNumber } = value;
  const db: DatabaseClient = req.app.locals.db;

  const epoch = await db.getEpochByNumber(epochNumber);
  if (!epoch) {
    throw createApiError(`Epoch ${epochNumber} not found`, 404);
  }

  res.json({
    success: true,
    data: epoch,
    timestamp: new Date().toISOString()
  });
}));

export default router;