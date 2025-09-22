import axios from 'axios';
import { ApiResponse, PaginatedResponse, SlotData, ValidatorData, EpochData, ValidatorStats, Stats } from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL.startsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api/v1`,
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export const beaconApi = {
  async getSlots(page: number = 1, limit: number = 100): Promise<PaginatedResponse<SlotData>> {
    const response = await api.get<ApiResponse<PaginatedResponse<SlotData>>>('/slots', {
      params: { page, limit }
    });
    return response.data.data!;
  },

  async getSlot(slotNumber: number): Promise<SlotData> {
    const response = await api.get<ApiResponse<SlotData>>(`/slots/${slotNumber}`);
    return response.data.data!;
  },

  async getValidators(page: number = 1, limit: number = 100): Promise<PaginatedResponse<ValidatorData>> {
    const response = await api.get<ApiResponse<PaginatedResponse<ValidatorData>>>('/validators', {
      params: { page, limit }
    });
    return response.data.data!;
  },

  async getValidator(validatorIndex: number): Promise<ValidatorData> {
    const response = await api.get<ApiResponse<ValidatorData>>(`/validators/${validatorIndex}`);
    return response.data.data!;
  },

  async getValidatorPerformance(validatorIndex: number): Promise<ValidatorStats> {
    const response = await api.get<ApiResponse<ValidatorStats>>(`/validators/${validatorIndex}/performance`);
    return response.data.data!;
  },

  async searchValidator(query: string): Promise<ValidatorData> {
    const response = await api.get<ApiResponse<ValidatorData>>('/validators/search', {
      params: { q: query }
    });
    return response.data.data!;
  },

  async getEpochs(page: number = 1, limit: number = 100): Promise<PaginatedResponse<EpochData>> {
    const response = await api.get<ApiResponse<PaginatedResponse<EpochData>>>('/epochs', {
      params: { page, limit }
    });
    return response.data.data!;
  },

  async getEpoch(epochNumber: number): Promise<EpochData> {
    const response = await api.get<ApiResponse<EpochData>>(`/epochs/${epochNumber}`);
    return response.data.data!;
  },

  async getStats(): Promise<Stats> {
    const response = await api.get<ApiResponse<Stats>>('/health/stats');
    return response.data.data!;
  },

  async getHealth(): Promise<any> {
    const response = await api.get<ApiResponse<any>>('/health');
    return response.data.data!;
  }
};