import api from './axios';

export const reviewApi = {
  create: (data: { rideId: string; revieweeId: string; rating: number; comment?: string }) =>
    api.post('/reviews', data),

  getForUser: (userId: string, page?: number) =>
    api.get(`/reviews/user/${userId}`, { params: { page } }),
};
