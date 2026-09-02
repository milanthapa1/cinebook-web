import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Search, User, LogOut, ChevronDown, TicketCheck, Shield, Ticket, Check } from 'lucide-react';
import { useAuthStore } from '../../features/auth/useAuthStore';
import { useLocationStore, useLiveLocations } from '../../features/location/useLocationStore';
import { useMovies } from '../../features/movies/useMovies';
import { useShowtimes } from '../../features/showtimes/useShowtimes';
import { generateBookingDates, formatShowtimeClock } from '../../features/showtimes/showtimeHelpers';

// ─── Date helpers ────────────────────────────────────────────────────────────

// ─── Custom Dropdown ──────────────────────────────────────────────────────────
interface DropdownOption { label: string; value: string }

interface CustomDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  placeholder: string;
  disabled?: boolean;
  stepNumber: number;
  stepActive: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value, onChange, options, placeholder, disabled = false, stepNumber, stepActive,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="flex-1 relative min-w-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`w-full flex items-center gap-2 pl-8 pr-2 py-2 rounded-lg border text-xs transition-all ${
          disabled
            ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-50 dark:bg-gray-800 dark:border-gray-700'
            : open
            ? 'bg-white border-[#00a8cc] text-gray-800 dark:bg-gray-900 dark:text-gray-100'
            : 'bg-white border-gray-300 text-gray-800 hover:border-[#00a8cc] dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100'
        }`}
      >
        {/* Step badge */}
        <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center shrink-0 ${
          stepActive ? 'bg-[#00a8cc] text-white' : 'bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {stepNumber}
        </span>
        <span className="truncate flex-1 text-left">
          {selected ? selected.label : <span className="text-gray-400">{placeholder}</span>}
        </span>
        <ChevronDown className={`w-3 h-3 text-gray-500 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !disabled && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-2xl overflow-hidden dark:bg-gray-900 dark:border-gray-700">
          <div className="max-h-48 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  opt.value === value
                    ? 'bg-[#00a8cc]/15 text-[#00a8cc] font-bold'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Location Dropdown ────────────────────────────────────────────────────────
