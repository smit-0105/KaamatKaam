import api from './axios';

export const bookingApi = {
  request: (data: { rideId: string; weightBooked?: number; pickupStop?: string; dropoffStop?: string; parcelDescription?: string }) =>
    api.post('/bookings', data),

  respond: (id: string, status: 'confirmed' | 'rejected') =>
    api.put(`/bookings/${id}/respond`, { status }),

  cancel: (id: string, reason?: string) =>
    api.put(`/bookings/${id}/cancel`, { reason }),

  complete: (id: string) => api.put(`/bookings/${id}/complete`),

  getMyBookings: (status?: string) =>
    api.get('/bookings/my', { params: status ? { status } : {} }),

  getForRide: (rideId: string) => api.get(`/bookings/ride/${rideId}`),
};
