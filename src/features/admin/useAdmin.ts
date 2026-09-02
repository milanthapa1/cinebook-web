import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AdminMovie {
  id: string;
  title: string;
  synopsis: string;
  posterUrl: string;
  bannerUrl?: string;
  trailerUrl?: string;
  genre: string[];
  language: string;
  format: string[];
  runtimeMins: number;
  rating: string;
  cast: { name: string; role: string; photoUrl: string }[];
  releaseDate: string;
  isShowing: boolean;
  createdAt: string;
}

export interface AdminHall {
  id: string;
  name: string;
  capacity: number;
  screenType: string;
  soundSystem: string;
  _count?: { seats: number; showtimes: number };
}

export interface AdminShowtime {
  id: string;
  movieId: string;
  hallId: string;
  startsAt: string;
  basePrice: number;
  premiumPrice: number;
  movie: { id: string; title: string; posterUrl: string };
  hall: { id: string; name: string };
  _count?: { bookings: number };
}

export interface AdminBooking {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: { id: string; name: string; email: string };
  showtime: {
    startsAt: string;
    movie: { id: string; title: string };
    hall: { id: string; name: string };
  };
  seats: any[];
  payment?: any;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  avatarUrl?: string | null;
  dob?: string | null;
  gender?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { bookings: number };
}

export interface AdminUserBooking {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  showtime: {
    startsAt: string;
    movie: { id: string; title: string; posterUrl: string };
    hall:  { id: string; name: string };
  };
  seats: { id: string; seatId: string; priceAtBooking: number }[];
  payment?: { provider: string; status: string; amount: number } | null;
}

// ─── Stats types ─────────────────────────────────────────────────────────────
export interface AdminStats {
  totalMovies: number;
  nowShowing: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  recentBookings: AdminBooking[];
  topMovies: { id: string; title: string; posterUrl: string; count: number }[];
  dailyRevenue: Record<string, number>;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const useAdminStats = () =>
  useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/stats');
      return res.data.data as AdminStats;
    },
  });

// ─── Movies ──────────────────────────────────────────────────────────────────
export const useAdminMovies = () =>
  useQuery({
    queryKey: ['admin', 'movies'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/movies');
      return res.data.data as AdminMovie[];
    },
  });

export const useCreateMovie = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<AdminMovie, 'id' | 'createdAt'>) =>
      apiClient.post('/admin/movies', data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'movies'] }),
  });
};

export const useUpdateMovie = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<AdminMovie> & { id: string }) =>
      apiClient.patch(`/admin/movies/${id}`, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'movies'] }),
  });
};

export const useDeleteMovie = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/movies/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'movies'] }),
  });
};

// ─── Halls ───────────────────────────────────────────────────────────────────
export const useAdminHalls = () =>
  useQuery({
    queryKey: ['admin', 'halls'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/halls');
      return res.data.data as AdminHall[];
    },
  });

export const useCreateHall = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<AdminHall, 'id' | '_count'>) =>
      apiClient.post('/admin/halls', data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'halls'] }),
  });
};

export const useUpdateHall = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<AdminHall> & { id: string }) =>
      apiClient.patch(`/admin/halls/${id}`, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'halls'] }),
  });
};

export const useDeleteHall = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/halls/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'halls'] }),
  });
};

// ─── Showtimes ────────────────────────────────────────────────────────────────
export const useAdminShowtimes = (movieId?: string) =>
  useQuery({
    queryKey: ['admin', 'showtimes', movieId],
    queryFn: async () => {
      const res = await apiClient.get('/admin/showtimes', { params: movieId ? { movieId } : {} });
      return res.data.data as AdminShowtime[];
    },
  });

export const useCreateShowtime = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { movieId: string; hallId: string; startsAt: string; basePrice: number; premiumPrice: number }) =>
      apiClient.post('/admin/showtimes', data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'showtimes'] }),
  });
};

export const useUpdateShowtime = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; startsAt?: string; basePrice?: number; premiumPrice?: number }) =>
      apiClient.patch(`/admin/showtimes/${id}`, data).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'showtimes'] }),
  });
};

