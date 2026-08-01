import { useQuery } from '@tanstack/react-query';
import apiClient from '../../lib/apiClient';

export interface Movie {
  id: string;
  title: string;
  synopsis: string;
  posterUrl: string;
  trailerUrl?: string;
  genre: string[];
  language: string;
  format: string[];
  runtimeMins: number;
  rating: string;
  cast: Array<{ name: string; role: string; photoUrl: string }>;
  releaseDate: string;
  isShowing: boolean;
}

export const useMovies = (params?: {
  genre?: string;
  language?: string;
  format?: string;
  search?: string;
  isShowing?: boolean;
}) => {
  return useQuery({
    queryKey: ['movies', params],
    queryFn: async () => {
      const res = await apiClient.get('/movies', { params });
      return res.data.data as Movie[];
    },
  });
};

export const useMovieDetail = (id: string) => {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: async () => {
      const res = await apiClient.get(`/movies/${id}`);
      return res.data.data as Movie & { showtimes?: any[] };
    },
    enabled: !!id,
  });
};
