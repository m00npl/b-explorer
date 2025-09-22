import { useQuery, UseQueryOptions } from 'react-query';
import { beaconApi } from '../utils/api';
import { SlotData, ValidatorData, EpochData, ValidatorStats, Stats, PaginatedResponse } from '../types/api';

export const useSlots = (page: number = 1, limit: number = 100) => {
  return useQuery<PaginatedResponse<SlotData>, Error>(
    ['slots', page, limit],
    () => beaconApi.getSlots(page, limit),
    {
      refetchInterval: 12000,
      staleTime: 10000,
    }
  );
};

export const useSlot = (slotNumber: number) => {
  return useQuery<SlotData, Error>(
    ['slot', slotNumber],
    () => beaconApi.getSlot(slotNumber),
    {
      enabled: slotNumber >= 0,
    }
  );
};

export const useValidators = (page: number = 1, limit: number = 100) => {
  return useQuery<PaginatedResponse<ValidatorData>, Error>(
    ['validators', page, limit],
    () => beaconApi.getValidators(page, limit),
    {
      staleTime: 30000,
    }
  );
};

export const useValidator = (validatorIndex: number) => {
  return useQuery<ValidatorData, Error>(
    ['validator', validatorIndex],
    () => beaconApi.getValidator(validatorIndex),
    {
      enabled: validatorIndex >= 0,
      staleTime: 30000,
    }
  );
};

export const useValidatorPerformance = (validatorIndex: number) => {
  return useQuery<ValidatorStats, Error>(
    ['validator-performance', validatorIndex],
    () => beaconApi.getValidatorPerformance(validatorIndex),
    {
      enabled: validatorIndex >= 0,
      staleTime: 60000,
    }
  );
};

export const useValidatorSearch = (query: string, enabled: boolean = false) => {
  return useQuery<ValidatorData, Error>(
    ['validator-search', query],
    () => beaconApi.searchValidator(query),
    {
      enabled: enabled && query.length >= 3,
      retry: false,
    }
  );
};

export const useEpochs = (page: number = 1, limit: number = 100) => {
  return useQuery<PaginatedResponse<EpochData>, Error>(
    ['epochs', page, limit],
    () => beaconApi.getEpochs(page, limit),
    {
      staleTime: 60000,
    }
  );
};

export const useEpoch = (epochNumber: number) => {
  return useQuery<EpochData, Error>(
    ['epoch', epochNumber],
    () => beaconApi.getEpoch(epochNumber),
    {
      enabled: epochNumber >= 0,
    }
  );
};

export const useStats = () => {
  return useQuery<Stats, Error>(
    ['stats'],
    () => beaconApi.getStats(),
    {
      refetchInterval: 30000,
      staleTime: 20000,
    }
  );
};

export const useHealth = () => {
  return useQuery<any, Error>(
    ['health'],
    () => beaconApi.getHealth(),
    {
      refetchInterval: 60000,
      staleTime: 50000,
    }
  );
};