export const useDeleteShowtime = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/showtimes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'showtimes'] }),
  });
};

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const useAdminBookings = (page = 1, status?: string) =>
  useQuery({
    queryKey: ['admin', 'bookings', page, status],
    queryFn: async () => {
      const res = await apiClient.get('/admin/bookings', { params: { page, limit: 15, status } });
      return res.data as { bookings: AdminBooking[]; total: number; totalPages: number; page: number };
    },
  });

export const useUpdateBookingStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.patch(`/admin/bookings/${id}/status`, { status }).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
  });
};

// ─── Users ────────────────────────────────────────────────────────────────────
export const useAdminUsers = (
  page = 1,
  search?: string,
  role?: string,
  status?: string,
) =>
  useQuery({
    queryKey: ['admin', 'users', page, search, role, status],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users', {
        params: { page, limit: 15, search, role, status },
      });
      return res.data as { users: AdminUser[]; total: number; totalPages: number; page: number };
    },
  });

export const useAdminUser = (id: string) =>
  useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/users/${id}`);
      return res.data.data as AdminUser;
    },
    enabled: !!id,
  });

export const useAdminUserBookings = (id: string, page = 1) =>
  useQuery({
    queryKey: ['admin', 'users', id, 'bookings', page],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/users/${id}/bookings`, {
        params: { page, limit: 10 },
      });
      return res.data as {
        bookings: AdminUserBooking[];
        total: number;
        totalPages: number;
        page: number;
      };
    },
    enabled: !!id,
  });

export const useUpdateUserRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'USER' | 'ADMIN' }) =>
      apiClient.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data.data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users', id] });
    },
  });
};

export const useUpdateUserStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' }) =>
      apiClient.patch(`/admin/users/${id}/status`, { status }).then((r) => r.data.data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users', id] });
    },
  });
};

export const useUpdateUserProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: { id: string; name?: string; phone?: string | null; dob?: string | null; gender?: string | null }) =>
      apiClient.patch(`/admin/users/${id}/profile`, data).then((r) => r.data.data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users', id] });
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/admin/users/${id}`).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
};

// ─── Toggle isShowing ──────────────────────────────────────────────────────
export const useToggleShowing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/movies/${id}/toggle-showing`).then(r => r.data.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin','movies'] }); qc.invalidateQueries({ queryKey: ['admin','stats'] }); },
  });
};

export const useBulkDeleteShowtimes = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (movieId: string) => apiClient.delete(`/admin/movies/${movieId}/showtimes`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin','showtimes'] }),
  });
};

// ─── Seats ─────────────────────────────────────────────────────────────────
export interface AdminSeat {
  id: string; hallId: string; row: string; number: number;
  type: 'STANDARD' | 'PREMIUM' | 'RECLINER';
}

export const useAdminSeats = (hallId: string) =>
  useQuery({
    queryKey: ['admin','seats', hallId],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/halls/${hallId}/seats`);
      return res.data.data as { hall: AdminHall; seats: AdminSeat[] };
    },
    enabled: !!hallId,
  });

export const useUpdateSeat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, type, hallId }: { id: string; type: string; hallId: string }) =>
      apiClient.patch(`/admin/seats/${id}`, { type }).then(r => r.data.data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['admin','seats', vars.hallId] }),
  });
};

export const useBulkUpdateSeats = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ hallId, seatIds, type }: { hallId: string; seatIds: string[]; type: string }) =>
      apiClient.patch(`/admin/halls/${hallId}/seats/bulk`, { seatIds, type }).then(r => r.data.data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['admin','seats', vars.hallId] }),
  });
};

export const useAddSeatRow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ hallId, row, count, type }: { hallId: string; row: string; count: number; type: string }) =>
      apiClient.post(`/admin/halls/${hallId}/seats/row`, { row, count, type }).then(r => r.data.data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['admin','seats', vars.hallId] }),
  });
};

export const useDeleteSeatRow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ hallId, row }: { hallId: string; row: string }) =>
      apiClient.delete(`/admin/halls/${hallId}/seats/row/${row}`).then(r => r.data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['admin','seats', vars.hallId] }),
  });
};

// ─── Booking detail + cancel ────────────────────────────────────────────────
export const useAdminBookingDetail = (id: string) =>
  useQuery({
    queryKey: ['admin','booking', id],
    queryFn: async () => { const res = await apiClient.get(`/admin/bookings/${id}`); return res.data.data as AdminBooking; },
    enabled: !!id,
  });

export const useCancelBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/bookings/${id}/cancel`).then(r => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin','bookings'] }); qc.invalidateQueries({ queryKey: ['admin','stats'] }); },
  });
};

