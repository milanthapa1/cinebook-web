import { useQuery } from '@tanstack/react-query';
import apiClient from '../../lib/apiClient';

export interface Hall {
  id: string;
  name: string;
  capacity: number;
  screenType: string;
  soundSystem: string;
  cinema?: {
    id: string;
    name: string;
    locationId: string;
    location?: { id: string; name: string };
  };
}

export interface Showtime {
  id: string;
  movieId: string;
  hallId: string;
  startsAt: string;
  basePrice: number;
  premiumPrice: number;
  hall: Hall;
  movie?: any;
}

export interface ShowtimesQuery {
  movieId?: string;
  date?: string;
  locationId?: string;
  cinemaId?: string;
}

export const useShowtimes = (params: ShowtimesQuery) => {
  const { movieId, date, locationId, cinemaId } = params;
  return useQuery({
    queryKey: ['showtimes', movieId, date, locationId, cinemaId],
    queryFn: async () => {
      const res = await apiClient.get('/showtimes', {
        params: { movieId, date, locationId, cinemaId },
      });
      return res.data.data as Showtime[];
    },
    enabled: !!date, // movieId is now optional — page works in browse mode too
  });
};
