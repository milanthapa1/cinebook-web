import { create } from 'zustand';

interface SelectedSeat {
  id: string;
  row: string;
  number: number;
  type: 'STANDARD' | 'PREMIUM' | 'RECLINER' | 'PLATINUM' | 'SOFA';
  price: number;
}

interface SeatSelectionState {
  showtimeId: string | null;
  selectedSeats: SelectedSeat[];
  expiresAt: string | null;
  seatError: string | null;
  setShowtimeId: (id: string) => void;
  toggleSeat: (seat: SelectedSeat) => void;
  clearSelection: () => void;
  clearSeatError: () => void;
  setExpiresAt: (expiresAt: string | null) => void;
}

export const useSeatStore = create<SeatSelectionState>((set) => ({
  showtimeId: null,
  selectedSeats: [],
  expiresAt: null,
  seatError: null,
  setShowtimeId: (id) =>
    set((state) => (state.showtimeId !== id ? { showtimeId: id, selectedSeats: [], expiresAt: null, seatError: null } : state)),

  toggleSeat: (seat) =>
    set((state) => {
      const exists = state.selectedSeats.some((s) => s.id === seat.id);
      if (exists) {
        return { selectedSeats: state.selectedSeats.filter((s) => s.id !== seat.id), seatError: null };
      }
      if (state.selectedSeats.length >= 8) {
        return { seatError: 'Maximum 8 seats per booking.' };
      }
      return { selectedSeats: [...state.selectedSeats, seat], seatError: null };
    }),

  clearSelection: () => set(() => ({
    selectedSeats: [],
    expiresAt: null,
    seatError: null,
  })),

  clearSeatError: () => set({ seatError: null }),

  setExpiresAt: (expiresAt) => set({ expiresAt }),
}));
