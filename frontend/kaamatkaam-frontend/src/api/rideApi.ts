import api from './axios';

export interface SearchParams {
  origin?: string;
  destination?: string;
  date?: string;
  weight?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export const rideApi = {
  search: (params: SearchParams) => api.get('/rides', { params }),

  getById: (id: string) => api.get(`/rides/${id}`),

  publish: (data: any) => api.post('/rides', data),

  getMyRides: (status?: string) => api.get('/rides/driver/myrides', { params: status ? { status } : {} }),

  update: (id: string, data: any) => api.put(`/rides/${id}`, data),

  cancel: (id: string) => api.delete(`/rides/${id}`),

  getSenders: (id: string) => api.get(`/rides/${id}/passengers`),
};
