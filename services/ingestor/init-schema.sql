-- Beacon Chain Explorer Schema
-- Creates tables for beacon chain data in Golem DB

-- Slots table - stores basic slot information
CREATE TABLE IF NOT EXISTS slots (
    slot_number BIGINT PRIMARY KEY,
    block_root VARCHAR(66),
    parent_root VARCHAR(66),
    state_root VARCHAR(66),
    proposer_index INTEGER,
    status VARCHAR(20) DEFAULT 'proposed',
    timestamp TIMESTAMP,
    graffiti TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '6 months')
);

-- Validators table - stores validator information
CREATE TABLE IF NOT EXISTS validators (
    validator_index INTEGER PRIMARY KEY,
    pubkey VARCHAR(98) UNIQUE,
    withdrawal_credentials VARCHAR(66),
    balance BIGINT,
    effective_balance BIGINT,
    status VARCHAR(20),
    activation_epoch BIGINT,
    exit_epoch BIGINT,
    last_attestation_slot BIGINT,
    effectiveness_rating DECIMAL(5,3),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '6 months')
);

-- Epochs table - stores epoch summaries
CREATE TABLE IF NOT EXISTS epochs (
    epoch_number BIGINT PRIMARY KEY,
    start_slot BIGINT,
    end_slot BIGINT,
    finalized BOOLEAN DEFAULT FALSE,
    justified BOOLEAN DEFAULT FALSE,
    total_validators INTEGER,
    active_validators INTEGER,
    total_balance BIGINT,
    avg_effectiveness DECIMAL(5,3),
    timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '6 months')
);

-- Attestations table - stores attestation data
CREATE TABLE IF NOT EXISTS attestations (
    id SERIAL PRIMARY KEY,
    slot_number BIGINT,
    committee_index INTEGER,
    validator_index INTEGER,
    beacon_block_root VARCHAR(66),
    source_epoch BIGINT,
    target_epoch BIGINT,
    signature VARCHAR(194),
    included_in_block BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '6 months'),
    FOREIGN KEY (slot_number) REFERENCES slots(slot_number),
    FOREIGN KEY (validator_index) REFERENCES validators(validator_index)
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS validator_performance (
    validator_index INTEGER,
    epoch_number BIGINT,
    attestations_made INTEGER DEFAULT 0,
    attestations_expected INTEGER DEFAULT 0,
    blocks_proposed INTEGER DEFAULT 0,
    blocks_expected INTEGER DEFAULT 0,
    effectiveness DECIMAL(5,3),
    balance_change BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '6 months'),
    PRIMARY KEY (validator_index, epoch_number),
    FOREIGN KEY (validator_index) REFERENCES validators(validator_index),
    FOREIGN KEY (epoch_number) REFERENCES epochs(epoch_number)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_slots_timestamp ON slots(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_slots_proposer ON slots(proposer_index);
CREATE INDEX IF NOT EXISTS idx_validators_status ON validators(status);
CREATE INDEX IF NOT EXISTS idx_validators_balance ON validators(balance DESC);
CREATE INDEX IF NOT EXISTS idx_epochs_timestamp ON epochs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_attestations_slot ON attestations(slot_number);
CREATE INDEX IF NOT EXISTS idx_attestations_validator ON attestations(validator_index);
CREATE INDEX IF NOT EXISTS idx_performance_epoch ON validator_performance(epoch_number DESC);

-- Cleanup function for expired data
CREATE OR REPLACE FUNCTION cleanup_expired_data() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    DELETE FROM attestations WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    DELETE FROM validator_performance WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;

    DELETE FROM slots WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;

    DELETE FROM validators WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;

    DELETE FROM epochs WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;