import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../lib/apiClient';

export interface Seat {
  id: string;
  hallId: string;
  row: string;
  number: number;
  type: 'STANDARD' | 'PREMIUM' | 'RECLINER' | 'PLATINUM' | 'SOFA';
  price: number;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED';
  heldByCurrentUser?: boolean;
}

export interface HoldResponse {
  holds: Array<{ id: string; seatId: string; expiresAt: string }>;
  expiresAt: string;
}

export const useSeats = (showtimeId: string) => {
  return useQuery({
    queryKey: ['seats', showtimeId],
    queryFn: async () => {
      const res = await apiClient.get('/seats', { params: { showtimeId } });
      return res.data.data as Seat[];
    },
    enabled: !!showtimeId,
    refetchInterval: 10000, // refresh seat status every 10s
  });
};

export const useHoldSeats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ showtimeId, seatIds }: { showtimeId: string; seatIds: string[] }) => {
      const res = await apiClient.post('/seat-holds', { showtimeId, seatIds });
      return res.data.data as HoldResponse;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['seats', variables.showtimeId] });
    },
  });
};
