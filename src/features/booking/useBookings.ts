import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/apiClient';

export interface Booking {
  id: string;
  userId: string;
  showtimeId: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  qrPayload: string;
  createdAt: string;
  seats: Array<{
    id: string;
    seatId: string;
    priceAtBooking: number;
    seatDetails?: { row: string; number: number; type: string };
  }>;
  showtime: {
    id: string;
    startsAt: string;
    movie: {
      title: string;
      posterUrl: string;
      format: string[];
      language: string;
      rating: string;
      runtimeMins: number;
    };
    hall: {
      name: string;
      screenType: string;
      soundSystem: string;
    };
  };
  payment?: {
    provider: string;
    providerRef: string;
    amount: number;
    status: string;
  };
}

export const useBookingDetail = (id: string) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await apiClient.get(`/bookings/${id}`);
      return res.data.data as Booking;
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const b = query.state.data;
      return b && b.status === 'PENDING' ? 3000 : false; // poll if pending payment
    },
  });
};

export const useUserBookings = () => {
  return useQuery({
    queryKey: ['userBookings'],
    queryFn: async () => {
      const res = await apiClient.get('/users/me/bookings');
      return res.data.data as Booking[];
    },
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      showtimeId: string;
      seatIds: string[];
      concessionsAmount?: number;
    }) => {
      const res = await apiClient.post('/bookings', payload);
      return res.data.data as Booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
    },
  });
};

export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: async (payload: { bookingId: string; provider: 'esewa' }) => {
      const res = await apiClient.post('/payments/initiate', payload);
      return res.data.data;
    },
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      bookingId: string;
      provider: 'esewa';
      token?: string;
      pidx?: string;
      refId?: string;
    }) => {
      const res = await apiClient.post('/payments/verify', payload);
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
    },
  });
};
