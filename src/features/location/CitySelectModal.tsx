import React from 'react';
import { MapPin, X } from 'lucide-react';
import { useLocationStore, useLiveLocations } from './useLocationStore';

/**
 * First-visit city picker. Shown once (until the visitor chooses a city or
 * dismisses it) whenever no location has been selected yet. Cities come from
 * the admin-managed locations - never hardcoded.
 */
export const CitySelectModal: React.FC = () => {
  const { selectedLocation, setSelectedLocation, dismissedCityPicker, dismissCityPicker } =
    useLocationStore();
  const { locationNames, isLoading } = useLiveLocations();

  const show =
    !isLoading &&
    locationNames.length > 0 &&
    selectedLocation === '' &&
    !dismissedCityPicker;

  if (!show) return null;

  const choose = (city: string) => {
    setSelectedLocation(city);
    dismissCityPicker();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={dismissCityPicker} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.15s_ease-out]">
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }`}</style>

        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Select Your City</h2>
            <p className="text-xs text-gray-500 mt-0.5">Choose a city to see showtimes near you</p>
          </div>
          <button
            onClick={dismissCityPicker}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 p-5 max-h-[60vh] overflow-y-auto">
          {locationNames.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => choose(city)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-[#00a8cc]/10 hover:border-[#00a8cc]/60 text-gray-800 text-sm font-semibold transition-colors"
            >
              <MapPin className="w-4 h-4 text-[#00a8cc] shrink-0" />
              <span className="truncate">{city}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitySelectModal;