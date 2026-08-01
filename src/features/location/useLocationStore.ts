import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usePublicLocations, AdminLocation } from '../admin/useAdmin';

// ─── Static fallback (used if API is unavailable) ─────────────────────────────
export interface LocationCinema {
  id: string;
  name: string;
  location: string;
  hallTypes: string[];
}

// Kept for legacy compatibility with ShowtimesPage/Navbar until those are fully wired to API
export const LOCATION_CINEMAS_MAP: Record<string, LocationCinema[]> = {
  Kathmandu: [
    { id: 'cin_civil', name: 'Civil Mall (Sundhara)', location: 'Kathmandu', hallTypes: ['IMAX 4K Laser', 'Dolby Atmos'] },
    { id: 'cin_rising', name: 'Rising Mall (Durbar Marg)', location: 'Kathmandu', hallTypes: ['Laser Auromax 3D'] },
    { id: 'cin_chhaya', name: 'Chhaya Center (Thamel)', location: 'Kathmandu', hallTypes: ['Dolby Cinema 3D'] },
    { id: 'cin_durbar', name: 'Durbar Cinemax (Durbar Marg)', location: 'Kathmandu', hallTypes: ['VIP Recliner Lounge'] },
  ],
  Lalitpur: [
    { id: 'cin_labim', name: 'Labim Mall (Pulchowk)', location: 'Lalitpur', hallTypes: ['Laser 3D Atmos', 'IMAX Laser'] },
  ],
  Pokhara: [
    { id: 'cin_pokhara_trade', name: 'Pokhara Trade Mall (Chipledhunga)', location: 'Pokhara', hallTypes: ['Dolby Atmos 3D'] },
    { id: 'cin_lakeside', name: 'Lakeside Cinema (Lakeside)', location: 'Pokhara', hallTypes: ['Laser Projection'] },
  ],
  Butwal: [
    { id: 'cin_milanchowk', name: 'Milanchowk Multiplex (Butwal)', location: 'Butwal', hallTypes: ['Dolby Surround 3D'] },
    { id: 'cin_butwal_city', name: 'Butwal City Center (Traffic Chowk)', location: 'Butwal', hallTypes: ['Digital 2D/3D'] },
  ],
  Biratnagar: [
    { id: 'cin_bhatbhateni_brt', name: 'Bhatbhateni Biratnagar (Main Road)', location: 'Biratnagar', hallTypes: ['Laser 3D Atmos'] },
  ],
  Chitwan: [
    { id: 'cin_cg_landmark', name: 'CG Landmark Mall (Narayangarh)', location: 'Chitwan', hallTypes: ['Dolby Atmos 3D'] },
  ],
};

// ─── Convert API Location → LocationCinema[] for backward compatibility ───────
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
        // Derive hallTypes from halls assigned to this cinema
        hallTypes: (c as any).halls?.map((h: any) => h.screenType).filter(Boolean) ?? ['Standard'],
      }));
  }
  return Object.keys(map).length > 0 ? map : LOCATION_CINEMAS_MAP;
}

// ─── Zustand store (persists selected location choice) ────────────────────────
interface LocationState {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  getCinemasForCurrentLocation: () => LocationCinema[];
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      selectedLocation: 'Kathmandu',
      setSelectedLocation: (location) => set({ selectedLocation: location }),
      getCinemasForCurrentLocation: () => {
        const loc = get().selectedLocation;
        return LOCATION_CINEMAS_MAP[loc] || LOCATION_CINEMAS_MAP['Kathmandu'];
      },
    }),
    { name: 'cinebook-location-storage' }
  )
);

// ─── Hook: live locations from API with static fallback ───────────────────────
export const useLiveLocations = () => {
  const { data: apiLocations, isLoading } = usePublicLocations();
  const liveMap = apiLocations && apiLocations.length > 0
    ? apiLocationsToMap(apiLocations)
    : LOCATION_CINEMAS_MAP;
  const locationNames = Object.keys(liveMap);
  return { liveMap, locationNames, isLoading };
};
