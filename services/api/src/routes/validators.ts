import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { asyncHandler, createApiError } from '../middleware/error-handler';
import { DatabaseClient } from '../database/client';
import { PaginatedResponse, ValidatorResponse, ValidatorStats } from '../types/api';

const router = Router();

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(100),
  status: Joi.string().valid('active_ongoing', 'active_exiting', 'active_slashed', 'pending_initialized', 'pending_queued', 'withdrawal_possible', 'withdrawal_done').optional(),
  search: Joi.string().min(3).optional()
});

const validatorParamSchema = Joi.object({
  validatorIndex: Joi.number().integer().min(0).required()
});

const searchSchema = Joi.object({
  q: Joi.string().min(3).required()
});

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = querySchema.validate(req.query);
  if (error) {
    throw createApiError(error.details[0].message, 400);
  }

  const { page, limit } = value;
  const offset = (page - 1) * limit;

  const db: DatabaseClient = req.app.locals.db;

  const [validators, totalCount] = await Promise.all([
    db.getValidators(limit, offset),
    db.getTotalCount('validators')
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const response: PaginatedResponse<ValidatorResponse> = {
    data: validators,
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

router.get('/search', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = searchSchema.validate(req.query);
  if (error) {
    throw createApiError(error.details[0].message, 400);
  }

  const { q } = value;
  const db: DatabaseClient = req.app.locals.db;

  let validator = null;

  if (/^\d+$/.test(q)) {
    validator = await db.getValidator(parseInt(q));
  } else {
    validator = await db.searchValidatorByPubkey(q);
  }

  if (!validator) {
    throw createApiError('Validator not found', 404);
  }

  res.json({
    success: true,
    data: validator,
    timestamp: new Date().toISOString()
  });
}));

router.get('/:validatorIndex', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = validatorParamSchema.validate(req.params);
  if (error) {
    throw createApiError(error.details[0].message, 400);
  }

  const { validatorIndex } = value;
  const db: DatabaseClient = req.app.locals.db;

  const validator = await db.getValidator(validatorIndex);
  if (!validator) {
    throw createApiError(`Validator ${validatorIndex} not found`, 404);
  }

  res.json({
    success: true,
    data: validator,
    timestamp: new Date().toISOString()
  });
}));

router.get('/:validatorIndex/performance', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = validatorParamSchema.validate(req.params);
  if (error) {
    throw createApiError(error.details[0].message, 400);
  }

  const { validatorIndex } = value;
  const db: DatabaseClient = req.app.locals.db;

  const [validator, performance] = await Promise.all([
    db.getValidator(validatorIndex),
    db.getValidatorPerformance(validatorIndex, 20)
  ]);

  if (!validator) {
    throw createApiError(`Validator ${validatorIndex} not found`, 404);
  }

  const stats: ValidatorStats = {
    validator_index: validator.validator_index,
    balance: validator.balance,
    effectiveness_rating: validator.effectiveness_rating,
    last_attestation_slot: validator.last_attestation_slot,
    recent_performance: performance.map(p => ({
      epoch: p.epoch_number,
      attestations_made: p.attestations_made,
      attestations_expected: p.attestations_expected,
      blocks_proposed: p.blocks_proposed,
      effectiveness: p.effectiveness
    }))
  };

  res.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString()
  });
}));

export default router;