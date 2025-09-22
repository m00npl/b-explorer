import { Pool, Client } from 'pg';
import { SlotData, ValidatorData, EpochData, AttestationData } from '../types/beacon';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

export class DatabaseClient {
  private pool: Pool;
  private golemDbUrl: string;

  constructor(golemDbUrl: string) {
    this.golemDbUrl = golemDbUrl;
    this.pool = new Pool({
      connectionString: this.buildConnectionString(),
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  private buildConnectionString(): string {
    const url = new URL(this.golemDbUrl);
    const username = process.env.DB_USERNAME || 'golem';
    const password = process.env.DB_PASSWORD || 'golem';
    const dbName = process.env.DB_NAME || 'beacon_explorer';
    const dbPort = process.env.DB_PORT || '5432';
    return `postgresql://${username}:${password}@${url.hostname}:${dbPort}/${dbName}`;
  }

  async connect(): Promise<void> {
    try {
      await this.pool.connect();
      logger.info('Connected to Golem DB');
    } catch (error: any) {
      logger.error('Failed to connect to Golem DB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
    logger.info('Disconnected from Golem DB');
  }

  async initializeSchema(): Promise<void> {
    try {
      const schemaPath = path.join(__dirname, '../../../init-schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await this.pool.query(schema);
      logger.info('Database schema initialized');
    } catch (error: any) {
      logger.error('Failed to initialize schema:', error);
      throw error;
    }
  }

  async insertSlot(slot: SlotData): Promise<void> {
    const query = `
      INSERT INTO slots (
        slot_number, block_root, parent_root, state_root,
        proposer_index, status, timestamp, graffiti
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (slot_number) DO UPDATE SET
        block_root = $2,
        parent_root = $3,
        state_root = $4,
        proposer_index = $5,
        status = $6,
        timestamp = $7,
        graffiti = $8,
        expires_at = CURRENT_TIMESTAMP + INTERVAL '6 months'
    `;

    try {
      await this.pool.query(query, [
        slot.slot_number,
        slot.block_root,
        slot.parent_root,
        slot.state_root,
        slot.proposer_index,
        slot.status,
        slot.timestamp,
        slot.graffiti
      ]);
    } catch (error: any) {
      logger.error(`Failed to insert slot ${slot.slot_number}:`, error);
      throw error;
    }
  }

  async upsertValidator(validator: ValidatorData): Promise<void> {
    const query = `
      INSERT INTO validators (
        validator_index, pubkey, withdrawal_credentials, balance,
        effective_balance, status, activation_epoch, exit_epoch,
        last_attestation_slot, effectiveness_rating
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (validator_index) DO UPDATE SET
        balance = $4,
        effective_balance = $5,
        status = $6,
        last_attestation_slot = $9,
        effectiveness_rating = $10,
        updated_at = CURRENT_TIMESTAMP,
        expires_at = CURRENT_TIMESTAMP + INTERVAL '6 months'
    `;

    try {
      await this.pool.query(query, [
        validator.validator_index,
        validator.pubkey,
        validator.withdrawal_credentials,
        validator.balance,
        validator.effective_balance,
        validator.status,
        validator.activation_epoch,
        validator.exit_epoch,
        validator.last_attestation_slot,
        validator.effectiveness_rating
      ]);
    } catch (error: any) {
      logger.error(`Failed to upsert validator ${validator.validator_index}:`, error);
      throw error;
    }
  }

  async upsertEpoch(epoch: EpochData): Promise<void> {
    const query = `
      INSERT INTO epochs (
        epoch_number, start_slot, end_slot, finalized, justified,
        total_validators, active_validators, total_balance, avg_effectiveness, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (epoch_number) DO UPDATE SET
        finalized = $4,
        justified = $5,
        total_validators = $6,
        active_validators = $7,
        total_balance = $8,
        avg_effectiveness = $9,
        timestamp = $10,
        expires_at = CURRENT_TIMESTAMP + INTERVAL '6 months'
    `;

    try {
      await this.pool.query(query, [
        epoch.epoch_number,
        epoch.start_slot,
        epoch.end_slot,
        epoch.finalized,
        epoch.justified,
        epoch.total_validators,
        epoch.active_validators,
        epoch.total_balance,
        epoch.avg_effectiveness,
        epoch.timestamp
      ]);
    } catch (error: any) {
      logger.error(`Failed to upsert epoch ${epoch.epoch_number}:`, error);
      throw error;
    }
  }

  async insertAttestation(attestation: AttestationData): Promise<void> {
    const query = `
      INSERT INTO attestations (
        slot_number, committee_index, validator_index, beacon_block_root,
        source_epoch, target_epoch, signature, included_in_block
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT DO NOTHING
    `;

    try {
      await this.pool.query(query, [
        attestation.slot_number,
        attestation.committee_index,
        attestation.validator_index,
        attestation.beacon_block_root,
        attestation.source_epoch,
        attestation.target_epoch,
        attestation.signature,
        attestation.included_in_block
      ]);
    } catch (error: any) {
      logger.error('Failed to insert attestation:', error);
      throw error;
    }
  }

  async cleanupExpiredData(): Promise<number> {
    try {
      const result = await this.pool.query('SELECT cleanup_expired_data()');
      return result.rows[0].cleanup_expired_data;
    } catch (error: any) {
      logger.error('Failed to cleanup expired data:', error);
      throw error;
    }
  }

  async query(text: string, params?: any[]): Promise<any> {
    return this.pool.query(text, params);
  }
}