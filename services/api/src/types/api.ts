export interface SlotResponse {
  slot_number: number;
  block_root: string | null;
  parent_root: string | null;
  state_root: string | null;
  proposer_index: number | null;
  status: string;
  timestamp: string;
  graffiti: string | null;
  created_at: string;
}

export interface ValidatorResponse {
  validator_index: number;
  pubkey: string;
  withdrawal_credentials: string;
  balance: number;
  effective_balance: number;
  status: string;
  activation_epoch: number;
  exit_epoch: number;
  last_attestation_slot: number | null;
  effectiveness_rating: number | null;
  updated_at: string;
}

export interface EpochResponse {
  epoch_number: number;
  start_slot: number;
  end_slot: number;
  finalized: boolean;
  justified: boolean;
  total_validators: number;
  active_validators: number;
  total_balance: number;
  avg_effectiveness: number;
  timestamp: string;
  created_at: string;
}

export interface AttestationResponse {
  id: number;
  slot_number: number;
  committee_index: number;
  validator_index: number;
  beacon_block_root: string;
  source_epoch: number;
  target_epoch: number;
  signature: string;
  included_in_block: number;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ValidatorStats {
  validator_index: number;
  balance: number;
  effectiveness_rating: number;
  last_attestation_slot: number | null;
  recent_performance: {
    epoch: number;
    attestations_made: number;
    attestations_expected: number;
    blocks_proposed: number;
    effectiveness: number;
  }[];
}