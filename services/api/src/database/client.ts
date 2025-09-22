import { Pool } from 'pg';
import { logger } from '../utils/logger';

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

  async query(text: string, params?: any[]): Promise<any> {
    try {
      const start = Date.now();
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;

      logger.debug('Query executed', {
        query: text.substring(0, 100),
        duration,
        rows: result.rowCount
      });

      return result;
    } catch (error: any) {
      logger.error('Database query error:', {
        query: text.substring(0, 100),
        params,
        error: error.message
      });
      throw error;
    }
  }

  async getSlots(limit: number = 100, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT
        slot_number, block_root, parent_root, state_root,
        proposer_index, status, timestamp, graffiti, created_at
      FROM slots
      WHERE expires_at > CURRENT_TIMESTAMP
      ORDER BY slot_number DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await this.query(query, [limit, offset]);
    return result.rows;
  }

  async getSlotByNumber(slotNumber: number): Promise<any | null> {
    const query = `
      SELECT
        slot_number, block_root, parent_root, state_root,
        proposer_index, status, timestamp, graffiti, created_at
      FROM slots
      WHERE slot_number = $1 AND expires_at > CURRENT_TIMESTAMP
    `;
    const result = await this.query(query, [slotNumber]);
    return result.rows[0] || null;
  }

  async getValidator(validatorIndex: number): Promise<any | null> {
    const query = `
      SELECT
        validator_index, pubkey, withdrawal_credentials, balance,
        effective_balance, status, activation_epoch, exit_epoch,
        last_attestation_slot, effectiveness_rating, updated_at
      FROM validators
      WHERE validator_index = $1 AND expires_at > CURRENT_TIMESTAMP
    `;
    const result = await this.query(query, [validatorIndex]);
    return result.rows[0] || null;
  }

  async getValidators(limit: number = 100, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT
        validator_index, pubkey, withdrawal_credentials, balance,
        effective_balance, status, activation_epoch, exit_epoch,
        last_attestation_slot, effectiveness_rating, updated_at
      FROM validators
      WHERE expires_at > CURRENT_TIMESTAMP
      ORDER BY validator_index
      LIMIT $1 OFFSET $2
    `;
    const result = await this.query(query, [limit, offset]);
    return result.rows;
  }

  async searchValidatorByPubkey(pubkey: string): Promise<any | null> {
    const query = `
      SELECT
        validator_index, pubkey, withdrawal_credentials, balance,
        effective_balance, status, activation_epoch, exit_epoch,
        last_attestation_slot, effectiveness_rating, updated_at
      FROM validators
      WHERE pubkey ILIKE $1 AND expires_at > CURRENT_TIMESTAMP
      LIMIT 1
    `;
    const result = await this.query(query, [`${pubkey}%`]);
    return result.rows[0] || null;
  }

  async getValidatorPerformance(validatorIndex: number, epochLimit: number = 10): Promise<any[]> {
    const query = `
      SELECT
        epoch_number, attestations_made, attestations_expected,
        blocks_proposed, blocks_expected, effectiveness, balance_change
      FROM validator_performance
      WHERE validator_index = $1 AND expires_at > CURRENT_TIMESTAMP
      ORDER BY epoch_number DESC
      LIMIT $2
    `;
    const result = await this.query(query, [validatorIndex, epochLimit]);
    return result.rows;
  }

  async getEpochs(limit: number = 100, offset: number = 0): Promise<any[]> {
    const query = `
      SELECT
        epoch_number, start_slot, end_slot, finalized, justified,
        total_validators, active_validators, total_balance,
        avg_effectiveness, timestamp, created_at
      FROM epochs
      WHERE expires_at > CURRENT_TIMESTAMP
      ORDER BY epoch_number DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await this.query(query, [limit, offset]);
    return result.rows;
  }

  async getEpochByNumber(epochNumber: number): Promise<any | null> {
    const query = `
      SELECT
        epoch_number, start_slot, end_slot, finalized, justified,
        total_validators, active_validators, total_balance,
        avg_effectiveness, timestamp, created_at
      FROM epochs
      WHERE epoch_number = $1 AND expires_at > CURRENT_TIMESTAMP
    `;
    const result = await this.query(query, [epochNumber]);
    return result.rows[0] || null;
  }

  async getAttestations(slot: number, limit: number = 100): Promise<any[]> {
    const query = `
      SELECT
        id, slot_number, committee_index, validator_index,
        beacon_block_root, source_epoch, target_epoch,
        signature, included_in_block, created_at
      FROM attestations
      WHERE slot_number = $1 AND expires_at > CURRENT_TIMESTAMP
      ORDER BY committee_index, validator_index
      LIMIT $2
    `;
    const result = await this.query(query, [slot, limit]);
    return result.rows;
  }

  async getStats(): Promise<any> {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM slots WHERE expires_at > CURRENT_TIMESTAMP) as total_slots,
        (SELECT COUNT(*) FROM validators WHERE expires_at > CURRENT_TIMESTAMP) as total_validators,
        (SELECT COUNT(*) FROM validators WHERE status = 'active_ongoing' AND expires_at > CURRENT_TIMESTAMP) as active_validators,
        (SELECT COUNT(*) FROM epochs WHERE expires_at > CURRENT_TIMESTAMP) as total_epochs,
        (SELECT MAX(slot_number) FROM slots WHERE expires_at > CURRENT_TIMESTAMP) as latest_slot,
        (SELECT MAX(epoch_number) FROM epochs WHERE expires_at > CURRENT_TIMESTAMP) as latest_epoch
    `;
    const result = await this.query(query);
    return result.rows[0];
  }

  async getTotalCount(table: string): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM ${table} WHERE expires_at > CURRENT_TIMESTAMP`;
    const result = await this.query(query);
    return parseInt(result.rows[0].count);
  }
}