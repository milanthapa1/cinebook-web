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

const LOCAL_STORAGE_KEY = 'cinebook_user_bookings';

function saveBookingToLocalStorage(booking: Booking) {
  try {
    if (!booking || !booking.id) return;
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const bookings: Booking[] = raw ? JSON.parse(raw) : [];
    const idx = bookings.findIndex((b) => b.id === booking.id);
    if (idx !== -1) {
      bookings[idx] = { ...bookings[idx], ...booking };
    } else {
      bookings.unshift(booking);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookings));
  } catch (e) {
    // Ignore localStorage errors
  }
}

function getBookingFromLocalStorage(id: string): Booking | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const bookings: Booking[] = JSON.parse(raw);
    return bookings.find((b) => b.id === id) || null;
  } catch (e) {
    return null;
  }
}

function getUserBookingsFromLocalStorage(): Booking[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export const useBookingDetail = (id: string) => {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/bookings/${id}`);
        if (res.data?.data) {
          saveBookingToLocalStorage(res.data.data);
          return res.data.data as Booking;
        }
      } catch (e) {
        // Fallback to localStorage if API fails or returns 404
      }
      const cached = getBookingFromLocalStorage(id);
      if (cached) return cached;
      throw new Error('Booking not found');
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const b = query.state.data;
      return b && b.status === 'PENDING' ? 3000 : false;
    },
  });
};

export const useUserBookings = () => {
  return useQuery({
    queryKey: ['userBookings'],
    queryFn: async () => {
      let apiBookings: Booking[] = [];
      try {
        const res = await apiClient.get('/users/me/bookings');
        if (Array.isArray(res.data?.data)) {
          apiBookings = res.data.data;
          apiBookings.forEach(saveBookingToLocalStorage);
        }
      } catch (e) {
        // Fallback to localStorage
      }
      const localBookings = getUserBookingsFromLocalStorage();
      const combinedMap = new Map<string, Booking>();
      apiBookings.forEach((b) => combinedMap.set(b.id, b));
      localBookings.forEach((b) => {
        if (!combinedMap.has(b.id)) combinedMap.set(b.id, b);
      });
      return Array.from(combinedMap.values());
    },
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      showtimeId: string;
      seatIds: string[];
    }) => {
      const res = await apiClient.post('/bookings', payload);
      const booking = res.data.data as Booking;
      saveBookingToLocalStorage(booking);
      return booking;
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
      const data = res.data.data;
      if (data?.id) {
        saveBookingToLocalStorage(data);
      } else {
        const existing = getBookingFromLocalStorage(payload.bookingId);
        if (existing) {
          existing.status = 'CONFIRMED';
          saveBookingToLocalStorage(existing);
        }
      }
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
    },
  });
};
