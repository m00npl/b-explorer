import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { asyncHandler, createApiError } from '../middleware/error-handler';
import { DatabaseClient } from '../database/client';
import { PaginatedResponse, SlotResponse } from '../types/api';

const router = Router();

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(100)
});

const slotParamSchema = Joi.object({
  slotNumber: Joi.number().integer().min(0).required()
});

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = querySchema.validate(req.query);
  if (error) {
    throw createApiError(error.details[0].message, 400);
  }

  const { page, limit } = value;
  const offset = (page - 1) * limit;

  const db: DatabaseClient = req.app.locals.db;

  const [slots, totalCount] = await Promise.all([
    db.getSlots(limit, offset),
    db.getTotalCount('slots')
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const response: PaginatedResponse<SlotResponse> = {
    data: slots,
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

router.get('/:slotNumber', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = slotParamSchema.validate(req.params);
  if (error) {
    throw createApiError(error.details[0].message, 400);
  }

  const { slotNumber } = value;
  const db: DatabaseClient = req.app.locals.db;

  const slot = await db.getSlotByNumber(slotNumber);
  if (!slot) {
    throw createApiError(`Slot ${slotNumber} not found`, 404);
  }

  res.json({
    success: true,
    data: slot,
    timestamp: new Date().toISOString()
  });
}));

router.get('/:slotNumber/attestations', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = slotParamSchema.validate(req.params);
  if (error) {
    throw createApiError(error.details[0].message, 400);
  }

  const { slotNumber } = value;
  const db: DatabaseClient = req.app.locals.db;

  const attestations = await db.getAttestations(slotNumber);

  res.json({
    success: true,
    data: attestations,
    timestamp: new Date().toISOString()
  });
}));

export default router;