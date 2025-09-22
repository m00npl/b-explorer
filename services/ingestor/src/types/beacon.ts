export interface BeaconHead {
  slot: number;
  root: string;
  epoch: number;
}

export interface BlockHeader {
  root: string;
  canonical: boolean;
  header: {
    message: {
      slot: string;
      proposer_index: string;
      parent_root: string;
      state_root: string;
      body_root: string;
    };
    signature: string;
  };
  timestamp: number;
  parent_root: string;
  state_root: string;
}

export interface BeaconBlock {
  proposer_index: number;
  graffiti: string;
  attestations: Attestation[];
}

export interface Attestation {
  committee_index: number;
  validator_index: number;
  beacon_block_root: string;
  source_epoch: number;
  target_epoch: number;
  signature: string;
}

export interface Validator {
  index: number;
  pubkey: string;
  withdrawal_credentials: string;
  balance: number;
  effective_balance: number;
  status: string;
  activation_epoch: number;
  exit_epoch: number | null;
  last_attestation_slot?: number;
  effectiveness_rating?: number;
}

export interface SlotData {
  slot_number: number;
  block_root: string | null;
  parent_root: string | null;
  state_root: string | null;
  proposer_index: number | null;
  status: string;
  timestamp: Date;
  graffiti: string | null;
}

export interface ValidatorData {
  validator_index: number;
  pubkey: string;
  withdrawal_credentials: string;
  balance: number;
  effective_balance: number;
  status: string;
  activation_epoch: number;
  exit_epoch: number | null;
  last_attestation_slot?: number;
  effectiveness_rating?: number;
}

export interface EpochData {
  epoch_number: number;
  start_slot: number;
  end_slot: number;
  finalized: boolean;
  justified: boolean;
  total_validators: number;
  active_validators: number;
  total_balance: number;
  avg_effectiveness: number | null;
  timestamp: Date;
}

export interface AttestationData {
  slot_number: number;
  committee_index: number;
  validator_index: number;
  beacon_block_root: string;
  source_epoch: number;
  target_epoch: number;
  signature: string;
  included_in_block: number;
}