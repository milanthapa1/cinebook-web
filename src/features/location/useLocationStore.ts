import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePublicLocations, AdminLocation } from '../admin/useAdmin';

// ─── Location cinema shape (real data returned by the API) ────────────────────
export interface LocationCinema {
  id: string;
  name: string;
  location: string;
  hallTypes: string[];
}

// ─── Convert API Location → LocationCinema[] ──────────────────────────────────
export function apiLocationsToMap(apiLocations: AdminLocation[]): Record<string, LocationCinema[]> {
  const map: Record<string, LocationCinema[]> = {};
  for (const loc of apiLocations) {
    if (!loc.isActive) continue;
    map[loc.name] = (loc.cinemas ?? [])
      .filter(c => c.isActive)
      .map(c => ({
        id: c.id,
        name: c.name,
        location: loc.name,
        hallTypes: (c as any).halls?.map((h: any) => h.screenType).filter(Boolean) ?? ['Standard'],
      }));
  }
  return map;
}

// ─── Zustand store (persists selected location choice) ────────────────────────
export interface LocationState {
  /** Empty until the visitor picks a city for the first time. */
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  /** True once the first-visit city picker has been dismissed without choosing. */
  dismissedCityPicker: boolean;
  dismissCityPicker: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      selectedLocation: '',
      setSelectedLocation: (location) => set({ selectedLocation: location }),
      dismissedCityPicker: false,
      dismissCityPicker: () => set({ dismissedCityPicker: true }),
    }),
    { name: 'cinebook-location-storage' }
  )
);

// ─── Hook: live locations from API (no static fallback) ───────────────────────
export const useLiveLocations = () => {
  const { data: apiLocations, isLoading } = usePublicLocations();
  const liveMap = apiLocations && apiLocations.length > 0 ? apiLocationsToMap(apiLocations) : {};
  const locationNames = Object.keys(liveMap);
  return { liveMap, locationNames, isLoading };
};
