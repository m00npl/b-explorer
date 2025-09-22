import axios, { AxiosInstance } from 'axios';
import { BeaconHead, BlockHeader, BeaconBlock, Validator } from '../types/beacon';
import { logger } from '../utils/logger';

export class BeaconAPIClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('Beacon API error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message
        });
        throw error;
      }
    );
  }

  async getHead(): Promise<BeaconHead> {
    try {
      const response = await this.client.get('/eth/v1/beacon/headers/head');
      const data = response.data.data;
      const slot = parseInt(data.header.message.slot);
      return {
        slot: slot,
        root: data.root,
        epoch: Math.floor(slot / 32)
      };
    } catch (error: any) {
      logger.error('Failed to get head:', error);
      throw error;
    }
  }

  async getBlockHeader(slot: number): Promise<BlockHeader | null> {
    try {
      const response = await this.client.get(`/eth/v1/beacon/headers/${slot}`);
      const data = response.data.data;

      return {
        root: data.root,
        canonical: data.canonical,
        header: data.header,
        timestamp: Date.now() / 1000, // Lighthouse doesn't provide timestamp in header
        parent_root: data.header.message.parent_root,
        state_root: data.header.message.state_root
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      logger.error(`Failed to get block header for slot ${slot}:`, error);
      throw error;
    }
  }

  async getBlock(slot: number): Promise<BeaconBlock | null> {
    try {
      const response = await this.client.get(`/eth/v2/beacon/blocks/${slot}`);
      const data = response.data.data;

      return {
        proposer_index: parseInt(data.message.proposer_index),
        graffiti: Buffer.from(data.message.body.graffiti.slice(2), 'hex').toString('utf8').replace(/\0/g, ''),
        attestations: [] // Attestations in Lighthouse API are complex aggregated data, we'll skip for now
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      logger.error(`Failed to get block for slot ${slot}:`, error);
      throw error;
    }
  }

  async getValidators(rotationOffset: number = 0): Promise<Validator[]> {
    try {
      // Rotational fetching: 10k validators per cycle
      // Total validators: ~2M, so full rotation takes ~200 cycles (~3.3 hours at 60s intervals)
      const totalValidators = 2100000; // Estimated total, will be dynamic later
      const validatorsPerCycle = 10000;
      const batchSize = 100;

      // Calculate this cycle's range with rotation
      const cycleStart = (rotationOffset * validatorsPerCycle) % totalValidators;
      const cycleEnd = Math.min(cycleStart + validatorsPerCycle - 1, totalValidators - 1);

      logger.info(`Fetching validators ${cycleStart}-${cycleEnd} (rotation offset: ${rotationOffset})`);

      const validators: Validator[] = [];

      for (let start = cycleStart; start <= cycleEnd; start += batchSize) {
        const end = Math.min(start + batchSize - 1, cycleEnd);
        const ids = Array.from({ length: end - start + 1 }, (_, i) => start + i).join(',');

        try {
          const response = await this.client.get(`/eth/v1/beacon/states/head/validators?id=${ids}`);
          const batchValidators = response.data.data;

          validators.push(...batchValidators.map((v: any) => {
            const exitEpoch = parseInt(v.validator.exit_epoch);
            // Handle Ethereum's "never" value (18446744073709551615) which exceeds PostgreSQL BIGINT max
            const safeExitEpoch = exitEpoch >= 9223372036854775807 ? null : exitEpoch;

            return {
              index: parseInt(v.index),
              pubkey: v.validator.pubkey,
              withdrawal_credentials: v.validator.withdrawal_credentials,
              balance: parseInt(v.balance), // Keep in Gwei (BIGINT)
              effective_balance: parseInt(v.validator.effective_balance), // Keep in Gwei (BIGINT)
              status: v.status,
              activation_epoch: parseInt(v.validator.activation_epoch),
              exit_epoch: safeExitEpoch,
              last_attestation_slot: null, // Not provided by this endpoint
              effectiveness_rating: null // Not provided by this endpoint
            };
          }));
        } catch (batchError: any) {
          if (batchError.response?.status === 404) {
            // Some validators don't exist in this range, continue
            logger.warn(`Validators ${start}-${end} not found, continuing...`);
            continue;
          }
          throw batchError;
        }
      }

      logger.info(`Successfully fetched ${validators.length} validators from range ${cycleStart}-${cycleEnd}`);
      return validators;
    } catch (error: any) {
      logger.error('Failed to get validators:', error);
      throw error;
    }
  }

  async getFinality(): Promise<{ finalized_epoch: number; justified_epoch: number }> {
    try {
      const response = await this.client.get('/eth/v1/beacon/states/head/finality_checkpoints');
      const data = response.data.data;
      return {
        finalized_epoch: parseInt(data.finalized.epoch),
        justified_epoch: parseInt(data.current_justified.epoch)
      };
    } catch (error: any) {
      logger.error('Failed to get finality:', error);
      throw error;
    }
  }
}