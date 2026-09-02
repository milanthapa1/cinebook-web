import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/apiClient';
import { useAuthStore } from '../auth/useAuthStore';

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

// Namespace the offline ticket cache per user so one account's bookings can
// never leak into another account's browser, and so logging out/in never shows
// a previous user's cached tickets.
function bookingStorageKey(): string {
  try {
    const userId = useAuthStore.getState().user?.id;
    return userId ? `${LOCAL_STORAGE_KEY}_${userId}` : LOCAL_STORAGE_KEY;
  } catch {
    return LOCAL_STORAGE_KEY;
  }
}

export function clearUserBookingsFromLocalStorage(): void {
  try {
    const key = bookingStorageKey();
    if (key !== LOCAL_STORAGE_KEY) {
      localStorage.removeItem(key);
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

function saveBookingToLocalStorage(booking: Booking) {
  try {
    if (!booking || !booking.id) return;
    const key = bookingStorageKey();
    const raw = localStorage.getItem(key);
    const bookings: Booking[] = raw ? JSON.parse(raw) : [];
    const idx = bookings.findIndex((b) => b.id === booking.id);
    if (idx !== -1) {
      bookings[idx] = { ...bookings[idx], ...booking };
    } else {
      bookings.unshift(booking);
    }
    localStorage.setItem(key, JSON.stringify(bookings));
  } catch (e) {
    // Ignore localStorage errors
  }
}

function getBookingFromLocalStorage(id: string): Booking | null {
  try {
    const raw = localStorage.getItem(bookingStorageKey());
    if (!raw) return null;
    const bookings: Booking[] = JSON.parse(raw);
    return bookings.find((b) => b.id === id) || null;
  } catch (e) {
    return null;
  }
}

function getUserBookingsFromLocalStorage(): Booking[] {
  try {
    const raw = localStorage.getItem(bookingStorageKey());
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
      } catch (e: any) {
        // Only serve the offline/refresh cache when the API was unreachable
        // (no response). If the server answered at all (404/401/403), trust it —
        // a booking must not come back from localStorage after the server
        // confirmed it doesn't exist or the user lost access to it.
        if (e?.response) throw new Error('Booking not found');
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
      } catch (e: any) {
        // Surface server errors instead of silently serving the stale cache.
        if (e?.response) throw e;
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
      transaction_code?: string;
      transaction_uuid?: string;
      status?: string;
      signed_field_names?: string;
      signature?: string;
      product_code?: string;
      amount?: number;
    }) => {
      const res = await apiClient.post('/payments/verify', payload);
      const data = res.data.data;
      // Only the server decides a booking is confirmed. If it responded with
      // an explicit success, mirror just that status into the offline cache so
      // the ticket page shows truth even if the next refetch fails.
      if (data?.bookingId && data?.status === 'CONFIRMED') {
        const cached = getBookingFromLocalStorage(payload.bookingId);
        if (cached) {
          cached.status = 'CONFIRMED';
          saveBookingToLocalStorage(cached);
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
