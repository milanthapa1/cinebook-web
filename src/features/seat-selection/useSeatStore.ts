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
  concessions: Array<{ id: string; name: string; price: number; quantity: number }>;
  setShowtimeId: (id: string) => void;
  toggleSeat: (seat: SelectedSeat) => void;
  clearSelection: () => void;
  clearSeatError: () => void;
  setExpiresAt: (expiresAt: string | null) => void;
  updateConcessionQuantity: (id: string, delta: number, itemDetails?: { name: string; price: number }) => void;
}

export const useSeatStore = create<SeatSelectionState>((set) => ({
  showtimeId: null,
  selectedSeats: [],
  expiresAt: null,
  seatError: null,
  concessions: [
    { id: 'popcorn_lg', name: 'Large Butter Popcorn', price: 250, quantity: 0 },
    { id: 'soda_lg', name: 'Chilled Pepsi 750ml', price: 150, quantity: 0 },
    { id: 'nachos_combo', name: 'Cheese Nachos + Coke Combo', price: 380, quantity: 0 },
  ],
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

  clearSelection: () => set((state) => ({
    selectedSeats: [],
    expiresAt: null,
    seatError: null,
    concessions: state.concessions.map(c => ({ ...c, quantity: 0 })),
  })),

  clearSeatError: () => set({ seatError: null }),

  setExpiresAt: (expiresAt) => set({ expiresAt }),

  updateConcessionQuantity: (id, delta) =>
    set((state) => ({
      concessions: state.concessions.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
      ),
    })),
}));