// ─── Location / Cinema types ───────────────────────────────────────────────
export interface AdminCinema {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  mapUrl?: string;
  isActive: boolean;
  locationId: string;
  location?: { id: string; name: string };
  halls?: { id: string; name: string; capacity: number; screenType: string; _count?: { seats: number } }[];
  _count?: { halls: number };
}

export interface AdminLocation {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  cinemas?: AdminCinema[];
  _count?: { cinemas: number };
}

// ─── Location hooks ────────────────────────────────────────────────────────
export const useAdminLocations = () =>
  useQuery({
    queryKey: ['admin', 'locations'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/locations');
      return res.data.data as AdminLocation[];
    },
  });

export const useCreateLocation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; isActive?: boolean }) =>
      apiClient.post('/admin/locations', data).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'locations'] });
      qc.invalidateQueries({ queryKey: ['locations', 'public'] });
    },
  });
};

export const useUpdateLocation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; isActive?: boolean }) =>
      apiClient.patch(`/admin/locations/${id}`, data).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'locations'] });
      qc.invalidateQueries({ queryKey: ['locations', 'public'] });
    },
  });
};

export const useDeleteLocation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/locations/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'locations'] });
      qc.invalidateQueries({ queryKey: ['locations', 'public'] });
    },
  });
};

// ─── Cinema hooks ──────────────────────────────────────────────────────────
export const useAdminCinemas = (locationId?: string) =>
  useQuery({
    queryKey: ['admin', 'cinemas', locationId],
    queryFn: async () => {
      const res = await apiClient.get('/admin/cinemas', { params: locationId ? { locationId } : {} });
      return res.data.data as AdminCinema[];
    },
  });

export const useCreateCinema = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; locationId: string; address?: string; phone?: string; mapUrl?: string; isActive?: boolean }) =>
      apiClient.post('/admin/cinemas', data).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'cinemas'] });
      qc.invalidateQueries({ queryKey: ['admin', 'locations'] });
      qc.invalidateQueries({ queryKey: ['locations', 'public'] });
    },
  });
};

export const useUpdateCinema = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<AdminCinema> & { id: string }) =>
      apiClient.patch(`/admin/cinemas/${id}`, data).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'cinemas'] });
      qc.invalidateQueries({ queryKey: ['admin', 'locations'] });
      qc.invalidateQueries({ queryKey: ['locations', 'public'] });
    },
  });
};

export const useDeleteCinema = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/cinemas/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'cinemas'] });
      qc.invalidateQueries({ queryKey: ['admin', 'locations'] });
      qc.invalidateQueries({ queryKey: ['locations', 'public'] });
    },
  });
};

export const useAssignHallToCinema = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ hallId, cinemaId }: { hallId: string; cinemaId: string | null }) =>
      apiClient.patch(`/admin/halls/${hallId}/assign-cinema`, { cinemaId }).then(r => r.data.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'halls'] }); qc.invalidateQueries({ queryKey: ['admin', 'cinemas'] }); },
  });
};

// ─── Public locations (no auth - for frontend pickers) ─────────────────────
export const usePublicLocations = () =>
  useQuery({
    queryKey: ['locations', 'public'],
    queryFn: async () => {
      const res = await apiClient.get('/locations');
      return res.data.data as AdminLocation[];
    },
    staleTime: 5 * 60 * 1000,
  });
