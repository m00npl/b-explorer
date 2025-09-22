import axios from 'axios';
import { DatabaseClient } from './database/client';
import { BeaconAPIClient } from './beacon/api-client';
import { logger } from './utils/logger';

export class BeaconIngestor {
  private dbClient: DatabaseClient;
  private beaconClient: BeaconAPIClient;
  private pollInterval: number;
  private isRunning: boolean = false;
  private intervalId?: NodeJS.Timeout;
  private validatorRotationOffset: number = 0;

  constructor(beaconNodeUrl: string, golemDbUrl: string, pollInterval: number) {
    this.dbClient = new DatabaseClient(golemDbUrl);
    this.beaconClient = new BeaconAPIClient(beaconNodeUrl);
    this.pollInterval = pollInterval;
  }

  async start(): Promise<void> {
    logger.info('Initializing ingestor...');

    try {
      await this.dbClient.connect();
      // Schema already initialized manually
      // await this.dbClient.initializeSchema();

      this.isRunning = true;

      await this.ingestCurrentData();

      this.intervalId = setInterval(async () => {
        try {
          await this.ingestCurrentData();
        } catch (error: any) {
          logger.error('Error during periodic ingestion:', error);
        }
      }, this.pollInterval);

      logger.info(`Ingestor started, polling every ${this.pollInterval}ms`);
    } catch (error) {
      logger.error('Failed to start ingestor:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    logger.info('Stopping ingestor...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    await this.dbClient.disconnect();
    logger.info('Ingestor stopped');
  }

  private async ingestCurrentData(): Promise<void> {
    try {
      const head = await this.beaconClient.getHead();
      const currentSlot = head.slot;

      await this.ingestSlotRange(Math.max(0, currentSlot - 10), currentSlot);

      await this.ingestValidators();

      await this.updateEpochSummary(Math.floor(currentSlot / 32));

      await this.cleanupExpiredData();

      logger.info(`Ingested data up to slot ${currentSlot}`);
    } catch (error: any) {
      logger.error('Error ingesting current data:', error);
    }
  }

  private async ingestSlotRange(startSlot: number, endSlot: number): Promise<void> {
    for (let slot = startSlot; slot <= endSlot; slot++) {
      try {
        const blockHeader = await this.beaconClient.getBlockHeader(slot);
        if (blockHeader) {
          const block = await this.beaconClient.getBlock(slot);
          await this.dbClient.insertSlot({
            slot_number: slot,
            block_root: blockHeader.root,
            parent_root: blockHeader.parent_root,
            state_root: blockHeader.state_root,
            proposer_index: block?.proposer_index || null,
            status: block ? 'proposed' : 'missed',
            timestamp: new Date(blockHeader.timestamp * 1000),
            graffiti: block?.graffiti || null
          });

          if (block?.attestations) {
            for (const attestation of block.attestations) {
              await this.dbClient.insertAttestation({
                slot_number: slot,
                committee_index: attestation.committee_index,
                validator_index: attestation.validator_index,
                beacon_block_root: attestation.beacon_block_root,
                source_epoch: attestation.source_epoch,
                target_epoch: attestation.target_epoch,
                signature: attestation.signature,
                included_in_block: slot
              });
            }
          }
        }
      } catch (error: any) {
        logger.warn(`Failed to ingest slot ${slot}:`, error);
      }
    }
  }

  private async ingestValidators(): Promise<void> {
    try {
      // Use rotational offset and increment it for next cycle
      const validators = await this.beaconClient.getValidators(this.validatorRotationOffset);

      for (const validator of validators) {
        await this.dbClient.upsertValidator({
          validator_index: validator.index,
          pubkey: validator.pubkey,
          withdrawal_credentials: validator.withdrawal_credentials,
          balance: validator.balance,
          effective_balance: validator.effective_balance,
          status: validator.status,
          activation_epoch: validator.activation_epoch,
          exit_epoch: validator.exit_epoch,
          last_attestation_slot: validator.last_attestation_slot,
          effectiveness_rating: validator.effectiveness_rating
        });
      }

      // Increment rotation offset for next cycle
      this.validatorRotationOffset++;
      logger.info(`Validator rotation offset advanced to: ${this.validatorRotationOffset}`);

    } catch (error: any) {
      logger.error('Error ingesting validators:', error);
    }
  }

  private async updateEpochSummary(epoch: number): Promise<void> {
    try {
      const startSlot = epoch * 32;
      const endSlot = startSlot + 31;

      // Use estimated values for epoch summary since we're rotating through validators
      // These will be updated as we collect more validator data over time
      const estimatedTotalValidators = 2100000;
      const estimatedActiveValidators = 2000000;
      const estimatedTotalBalance = BigInt(estimatedActiveValidators) * BigInt(32000000000); // 32 ETH per validator in Gwei

      // Get finality information
      const finality = await this.beaconClient.getFinality();

      await this.dbClient.upsertEpoch({
        epoch_number: epoch,
        start_slot: startSlot,
        end_slot: endSlot,
        finalized: epoch <= finality.finalized_epoch,
        justified: epoch <= finality.justified_epoch,
        total_validators: estimatedTotalValidators,
        active_validators: estimatedActiveValidators,
        total_balance: Number(estimatedTotalBalance),
        avg_effectiveness: null, // Will be calculated when we have enough validator data
        timestamp: new Date()
      });
    } catch (error: any) {
      logger.error(`Error updating epoch ${epoch} summary:`, error);
    }
  }

  private async cleanupExpiredData(): Promise<void> {
    try {
      const deletedCount = await this.dbClient.cleanupExpiredData();
      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} expired records`);
      }
    } catch (error: any) {
      logger.error('Error cleaning up expired data:', error);
    }
  }
}