const LocationDropdown: React.FC<{
  value: string;
  onChange: (val: string) => void;
  options: string[];
}> = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const loading = options.length === 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !loading && setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
          loading
            ? 'bg-gray-100 border-gray-300 cursor-default dark:bg-gray-800 dark:border-gray-700'
            : open
            ? 'bg-white border-[#00a8cc] shadow-sm dark:bg-gray-900'
            : 'bg-gray-100 border-gray-300 hover:border-[#00a8cc]/60 dark:bg-gray-800 dark:border-gray-700'
        }`}
      >
        <MapPin className="w-3.5 h-3.5 text-[#00a8cc] shrink-0" />
        <span className="text-xs font-bold text-gray-900 max-w-[140px] truncate dark:text-gray-100">
          {value || (loading ? 'Loading cities…' : 'Select city')}
        </span>
        <ChevronDown className={`w-3 h-3 text-gray-500 shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !loading && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1.5 min-w-[220px] bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50 dark:bg-gray-900 dark:border-gray-700"
        >
          <p className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            Choose your city
          </p>
          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((loc) => (
              <button
                key={loc}
                type="button"
                role="option"
                aria-selected={loc === value}
                onClick={() => {
                  onChange(loc);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                  loc === value
                    ? 'text-[#00a8cc] font-bold'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                }`}
              >
                <MapPin className={`w-3 h-3 shrink-0 ${loc === value ? 'text-[#00a8cc]' : 'text-gray-300 dark:text-gray-600'}`} />
                <span className="flex-1 truncate">{loc}</span>
                {loc === value && <Check className="w-3.5 h-3.5 shrink-0 text-[#00a8cc]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── User Profile Menu ────────────────────────────────────────────────────────
const UserMenu: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#00a8cc]/50 dark:hover:bg-gray-800"
        title={user.name}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border border-[#00a8cc]/70 shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#00a8cc] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {initials}
          </div>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 dark:bg-gray-900 dark:border-gray-700">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs font-bold text-gray-900 truncate dark:text-gray-100">{user.name}</p>
            <p className="text-[11px] text-gray-500 truncate mt-0.5 dark:text-gray-400">{user.email}</p>
          </div>

          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#00a8cc]/10 hover:text-[#00a8cc] transition-colors dark:text-gray-300"
            >
              <User className="w-3.5 h-3.5" />
              Account Settings
            </Link>
            <Link
              to="/profile?tab=tickets"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-[#00a8cc]/10 hover:text-[#00a8cc] transition-colors dark:text-gray-300"
            >
              <TicketCheck className="w-3.5 h-3.5" />
              My Tickets
            </Link>
            {user.role === 'ADMIN' && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-500/10 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}
          </div>

          <div className="border-t border-gray-200 py-1 dark:border-gray-700">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { selectedLocation, setSelectedLocation } = useLocationStore();
  const { liveMap, locationNames } = useLiveLocations();
  const cinemasForLocation = liveMap[selectedLocation] || liveMap[Object.keys(liveMap)[0]] || [];
  const { data: moviesData } = useMovies({ isShowing: true });
  const dates = generateBookingDates();

  const [qCinema, setQCinema] = useState('');
  const [qMovie, setQMovie] = useState('');
  const [qDate, setQDate] = useState('');
  const [qTime, setQTime] = useState('');

  // Reset selections when location changes
  useEffect(() => {
    setQCinema('');
    setQMovie('');
    setQDate('');
    setQTime('');
  }, [selectedLocation]);

  const step1Done = qCinema !== '';
  const step2Done = step1Done && qMovie !== '';
  const step3Done = step2Done && qDate !== '';
  const allDone = step3Done && qTime !== '';

  const selectedCinema = cinemasForLocation.find((c) => c.id === qCinema);

  const { data: showtimesData } = useShowtimes({
    date: qDate,
    cinemaId: qCinema,
    movieId: qMovie || undefined,
  });

  const timeOptions = useMemo(() => {
    if (!showtimesData) return [];
    const seen = new Set<string>();
    return showtimesData
      .map((showtime) => ({
        label: formatShowtimeClock(showtime.startsAt),
        value: showtime.id,
      }))
      .filter((option) => {
        if (seen.has(option.value)) return false;
        seen.add(option.value);
        return true;
      });
  }, [showtimesData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickBooking = () => {
    if (!allDone) return;
    const params = new URLSearchParams({
      movieId: qMovie,
      cinema: selectedCinema?.name ?? '',
      date: qDate,
      time: qTime,
    });
    navigate(`/showtimes?${params.toString()}`);
  };

  // Build option arrays for each dropdown
  const cinemaOptions: DropdownOption[] = cinemasForLocation.map((c) => ({ label: c.name, value: c.id }));
  const movieOptions: DropdownOption[] = (moviesData ?? []).map((m) => ({ label: m.title, value: m.id }));
  const dateOptions: DropdownOption[] = dates.map((d) => ({ label: d.label, value: d.iso }));

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm dark:bg-gray-950 dark:border-gray-800">

      {/* ── Top Navbar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Left: Logo + Location */}
        <div className="flex items-center gap-5 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="font-logo text-3xl font-normal text-[#00a8cc] group-hover:text-[#00bce0] transition-colors leading-none">
              CINEBOOK
            </span>
          </Link>

          {/* Location Dropdown */}
          <div className="hidden md:block">
            <LocationDropdown
              value={selectedLocation}
              onChange={setSelectedLocation}
              options={locationNames}
            />
          </div>
        </div>

        {/* Center: Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 text-[11px] font-semibold uppercase tracking-widest text-gray-600 dark:text-gray-300">
          <Link to="/movies" className="hover:text-gray-900 transition-colors dark:hover:text-white">Movies</Link>
          <Link to="/showtimes" className="hover:text-gray-900 transition-colors dark:hover:text-white">Showtimes</Link>
          <Link to="/contact" className="hover:text-gray-900 transition-colors dark:hover:text-white">Customer Service</Link>
        </nav>

        {/* Right: Search + Auth */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/movies')}
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
            title="Browse movies"
          >
            <Search className="w-4 h-4" />
          </button>

          {user ? (
            <UserMenu onLogout={handleLogout} />
          ) : (
            <Link
              to="/login"
              className="px-5 py-2 rounded-lg bg-black hover:bg-gray-800 text-white font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95"
            >
              <User className="w-3.5 h-3.5" /> Sign In
            </Link>
          )}
        </div>
      </div>

      {/* ── Quick Booking Bar ── */}
      <div className="bg-gray-50 border-t border-gray-200 py-2 px-4 dark:bg-gray-900 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center gap-2">

          {/* Label */}
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 shrink-0 whitespace-nowrap">
            <Ticket className="w-3.5 h-3.5 text-[#00a8cc]" />
            Quick Book
          </span>

          {/* Separator */}
          <div className="hidden sm:block w-px h-6 bg-gray-300 shrink-0 mx-1 dark:bg-gray-700" />

          {/* Step 1: Cinema */}
          <CustomDropdown
            stepNumber={1}
            stepActive={true}
            value={qCinema}
            onChange={(val) => { setQCinema(val); setQMovie(''); setQDate(''); setQTime(''); }}
            options={cinemaOptions}
            placeholder="Select Cinema"
          />

          {/* Step 2: Movie */}
          <CustomDropdown
            stepNumber={2}
            stepActive={step1Done}
            value={qMovie}
            onChange={(val) => { setQMovie(val); setQDate(''); setQTime(''); }}
            options={movieOptions}
            placeholder="Select Movie"
            disabled={!step1Done}
          />

          {/* Step 3: Date */}
          <CustomDropdown
            stepNumber={3}
            stepActive={step2Done}
            value={qDate}
            onChange={(val) => { setQDate(val); setQTime(''); }}
            options={dateOptions}
            placeholder="Select Date"
            disabled={!step2Done}
          />

          {/* Step 4: Time */}
          <CustomDropdown
            stepNumber={4}
            stepActive={step3Done}
            value={qTime}
            onChange={setQTime}
            options={timeOptions}
            placeholder="Select Time"
            disabled={!step3Done}
          />

          {/* Buy Now */}
          <button
            onClick={handleQuickBooking}
            disabled={!allDone}
            title={!allDone ? 'Please fill all fields above' : 'Book now'}
            className={`shrink-0 px-5 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all ${
              allDone
                ? 'bg-[#00a8cc] hover:bg-[#0096c7] text-white active:scale-95'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300'
            }`}
          >
            Buy Now
          </button>
        </div>
      </div>
    </header>
  );
};
